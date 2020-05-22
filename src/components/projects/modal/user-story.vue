<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Mentions from '@components/utils/mentions'

export default {
  components: { vSelect, Mentions },
  data() {
    return {
      loading: false,
      userStoryPriorities: [],
      userStoryPriority: [],
      userStory: '',
      additionalInformation: '',
      acceptanceCriteria: '',
      project: [],
      projects: [],
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      errors: [],
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'userstoryCreate') {
        object.item.name = ''
        if (this.$route.params.projectSlug) {
          this.getProject(this.$route.params.projectSlug)
        } else {
          this.getProjects()
        }

        this.$refs['modal'].show()
      }
    },
  },
  methods: {
    hideModal() {
      
      this.closeModal(this.$refs['modal'])
    },

    changeProjects(project) {
      this.getUserStoryPriorities(project.code)
    },

    getProject(projectSlug) {
      
      Axios()
        .get('projects/' + projectSlug + '/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.project = {
            label: response.data.data.name,
            code: response.data.data.slug,
          }
          this.getProjects()
          this.getUserStoryPriorities(response.data.data.slug)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getProjects() {
      Axios()
        .get('projects/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].name,
              code: data[i].slug,
            })
          }
          this.projects = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getUserStoryPriorities(projectSlug) {
      Axios()
        .get('user-story-priorities/?company_slug=' + this.currentCompany.slug + '&project_slug=' + projectSlug)
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].title,
              code: data[i].id,
            })
          }
          this.userStoryPriorities = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateAdditionalInformationText(text) {
      this.additionalInformation = text
    },

    updateTitleText(text) {
      this.userStory = text
    },

    validateForm(event) {
      this.errors = []

      if (!this.userStory) {
        this.errors.push(this.$t('User Story is required'))
      }

      if (this.errors.length) {
        return false
      }

      return true
    },

    create(event) {
      if (!this.validateForm(event)) {
        event.preventDefault()
        return
      }

      this.loading = true

      Axios()
        .post('user-stories/?company_slug=' + this.currentCompany.slug, {
          project_slug: this.project.code,
          title: this.userStory,
          user_story_priority_id: this.userStoryPriority.code,
          additional_information: this.additionalInformation,
          acceptance_criteria: this.acceptanceCriteria,
        })
        .then((response) => {
          let data = response.data
          this.loading = false
          this.$router.push({
            name: 'projects.user-stories.show',
            params: {
              companySlug: data.company.slug,
              projectSlug: data.project.slug,
              userStorySlug: data.slug,
            },
          })
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <b-modal id="modal" ref="modal" lazy size="lg" :title="$t('Create an User Story')" hide-header hide-footer>
     <div class="welcome d-flex justify-content-center align-items-center">
      <div class="welcome-box">
        <div class="row">
          <!--
          <div class="col-md-5 bg-464DEE d-flex justify-content-center align-items-center">
            <div class="">
              <div class="text-left" style="width:400px; margin: 0 auto;">
                <img src="https://gitscrum-static.s3.amazonaws.com/img/modal.png" style="width:220px" />
                <div class="mt-15-px ml-5-px">
                  <span class="tx-18-px txt-26DC8E fw-600">{{ $t('What is a User Story?') }}</span>
                  <p class="tx-12-px mt-15-px">
                    <strong>
                      {{ $t('UserStory_Text1') }}
                    </strong>
                    <br />
                    <br />
                    <strong>
                      {{ $t('As a < type of user >') }},
                      <br />
                      {{ $t('I want < some goal >') }},
                      <br />
                      {{ $t('so that < some reason >') }}.
                    </strong>
                    <br /><br />
                    {{ $t('UserStory_Text2') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          -->
          <div class="col-md-12 d-flex justify-content-center align-items-center">
            <div>
              <button type="button" aria-label="Close" class="close" @click="hideModal">×</button>
              <div>
                <h3 class="d-block tx-24-px fw-700 mb-0">{{ $t('Create an User Story') }}</h3>
                <span class="d-block tx-14-px txt-9EA9C1 mb-30-px">{{ currentCompany.name }}</span>

                <div v-if="errors.length" class="alert alert-info">
                  <b>{{ $t('Please correct the following error(s):') }}</b>
                  <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                  </ul>
                </div>

                <div class="form-row">
                  <div class="form-group col-md-12">
                    <label>{{ $t('Project Name') }}</label>
                    <v-select v-model="project" :options="projects" :clearable="false" @input="changeProjects">
                    </v-select>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $t('User Story Priority') }}</label>
                    <v-select v-model="userStoryPriority" :options="userStoryPriorities" :clearable="false"> </v-select>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $tc('User Story', 1) }} *</label>
                    <Mentions
                      ref="mentions1"
                      element-type="textarea"
                      :mention-users="true"
                      :content-text="userStory"
                      :company-slug="$route.params.companySlug"
                      :project-slug="project.code"
                      :element-rows="3"
                      @update-text="updateTitleText"
                    ></Mentions>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $t('Additional Information') }}</label>
                    <Mentions
                      ref="mentions2"
                      element-type="textarea"
                      :mention-users="true"
                      :content-text="additionalInformation"
                      :company-slug="currentCompany.slug"
                      :project-slug="project.code"
                      :element-rows="3"
                      @update-text="updateAdditionalInformationText"
                    ></Mentions>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $t('Acceptance Criteria') }}</label>
                    <b-form-textarea v-model="acceptanceCriteria" rows="2" max-rows="4" no-auto-shrink></b-form-textarea>
                    <small class="info" style="line-height: 16px;display: block;margin: 10px 0;"> {{ $t('UserStory_Text3') }} </small>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <div>
                    <button v-show="!loading" class="btn btn-secondary" type="button" @click="hideModal">
                      <span>{{ $t('Cancel') }}</span>
                    </button>
                  </div>
                  <div class="ml-20-px">
                    <b-button v-show="loading" class="btn btn-primary" type="button">
                      <span class="mr-10-px">
                        <b-spinner :label="$t('Loading')" small class="title-loading"></b-spinner>
                      </span>
                      <span>{{ $t('Creating User Story') }}...</span>
                    </b-button>
                    <button v-show="!loading" class="btn btn-primary" type="button" @click="create">
                      <span class="mr-10-px"><font-awesome-icon :icon="['fa', 'plus']"/></span>
                      <span>{{ $t('Create User Story') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>
