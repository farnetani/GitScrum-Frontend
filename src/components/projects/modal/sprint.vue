<script>
import Axios from '@utils/axios'
import DatePicker from 'vue2-datepicker'
import { modalManager } from '@state/helpers'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Mentions from '@components/utils/mentions'

export default {
  components: { DatePicker, vSelect, Mentions },
  data() {
    return {
      loading: false,
      sprintName: '',
      sprintGoal: '',
      sprintDates: new Date(),
      sprintStatus: null,
      sprintStatuses: [],
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
      if (object.item.name === 'sprintCreate') {
        object.item.name = ''
        this.errors = []
        if (this.$route.params.projectSlug) {
          this.getProject(this.$route.params.projectSlug)
        }
        this.getProjects()
        this.getSprintStatuses()

        this.$refs['modal'].show()
      }
    },
  },
  methods: {
    hideModal() {
      this.closeModal(this.$refs['modal'])
    },
    getProject(projectSlug) {
      Axios()
        .get('projects/' + projectSlug + '/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.project = {
            label: response.data.data.name,
            code: response.data.data.slug,
          }
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

    getSprintStatuses() {
      Axios()
        .get('sprints/statuses?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].title,
              code: data[i].slug,
            })
          }
          this.sprintStatuses = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    validateForm(event) {
      this.errors = []

      if (!this.project) {
        this.errors.push(this.$t('Project is required'))
      }

      if (!this.sprintStatus) {
        this.errors.push(this.$t('Status is required'))
      }

      if (!this.sprintName) {
        this.errors.push(this.$t('Sprint Name is required'))
      }

      if (!this.sprintDates[0] || !this.sprintDates[1]) {
        this.errors.push(this.$t('Dates is required'))
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

      let dateStart = new Date(this.sprintDates[0])
      let dateStartFormated = dateStart.getFullYear() + '-' + (dateStart.getMonth() + 1) + '-' + dateStart.getDate()

      let dateFinish = new Date(this.sprintDates[1])
      let dateFinishFormated = dateFinish.getFullYear() + '-' + (dateFinish.getMonth() + 1) + '-' + dateFinish.getDate()

      Axios()
        .post('sprints/?company_slug=' + this.currentCompany.slug + '&project_slug=' + this.project.code, {
          title: this.sprintName,
          date_start: dateStartFormated,
          date_finish: dateFinishFormated,
          description: this.sprintGoal,
          sprint_status_id: this.sprintStatus,
        })
        .then((response) => {
          let data = response.data
          this.loading = false
          this.$router.push({
            name: 'projects.sprints.show',
            params: {
              companySlug: data.company.slug,
              projectSlug: data.project.slug,
              sprintSlug: data.slug,
            },
          })
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateSprintGoalText(text) {
      this.sprintGoal = text
    },
  },
}
</script>

<template>
  <b-modal id="modal" ref="modal" lazy size="lg" :title="$t('Create a Sprint')" hide-header hide-footer>
    <div class="welcome d-flex justify-content-center align-items-center">
      <div class="welcome-box">
        
        <div class="row">
          <!--
          <div class="col-md-5 bg-464DEE d-flex justify-content-center align-items-center">
            <div class="">
              <div class="text-left" style="width:400px; margin: 0 auto;">
                <img src="https://gitscrum-static.s3.amazonaws.com/img/modal.png" style="width:220px" />
                <div class="mt-15-px ml-5-px">
                  <span class="tx-18-px txt-26DC8E fw-600">{{ $t('What is Sprint?') }}</span>
                  <p class="tx-12-px mt-15-px">
                    <strong>
                      {{ $t('Sprint_Text1') }}
                    </strong>
                    {{ $t('Sprint_Text2') }}
                  </p>
                  <p class="tx-12-px mt-15-px">
                    <strong>{{ $t('Sprint Goal') }}</strong> {{ $t('Sprint_Text3') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          -->
          <div class="col-md-12 d-flex justify-content-center align-items-center">
            <div>
              <button type="button" aria-label="Close" class="close" @click="hideModal">×</button>
              <div style="max-width: 520px">
                <h3 class="d-block tx-24-px fw-700 mb-0">{{ $t('Create a Sprint') }}</h3>
                <span class="d-block tx-14-px txt-9EA9C1 mb-30-px">{{ currentCompany.name }}</span>

                <div v-if="errors.length" class="alert alert-info">
                  <b>{{ $t('Please correct the following error(s):') }}</b>
                  <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                  </ul>
                </div>

                <div class="form-row">
                  <div class="form-group col-md-12">
                    <label>{{ $t('Project Name') }} *</label>
                    <v-select v-model="project" :options="projects" :clearable="false"> </v-select>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $t('Sprint Name') }} *</label>
                    <input v-model="sprintName" type="text" required="true" class="form-control" maxlength="60" />
                  </div>
                  <div class="form-group col-md-6">
                    <label>{{ $t('Project Status') }} *</label>
                    <v-select v-model="sprintStatus" :options="sprintStatuses" :clearable="false"> </v-select>
                  </div>
                  <div class="form-group col-md-6">
                    <label>{{ $t('Dates') }} *</label>
                    <DatePicker
                      v-model="sprintDates"
                      range
                      lang="en"
                      format="YYYY-MM-DD"
                      confirm
                      style="width:100%"
                    ></DatePicker>
                  </div>
                  <div class="form-group col-md-12">
                    <label>{{ $t('Sprint Goals') }}</label>
                    <Mentions
                      ref="mentions"
                      element-type="textarea"
                      :mention-users="true"
                      :content-text="sprintGoal"
                      :company-slug="currentCompany.slug"
                      :project-slug="project.code"
                      :element-rows="5"
                      @update-text="updateSprintGoalText"
                    ></Mentions>
                  </div>
                </div>
                <div class="mt-10-px d-flex justify-content-end">
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
                      <span>{{ $t('Creating Sprint') }}...</span>
                    </b-button>
                    <button v-show="!loading" class="btn btn-primary" type="button" @click="create">
                      <span class="mr-10-px"><font-awesome-icon :icon="['fa', 'plus']"/></span>
                      <span>{{ $t('Create Sprint') }}</span>
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
