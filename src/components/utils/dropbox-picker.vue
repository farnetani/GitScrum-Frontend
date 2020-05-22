<script>
import Axios from '@utils/axios'
import appConfig from '@src/app.config'

export default {
  props: {
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: true,
    },
    attachmentableType: {
      type: String,
      required: true,
    },
    id: {
      type: Number | null,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      scriptReady: false,
      checkingInterval: null,
      config: null,
    }
  },
  watch: {
    scriptReady: function(data) {
      if (data) {
        clearInterval(this.checkingInterval)
        this.initDropboxPicker()
      }
    },
  },
  created() {
    this.loadScript()
    this.getConfig()
  },
  methods: {
    loadScript() {
      let script = document.createElement('script')
      script.setAttribute('src', 'https://www.dropbox.com/static/api/2/dropins.js')
      script.setAttribute('id', 'dropboxjs')
      script.setAttribute('data-app-key', appConfig.dropbox.key)
      document.head.appendChild(script)

      this.checkScriptLoaded()
    },

    checkScriptLoaded() {
      let localThis = this
      this.checkingInterval = setInterval(function() {
        if (window.Dropbox) {
          localThis.scriptReady = true
        }
      }, 500) // or whatever interval you want to check
    },

    getConfig() {
      this.config = {
        multiselect: true,
        folderselect: false,
        linkType: 'preview',
      }
    },

    initDropboxPicker() {
      let providerButtons = document.getElementById('provider-buttons')

      if (!providerButtons) return false

      let options = {
        success: this.sendDropboxFile,
        linkType: 'preview',
        multiselect: false,
        folderselect: false,
      }

      let button = window.Dropbox.createChooseButton(options)
      providerButtons.appendChild(button)
    },

    sendDropboxFile(files) {
      files.forEach((file) => {
        this.sendFile(file, 'dropbox')
      })
    },

    sendFile(file, provider) {
      let params = {
        company_slug: this.companySlug,
        project_slug: this.projectSlug,
        size: file.bytes,
        link: file.link,
        name: file.name,
        provider: provider,
        attachmentable_type: this.attachmentableType,
        attachmentable_id: this.id,
      }

      Axios()
        .post('attachments/?company_slug=' + this.companySlug + '&project_slug=' + this.projectSlug, params)
        .then((response) => {
          this.$emit('image-uploaded', response.data.data)
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <div>
    <span id="provider-buttons"></span>
  </div>
</template>
