<script>
import Axios from '@utils/axios'
import Layout from '@layouts/tpl-main'
import SideBar from '@components/companies/side-bar'
import TitleLoading from '@components/utils/title-loading'
import TemplateUserStoryPriority from '@components/companies/templates/user-story-priority'

export default {
  page: {
    title: 'User Story Priority Template',
    meta: [{ name: 'description', content: 'User Story Priority' }],
  },
  components: { Layout, TemplateUserStoryPriority, SideBar, TitleLoading },
  data() {
    return {
      loading: true,
      loadingCreate: false,
      templateList: [],
      templateSelected: null,
      name: '',
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
    }
  },
  created() {
    this.templateType = this.$route.params.template
    this.listTemplates()
  },
  methods: {
    listTemplates() {
      Axios()
        .get('templates/priority/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          const templateList = this.handleTemplatePrivacy(response.data.data)
          if (!this.templateSelected && templateList[0]) {
            this.templateSelected = templateList[0]
          }

          this.templateList = templateList
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
        })
    },

    handleTemplatePrivacy(templateList) {
      for (let i = 0; i < templateList.length; i++) {
        templateList[i].is_private = !templateList[i].is_private
      }
      return templateList
    },

    createTemplate() {
      this.loadingCreate = true
      Axios()
        .post('templates/priority/?company_slug=' + this.currentCompany.slug, {
          name: this.name,
        })
        .then((response) => {
          this.loadingCreate = false
          this.name = ''
          this.selected(response.data.data)
          this.templateList.push(response.data.data)
        })
        .catch((e) => {
          this.loadingCreate = false
        })
    },

    selected(object) {
      this.templateSelected = object
    },

    deleteSelectedTemplate() {

       this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('templates/priority/' + this.templateSelected.id + '/?company_slug=' + this.currentCompany.slug)
          .then((response) => {
            this.templateList.splice(this.templateList.indexOf(this.templateSelected), 1)
            this.templateSelected = {}
          })
        }
      })

    },

    updateList() {
      this.listTemplates()
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="template template-user-story">
      <div class="row mb-30-px">
        <div class="col-md-2">
          <SideBar></SideBar>
        </div>
        <div class="col-md-9 offset-md-1">
          <div class="row">
            <div class="col-md-4">
              <TitleLoading
                :title="$t('User Story Priority')"
                :loading="loading"
                addclass="text-dark font-weight-bold mb-0 mr-5"
              ></TitleLoading>
              <h3 class="sub-title tx-14-px mb-10-px mt-20-px fw-500 txt-001737">
                {{ $t('Create a Template') }}
              </h3>
            </div>
            <div v-if="templateSelected !== null && templateSelected.slug" class="col-md-7 offset-md-1 d-flex">
              <h3 class="fw-600 tx-18-px col-md-9 p-0">
                {{ $t('Template Selected') }}
              </h3>
              <span class="float-right col-md-3 pd-0 text-right">
                <a class="txt-68748F fw-500 lh-15-px tx-10-px tx-uppercase" href="javascript:;" @click="deleteSelectedTemplate">
                  {{ $t('Delete') }}
                </a>
              </span>
            </div>
            <div v-else class="col-md-8">
              <h4>{{ $t('Please, select an available template') }}</h4>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4">
              <div class="create-template-div d-flex">
                <input
                  v-model="name"
                  pattern=".{3,}"
                  required
                  :title="$t('3 characters minimum')"
                  type="text"
                  maxlength="25"
                  class="form-control"
                  :placeholder="$t('Write template name')"
                />
                <div class="input-group-append">
                  <button
                    v-show="!loadingCreate"
                    class="btn btn-sm btn-primary"
                    type="button"
                    :disabled="name.length < 3"
                    @click="createTemplate"
                  >
                    <i class="fa fa-check"></i>
                  </button>

                  <button v-show="loadingCreate" class="btn btn-sm btn-primary" type="button">
                    <b-spinner :label="$t('Loading')" small class="title-loading"></b-spinner>
                  </button>
                </div>
              </div>

              <span class="sub-title d-block tx-14-px mb-10-px mt-20-px fw-500 txt-001737">
                {{ $t('Available templates') }}
              </span>

              <div
                v-for="template in templateList"
                :key="template.id"
                class="col-md-12 overflow-auto card-template cursor-pointer mb-10-px p-10-px"
                :class="templateSelected.slug === template.slug ? 'selected' : ''"
                @click="selected(template)"
              >
                <p class="fw-600 txt-12-px txt-3D4F9F lh-18-px mb-5-px" v-text="template.name"></p>
                <p class="txt-909CB8 m-0"> <span v-text="template.items.length"></span> {{ $t('priorities') }} </p>
              </div>
            </div>
            <div v-if="templateSelected !== null && templateSelected.slug" class="col-md-7 offset-md-1">
              <TemplateUserStoryPriority
                :template-selected="templateSelected"
                @update-list="updateList"
              ></TemplateUserStoryPriority>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
