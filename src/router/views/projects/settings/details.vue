<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'

import appConfig from '@src/app.config'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import Mentions from '@components/utils/mentions'
import UploadImage from '@components/utils/upload-image'

export default {
  page: {
    title: 'Project Settings',
    meta: [{ name: 'description', content: '' }],
  },
  components: { 
    Layout, 
    TitleLoading, 
    ButtonLoading, 
    vSelect,
    vueDropzone: vue2Dropzone,
    Mentions,
    UploadImage 
  },
  data() {
    return {
      loading: true,
      btnLoading: false,

      project: [],
      projectsParents: [],
      projectsStatus: [],
      projectsStatusSelect: 0,
      projectsParentSelect: [],
      companyName: '',
      projectCode: '',
      projectName: '',
      projectDescription: '',
      projectIsPrivate: false,
      projectSlackWebhook: '',
      projectDiscordWebhook: '',
      projectTaskShowNumber: false,
      projectUserTimer: false,
      projectTaskType: false,
      projectTaskEffort: false,
      projectUserStories: false,
      projectSprints: false,
      showSuccessAlert: false,
      alertMessage: '',
      
      logoOptions: {
        url:
          appConfig.APIBaseURL +
          'projects/' +
          this.$route.params.projectSlug +
          '/logo/?company_slug=' +
          this.$route.params.companySlug,
        http: 'POST',
        thumbnailWidth: 128,
        maxFilesize: 5000,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        cropSize: {
          width: 128,
          height: 128,
        },
        paramName: 'logo_file',
      },

      dropzoneOptionsBackground: {
        url:
          appConfig.APIBaseURL +
          'projects/' +
          this.$route.params.projectSlug +
          '/background/?company_slug=' +
          this.$route.params.companySlug,
        thumbnailWidth: 128,
        maxFilesize: 5000,
        maxFiles: 1,
        acceptedFiles: 'image/*',
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'background_file',
      },

    }
  },
  created() {
    this.getProject()
  },
  methods: {
    
    setVModel(){
        this.companyName = this.project.company.name
        this.projectCode = this.project.code
        this.projectName = this.project.pure_name
        this.projectDescription = this.project.description
        this.projectIsPrivate = !this.project.visibility.is_private
        this.projectSlackWebhook = this.project.slack_webhook
        this.projectDiscordWebhook = this.project.discord_webhook
        this.projectTaskShowNumber = this.project.settings.show_number
        this.projectUserTimer = this.project.settings.use_timer
        this.projectTaskType = this.project.settings.task_type
        this.projectTaskEffort = this.project.settings.task_effort
        this.projectUserStories = this.project.settings.has_user_stories
        this.projectSprints = this.project.settings.has_sprints
        this.projectsStatusSelect = this.project.status.code
        if (this.project.parent) {
          this.projectsParentSelect = this.project.parent.name
        }
    },

    getProject() {

      this.getProjectStatus()
      this.getProjectParent()

      let project = this.$store.getters['project/getProject']

      if ( project !== null ) {
        this.project = project
        this.loading = false
        this.setVModel()
        return 
      }

      Axios()
        .get('projects/' + 
          this.$route.params.projectSlug + 
          '/?company_slug=' + 
          this.$route.params.companySlug)
        .then((response) => {
          this.loading = false
          this.project = response.data.data
          this.$store.dispatch('project/setProject', this.project)

          this.setVModel()
        })
        .catch((e) => {
          console.error(e)
        })
    },


    getProjectParent() {
      Axios()
        .get(
          'projects/parents/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.projectsParents = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getProjectStatus() {
      Axios()
        .get(
          'projects/statuses/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.projectsStatus = response.data.data
          this.projectsStatusSelect = this.projectsStatus[this.project.status.code]
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateProject() {
      this.btnLoading = true

      let parentId = this.projectsParentSelect ? this.projectsParentSelect.id : null

      Axios()
        .put('projects/' + 
          this.$route.params.projectSlug + 
          '/?company_slug=' + 
          this.$route.params.companySlug, 
        {
          code: this.projectCode,
          name: this.projectName,
          description: this.projectDescription,
          is_private: !this.projectIsPrivate,
          parent_id: parentId,
          current_status: this.projectsStatusSelect.id,
          slack_webhook: this.projectSlackWebhook,
          discord_webhook: this.projectDiscordWebhook,
          show_number: this.projectTaskShowNumber,
          use_timer: this.projectUserTimer,
          task_type: this.projectTaskType,
          task_effort: this.projectTaskEffort,
          has_user_stories: this.projectUserStories,
          has_sprints: this.projectSprints,
        })
        .then((response) => {
          
          this.btnLoading = false

          this.$store.dispatch('project/setProject', response.data.data)
          this.$store.dispatch('projectSidebar/setSidebar', null)

          this.$router.push({
            name: 'project.settings.details',
            params: {
              companySlug: this.$route.params.companySlug,
              projectSlug: response.data.data.slug,
            },
          })

        })
        .catch((e) => {
          console.error(e)
        })
    },

    deleteProject() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('projects/' + this.$route.params.projectSlug + '/?company_slug=' + this.$route.params.companySlug)
          .then((response) => {
            this.$router.push({
              name: 'workspaces.projects',
            })
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })
    },

    checked(value) {
      return value === true
    },

    updateLogo(logo) {
      if (this.project.logo !== logo && logo !== null) {
        this.project.logo = logo
      }
    },

    afterCompleteBackground(value) {
      this.project.background = value.dataURL
      this.$refs.updateBackgroundDropzone.removeAllFiles()
    },

    updateDescriptionText(text) {
      this.projectDescription = text
    },

    removeLogo(){
      Axios()
        .delete('projects/' + this.$route.params.projectSlug + 
          '/logo/?company_slug=' + 
          this.$route.params.companySlug)
        .then((response) => {
          window.location.reload();
        })
    },

    removeBackground(){
      Axios()
        .delete('projects/' + this.$route.params.projectSlug + 
          '/background/?company_slug=' + 
          this.$route.params.companySlug)
        .then((response) => {
          window.location.reload();
        })
    }
    
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
      <TitleLoading
        :title="$t('Project Details')" :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="project-details pt-70px">
      <div class="container">

        <b-container class="project-api-management">
          <b-row>
            <b-col cols="4">
              
              <div class="mb-0 tx-18-px lh-16 fw-500 txt-001737">{{ $t('Project Logo') }}</div>

              <b-row class="mt-20-px">
                <b-col cols="5">
                  <b-img :src="project.logo" rounded class="mt-8-px" style="width:128px"></b-img>
                </b-col>
                <b-col cols="7">
                  <p class="tx-12-px txt-A7AFB7">{{ $t('Project_Details_Text_2') }}</p>
                </b-col>
              </b-row>
              <b-row align-v="center">
                <b-col cols="5">
                  <b-link href="javascript:;" class="d-block mt-10-px tx-12-px" @click="removeLogo">{{ $t('Remove Logo') }}</b-link>
                </b-col>
                <b-col cols="7">
                  <UploadImage :button-text="$t('Upload your Logo')" :options="logoOptions" @get-image="updateLogo"></UploadImage>
                </b-col>
              </b-row>
          
              <hr>

              <div class="mb-15-px d-flex justify-content-between">
                <div class="tx-18-px lh-16 fw-500 txt-001737">{{ $t('Board Background') }}</div>
                <b-link href="javascript:;" class="d-block tx-12-px" @click="removeBackground">{{ $t('Remove Background') }}</b-link>
              </div>

              <vue-dropzone
                id="updateBackgroundDropzone"
                ref="updateBackgroundDropzone"
                class="mt-15-px"
                :options="dropzoneOptionsBackground"
                :use-custom-slot="true"
                @vdropzone-complete="afterCompleteBackground"
              >
                <div class="dropzone-custom-content">
                  <h3 class="dropzone-custom-title">{{ $t('Drag and drop to upload') }}</h3>
                  <div class="subtitle">...{{ $t('or click to select a file from your computer') }}</div>
                </div>
              </vue-dropzone>

              <b-img :src="project.background" class="mt-20-px" style="width:100%"></b-img>
              

            </b-col>
            <b-col cols="7" offset-md="1">

              <b-row>
                
                <TitleLoading :title="$t('Project Details')" :loading="loading"></TitleLoading>

                <div class="mt-20-px mb-30-px">    
                    <b-alert v-model="showSuccessAlert" variant="success" class="mg-b-15" dismissible fade>
                      {{ alertMessage }}
                    </b-alert>
                    <div class="form-row">
                      <div class="form-group col-md-12">
                        <b-form-checkbox v-model="projectIsPrivate" :checked="projectIsPrivate">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Public Project') }}</span>
                        </b-form-checkbox>
                        <p class="txt-6C7293 tx-12-px">{{ $t('Project_Details_Text') }}</p>
                      </div>
                    </div>

                    <hr>

                    <div class="form-row mg-t-15">
                      <div class="form-group col-md-8">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Company Owner') }}</label>
                        <input v-model="companyName" type="text" class="form-control" disabled />
                      </div>
                      <div class="form-group col-md-4">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Optional Code (e.g. PROJ01)') }}</label>
                        <input v-model="projectCode" type="text" maxlength="6" class="form-control" />
                      </div>
                    </div>
                    <div class="form-row mg-t-15">
                      <div class="form-group col-md-8">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Project Name') }}</label>
                        <input v-model="projectName" type="text" maxlength="60" class="form-control" />
                      </div>
                      <div class="form-group col-md-4">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Project Status') }}</label>
                        <v-select v-model="projectsStatusSelect" :options="projectsStatus" label="label"> </v-select>
                      </div>
                    </div>
                    <div class="form-row mg-t-15">
                      <div class="form-group col-md-12">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Project Parent') }}</label>
                        <v-select v-model="projectsParentSelect" :options="projectsParents" label="name"></v-select>
                      </div>
                    </div>
                    <div class="form-row mg-t-15 pd-b-15 bd-b">
                      <div class="form-group col-md-12">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Project Goals') }}</label>
                        <Mentions
                          ref="mentions"
                          element-type="textarea"
                          :mention-users="true"
                          :content-text="projectDescription"
                          :company-slug="$route.params.companySlug"
                          :project-slug="$route.params.projectSlug"
                          :element-rows="5"
                          @update-text="updateDescriptionText"
                        ></Mentions>
                      </div>
                    </div>

                    <hr>

                    <div class="tx-18-px lh-16 fw-500 txt-001737 mb-10-px">{{ $t('Project Messaging') }}</div>
                    
                    <div class="form-row mg-t-15">
                      <div class="form-group col-md-12">
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Slack Webhook') }}</label>
                        <input v-model="projectSlackWebhook" type="text" class="form-control mb-10-px" />
                      
                        <label class="tx-12-px txt-68748F mb-5-px">{{ $t('Discord Webhook') }}</label>
                        <input v-model="projectDiscordWebhook" type="text" class="form-control" />
                      </div>
                    </div>

                    <hr>

                    <p class="tx-12-px txt-9EA9C1">{{ $t('No information will be deleted') }}</p>
                    <div class="form-row mb-20-px">
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectTaskShowNumber" :checked="checked(projectTaskShowNumber)">
                          <span class="txt-6C7293 tx-14-px"> {{ $t('Enable Task Show Number') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectUserTimer" :checked="checked(projectUserTimer)">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Enable Task Timer') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectTaskType" :checked="checked(projectTaskType)">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Enable Task Type') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectTaskEffort" :checked="checked(projectTaskEffort)">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Enable Task Effort') }} </span>
                        </b-form-checkbox>
                      </div>
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectUserStories" :checked="checked(projectUserStories)">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Enable User Stories') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="form-group col-md-4 mb-10-px">
                        <b-form-checkbox v-model="projectSprints" :checked="checked(projectSprints)">
                          <span class="txt-6C7293 tx-14-px">{{ $t('Enable Sprints') }}</span>
                        </b-form-checkbox>
                      </div>
                    </div>

                    <hr>

                    <div class="d-flex justify-content-between">
                      <div>
                        <a href="javascript:;" class="txt-EF5958" @click="deleteProject">
                          <span>{{ $t('Delete') }}</span>
                        </a>
                      </div>
                      <div class="d-flex justify-content-end">

                        <ButtonLoading
                          :loading="btnLoading"
                          :title="$t('Update Project')"
                          :title-loading="$t('Updating Project')"
                          type="btn-md"
                          mode="button"
                          @action="updateProject"
                        ></ButtonLoading>

                      </div>
                    </div>
                </div> 
              </b-row>

            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </Layout>
</template>