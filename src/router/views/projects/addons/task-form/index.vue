<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import Sidebar from '@components/projects/addons/sidebar-task-form'
import TaskFormEnable from '@components/projects/addons/task-form-enable'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Form2Task',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, ButtonLoading, Sidebar, TaskFormEnable },
  data() {
    return {
      dates: '',
      loading: true,
      btnConvertLoading: false,
      answers: [],
      gridConfig: [
        'max-width:600px; width:600px;',
        '',
        'max-width:35px; width:35px;',
        'max-width:450px; width:450px;',
      ],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,

      workflow: [],
      workflows: [],
      configFormAnswer: null
    }
  },
  created() {
    this.getAnswers(this.currentPage)
    this.getConfig()
  },
  methods: {
    ...modalManager,

    modalTask(value, object) {
      this.open({ name: value, object: object })
    },

    getAnswers(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
      .get(
        'form-answers/?company_slug=' + 
        this.$route.params.companySlug + 
        '&project_slug=' + 
        this.$route.params.projectSlug +
        '&page=' +
        page
      )
      .then((response) => {
        if (response.data.data.length === 0 && page !== 1) {
          this.getAnswers(1)
          return
        }
        this.loading = false
        this.answers = response.data.data
        this.totalRows = response.data.total
        this.totalPages = response.data.total_pages
        this.perPage = response.data.per_page
        this.currentPage = response.data.current_page
      })
    },
    getConfig() {
      Axios()
        .get(
          'config-form-answers/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {

          let data = response.data.data
          this.configFormAnswer = data
          this.workflow = data.config_workflow_id
          this.getWorkflows()
          
        })
    },
    getWorkflows() {
      Axios()
        .get(
          'projects-workflows/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.workflows = response.data.data
          
          if ( !this.workflow ) {
          
            this.workflows.forEach(element => {
              if ( element.default ){
                this.workflow = element.id
                return
              }
            });

          }
          
        })
    },
    convertToTask(item, index){
      this.btnConvertLoading = true
      Axios()
      .post(
        'form-answers/' + item.uuid + '/convert/?company_slug=' + 
        this.$route.params.companySlug + 
        '&project_slug=' + 
        this.$route.params.projectSlug,
        {
          workflow_id: this.workflow
        }
      )
      .then((response) => {
        this.btnConvertLoading = false
        this.getAnswers();
      })

    },
    updateWorkflow(){
      Axios()
        .put(
          'config-form-answers/workflow/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug, {
            config_workflow_id: this.workflow
          }
        )
        .then((response) => {
          this.btnLoading = false
        })
    },
    remove(item, index){
      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.loading = true
          Axios()
          .delete(
            'form-answers/' + item.uuid + '/?company_slug=' + 
            this.$route.params.companySlug + 
            '&project_slug=' + 
            this.$route.params.projectSlug
          )
          .then((response) => {
            this.getAnswers();
          })

        }
      })
    },
    configFormAnswerConfig(status){
      this.configFormAnswer.enabled = status
    }
  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
      <TitleLoading :title="$t('Form2Task')" :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="form2task pt-60px">
      
      <div class="container">
        <div class="row mb-30-px">
          <div class="col-md-3">
            <Sidebar></Sidebar>
          </div>
          <div class="col-md-9">
            
            <div>

              <TaskFormEnable v-if="configFormAnswer" :config="configFormAnswer" @enableShareableLink="configFormAnswerConfig"></TaskFormEnable>
              
              <div class="mt-15-px">
                <div class="divTable">
                  <div class="divTableHead">
                    <div class="divTableRow">
                      <div class="divTableCell d-flex justify-content-start align-items-center" :style="gridConfig[0]">
                        {{ $t('Answer') }}
                      </div>
                      <div class="d-flex justify-content-end align-items-center" :style="gridConfig[3]">
                        <div>{{ $t('Convert to workflow stage') }}</div>
                        <div class="ml-10-px wd-150-px">
                          <b-form-select v-model="workflow" :options="workflows" value-field="id" text-field="title" size="sm" @change="updateWorkflow"></b-form-select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="divTableBody">
                    <div v-for="(item, index) in answers" :key="index" class="divTableRowBg">
                      <div class="divTableRow d-flex">
                        <div class="divTableCell text-left" :style="item.task ? '' : gridConfig[0]">
                          <span v-show="item.status.id === 1" class="txt-primary-title txt-link" @click="modalTask('task', item.task)">{{ item.title}}</span>
                          <span v-show="!item.status.id" class="txt-primary-title txt-link" @click="modalAnswer('answer', item)">{{ item.title}}</span>
                          <p class="mb-0">
                            <span class="d-block">{{ item.description | truncate(160) }}</span>
                            <span class="d-block mt-10-px">
                              <span class="badge badge-light">{{ item.status.name}}</span> <span>{{ $t('Created at') }} {{ item.created_at.date_for_humans}}</span>
                            </span>
                          </p>
                        </div>
                        <div v-if="!item.status.id" class="divTableCell text-center" :style="gridConfig[1]">
                          <span class="btn-medium-small">
                            <ButtonLoading
                              :loading="btnConvertLoading"
                              :title="$t('Convert to Task')"
                              :title-loading="$t('Converting')"
                              type="btn-md"
                              mode="button"
                              @action="convertToTask(item, index)"
                            ></ButtonLoading>
                          </span>
                          <span>

                          </span>
                        </div>
                        <div v-if="!item.status.id" class="divTableCell d-flex align-items-top" :style="gridConfig[2]">
                          
                          <div class="dropdown header-dropdown">
                            <div class="dropdown-toggle" data-toggle="dropdown">
                              <div class="dropdown-ellipsis">
                                <font-awesome-icon :icon="['far', 'ellipsis-v']" />
                              </div>
                            </div>
                            <div class="dropdown-menu dropdown-menu-right" style="padding:6px 10px 6px">
                              <a
                                class="header-dropdown-item"
                                style="margin-top:10px"
                                href="javascript:;"
                                @click="remove(item, index)"
                              >
                                <span class="icon-size"><font-awesome-icon :icon="['fal', 'minus-square']"/></span>
                                <span class="ml-2">{{ $t('Remove Answer') }}</span>
                              </a>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                <b-pagination
                  hide-goto-end-buttons
                  class="paginator"
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                  @change="getAnswers"
                >
                  <template slot="prev-text">
                    <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
                  </template>
                  <template slot="next-text">
                    <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
                  </template>
                </b-pagination>
              </div>
            </div>        
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
