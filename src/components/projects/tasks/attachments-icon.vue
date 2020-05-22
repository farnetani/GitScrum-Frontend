<script>
import appConfig from '@src/app.config'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import DropboxPicker from '@components/utils/dropbox-picker'
import GDrivePicker from '@components/utils/gdrive-picker'
import TitleLoading from '@components/utils/title-loading'
import { taskManager } from '@state/helpers'

export default {
  components: { vueDropzone: vue2Dropzone, DropboxPicker, GDrivePicker, TitleLoading },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      loading: false,

      dropzoneOptions: {
        url:
          appConfig.APIBaseURL +
          'attachments/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug +
          '&attachmentable_type=issues' +
          '&attachmentable_id=' +
          this.task.uuid,
        thumbnailWidth: 50,
        thumbnailHeight: 50,
        maxFilesize: 100,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'file',
      },
      uploadFilesCount: 0,
      showPicker: true,
    }
  },
  created(){
    this.whois()
  },
  methods: {
    ...taskManager,

    whois(){

      if ( window.location.hostname !== 'localhost:8080' || window.location.hostname !== 'gitscrum.com' ){
        this.showPicker = false;
      }

    },
    afterComplete(file) {
      file.previewElement.parentNode.removeChild(file.previewElement)
      this.uploadFilesCount--
      this.handleDropzonePreview()
      this.actionTask({ name: 'attachment.reload' })
      this.loading = false
    },

    updateImage() {
      this.refresh.push([])
      this.activities.push([])
    },

    sending() {
      this.uploadFilesCount++
      this.loading = true
      this.handleDropzonePreview()
    },

    handleDropzonePreview() {
      let dropzoneMessage = document.getElementsByClassName('dropzone-custom-content')
      dropzoneMessage[0].parentNode.style.display = this.uploadFilesCount == 0 ? 'block' : 'none'
    },
  },
}
</script>

<template>
  <div class="mb-8-px">

    <b-dropdown v-if="authorize('tasks', 'create')" ref="dropdown" right class="dropdown-400px styled-dropdown">
      <template v-slot:button-content >
        <span class="icon-size"><font-awesome-icon :icon="['far', 'paperclip']" style="font-size:14px"/></span>
        <span>{{ $t('Attachments') }}</span>
        <b-spinner v-show="loading" :label="$t('Loading')" class="title-loading" style="position: absolute;top: 10px;right: 15px;"></b-spinner>
      </template>
      <b-dropdown-header>
        <div class="d-flex align-items-center justify-content-between">
          <TitleLoading :title="$t('Attachments')" :loading="loading"></TitleLoading>
          <div class="dropdown-header-icons">
            <div>
              <font-awesome-icon :icon="['far', 'plus-square']" />
              <span>{{$t('Send Attachments')}}</span>
            </div>
          </div>
        </div>
      </b-dropdown-header>
      <b-dropdown-form>
    
        <div class="header-dropdown-topitem">
          <vue-dropzone
            id="attachments-icon-dropzone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            @vdropzone-file-added="sending"
            @vdropzone-complete="afterComplete($event)"
          >
            <div class="dropzone-custom-content">
              <h3 class="fw-600 tx-14-px">{{ $t('Drag and drop to upload') }}</h3>
              <div class="subtitle tx-12-px">...{{ $t('or click to select a file from your computer') }}</div>
            </div>
          </vue-dropzone>
        </div>

        <div v-if="showPicker" class="mt-10px">
          <div>
            <DropboxPicker
              :id="task.uuid"
              :company-slug="task.company.slug"
              :project-slug="task.project.slug"
              attachmentable-type="issues"
              @image-uploaded="updateImage"
            ></DropboxPicker>
          </div>
          <div class="mt-10-px">
            <GDrivePicker
              :id="task.uuid"
              :company-slug="$route.params.companySlug"
              :project-slug="$route.params.projectSlug"
              attachmentable-type="issues"
              @image-uploaded="updateImage"
            ></GDrivePicker>
          </div>
        </div>
        
      </b-dropdown-form>
    </b-dropdown>
    
  </div>
</template>
