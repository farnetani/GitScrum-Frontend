<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import appConfig from '@src/app.config'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import TitleLoading from '@components/utils/title-loading'
import ListUsers from '@components/utils/list-users'
import DropboxPicker from '@components/utils/dropbox-picker'
import GDrivePicker from '@components/utils/gdrive-picker'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Documents',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    vueDropzone: vue2Dropzone,
    TitleLoading,
    ListUsers,
    DropboxPicker,
    GDrivePicker,
  },
  data: function() {
    return {
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      filter: null,
      attachments: [],
      dropzoneOptions: {
        url:
          appConfig.APIBaseURL +
          'attachments/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug +
          '&attachmentable_type=projects' +
          '&attachmentable_id=null',
        thumbnailWidth: 50,
        thumbnailHeight: 50,
        maxFilesize: 100,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'file',
      },
      uploadFilesCount: 0,
      loading: false,
      seeAll: 'all',
      searchTerm: ''
    }
  },
  watch: {
    seeAll() {
      this.getAttachments()
    },
    searchTerm(){
      this.getAttachments()
    }
  },
  created() {
    this.getAttachments(this.currentPage)
  },
  
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },

    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getAttachments(page) {
      this.scrollToTop()
      this.loading = true
      let attachmentableType = this.seeAll

      if ( this.seeAll === '' ){
        attachmentableType = 'projects'
      }

      Axios()
        .get(
          'attachments/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&attachmentable_type=' + attachmentableType +
            '&attachmentable_id=null' +
            '&search=' + this.searchTerm +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getAttachments(1)
            return
          }
          this.attachments = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
          this.handleDropzonePreview()
        })
        .catch((error) => {
          console.error(error)
        })
    },

    afterComplete(file) {
      file.previewElement.parentNode.removeChild(file.previewElement)
      this.uploadFilesCount--
      this.handleDropzonePreview()
      this.getAttachments(1)
      this.loading = false
    },

    sedding() {
      this.uploadFilesCount++
      this.handleDropzonePreview()
      this.loading = true
    },

    handleDropzonePreview() {
      let dropzoneMessage = document.getElementsByClassName('dropzone-custom-content')
      dropzoneMessage[0].parentNode.style.display = this.uploadFilesCount == 0 ? 'block' : 'none'
    },

    updateImage() {
      this.getAttachments(1)
    },

    isImage(attachment) {
      return attachment.mimetype.includes('image')
    },

    removeAttachment(attachment, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('attachments/' + attachment.id)
          .then((response) => {
            this.getAttachments(this.currentPage)
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })

    },

    getIconByType(type) {
      let icon = ''
      switch (type) {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.oasis.opendocument.spreadsheet':
          icon = '-excel'
          break
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessing':
          icon = '-word'
          break
        case 'application/pdf':
          icon = '-pdf'
          break
        case 'text/plain':
          icon = '-alt'
          break
        default:
          icon = ''
      }

      return icon
    },
  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
      <TitleLoading
        :title="$tc('Explore Documents', totalRows)"
        :title-alternative="$t('Documents')"
        :subtitle="$t('Documents that teams rely on to successfully guide projects')"
      ></TitleLoading>
    </template>

    <div slot="content" class="project-documents pt-70px">
      <div class="container">
        <div class="d-flex justify-content-between mb-30-px">
          <div>
            
            <b-form-checkbox
              v-model="seeAll"
              value="all"
              unchecked-value=""
            >
              Include attachments that are in tasks
            </b-form-checkbox>
          </div>
          <div>

            <b-form-input 
            v-model="searchTerm" 
            type="search" 
            debounce="1000"
            :placeholder="$t('Search documents')"
            style="width: 350px"
            ></b-form-input>

          </div>
        </div>

        <div class="d-flex justify-content-between">
          <vue-dropzone
          class="wd-100"
            id="documentsDropzone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            @vdropzone-file-added="sedding"
            @vdropzone-complete="afterComplete($event)"
          >
            <div class="dropzone-custom-content">
              <h3 class="dropzone-custom-title">{{ $t('Drag and drop to upload') }}</h3>
              <div class="subtitle">...{{ $t('or click to select a file from your computer') }}</div>
            </div>
          </vue-dropzone>

          <div style="width:300px">
            <div class="ml-10-px mb-10-px">
              <DropboxPicker
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                attachmentable-type="projects"
                @image-uploaded="updateImage"
              >
              </DropboxPicker>
            </div>
            <div class="ml-10-px">
              <GDrivePicker
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                attachmentable-type="projects"
                @image-uploaded="updateImage"
              >
              </GDrivePicker>
            </div>
          </div>
        </div>

        <div class="row mt-20-px ml-0">
          <silentbox-group>
            <div class="d-flex align-content-start flex-wrap">
              <div v-for="(attachment, index) in attachments" :key="attachment.id" class="document-card">
                <div class="card">
                  <div class="document-image">
                    <div v-if="isImage(attachment)" class="cover-container m-0">
                      <div class="dropdown gallery-dropdown header-dropdown">
                        <div class="dropdown-toggle" data-toggle="dropdown">
                          <div class="txt-A7AFB7">
                            <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                          </div>
                        </div>
                        <div class="dropdown-menu dropdown-menu-right" style="min-width:130px;">
                          <a class="header-dropdown-item mt-10-px" @click="removeAttachment(attachment, index)">
                            <span class="icon-size"><font-awesome-icon :icon="['far', 'trash']"/></span>
                            <span class="ml-2">{{ $t('Delete') }}</span>
                          </a>
                        </div>
                      </div>
                      <silentbox-item :src="attachment.download.url" :description="attachment.filename">
                        <div class="gallery-image">
                          <ListUsers :user="attachment.user" :link="true" size="22"></ListUsers>
                          <img :src="attachment.download.url" class="cover" />
                        </div>
                      </silentbox-item>
                    </div>
                    <div v-if="!isImage(attachment)" class="cover-container m-0">
                      <div class="dropdown gallery-dropdown header-dropdown">
                        <div class="dropdown-toggle" data-toggle="dropdown">
                          <div class="txt-A7AFB7">
                            <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                          </div>
                        </div>
                        <div class="dropdown-menu dropdown-menu-right" style="min-width:130px;">
                          <a class="header-dropdown-item mt-10-px" @click="removeAttachment(attachment, index)">
                            <span class="icon-size"><font-awesome-icon :icon="['far', 'trash']"/></span>
                            <span class="ml-2">{{ $t('Delete') }}</span>
                          </a>
                        </div>
                      </div>
                      <a :href="attachment.download.url" class="" target="_blank">
                        <div class="gallery-image">
                          <ListUsers :user="attachment.user" :link="true" size="22"></ListUsers>
                          <span class="icons d-block">
                            <font-awesome-icon
                              :icon="['fal', 'file' + getIconByType(attachment.mimetype)]"
                              class="txt-9EA9C1"
                              style="font-size:60px"
                            />
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div class="document-details">
                    <a :href="attachment.download.url" class="" target="_blank">
                      <span class="txt-68748F tx-12-px fw-500">{{ attachment.filename }}</span>
                    </a>
                    <div class="d-flex justify-content-between">
                      <span class="txt-9EA9C1 tx-11-px m-0" :title="attachment.created_at.timezone"
                        >{{ attachment.created_at.date_for_humans }}
                      </span>
                      <span v-if="attachment.task" class="txt-link txt-464DEE tx-11-px fw-600" @click="modal('task', attachment.task)">See task</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </silentbox-group>
        </div>

        <div v-if="totalPages > 1" class="d-flex justify-content-center mg-b-30">
          <b-pagination
            hide-goto-end-buttons
            class="paginator"
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            @change="getAttachments"
          >
            <template slot="prev-text">
              <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
            </template>
            <template slot="next-text">
              <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
            </template>
          </b-pagination>
        </div>
      </div>
    </div>
  </Layout>
</template>
