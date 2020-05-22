<script>
import Axios from '@utils/axios'
import Layout from '@layouts/tpl-main'
import TitleLoading from '@components/utils/title-loading'
import BoxItem from '@components/marketplace/box-item'
import SideList from '@components/marketplace/side-list'
import Banner from '@components/marketplace/banner'

export default {
  page: {
    title: 'Marketplace',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    TitleLoading,
    BoxItem,
    SideList,
    Banner,
  },
  data() {
    return {
      loading: false,
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
      boxes: [
        {
          title: this.$t('Workflows'),
          loading: true,
          items: [],
          template: {
            type: 'workflow',
            name: this.$tc('Stage', 0),
          },
        },
        {
          title: this.$t('Task Types'),
          loading: true,
          items: [],
          template: {
            type: 'type',
            name: this.$tc('Type', 0),
          },
        },
        {
          title: this.$t('Task Efforts'),
          loading: true,
          template: {
            type: 'effort',
            name: this.$tc('Effort', 0),
          },
        },
        {
          title: this.$t('Task Custom Fields'),
          loading: true,
          template: {
            type: 'field',
            name: this.$tc('Field', 0),
          },
        },
        {
          title: this.$t('Task Checklists'),
          loading: true,
          template: {
            type: 'checklist',
            name: this.$tc('Checklist', 0),
          },
        },
        {
          title: this.$t('User Story Priorities'),
          loading: true,
          template: {
            type: 'priority',
            name: this.$tc('Prioritiy', 0),
          },
        },
      ],
    }
  },
  created() {
    this.getTemplateTypes()
    this.getTemplateEfforts()
    this.getTemplatePriorities()
    this.getTemplateWorkflows()
    this.getTemplateFields()
    this.getTemplateChecklists()
  },
  methods: {
    getTemplateWorkflows() {
      this.boxes[0].loading = true
      Axios()
        .get('marketplace/templates/workflow/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[0].items = response.data.data
          this.boxes[0].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplateTypes() {
      this.boxes[1].loading = true
      Axios()
        .get('marketplace/templates/type/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[1].items = response.data.data
          this.boxes[1].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplateEfforts() {
      this.boxes[2].loading = true
      Axios()
        .get('marketplace/templates/effort/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[2].items = response.data.data
          this.boxes[2].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplateFields() {
      this.boxes[3].loading = true
      Axios()
        .get('marketplace/templates/field/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[3].items = response.data.data
          this.boxes[3].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplateChecklists() {
      this.boxes[4].loading = true
      Axios()
        .get('marketplace/templates/checklist/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[4].items = response.data.data
          this.boxes[4].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTemplatePriorities() {
      this.boxes[5].loading = true
      Axios()
        .get('marketplace/templates/priority/?limit=4&company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.boxes[5].items = response.data.data
          this.boxes[5].loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="marketplace">

      <Banner :template-name="''"></Banner>

      <div class="row mb-30-px">
        <div class="col-md-12">
          <div v-for="(boxe, index) in boxes" :key="index" class="row mb-10-px">
            <div class="col-md-12">
              <div class="d-flex justify-content-between align-items-center mb-10-px">
                <div>
                  <TitleLoading :title="boxe.title" :loading="boxe.loading" class="header-title" />
                </div>
                <div>
                  <router-link
                    :to="{
                      name: 'marketplace.templates.index',
                      params: {
                        template: boxe.template.type,
                      },
                    }"
                    class="txt-link txt-primary  mr-10-px"
                  >
                    {{ $t('See All') }}
                  </router-link>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <BoxItem :items="boxe.items" :template="boxe.template.type" :name="boxe.template.name"></BoxItem>
            </div>
          </div>
        </div>
        <!--
        <div class="col-md-2 offset-md-1">
         
          <SideList :title="$t('Installed')" :informations="list"> </SideList>
          <SideList :title="$t('Popular')" :informations="list"> </SideList>
          
        </div>
        -->
      </div>
    </div>
  </Layout>
</template>
