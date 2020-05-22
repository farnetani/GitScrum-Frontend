<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { modalManager } from '@state/helpers'
import TaskCustomFieldCreate from '@components/utils/task-custom-field-create'
import TaskCustomFieldList from '@components/utils/task-custom-field-list'

export default {
  components: {
    vSelect,
    TaskCustomFieldCreate,
    TaskCustomFieldList,
  },
  data() {
    return {
      loading: true,
      btnLoading: false,
      customFieldOptions: this.setCustomFieldsOptions(),
      newTaskCustomField: this.defaultItem(),
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      projectSlug: this.$route.params.projectSlug,
      templateSelected: {},
      openTemplateBox: false,
      openCreateBox: true,
      templateItem: null,
      templateItems: [],
      activeTab: 0,
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'projectTaskCustomFields') {
        object.item.name = ''
        this.getTaskCustomFields()
        this.getTemplateTaskCustomFields()
        this.$refs['modal'].show()
        
      }
    },
  },
  methods: {
    setCustomFieldsOptions() {
      return [
        { label: 'Small text', code: 'text' },
        { label: 'Long text', code: 'textarea' },
        { label: 'Checkbox', code: 'checkbox' },
        { label: 'Selectable options', code: 'select' },
      ]
    },

    defaultItem() {
      return {
        id: null,
        title: '',
        type: { label: 'Small text', code: 'text' },
        optionCustomFieldSelectable: false,
        optionCustomFieldSelect: [],
        meta: '',
        popoverShow: false,
      }
    },

    hideModal() {
      
      this.closeModal(this.$refs['modal'])
    },
    toggleModal() {
      this.$refs['modal'].toggle('#toggle-btn')
    },

    prepareType(item) {
      for (let i = 0; i < this.customFieldOptions.length; i++) {
        if (item.type === this.customFieldOptions[i].code) {
          item.type = this.customFieldOptions[i]
          break
        }
      }
      return item
    },

    getTaskCustomFields() {
      if ( !this.templateSelected.items ){
      Axios()
        .get(
          'project-templates/field/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.templateSelected = {
            items: [],
          }
          for (let i = 0; i < response.data.data.length; i++) {
            // this.templateSelected.items.push(this.prepareType(response.data.data[i]))
            this.templateSelected.items.push(response.data.data[i])
          }
          this.selected(this.templateSelected)

          this.loading = false
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
      }
    },

    selected(object) {
      object.items = this.handleItemTypes(object.items)
      this.templateSelected = object
    },

    handleItemTypes(items) {
      for (let i = 0; i < items.length; i++) {
        if (typeof items[i].type === 'string') {
          items[i] = this.prepareType(items[i])
          if (!items[i].optionCustomFieldSelect) {
            this.appendParam(items[i])
          }
        }
      }

      return items
    },

    appendParam(item) {
      let optionArray = []

      if (item.meta && item.meta !== null && item.meta.length) {

        item.meta.forEach((opt, key) => {
          optionArray[key] = {
            id: opt,
            name: opt,
          }
        })
      }

      this.$set(item, 'optionCustomFieldSelect', optionArray)
    },

    getTemplateTaskCustomFields() {
      if ( !this.templateItems.length ){
        Axios()
          .get(
            'templates/field/?company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug
          )
          .then((response) => {
            this.templateItems = response.data.data.filter((template) => template.items.length)
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },

    openCreate() {
      if (this.openCreateBox) {
        this.openCreateBox = false
      } else {
        this.openCreateBox = true
        this.openTemplateBox = false
      }
    },
    openTemplate() {
      if (this.openTemplateBox) {
        this.openTemplateBox = false
      } else {
        this.getTemplateTaskCustomFields()
        this.openTemplateBox = true
        this.openCreateBox = false
      }
    },

    applyTemplate() {
      this.openTemplateBox = false
      this.loading = true
      this.btnLoading = true
      Axios()
        .post(
          'templates/field/' +
            this.templateItem.id +
            '/apply/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.getTaskCustomFields()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    resetFields() {
      this.search = ''
      this.newTaskCustomField = this.defaultItem()
    },
  },
}
</script>

<template>
  <b-modal id="modal" ref="modal" hide-footer lazy size="md">
    <div slot="modal-title">
      <div class="d-flex" style="align-items: center;">
        <span class="title">{{ $t('Project Task Custom Fields') }}</span>
        <div class="d-flex">
          <b-spinner
            v-show="loading"
            :label="$t('Loading')"
            variant="secondary"
            small
            class="title-loading"
          ></b-spinner>
        </div>
      </div>
      <span class="subTitle">{{ $t('Project templates') }}</span>
    </div>
    <div class="modalContent">
      <div class="project-task-custom-fields template">
        <b-card no-body>
          <b-tabs v-model="activeTab" pills card vertical @input="resetFields">
            <b-tab :title="$tc('Create', 1)" lazy>
              <b-card-text>
                <div class="col-sm-12 template">
                  <!-- :new-task-custom-field="newTaskCustomField" -->
                  <TaskCustomFieldCreate
                    :custom-field-options="customFieldOptions"
                    :current-company="currentCompany"
                    :project-slug="projectSlug"
                    :template-selected="templateSelected"
                  ></TaskCustomFieldCreate>
                </div>
              </b-card-text>
            </b-tab>
            <b-tab :title="$t('Apply')" lazy>
              <b-card-text>
                <div class="col-sm-12 template">
                  <div class="create-template-item-div">
                    <h5 class="fw-500 tx-14-px txt-001737 title m-0">
                      {{ $t('Apply Template') }}
                    </h5>
                    <div class="item-input d-flex mt-10-px" style="width:465px;">
                      <div class="v-select-sm only-left-border-radius">
                        <v-select
                          v-model="templateItem"
                          style="min-width:466px"
                          :options="templateItems"
                          :clearable="false"
                          :searchable="false"
                          label="name"
                        ></v-select>
                      </div>
                      <div class="input-group-append">
                        <button
                          v-if="!btnLoading"
                          class="btn btn-sm btn-primary"
                          type="button"
                          :disabled="!templateItem"
                          @click="applyTemplate"
                        >
                          <font-awesome-icon :icon="['fa', 'check']" />
                        </button>

                        <button v-if="btnLoading" class="btn btn-sm btn-primary" type="button">
                          <b-spinner :label="$t('Loading')" small class="title-loading"></b-spinner>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </b-card-text>
            </b-tab>

            <div class="row mt-20-px mb-15-px">
              <div class="col-md-12">
                <hr class="m-0" />
              </div>
            </div>

            <div v-if="!loading">
              <TaskCustomFieldList
                :template-selected="templateSelected"
                :custom-field-options="customFieldOptions"
                :current-company="currentCompany"
                :project-slug="projectSlug"
                :title="true"
              ></TaskCustomFieldList>
            </div>
          </b-tabs>
        </b-card>
      </div>
    </div>
  </b-modal>
</template>
