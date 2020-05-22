<script>
import Axios from '@utils/axios'
import appConfig from '@src/app.config'
import FilePickerButton from 'vue-google-picker'

export default {
  components: {
    FilePickerButton,
  },
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
      gConfig: null,
    }
  },
  watch: {
    scriptReady: function(data) {
      if (data) {
        clearInterval(this.checkingInterval)
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
      script.setAttribute('src', 'https://apis.google.com/js/api.js')
      document.head.appendChild(script)

      this.checkScriptLoaded()
    },

    checkScriptLoaded() {
      let localThis = this
      this.checkingInterval = setInterval(function() {
        if (window.gapi) {
          localThis.scriptReady = true
        }
      }, 500) // or whatever interval you want to check
    },

    getConfig() {
      this.gConfig = {
        // The Browser API key obtained from the Google API Console.
        developerKey: appConfig.gdrive.key,

        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        clientId: appConfig.gdrive.clientId,

        // Scope to use to access user's drive.
        scope: 'https://www.googleapis.com/auth/drive.file',
      }
    },

    showDetails(data) {
      if (data.action === 'picked') {
        data.docs.forEach((file) => {
          this.sendFile(file, 'googledrive')
        })
      }
    },

    sendFile(file, provider) {
      let params = {
        company_slug: this.companySlug,
        project_slug: this.projectSlug,
        size: file.sizeBytes,
        link: file.url,
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
  <div v-if="scriptReady">
    <FilePickerButton :config="gConfig" @picked="showDetails" class="btn-none">
      <a
        href="javascript:;"
        class="dropbox-dropin-default"
        style="padding: 6px 12px 0 !important;height: 26px !important;position: relative;top: -1px;"
      >
        <img
          src="https://gitscrum-static.s3.amazonaws.com/img/GDrive.png"
          style="width: 15px; height: 14px; margin-right: 8px;"
        />
        <span class="fw-600">{{ $t('Choose from GDrive') }}</span>
      </a>
    </FilePickerButton>
  </div>
</template>

<style scoped>
button {
  background-color: transparent;
  border: none;
}
</style>
