<script>
import Axios from '@utils/axios'

export default {
  props: {
    config: {
      type: Object | Array,
      required: true,
    },
  },
  data() {
    return {
      configFormAnswer: [],
      loading: true,
      btnLoading: false,
      enableShareableLinkLoading: false,
      enableShareableLink: false,
      token: '',
      shareableLink: '',
      linkCopied: false,
    }
  },
  created(){
    this.shareableLink = this.getDomain('task-form') + this.config.token
    this.enableShareableLink = this.config.enabled
  },
  methods: {
    enableToggle(){
      this.btnLoading = true
      this.$emit('enableShareableLink', !this.enableShareableLink)

      Axios()
        .post(
          'config-form-answers/enable/toggle/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {
          this.btnLoading = false
        })
    },

    copyLink() {
      this.linkCopied = false
      let taElement = document.getElementById('shareableLink')

      const el = document.createElement('textarea')
      el.value = this.shareableLink || ''
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)

      taElement.focus()
      taElement.select()
      this.linkCopied = true
    },

    updateShareableLink(){
      this.enableShareableLinkLoading = true
      this.linkCopied = false
      this.config.shareableLink = ''
      this.loading = true

      Axios()
        .post(
          'config-form-answers/token/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.token = response.data.data.token
          this.shareableLink = this.getDomain('task-form') + this.token
          this.enableShareableLinkLoading = false
          this.loading = false
        })
        .catch((e) => {
          this.enableShareableLinkLoading = false
        })
    }
  }
}
</script>

<template>
  <div class="d-flex bd-highlight">
    
    <div v-if="false" class="hero-card-row mr-10-px" style="width: 200px;">
      <div class="hero-card hero-unique card-md" style="height: 116px;">
        <span class="number mt-5-px mb-4-px">
          <span>12/500</span>
        </span>
        <span class="text pb-10-px">
          {{ $t('Total Answers') }}
        </span>
      </div>
    </div>
    <div class="flex-grow-1 bd-highlight">
      <div class="d-flex justify-content-between">
        <b-form-checkbox
            v-model="enableShareableLink"
            @change="enableToggle"
        >
            {{ $t('Enable Form2Task for this project') }}
        </b-form-checkbox>

        <router-link
            v-show="enableShareableLink"
            :to="{
            name: 'projects.addons.task-form.public',
            params: {
                token: config.token,
            },
            }"
            target="_blank"
        >
            {{ $t('See my Form2Task') }}
        </router-link>
      </div>

      <hr />

      <div v-show="enableShareableLink">
        <textarea
          id="shareableLink"
          v-model="shareableLink"
          :disabled="enableShareableLinkLoading"
          type="text"
          class="form-control tx-12-px cursor-pointer"
          style="word-break: break-all; line-height: 15px; padding: 10px 15px; background-color: #ffffff"
          readonly
          @click="
          $event.target.focus()
          $event.target.select()
          copyLink()
          "
        />
        <div class="d-flex justify-content-between mt-5-px">
          <div class="text-center tx-10-px fw-500">
            <span v-show="!linkCopied" class="txt-9EA9C1">
                {{ $t('Click to copy') }}
            </span>
            <span v-show="linkCopied" class="txt-3D4F9F">
                {{ $t('Copied to clipboard') }}
            </span>
          </div>
          <a
          v-show="enableShareableLink"
          href="javascript:;"
          class="txt-68748F fw-500 lh-15-px tx-10-px tx-uppercase"
          @click="updateShareableLink"
          >
          {{ $t('Update Link') }}
          </a>
        </div>
      </div>
    </div>
    
  </div>
</template>
