<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import TaskChecklistCreate from '@components/utils/task-checklist-create'
import TaskChecklistList from '@components/utils/task-checklist-list'

export default {
  name: 'TaskChecklistList',
  components: { Draggable, TaskChecklistCreate, TaskChecklistList },
  props: {
    currentCompany: {
      type: Object,
      required: true,
    },
    templateSelected: {
      type: Object,
      required: true,
    },
    projectSlug: {
      type: String,
      required: false,
      default: null,
    },
    title: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {}
  },
  methods: {
    getUrl(id) {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/checklist/'

      if (!this.projectSlug) {
        url += this.templateSelected.id + '/items/'
      }

      if (id) {
        url += id + '/'
      }

      url += '?company_slug=' + this.currentCompany.slug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }

      return url
    },

    updateItem(params, id) {
      let url = this.getUrl(id)
      Axios()
        .put(url, params)
        .then((response) => {})
        .catch((e) => {})
    },

    deleteItem(item) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          let url = this.getUrl(item.id)
          Axios()
            .delete(url)
            .then((response) => {
              this.templateSelected.items.splice(this.templateSelected.items.indexOf(item), 1)
            })
        }
      })

    },

    updateItemTitle(title, id) {
      this.updateItem(
        {
          title: title,
        },
        id
      )
    },

    updateItemPosition(item) {
      this.updateItem(
        {
          position: item.moved.newIndex + 1,
        },
        item.moved.element.id
      )
    },
  },
}
</script>

<template>
  <div class="list-template-items-div">
    <div class="row" v-if="title">
      <div class="col-md-12">
        <h5 class="fw-500 tx-14-px txt-001737 title">
          {{ $t('Task Checklist created') }}
        </h5>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <table class="table table-card" v-if="templateSelected.items.length">
          <Draggable
            v-model="templateSelected.items"
            tag="tbody"
            ghost-class="ghost"
            @change="updateItemPosition($event)"
          >
            <tr v-for="item in templateSelected.items" :key="item.id">
              <td style="width: 1530px !important;">
                <div class="checklist d-flex justify-content-between mb-10-px">
                  <div class="flex-grow-1 text-right">
                    <div class="d-inline-flex nav-item dropdown header-dropdown no-border">
                      <a class="nav-title dropdown-toggle txt-909CB8" href="javascript:;" data-toggle="dropdown">
                        <font-awesome-icon :icon="['fa', 'ellipsis-h']" style="font-size:18px; color: #909CB8;" />
                      </a>
                      <div class="dropdown-menu dropdown-menu-right navbar-dropdown" style="width:100px">
                        <div class="mt-10-px">
                          <a href="javascript:;" class="header-dropdown-item" @click="deleteItem(item)">
                            <span>{{ $t('Delete') }}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group form-group-swatches mb-0">
                  <b-form-input v-model="item.title" @change="updateItemTitle($event, item.id)"></b-form-input>
                </div>
              </td>
              <div v-if="item.items" style="margin-left: 40px;">
                <TaskChecklistCreate
                    :current-company="currentCompany"
                    :project-slug="projectSlug"
                    :template-selected="item"
                    :checklist-item="true"
                  ></TaskChecklistCreate>
                <TaskChecklistList
                  :template-selected="item"
                  :current-company="currentCompany"
                  :project-slug="projectSlug"
                ></TaskChecklistList>
              </div>
            </tr>
          </Draggable>
        </table>
        <div v-else class="alert alert-info mt-15-px">
          <span> {{ $t('List without Items') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
