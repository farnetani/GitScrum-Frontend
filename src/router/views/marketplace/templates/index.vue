<script>
import Axios from '@utils/axios'
import Layout from '@layouts/tpl-main'
import TitleLoading from '@components/utils/title-loading'
import BoxItem from '@components/marketplace/box-item'
import Banner from '@components/marketplace/banner'

export default {
  page: {
    title: '',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    TitleLoading,
    BoxItem,
    Banner
  },
  data() {
    return {
      loading: false,
      items: [],
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
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
    this.getTemplate(this.currentPage)
  },
  methods: {
    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getTemplate(page) {
      this.scrollToTop()
      this.loading = true
      Axios()
        .get(
          'marketplace/templates/' +
            this.$route.params.template +
            '/?company_slug=' +
            this.currentCompany.slug +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getTemplate(1)
            return
          }
          this.items = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
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
        // code block
      }
    },
    getTitle(total) {
      switch (this.$route.params.template) {
        case 'workflow':
          return this.$tc('Stage', total)
        case 'type':
          return this.$tc('Type', total)
        case 'effort':
          return this.$tc('Effort', total)
        case 'field':
          return this.$tc('Field', total)
        case 'checklist':
          return this.$tc('Checklist', total)
        case 'priority':
          return this.$tc('Priority', total)
        default:
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="marketplace">

      <Banner :template-name="getFeature()"></Banner>
      
      <b-container>
        <b-row align-v="center" class="mb-10-px">
          <b-col>
            <TitleLoading :title="getFeature()" :loading="loading"></TitleLoading>
          </b-col>
        </b-row>
        <b-row>
          <BoxItem :items="items" :template="$route.params.template" :name="getFeature()"></BoxItem>
          <div v-if="totalPages > 1" class="d-flex justify-content-center mb-15-px">
            <b-pagination
              v-model="currentPage"
              hide-goto-end-buttons
              class="paginator"
              :total-rows="totalRows"
              :per-page="perPage"
              @change="getTemplate"
            >
              <template slot="prev-text">
                <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
              </template>
              <template slot="next-text">
                <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
              </template>
            </b-pagination>
          </div>
        </b-row>
      </b-container>
      
    </div>
  </Layout>
</template>
