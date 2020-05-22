<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import TaskChecklistCreate from '@components/utils/task-checklist-create'
import TaskChecklistList from '@components/utils/task-checklist-list'

export default {
  components: {
    vSelect,
    TaskChecklistCreate,
    TaskChecklistList,
  },
  data() {
    return {
      loading: true,
      btnLoading: false,
      openTemplateBox: false,
      openCreateBox: true,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      projectSlug: this.$route.params.projectSlug,
      checklists: {},
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
      if (object.item.name === 'projectTaskChecklists') {
        object.item.name = ''
        this.getTaskChecklists()
        this.$refs['modal'].show()
        this.getTemplateTaskChecklists()
      }
    },
  },
  methods: {
    getTaskChecklists() {
      Axios()
        .get(
          'project-templates/checklist/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.checklists = {
            items: [],
          }
          for (let i = 0; i < response.data.data.length; i++) {
            this.checklists.items.push(response.data.data[i])
          }
          this.loading = false
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getTemplateTaskChecklists() {
      Axios()
        .get(
          'templates/checklist/?company_slug=' +
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
        this.getTemplateTaskChecklists()
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
          'templates/checklist/' +
            this.templateItem.id +
            '/apply/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.getTaskChecklists()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    resetFields() {
      this.search = ''
    },
  },
}
</script>

<template>
  <b-modal id="modal" ref="modal" hide-footer lazy size="md">
    <div slot="modal-title">
      <div class="d-flex" style="align-items: center;">
        <span class="title">{{ $t('Project Task Checklist') }}</span>
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
      <div class="project-task-checklists">
        <b-card no-body>
          <b-tabs v-model="activeTab" pills card vertical @input="resetFields">
            <b-tab :title="$tc('Create', 1)" lazy>
              <b-card-text>
                <div class="col-sm-12 template">
                  <TaskChecklistCreate
                    :current-company="currentCompany"
                    :project-slug="projectSlug"
                    :template-selected="checklists"
                    :title="$t('Create a Checklist')"
                  ></TaskChecklistCreate>
                </div>
              </b-card-text>
            </b-tab>
            <b-tab :title="$t('Apply')" lazy>
              <b-card-text>
                <div class="col-sm-12 template">
                  <div class="row">
                    <div class="col-md-12">
                      <div class="create-template-item-div">
                        <h5 class="fw-500 tx-14-px txt-001737 title m-0">
                          {{ $t('Apply Template') }}
                        </h5>
                        <div class="item-input d-flex mt-10-px">
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
              <TaskChecklistList
                :template-selected="checklists"
                :current-company="currentCompany"
                :project-slug="projectSlug"
                :title="true"
              ></TaskChecklistList>
            </div>
          </b-tabs>
        </b-card>
      </div>
    </div>
  </b-modal>
</template>
