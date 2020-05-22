<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'API Management',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, ButtonLoading },
  data() {
    return {
      loading: true,
      btnLoading: false,
      apiId: '',
      copyApiIDSuccess: '',
      projectKey: '',
      copyProjectKeySuccess: '',
      statsTotal: null,
      statsLastEndpoint: null,
      statsLastRequest: null,
    }
  },
  created() {
    this.getAPIKeys()
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    getAPIKeys() {
      Axios()
        .get(
          'api/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {
          this.loading = false
          let data = response.data.data
          this.apiId = data.api_id
          this.projectKey = data.project_key

          this.getStats()
        })
    },

    getStats() {
      Axios()
        .get(
          'api/stats/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {
          this.loading = false
          let stats = response.data.data

          if ( stats.total > 0 ){
            this.statsTotal = stats.total
            this.statsLastEndpoint = stats.last_endpoint
            this.statsLastRequest = stats.last_request.date_for_humans
          }
        })
    },

    updateAPIKeys(){
      this.btnLoading = true;
      Axios()
        .put(
          'api/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {
          this.loading = false
          let data = response.data.data
          this.apiId = data.api_id
          this.projectKey = data.project_key
          this.btnLoading = false;
        })
    },

    copyApiID() {
      this.$copyText(this.apiId)
      this.copyApiIDSuccess = 'Copied'
    },

    copyProjectKey() {
      this.$copyText(this.projectKey)
      this.copyProjectKeySuccess = 'Copied'
    },
    
  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
      <TitleLoading
        :title="$t('API Management')"
        :subtitle="$t('Use the GitScrum infrastructure to connect or create new applications')"
        :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="project-api-management pt-70px">

      <div class="container">

        <b-container>
          <b-row>
            <b-col cols="3">
              <h4 class="h5">{{ $t('Stats') }}</h4>

                <div v-if="statsTotal" class="mt-20px">
                  <h6 class="h6 mb-5px">{{ $t('Total Requests') }}</h6>
                  <span class="fw-600" v-text="statsTotal"></span>

                  <h6 class="h6 mt-10px mb-5px">{{ $t('Last Request') }}</h6>
                  <span class="tx-11-px" v-text="statsLastRequest"></span>

                  <h6 class="h6 mt-10px mb-5px">{{ $t('Last Endpoint') }}</h6>
                  <span class="d-block tx-11-px lh-16-px">{{ statsLastEndpoint.uri }}</span>
                </div>

                <div v-if="!statsTotal" class="mt-20px">
                  {{ $t('No data available yet') }}
                </div>

            </b-col>
            <b-col cols="9">

              <h4 class="h5">{{ $t('Project API Credentials') }}</h4>
              <p class="mt-10px mb-10px">{{ $t('Use GitScrum\'s new API to programmatically interact with your organization\'s data. You can also develop (third-party) apps and build upon GitScrum core product features. The API ID and the Project key are required for you to use our API in a secure way.') }}</p>

              <hr>

              <b-row>
                <b-col cols="6">
                  <label>{{ $t('API ID') }} 
                    <small class="text-success" v-text="copyApiIDSuccess"></small>
                  </label>

                  <b-input-group>
                    <b-input v-model="apiId" 
                      :disabled="apiId === ''" 
                      :readonly="apiId !== ''" 
                      autocomplete="off"></b-input>
                    <b-input-group-append>
                      <b-button variant="outline-secondary" @click="copyApiID">
                        <font-awesome-icon :icon="['far', 'copy']" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  
                </b-col>
                <b-col cols="6">
                  <label>{{ $t('Project Key') }} 
                    <small class="text-success" v-text="copyProjectKeySuccess"></small>
                  </label>

                  <b-input-group>
                    <b-input v-model="projectKey" 
                      :disabled="projectKey === ''" 
                      :readonly="projectKey !== ''"
                      autocomplete="off"></b-input>
                    <b-input-group-append>
                      <b-button variant="outline-secondary" @click="copyProjectKey">
                        <font-awesome-icon :icon="['far', 'copy']" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>

                </b-col>
                <b-col class="mt-10px text-right">
                  <ButtonLoading
                    :loading="btnLoading"
                    :title="$t('Update Project Key')"
                    :title-loading="$t('Updating')"
                    type="btn-md"
                    mode="button"
                    @action="updateAPIKeys"
                  ></ButtonLoading>
                </b-col>
              </b-row>

            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </Layout>
</template>