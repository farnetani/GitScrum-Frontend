<script>
import Axios from '@utils/axios'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  components: {
    Swatches,
  },
  props: {
    project: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      search: '',
      selectableLabels: [],
      newLabel: this.defaultLabel(),
      labelColorStyleProps: {
        blank: true,
        width: 15,
        height: 15,
        class: 'm1',
      },
      currentEditingLabel: {
        title: '',
        color: '',
      },
      activeTab: 0,
      tabs: ['myLabels', 'searchLabels'],
      createBtnLoading: false,
      searchBtnLoading: false,
    }
  },
  created() {
    this.searchLabels()
  },
  methods: {
    defaultLabel() {
      return {
        id: null,
        title: '',
        color: '#ac725e',
        blocked: false,
      }
    },

    setCurrentEditingLabel(label) {
      this.currentEditingLabel.id = label.id
      this.currentEditingLabel.slug = label.slug
      this.currentEditingLabel.color = label.color
      this.currentEditingLabel.title = label.title
    },

    resetFields() {
      this.search = ''
      this.newLabel = this.defaultLabel()
    },

    searchLabels() {
      this.searchBtnLoading = true
      Axios()
        .get(
          'projects-labels/not-added/?company_slug=' +
            this.project.company.slug +
            '&project_slug=' +
            this.project.slug +
            '&search=' +
            this.search
        )
        .then((response) => {
          this.searchBtnLoading = false
          this.selectableLabels = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },

    onClickSearchLabels() {
      this.searchLabels()
    },

    onClickSelectLabel(label) {
      this.addLabelToProject(label)
    },

    editLabel(label) {
      this.setCurrentEditingLabel(label)
    },

    updateLabel(label) {
      if (!label.title) {
        label.color = this.currentEditingLabel.color
        label.title = this.currentEditingLabel.title
        return
      }

      Axios()
        .put(
          'projects-labels/' +
            label.slug +
            '?company_slug=' +
            this.project.company.slug +
            '&project_slug=' +
            this.project.slug,
          {
            title: label.title,
            color: label.color,
          }
        )
        .then((_) => {
          this.updateLocalLabel()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateLocalLabel() {
      let labels

      switch (this.tabNameSelected) {
        case 'searchLabels':
          labels = this.selectableLabels
          break
        case 'myLabels':
          labels = this.project.labels
          break
        default:
          labels = null
          break
      }

      if (labels !== null) {
        labels.forEach((label) => {
          if (label.slug === this.currentEditingLabel.slug) {
            this.$set(label, 'color', this.currentEditingLabel.color)
            this.$set(label, 'title', this.currentEditingLabel.title)
          }
        })
      }
      this.tabNameSelected = ''
    },

    onClickDeleteLabel(label) {

      this.$bvModal.msgBoxConfirm(this.$t('Are you sure? It will remove the label permanently'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete(
            'projects-labels/' +
              label.slug +
              '?company_slug=' +
              this.project.company.slug +
              '&project_slug=' +
              this.project.slug
          )
          .then((_) => {
            this.selectableLabels.splice(
              this.selectableLabels.indexOf(label),
              1
            )
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })
      
    },

    onClickRemoveLabel(label) {
      Axios()
        .delete(
          'projects-labels/' +
            label.slug +
            '/detach?company_slug=' +
            this.project.company.slug +
            '&project_slug=' +
            this.project.slug
        )
        .then((_) => {
          this.project.labels.splice(this.project.labels.indexOf(label), 1)
          this.selectableLabels.push(label)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    addLabelToProject(label) {
      Axios()
        .post(
          'projects-labels/' +
            label.slug +
            '/attach?company_slug=' +
            this.project.company.slug +
            '&project_slug=' +
            this.project.slug,
          label
        )
        .then((response) => {
          this.selectableLabels.splice(this.selectableLabels.indexOf(label), 1)
          this.project.labels.push(label)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    saveLabel() {
      this.createBtnLoading = true
      if (!this.newLabel.title) {
        return
      }

      Axios()
        .post(
          'projects-labels/?company_slug=' +
            this.project.company.slug +
            '&project_slug=' +
            this.project.slug,
          this.newLabel
        )
        .then((response) => {
          this.createBtnLoading = false
          this.project.labels.push(response.data.data)
          this.resetFields()
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <div class="manage-labels">
    <b-card no-body>
      <b-tabs v-model="activeTab" pills card vertical @input="resetFields">
        <b-tab :title="$tc('Project', 1)" lazy>
          <b-card-text>
            <div class="col-sm-12 new-label-content">
              <div class="input-group">
                <input
                  ref="labelTitle"
                  v-model="newLabel.title"
                  class="col-sm-9 form-control"
                  type="text"
                  maxlength="45"
                  :placeholder="$t('Label Name')"
                  :disabled="newLabel.blocked"
                  @keyup.enter="saveLabel"
                />
                <Swatches
                  v-model="newLabel.color"
                  colors="text-advanced"
                  popover-to="left"
                  class="col-sm-1 swatches-input"
                ></Swatches>
                <span
                  class="col-sm-2 input-group-btn d-flex justify-content-end"
                >
                  <b-button
                    v-if="createBtnLoading"
                    variant="primary"
                    class="btn btn-primary font-weight-bold"
                  >
                    <b-spinner small type="grow"></b-spinner>
                    {{ $t('Creating') }}
                  </b-button>

                  <button
                    v-if="!createBtnLoading"
                    class="btn btn-primary btn-text"
                    type="button"
                    :disabled="!newLabel.title"
                    @click="saveLabel"
                  >
                    {{ $t('Create') }}
                  </button>
                </span>
              </div>
            </div>

            <div class="col-sm-12 p-0">
              <table class="table table-hover">
                <!-- <thead>
                  <tr>
                    <th width="60">{{ $tc('Color', 1) }}</th>
                    <th>{{ $tc('Label', 1) }}</th>
                    <th width="190"></th>
                  </tr>
                </thead> -->
                <tbody>
                  <tr v-for="label in project.labels" :key="label.id">
                    <td width="60">
                      <Swatches
                        v-model="label.color"
                        colors="text-advanced"
                        popover-to
                        class="swatches-input"
                        @input="updateLabel(label)"
                      ></Swatches>
                    </td>
                    <td>
                      <input
                        v-model="label.title"
                        class="form-control"
                        type="text"
                        maxlength="45"
                        :placeholder="$t('Label Name')"
                        @keyup.enter="updateLabel(label)"
                        @focus="editLabel(label)"
                        @blur="updateLabel(label)"
                      />
                    </td>
                    <td width="190">
                      <span
                        class="icon-color cursor-pointer icon-remove"
                        @click="onClickRemoveLabel(label)"
                      >
                        <i class="fas fa-minus"></i>
                        <span class="icon-text">
                          {{ $t('Remove from project') }}
                        </span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-card-text>
        </b-tab>
        <b-tab :title="$t('Search')" lazy>
          <b-card-text>
            <div class="col-sm-12 search-label-content">
              <div class="input-group">
                <input
                  v-model="search"
                  type="text"
                  class="col-sm-9 form-control input"
                  :placeholder="$t('Search for')"
                  @keyup.enter="onClickSearchLabels"
                />
                <span
                  class="col-sm-3 input-group-btn d-flex justify-content-end"
                >
                  <button
                    v-if="!searchBtnLoading"
                    class="btn btn-primary"
                    type="button"
                    @click="onClickSearchLabels"
                  >
                    <i class="fa fa-search"> </i
                  ></button>

                  <button
                    v-if="searchBtnLoading"
                    class="btn btn-primary"
                    type="button"
                  >
                    <b-spinner
                      :label="$t('Loading')"
                      small
                      class="title-loading"
                    ></b-spinner>
                  </button>
                </span>
              </div>
            </div>

            <div class="col-sm-12 p-0">
              <table
                class="table table-hover"
                style="border-top:1px solid #fff;"
              >
                <!-- <thead>
                  <tr>
                    <th width="60">{{ $tc('Color', 1) }}</th>
                    <th>{{ $tc('Label', 1) }}</th>
                    <th width="155"></th>
                    <th width="56"></th>
                  </tr>
                </thead> -->
                <tbody>
                  <tr v-for="label in selectableLabels" :key="label.id">
                    <td width="60">
                      <Swatches
                        v-model="label.color"
                        colors="text-advanced"
                        popover-to
                        class="swatches-input"
                        @input="updateLabel(label)"
                      ></Swatches>
                    </td>
                    <td>
                      <input
                        v-model="label.title"
                        class="form-control"
                        type="text"
                        maxlength="45"
                        placeholder="Label Name"
                        @keyup.enter="updateLabel(label)"
                        @focus="editLabel(label)"
                        @blur="updateLabel(label)"
                      />
                    </td>
                    <td width="155">
                      <span
                        class="icon-color cursor-pointer icon-add"
                        @click="onClickSelectLabel(label)"
                      >
                        <i class="fas fa-plus"></i>
                        <span class="icon-text">
                          {{ $t('Add to project') }}
                        </span>
                      </span>
                    </td>
                    <td width="56">
                      <span
                        class="icon-color cursor-pointer icon-remove"
                        @click.stop.prevent="onClickDeleteLabel(label)"
                      >
                        <i class="fas fa-trash"></i>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-card-text>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>
