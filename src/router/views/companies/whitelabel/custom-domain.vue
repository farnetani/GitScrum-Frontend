<script>
import Layout from '@layouts/tpl-main'
import appConfig from '@src/app.config'
import SideBar from '@components/companies/side-bar'
import TitleLoading from '@components/utils/title-loading'
import Axios from '@utils/axios'
import UploadImage from '@components/utils/upload-image'
import Alert from '@components/utils/alert'
import ButtonLoading from '@components/utils/button-loading'
import Ads from '@components/utils/ads'

export default {
  page: {
    title: 'CustomDomain',
    meta: [{ name: 'description', content: 'Checklists' }],
  },
  components: { Layout, TitleLoading, UploadImage, SideBar, Alert, Ads, ButtonLoading },
  data: function() {
    return {
      loading: false,
      loadingEmail: true,
      loadingAddDomain: false,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      whiteLabel: null,
      logoOptions: null,
      email_footer: null,
      domains: [],
      newDomain: '',
      logo: null,
      alertMessage: '',
      alertStatus: false,
    }
  },
  created() {
    this.getCompany()
    this.getEmail()
    this.getDomains()
    this.getLogo()
    this.logoOptions = this.setLogoOptions()
  },
  methods: {
    getCompany() {
      Axios()
        .get('companies/' + this.currentCompany.slug)
        .then((response) => {
          this.whiteLabel = response.data.data.whitelabel.enabled
        })
    },

    setLogoOptions() {
      return {
        url: appConfig.APIBaseURL + 'whitelabel/logo/?company_slug=' + this.currentCompany.slug,
        http: 'POST',
        thumbnailWidth: 122,
        maxFilesize: 100,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'logo_file',
        cropSize: {
          width: 122,
          height: 22,
        },
      }
    },
    getEmail() {
      Axios()
        .get('whitelabel/email/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.email_footer = response.data.data.email
          this.loadingEmail = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    addEmail() {
      this.loadingEmail = true
      Axios()
        .put('whitelabel/email/', {
          company_slug: this.currentCompany.slug,
          email_footer: this.email_footer,
        })
        .then((_) => {
          this.loadingEmail = false
        })
        .catch((e) => {
          console.error(e)
          this.loadingEmail = false
        })
    },

    getDomains() {
      Axios()
        .get('whitelabel/domains/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.domains = response.data.data
        })
        .catch((error) => {
          console.error(error)
        })
    },

    addDomain() {
      this.loadingAddDomain = true
      this.alertStatus = false
      Axios()
        .post('whitelabel/domains/', {
          company_slug: this.currentCompany.slug,
          domain_name: this.newDomain,
        })
        .then((response) => {
          const domain = this.newDomain
          this.domains.push({
            domain: domain,
          })
          this.newDomain = ''
          this.loadingAddDomain = false
        })
        .catch((error) => {
          this.alertMessage = 'Error. '

          error.response.data.data.domain_name.forEach((message) => {
            this.alertMessage += message
          })

          this.alertStatus = true
          this.loadingAddDomain = false
        })
    },

    deleteDomain(domainName) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('whitelabel/domains/?company_slug=' + this.currentCompany.slug + '&domain_name=' + domainName)
          .then((response) => {
            let domainPosition = this.domains
              .map(function(e) {
                return e.domain
              })
              .indexOf(domainName)
            this.domains.splice(domainPosition, 1)
          })
          .catch((e) => {
            console.error(e)
          })
        }

      })
        
    },

    getLogo() {
      Axios()
        .get('whitelabel/logo/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.logo = response.data.data.logo
        })
        .catch((e) => {
          console.error(e)
        })
    },

    removeLogo() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('whitelabel/logo/?company_slug=' + this.currentCompany.slug)
          .then((response) => {
            this.logo = null
            let domain = window.location.host
            this.$cookies.remove('branding-' + domain)
          })
          .catch((e) => {
            console.error(e)
          })
        }

      })

    },

    updateLogo(logo) {
      if (this.logo !== logo && logo !== null) {
        this.logo = logo
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="white-label">
      <div class="row mb-30-px">
        <div class="col-md-2">
          <SideBar></SideBar>
        </div>

        <div class="col-md-5 offset-md-1">
          <div class="mb-20-px d-lg-flex">
            <TitleLoading title="White Label Setup" :loading="loading"></TitleLoading>
          </div>
          <div class="row flex-column-reverse flex-md-row">
            
            <div class="col-md-12">

                <p class="tx-18-px txt-001737 fw-600 mb-5-px">
                  {{ $t('STEP 1') }}
                </p>
                <p class="tx-12-px txt-68748F">
                  {{ $t('Add a Domain / Subdomain ( Mandatory )') }}
                </p>

                <Alert :message="alertMessage" :status="alertStatus"></Alert>

                <div v-show="!whiteLabel" class="txt-EF5958 fw-600">
                  {{ $t('You must update your account to set up White Label') }}
                </div>

                <div v-show="whiteLabel" class="row">
                  <div class="col-12">
                    <div class="form-group mb-5-px">
                      <div class="input-group">
                        <input
                          v-model="newDomain"
                          type="text"
                          class="form-control"
                          autocomplete="off"
                          placeholder="e.g.: my-domain.com / project.my-domain.com"
                        />
                        <div class="input-group-append">
                          <button
                            v-show="!loadingAddDomain"
                            class="btn btn-sm btn-primary"
                            type="button"
                            :disabled="newDomain === null || newDomain === ''"
                            @click="addDomain"
                          >
                            <i class="fa fa-check"></i>
                          </button>

                          <button v-show="loadingAddDomain" class="btn btn-sm btn-primary" type="button">
                            <b-spinner :label="$t('Loading')" small class="title-loading"></b-spinner>
                          </button>
                        </div>
                      </div>
                    </div>

                    <p class="tx-10-px txt-68748F">
                      * {{ $t('Domains and/or Subdomains that are allowed to use GitScrum White Label.') }}
                    </p>
                  </div>
                </div>

                <div v-show="domains">
                  
                  <h6 v-if="domains.length > 0" class="mt-15-px">
                    {{ $t('Domains / Subdomains List') }}
                  </h6>

                  <table class="table">
                    <tbody>
                      <tr v-for="domain in domains" :key="domain.id">
                        <td>
                          <h6 class="mt-0 mb-0">
                            <a :href="'http://' + domain.domain" target="_blank">{{ domain.domain }}</a>
                          </h6>
                        </td>
                        <td class="text-right">
                          <i class="fa fa-trash text-danger cursor-pointer" @click="deleteDomain(domain.domain)"> </i>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p class="tx-18-px txt-001737 fw-600 mb-5-px mt-30-px">
                  {{ $t('STEP 2') }}
                </p>
                <p class="tx-12-px txt-68748F mb-20-px" for="settings_site_name">
                  {{ $t("Add a CNAME record to your domain's DNS records") }}
                </p>

                <p class="tx-12-px txt-68748F fw-600 mb-20-px">
                  {{
                    $t(
                      'To add the CNAME record to your domain host, follow the steps below. See your domain host’s documentation for more specific instructions.'
                    )
                  }}
                </p>

                <p class="tx-12-px txt-68748F"> {{ $t('1. Go to your domain’s DNS records') }}. </p>

                <p class="tx-12-px txt-68748F">
                  {{ $t('2. Add a record to your DNS settings, selecting CNAME as the record type') }}.
                </p>

                <p class="tx-12-px txt-68748F">
                  {{ $t('3. Return to the first window or tab and copy the contents of the Label/Host field') }}.
                </p>

                <p class="tx-12-px txt-68748F">
                  {{ $t('4. Paste the copied contents into the Label or Host field with your DNS records') }}.
                </p>

                <p class="tx-12-px txt-68748F">
                  {{
                    $t('5. Return to the first window or tab and copy the contents of the Destination/Target field')
                  }}.
                </p>

                <p class="tx-12-px txt-68748F">
                  {{ $t('6. Paste the copied contents into the Destination or Target field with your DNS records') }}.
                </p>

                <div class="mt-20-px">
                  <p class="tx-12-px txt-68748F fw-600">
                    {{ $t('Your record should look similar to one of the tables below') }}:
                  </p>

                  <p class="tx-12-px txt-68748F">
                    {{ $t('GitScrum White Label - CNAME') }} :
                    <span class="tx-12-px txt-68748F fw-600">wl.gitscrum.com</span>
                  </p>
                </div>

                <table class="table table-bordered mb-15-px mt-20-px">
                  <thead>
                    <tr>
                      <th>{{ $t('Record type') }}</th>
                      <th>{{ $t('Label/Host field') }}</th>
                      <th>{{ $t('Time To Live (TTL)') }}</th>
                      <th>{{ $t('Destination/Target field') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="tx-11-px txt-6C7293">{{ $t('CNAME') }}</td>
                      <td class="tx-11-px txt-6C7293">XXXXXXXXXXXX</td>
                      <td class="tx-11-px txt-6C7293">{{ $t('3600 or leave the default') }}</td>
                      <td class="tx-11-px txt-6C7293">wl.gitscrum.com</td>
                    </tr>
                  </tbody>
                </table>

                <p class="tx-12-px txt-68748F">{{ $t('7. Save your record') }}.</p>
                <p class="tx-12-px txt-68748F">
                  {{ $t('CNAME_Text1') }}
                </p>

            </div>
          </div>
        </div>
        <div class="col-md-3 offset-md-1">
          
          <Ads v-show="!whiteLabel" type="square"></Ads>

          <b-card no-body class="p-20-px">
            <b-card-text>
              <p class="tx-14-px fw-500 txt-001737 mb-10-px"> {{ $t('Company Logo') }} </p>
              <p class="tx-11-px txt-68748F">
                {{
                  $t(
                    'You can upload a logo to replace the GitScrum Logo in Header of your company. This is a great way to promote your brand.'
                  )
                }}
              </p>

              <p class="tx-11-px txt-68748F m-0">
                {{
                  $t(
                    'We recommend using image files: of less than 500 KB and 122 (width) x 22 (height) pixels for best results.'
                  )
                }}
              </p>
            </b-card-text>
            <b-card-text v-show="whiteLabel" class="mt-15-px">
              <div class="d-flex justify-content-center align-items-center">
                <img
                  :src="logo !== null ? logo : 'https://gitscrum-static.s3.us-east-1.amazonaws.com/img/gitscrum.png'"
                  style="width:122px !important; height:22px !important; "
                />
              </div>
              <p v-show="logo !== null" class="mt-10-px text-center">
                <a href="javascript:;" class="text-danger" @click="removeLogo">
                  {{ $t('Remove your Company Logo') }}
                </a>
              </p>
            </b-card-text>
            <b-card-text v-show="whiteLabel" class="mt-15-px">
              <div v-show="logoOptions">
                <UploadImage
                  :button-text="$t('Upload your Company Logo')"
                  button-class="btn btn-primary tx-12-px fw-500 wd-100"
                  :options="logoOptions"
                  @get-image="updateLogo"
                  style="font-size:12px !important;"
                >
                </UploadImage>
              </div>
            </b-card-text>
          </b-card>

          <b-card v-show="whiteLabel" no-body class="p-20-px mt-20-px">
            <b-card-text>
              <p class="tx-14-px fw-500 txt-001737 mb-10-px"> {{ $t('Email Footer') }} </p>
              <div class="form-group m-0">
                <div class="input-group">
                  <input
                    v-model="email_footer"
                    type="text"
                    class="form-control"
                    autocomplete="off"
                    :placeholder="$t('Write a new email footer')"
                  />
                  <div class="input-group-append">
                    <ButtonLoading :loading="loadingEmail" type="btn-sm" @action="addEmail"></ButtonLoading>
                  </div>
                </div>
              </div>
            </b-card-text>
          </b-card>
        </div>
      </div>
    </div>
  </Layout>
</template>
