<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { modalManager } from '@state/helpers'
import UserStoryPriorityCreate from '@components/utils/user-story-priority-create'
import UserStoryPriorityList from '@components/utils/user-story-priority-list'

export default {
  components: {
    vSelect,
    UserStoryPriorityCreate,
    UserStoryPriorityList,
  },
  data() {
    return {
      loading: true,
      btnLoading: false,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      projectSlug: this.$route.params.projectSlug,
      priorities: {},
      userStoryPriorityTitle: '',
      userStoryPriorityColor: '#000000',
      openCreateBox: false,
      openTemplateBox: false,
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
      if (object.item.name === 'projectUserStoryPriorities') {
        object.item.name = ''
        this.getUserStoryPriorities()
        this.$refs['modal'].show()
        this.getTemplateUserStoryPriorities()
      }
    },
  },
  methods: {
    hideModal() {
      
      this.closeModal(this.$refs['modal'])
    },
    toggleModal() {
      this.$refs['modal'].toggle('#toggle-btn')
    },
    getUserStoryPriorities() {
      Axios()
        .get(
          'project-templates/priority/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.priorities = {
            items: [],
          }
          for (let i = 0; i < response.data.data.length; i++) {
            this.priorities.items.push(response.data.data[i])
          }
          this.loading = false
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplateUserStoryPriorities() {
      Axios()
        .get(
          'templates/priority/?company_slug=' +
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
    updateColor(color, id) {
      this.update(
        {
          color: color,
        },
        id
      )
    },
    updateTitle(title, id) {
      this.update(
        {
          title: title,
        },
        id
      )
    },
    updateDefault(value, id) {
      this.update(
        {
          default: value,
        },
        id
      )
    },
    updatePosition(item) {
      this.update(
        {
          position: item.moved.newIndex + 1,
        },
        item.moved.element.id
      )
    },
    update(params, id) {
      Axios()
        .put(
          'project-templates/priority/' +
            id +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          params
        )
        .then((response) => {})
        .catch((e) => {
          console.error(e)
        })
    },
    addUserStoryPriority() {
      this.btnLoading = true
      Axios()
        .post(
          'project-templates/priority/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            title: this.userStoryPriorityTitle,
            color: this.userStoryPriorityColor,
            type: 'user_stories',
          }
        )
        .then((response) => {
          this.priorities.push(response.data.data)
          this.userStoryPriorityTitle = ''
          this.userStoryPriorityColor = '#000000'
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    deleteUserStoryPriority(id) {
      this.loading = true
      Axios()
        .delete(
          'project-templates/priority/' +
            id +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.getUserStoryPriorities()
        })
        .catch((e) => {
          console.error(e)
        })
    },
    applyTemplate() {
      this.openTemplateBox = false
      this.loading = true
      this.btnLoading = true

      Axios()
        .post(
          'templates/priority/' +
            this.templateItem.id +
            '/apply/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.getUserStoryPriorities()
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
        this.getTemplateUserStoryPriorities()
        this.openTemplateBox = true
        this.openCreateBox = false
      }
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
        <span class="title">{{ $t('Project User Story Priorities') }}</span>
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
      <div class="project-user-story-priorities">
        <b-card no-body>
          <b-tabs v-model="activeTab" pills card vertical @input="resetFields">
            <b-tab :title="$tc('Create', 1)" lazy>
              <b-card-text>
                <div class="col-sm-12 template">
                  <UserStoryPriorityCreate
                    :current-company="currentCompany"
                    :project-slug="projectSlug"
                    :template-selected="priorities"
                  ></UserStoryPriorityCreate>
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
              <UserStoryPriorityList
                :template-selected="priorities"
                :current-company="currentCompany"
                :project-slug="projectSlug"
                :title="true"
              ></UserStoryPriorityList>
            </div>
          </b-tabs>
        </b-card>
      </div>
    </div>
  </b-modal>
</template>
