<script>
import Layout from '@layouts/tpl-main'
import appConfig from '@src/app.config'
import SideBar from '@components/companies/side-bar'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import UploadImage from '@components/utils/upload-image'
import DescriptionEditable from '@components/utils/description-editable'
import ButtonLoading from '@components/utils/button-loading'

export default {
  page: {
    title: 'Company Information',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    SideBar,
    TitleLoading,
    UploadImage,
    DescriptionEditable,
    ButtonLoading,
  },
  data: function() {
    return {
      loading: true,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      company: [],
      companyName: '',
      companyDescription: '',
      companyDescriptionMention: '',
      settingsEmail: false,
      settingsLabels: false,
      btnLoading: false,
      logo: null,

      logoOptions: {
        url: appConfig.APIBaseURL + '/companies/',
        http: 'POST',
        thumbnailWidth: 150,
        maxFilesize: 100,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'logo_file',
      },
      companyLogo: null,
    }
  },
  created() {
    this.getCompany(this.currentCompany.slug)
    this.logoOptions.url += this.currentCompany.slug + '/logo'
  },
  methods: {
    getCompany(companySlug) {
      Axios()
        .get('companies/' + companySlug)
        .then((response) => {
          this.loading = false
          this.company = response.data.data
          this.currentCompany = this.company
          
          this.logo = this.company.logo
          this.companyName = this.company.name
          this.companyDescription = this.company.description
          this.companyDescriptionMention = this.company.description_mention
          this.settingsEmail = this.company.settings.personalised_email
          this.settingsLabels = this.company.settings.share_project_labels

          localStorage.setItem('CURRENT_COMPANY', JSON.stringify(this.company))
          this.$eventBus.$emit('change-current-company', this.company)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getCompanies(){
      Axios()
        .get('companies')
        .then((response) => {

          localStorage.setItem('COMPANIES_USER', JSON.stringify(response.data.data))

        })
        .catch((e) => {
          console.error(e)
        })
       

    },

    updateCompany() {
      this.btnLoading = true
      
      Axios()
        .put('companies/' + this.currentCompany.slug, {
          name: this.companyName,
          description: this.companyDescription,
          description_mention: this.companyDescriptionMention,
          personalised_email: this.settingsEmail,
          has_company_labels: this.settingsLabels,
        })
        .then((response) => {
          this.btnLoading = false
          this.getCompany(response.data.data.slug)
          this.getCompanies()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateLogo(logo) {
      this.logo = logo
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="company-information information">
      <div class="row mb-30-px">
        <div class="col-md-2">
          <SideBar></SideBar>
        </div>
        <div class="col-md-9 offset-md-1">
          <div class="row">
            <div class="col-md-12">
              <TitleLoading
                :title="$t('Company Details')"
                :loading="loading"
                addclass="tx-18-px fw-600 txt-001737"
              ></TitleLoading>
            </div>
          </div>
          <div class="row mt-20-px">
            <div class="col-md-12">
              <div class="mb-30-px">
                <span class="tx-12-px txt-68748F">{{ $t('Active license for the company') }}</span>
                <h3>{{ currentCompany.stats.plan.title }}</h3>
              </div>
              <label class="form-label tx-12-px txt-68748F mb-5-px">
                {{ $t('Company Name') }}
                <span class="tx-danger">*</span>
              </label>
              <input
                v-model="companyName"
                maxlength="45"
                class="form-control tx-12-px txt-68748F company-name"
                type="text"
              />
            </div>
          </div>
          <div class="row mt-20-px">
            <div class="col-md-2">
              <span class="tx-14-px fw-500 txt-001737 sub-title">{{ $t('Company Logo') }}</span>
              <div class="mt-20-px logo">
                <img v-show="logo !== null" :src="logo" />
                <div class="buttons">
                  <div class=" d-flex justify-content-center">
                    <UploadImage :two-buttons="true" :options="logoOptions" :has-image="true" @get-image="updateLogo"></UploadImage>
                  </div>
                </div>
              </div>
              <div class="mt-15-px">
                <span class="tx-10-px txt-A7AFB7 lh-12-px informative-text">
                  {{
                    $t(
                      'You can upload a logo image to appear in your projects and email notifications. Must be at least 128x128 pixels.'
                    )
                  }}
                </span>
              </div>
            </div>
            <div class="offset-md-1 col-md-9">
              <span class="tx-14-px fw-500 txt-001737 sub-title">{{ $tc('Description', 1) }}</span>
              <div class="mt-20-px">
                <DescriptionEditable
                  :description="companyDescription"
                  :description-mention="companyDescriptionMention"
                  :endpoint="'companies/' + currentCompany.slug"
                  param-name="description"
                  placeholder="Company description"
                  :company-slug="currentCompany.slug"
                  permission-feature="company"
                ></DescriptionEditable>
              </div>
            </div>
          </div>

          <div class="row mt-30-px">
            <div class="col-lg">
              <b-form-checkbox v-model="settingsEmail" :checked="settingsEmail">
                <span class="txt-6C7293 tx-14-px checkbox-text-spacing">
                  {{ $t('Emails - Personalised Brand') }}
                </span>
              </b-form-checkbox>
              <div>
                <small class="txt-6C7293 tx-12-px checkbox-text-spacing">
                  {{ $t('Company logo and description will appear in emails sent.') }}
                </small>
              </div>
            </div>

            <div class="col-lg">
              <b-form-checkbox v-model="settingsLabels" :checked="settingsLabels">
                <span class="txt-6C7293 tx-14-px checkbox-text-spacing">
                  {{ $t('Share Project Labels') }}
                </span>
              </b-form-checkbox>
              <div>
                <small class="txt-6C7293 tx-12-px checkbox-text-spacing">
                  {{ $t('Project Labels can be used inside other projects.') }}
                </small>
              </div>
            </div>
          </div>

          <div class="mt-20-px">
            <ButtonLoading
              :loading="btnLoading"
              :title="$t('Update Details')"
              :title-loading="$t('Updating Details')"
              type="btn-md"
              @action="updateCompany"
            ></ButtonLoading>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
