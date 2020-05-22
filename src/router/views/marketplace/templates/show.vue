<script>
import Axios from '@utils/axios'
import Layout from '@layouts/tpl-main'
import TitleLoading from '@components/utils/title-loading'
import SideList from '@components/marketplace/side-list'
import FooterList from '@components/marketplace/footer-list'
import Banner from '@components/marketplace/banner'

export default {
  page: {
    title: 'Templates',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    TitleLoading,
    SideList,
    FooterList,
    Banner
  },
  data() {
    return {
      loading: false,
      copyTemplateLoading: false,
      template: [],
      meta: [],
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      list: [
        {
          topic: 'Free',
          title: 'IT Helpdesk Workflow By Beck Computer Systems, Inc.',
          type: 'Templates',
        },
        {
          topic: 'Free',
          title: 'IT Helpdesk Workflow By Beck Computer Systems, Inc.',
          type: 'Templates',
        },
        {
          topic: 'Free',
          title: 'IT Helpdesk Workflow By Beck Computer Systems, Inc.',
          type: 'Templates',
        },
      ],
    }
  },
  created() {
    this.getTemplate()
  },
  methods: {
    getTemplate() {
      this.loading = true
      Axios()
        .get(
          'marketplace/templates/' +
            this.$route.params.template +
            '/' +
            this.$route.params.slug +
            '/?company_slug=' +
            this.currentCompany.slug
        )
        .then((response) => {
          this.template = response.data.data
          this.meta = response.data.meta
          this.loading = false
          this.copyTemplateLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    copyTemplate() {
      this.copyTemplateLoading = true
      Axios()
        .post(
          'marketplace/templates/' +
            this.$route.params.template +
            '/' +
            this.$route.params.slug +
            '/copy/?company_slug=' +
            this.currentCompany.slug
        )
        .then((response) => {
          this.getTemplate()
          this.hasTemplate = true
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getFeature() {
      switch (this.$route.params.template) {
        case 'workflow':
          return this.$t('Workflow')
        case 'type':
          return this.$t('Task Type')
        case 'effort':
          return this.$t('Task Effort')
        case 'field':
          return this.$t('Task Custom Field')
        case 'checklist':
          return this.$t('Task Checklist')
        case 'priority':
          return this.$t('User Story Priority')
        default:
      }
    },
    getTitle() {
      switch (this.$route.params.template) {
        case 'workflow':
          return this.$t('Stage')
        case 'type':
          return this.$t('Type')
        case 'effort':
          return this.$t('Effort')
        case 'field':
          return this.$t('Field')
        case 'checklist':
          return this.$t('Checklist')
        case 'priority':
          return this.$t('Priority')
        default:
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="marketplace">

      <b-container>
        <b-row>
          <b-col>
            <Banner :template-name="getFeature()"></Banner>
          </b-col>
        </b-row>
        <b-row align-v="center" class="mb-20-px">
          <b-col>
            <TitleLoading :title="getFeature() + ' Template'" 
              :loading="loading"></TitleLoading>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            
            <b-card>

              <b-row class="mt-10px">
                <b-col cols="2">
                  <b-img :src="template.company.logo" rounded :alt="template.company.name"></b-img>
                </b-col>
                <b-col class="ml-10px">

                  <b-row>
                    <b-col cols="8">
                      <div>
                        <b-badge v-if="meta.is_mine" class="mb-15px" variant="secondary">
                          {{ $t('You own this template') }}</b-badge>
                        <b-badge v-if="meta.copied" class="mb-15px" variant="warning">
                          {{ $t('You copied this template for your company') }}
                        </b-badge>
                        <b-link v-if="meta.is_mine | meta.copied" :to="{ name: 'companies.template.' + $route.params.template }" 
                            class="ml-5-px tx-11-px">{{ $t('See template in your company') }}</b-link>
                      </div>
                      <h6 class="mt-5px tx-11px fw-600 txt-26DC8E">{{ $t('Template Free') }}</h6>
                      <h3 class="tx-18px fw-600 mb-0">{{ template.name }}</h3>
                      <span class="txt-9EA9C1 tx-12-px" v-text="template.company.name"></span>
                    </b-col>
                    <b-col class="text-right">
                      <div v-show="!meta.is_mine">
                        <button v-show="!meta.copied" class="btn btn-sm btn-primary fw-600" @click="copyTemplate('')">
                          <span v-show="!copyTemplateLoading">{{ $t('Copy Template') }}</span>
                          <span v-show="copyTemplateLoading">{{ $t('Copying') }}</span>
                          <b-spinner v-show="copyTemplateLoading" small type="grow"></b-spinner>
                        </button>
                      </div>
                    </b-col>
                  </b-row>

                  <table class="table template-box-table mb-3">
                    <thead>
                      <tr>
                        <th colspan="2" class="pl-0 pr-0 wd-100"> 
                          <div class="d-flex justify-content-between align-items-center">
                            <div>{{ getFeature() }}</div>
                            <div class="text-right">
                              <span v-if="template.copiers >= 30" class="badge badge-light"> {{ $t('+XXX copiers', { total: template.copiers }) }} </span>
                              <span v-if="template.copiers <= 10" class="badge badge-light"> {{ $t('+XXX copiers', { total: 30 }) }} </span>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="item in template.items">
                        <tr v-if="meta.feature === 'workflow'" :key="item.id">
                          <td class="pl-0 d-flex">
                            <span class="card-color-box" :style="' background: #' + item.color"></span>
                            <span class="table-status-text" v-text="item.title"> </span>
                          </td>
                          <td class="text-right pr-0">
                            <span v-if="item.state === 0">{{ $t('Open') }}</span>
                            <span v-if="item.state === 1">{{ $t('Done') }}</span>
                            <span v-if="item.state === 2">{{ $t('In Progress') }}</span>
                          </td>
                        </tr>
                        <tr v-if="meta.feature === 'type'" :key="item.id">
                          <td class="pl-0 d-flex">
                            <span class="card-color-box" :style="'background: #' + item.color"></span>
                            <span class="table-status-text"> {{ item.code }} - {{ item.title }} </span>
                          </td>
                          <td class="text-right pr-0">
                            <span v-if="item.default">{{ $t('Default') }}</span>
                          </td>
                        </tr>
                        <tr v-if="meta.feature === 'effort'" :key="item.id">
                          <td width="35" class="pl-0">
                            <span class="" v-text="item.title"></span>
                          </td>
                          <td width="60" class="text-right pr-0">
                            <span class="" v-text="item.effort"></span>
                            <span v-if="item.default">{{ $t('Default') }}</span>
                          </td>
                        </tr>
                        <tr v-if="meta.feature === 'field'" :key="item.id">
                          <td width="35" class="pl-0">
                            <span class="" v-text="item.name"></span>
                          </td>
                          <td width="60" class="text-right pr-0">
                            <span v-if="item.type === 'text'">{{ $t('Small text') }}</span>
                            <span v-if="item.type === 'textarea'">{{ $t('Long text') }}</span>
                            <span v-if="item.type === 'checkbox'">{{ $t('Checkbox') }}</span>
                            <span v-if="item.type === 'select'">{{ $t('Selectable options') }}</span>
                          </td>
                        </tr>
                        <tr v-if="meta.feature === 'checklist'" :key="item.id">
                          <td width="35" class="pl-0">
                            <span class="" v-text="item.title"></span>
                          </td>
                          <td width="60" class="text-right pr-0"> </td>
                        </tr>
                        <tr v-if="meta.feature === 'priority'" :key="item.id">
                          <td width="35" class="pl-0">
                            <span class="" :style="'background: #' + item.color"></span>
                            <span class="" v-text="item.title"></span>
                          </td>
                          <td width="60" class="text-right pr-0">
                            <span v-if="item.default">{{ $t('Default') }}</span>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </b-col>
              </b-row>
              
            </b-card>

          </b-col>
          <b-col cols="3" class="pl-20-px">
            <h5 class="tx-14-px lh-18-px fw-600">{{ $t('Templates are an excellent way to optimize your company\'s processes and projects.') }}</h5>
            <p>{{ $t('Click on "Copy Template" button to use this template in your company and projects.') }}</p>
            <p>{{ $t('After copying this template for your company, you can set the template as the default for all your projects.') }} 
              {{ $t('Whenever you create a new project, that template will be applied automatically.') }}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <FooterList
              :title="$t('Other Templates')"
              :other-templates="meta.other_templates"
              :feature="meta.feature"
              class="txt-primary tx-18px fw-700 mt-4"
            ></FooterList>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </Layout>
</template>
