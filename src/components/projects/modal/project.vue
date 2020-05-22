<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: { vSelect },
  data() {
    return {
      loading: false,
      projectsStatus: [],
      projectsStatusSelect: 0,
      projectsParents: [],
      projectsParentSelect: 0,
      projectName: '',
      projectCode: '',
      projectDescription: '',
      projectIsPrivate: 1,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      errors: [],

      advancedShow: false
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    projectIsPrivate(){
      console.log(this.projectIsPrivate)
    },
    statusModal(object) {
      if (object.item.name === 'projectCreate') {
        object.item.name = ''
        this.projectsStatus = []
        this.projectsStatusSelect = 0
        this.projectsParents = []
        this.projectsParentSelect = 0
        this.projectName = ''
        this.projectCode = ''
        this.projectDescription = ''
        this.projectIsPrivate = 1
        this.errors = []
        this.getProjectStatus()
        this.getProjectParent()
        this.$refs['modal'].show()
      }
    },
  },
  methods: {
    hideModal() {
      
      this.closeModal(this.$refs['modal'])
    },

    getProjectParent() {
      Axios()
        .get('projects/parents/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.projectsParents = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getProjectStatus() {
      Axios()
        .get('projects/statuses/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.projectsStatus = response.data.data
          this.projectsStatusSelect = this.projectsStatus[this.projectsStatusSelect]
        })
        .catch((e) => {
          console.error(e)
        })
    },

    validateForm(event) {
      this.errors = []

      if (!this.projectName) {
        this.errors.push('Project name required.')
      }

      if (!this.projectsStatusSelect) {
        this.projectsStatusSelect.id = 0
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

      console.log(this.projectIsPrivate)

      let parentId = this.projectsParentSelect ? this.projectsParentSelect.id : null
      console.log(this.projectsStatusSelect)
      Axios()
        .post('projects/?company_slug=' + this.currentCompany.slug, {
          company_slug: this.currentCompany.slug,
          name: this.projectName,
          code: this.projectCode,
          description: this.projectDescription,
          parent_id: parentId,
          current_status: this.projectsStatusSelect.id,
          is_private: this.projectIsPrivate,
        })
        .then((response) => {
          let data = response.data.data
          this.loading = false
          this.$router.push({
            name: 'projects.board',
            params: {
              companySlug: data.company.slug,
              projectSlug: data.slug,
            },
          })
        })
        .catch((error) => {})
    },

    advanced(){
      this.advancedShow = !this.advancedShow
    }
  },
}
</script>

<template>
  <b-modal
    id="modal"
    ref="modal"
    lazy
    size="lg"
    :title="$t('Create a new Project')"
    hide-header
    hide-footer
    @ok="create"
  >
    <div class="welcome d-flex justify-content-center align-items-center">
      <div class="welcome-box">

        <!--
        <div class="col-md-5 bg-464DEE d-flex justify-content-center align-items-center">
          <div class="">
            <div class="text-left" style="width:400px; margin: 0 auto;">
              <img src="https://gitscrum-static.s3.amazonaws.com/img/modal.png" style="width:220px" />
              <div class="mt-15-px ml-5-px">
                <span class="tx-18-px txt-26DC8E fw-600">{{ $t('ProjectModal_Text1') }}</span>
                <p class="tx-12-px mt-15-px">
                  <strong>
                    {{ $t('ProjectModal_Text2') }}
                  </strong>
                  {{ $t('ProjectModal_Text3') }}
                </p>
                <p class="tx-12-px mt-15-px">
                  <strong>{{ $t('Private projects') }}</strong> {{ $t('ProjectModal_Text4') }}
                </p>
              </div>
            </div>
          </div>
        </div>
        -->
        <div class="col-md-12 d-flex justify-content-center align-items-center">
          
            <button type="button" aria-label="Close" class="close" @click="hideModal">×</button>
            <div class="welcome-content">
              <h3 class="d-block tx-24-px fw-700 mb-0">{{ $t('Create a Project') }}</h3>
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
                  <input
                    v-model="projectName"
                    :clearable="false"
                    type="text"
                    autocomplete="off"
                    maxlength="45"
                    class="form-control project-title"
                  />
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <b-form-checkbox
                    v-model="projectIsPrivate"
                    value="1"
                    unchecked-value="0"
                  >
                    {{ $t('Project Private') }}
                  </b-form-checkbox>

                  <a href="javascript:;" class="link-advanced" @click="advanced">Advanced</a>
              </div>
              

              <hr />

              <div v-show="advancedShow" class="form-row">
                <div class="form-group col-md-6">
                  <label>{{ $t('Optional Code (e.g. PROJ01)') }}</label>
                  <input v-model="projectCode" type="text" maxlength="6" class="form-control" />
                </div>
                <div class="form-group col-md-6">
                  <label>{{ $t('Project Status') }} *</label>
                  <v-select v-model="projectsStatusSelect" :options="projectsStatus" label="label" :clearable="false">
                  </v-select>
                </div>
                <div class="form-group col-md-12">
                  <label>{{ $t('Project Parent') }}</label>
                  <v-select v-model="projectsParentSelect" :options="projectsParents" label="name"></v-select>
                </div>
                <div class="form-group col-md-12">
                  <label>{{ $t('Project Goals') }}</label>
                  <b-form-textarea v-model="projectDescription" rows="5" max-rows="8" no-auto-shrink></b-form-textarea>
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
                    <span>{{ $t('Creating Project') }}...</span>
                  </b-button>
                  <button v-show="!loading" class="btn btn-primary" type="button" @click="create">
                    <span>{{ $t('Create Project') }}</span>
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>
