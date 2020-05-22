<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import ListTasks from '@components/projects/tasks/list-tasks'
import TitleLoading from '@components/utils/title-loading'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import DescriptionEditable from '@components/utils/description-editable'
import LabelEdit from 'label-edit'

export default {
  page: {
    title: 'User Story',
    meta: [{ name: '', content: '' }],
  },
  components: { Layout, ListUsers, ListTasks, LabelEdit, vSelect, TitleLoading, DescriptionEditable },
  data() {
    return {
      loading: true,
      tasks: [],
      userStory: [],
      userStoryPriorities: [],
      userStoryEndpoint: this.getUserStoryEndpoint(),
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
    }
  },
  mounted() {
    this.getUserStoryPriorities()
    this.getTasks(this.currentPage)
  },
  created() {
    this.getUserStory()
  },
  methods: {
    scrollToElem() {
      if (document.getElementById('task-assignees')) {
        let top = document.getElementById('task-assignees').offsetTop
        window.scroll({
          top: top,
          left: 0,
          behavior: 'smooth',
        })
      }
    },

    getUserStoryPriorities() {
      Axios()
        .get(
          'user-story-priorities/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].title,
              code: data[i].id,
              color: data[i].color,
            })
          }
          this.userStoryPriorities = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getUserStoryEndpoint() {
      return (
        'user-stories/' +
        this.$route.params.userStorySlug +
        '/?company_slug=' +
        this.$route.params.companySlug +
        '&project_slug=' +
        this.$route.params.projectSlug
      )
    },

    getUserStory() {
      Axios()
        .get(
          'user-stories/' +
            this.$route.params.userStorySlug +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.userStory = response.data.data
          if( !this.userStory.priority ) {
            this.userStory.priority = {
              title: '',
              color: '#FFFFFF'
            }
          }

          // this.setSelectTextColor()
          this.loading = true
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getTasks(page) {
      this.scrollToElem()
      Axios()
        .get(
          'tasks/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug +
          '&user_story_slug=' +
          this.$route.params.userStorySlug +
          '&page=' +
          page
        )
        .then((response) => {
          this.tasks = response.data.data
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

    deleteUserStory() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete(this.getUserStoryEndpoint())
          .then((response) => {
            this.$router.push({
              name: 'projects.user-stories',
              params: {
                companySlug: this.$route.params.companySlug,
                projectSlug: this.$route.params.projectSlug,
              },
            })
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })

    },

    update(params) {
      Axios()
        .put(
          'user-stories/' +
            this.$route.params.userStorySlug +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          params
        )
        .then((response) => {})
        .catch((e) => {
          this.getUserStory()
          console.error(e)
        })
    },

    updatePriority(priority) {
      this.userStory.priority.color = priority.color
      // this.setSelectTextColor()
      let params = {
        user_story_priority_id: priority.code,
      }
      this.update(params)
    },
    downloadExcel() {
      Axios()
        .get(
          '/export-time-trackings/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&user_story_slug=' +
            this.$route.params.userStorySlug,
          { responseType: 'blob' }
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', this.userStory.title + '.xlsx')
          document.body.appendChild(link)
          link.click()
        })
        .catch((e) => {
          console.error(e)
        })
    },
    titleUpdate(title){
      let params = {
        title: title,
      }
      this.update(params)
      this.userStory.title = title
    }
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
     <TitleLoading
        :title="$t('User Stories')"
        :subtitle="$t('User stories are short and simple descriptions of capabilities')"
      >
      </TitleLoading>
    </template>

    <div slot="content" class="user-story pt-70px">
      
      <div class="container">
    
        <div class="row mb-30-px">
          <div class="col-lg-12">
            <div class="wd-100">
            
              <div class="title-component">
                <LabelEdit v-if="authorize('userStories', 'update')" class="wd-100" :text="userStory.title" v-on:text-updated-blur="titleUpdate"  v-on:text-updated-enter="titleUpdate"  v-on:text-updated="titleUpdate" :placeholder="$t('User Story Name')"></LabelEdit>
                <span v-else class="vlabeledit-label" v-text="userStory.title"></span>
              </div>

              <div class="d-flex justify-content-between">
                <div class="d-flex ml-7-px">
                  <div class="mr-12-px">
                    <ListUsers :link="true" :user="userStory.user" size="30"></ListUsers>
                  </div>
                  <div>
                    <router-link
                      :to="{
                        name: 'profile.user',
                        params: { username: userStory.user.username },
                      }"
                      class="d-block lh-16-px fw-600 tx-14-px txt-1E1E2F"
                      v-text="userStory.user.name"
                    >
                    </router-link>
                    <span class="d-block txt-909CB8 tx-12-px">
                      {{ $t('Created on') }}
                      <span v-text="userStory.created_at.date_for_humans"></span>
                    </span>
                  </div>
                </div>
                  
                <div class="d-flex justify-content-start v-select-mini user-story-priority">
                  
                  <v-select
                    id="user-story-priority"
                    v-model="userStory.priority.title"
                    :options="userStoryPriorities"
                    class="d-flex tx-uppercase"
                    :style="'color: ' + invertColor(userStory.priority.color, true) + ';background: ' + userStory.priority.color"
                    label="label"
                    :clearable="false"
                    :searchable="false"
                    @input="updatePriority"
                  >
                  </v-select>
                  
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-12 mb-15-px">
            <div v-if="userStory.stats" class="d-flex align-items-center">
              <span class="txt-909CB8 percentage-text"> {{ parseFloat(userStory.stats.percentage) | percent(0) }}</span>
              <div class="progress wd-100 ml-10-px">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :aria-valuenow="userStory.stats.percentage + 1"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="'width:' + userStory.stats.percentage + '%'"
                >
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3">
            <div class="hero-card-row">
              <div class="hero-card hero-unique card-md">
                <span class="icon">
                  <span class="hours">
                    <font-awesome-icon :icon="['far', 'clock']" class="txt-FBBB00" />
                  </span>
                </span>
                <span v-if="userStory.stats" class="number mt-5-px mb-4-px" v-text="userStory.stats.worked_hours"></span>
                <span class="text pb-10-px">{{ $t('Hours Worked') }}</span>
              </div>

              <div class="d-flex justify-content-between">
                <div class="hero-card hero-one card-md">
                  <span class="icon">
                    <span class="closed">
                      <font-awesome-icon :icon="['far', 'tasks']" class="txt-3D4F9F" />
                    </span>
                  </span>
                  <span class="number mt-5-px mb-4-px">
                    <span v-if="userStory.stats" v-text="userStory.stats.story_points"> </span>
                  </span>
                  <span class="text pb-10-px">
                    {{ $t('Total Effort') }}
                  </span>
                </div>
              
                <div class="hero-card hero-two card-md">
                  <span class="icon">
                    <span class="completed">
                      <font-awesome-icon :icon="['far', 'check']" class="txt-26DC8E" />
                    </span>
                  </span>
                  <span v-if="userStory.stats" class="number mt-5-px mb-4-px">
                    {{ userStory.stats.closed_tasks }}/{{ userStory.stats.total_tasks }}
                  </span>
                  <span class="text pb-10-px">
                    {{ $tc('Task', 2) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="userStory.users" class="hero-card text-left mb-10-px">
              <h3 class="tx-16-px fw-600 m-0">{{ $tc('Team', 1) }}</h3>
              <div class="p-5-px">
                <ListUsers
                  :link="true"
                  :users="userStory.users"
                  :limit="100"
                ></ListUsers>
              </div>
            </div>

            <div class="hero-card text-left mb-10-px">
              <h3 class="tx-16-px fw-600 m-0">{{ $t('Additional information') }}</h3>
              <DescriptionEditable
                class="mt-15-px"
                :description="userStory.additional_information"
                :description-mention="userStory.additional_information_mention"
                :endpoint="userStoryEndpoint"
                paramName="additional_information"
                :placeholder="$t('Additional information Description')"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                permission-feature="userStories"
              ></DescriptionEditable>
            </div>

            <div class="hero-card text-left mb-10-px">
              <h3 class="tx-16-px fw-600 m-0">{{ $t('Acceptance criteria') }}</h3>
              <DescriptionEditable
                class="mt-15-px"
                :description="userStory.acceptance_criteria"
                :description-mention="userStory.acceptance_criteria_mention"
                :endpoint="userStoryEndpoint"
                paramName="acceptance_criteria"
                :placeholder="$t('Acceptance criteria Description')"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                permission-feature="userStories"
              ></DescriptionEditable>
            </div>

            <div v-if="authorize('userStories', 'delete')" class="hero-card text-left">
                <a
                  href="javascript:;"
                  class="txt-68748F fw-500 lh-15-px tx-10-px mr-10-px tx-uppercase"
                  title="Delete User Story"
                  @click="deleteUserStory"
                  >
                  <font-awesome-icon :icon="['far', 'trash']" class="mr-5-px" style="font-size:12px; color: #909CB8;" />
                  {{ $t('Delete User Story') }}
                </a>
            </div>
          </div>

          <div class="col-lg-7">

            <ListTasks class="mg-t-20" :items="tasks" :search="true" title="" :flag="true"></ListTasks>
          
            <div v-if="totalRows" class="d-flex justify-content-center mt-4">
            <!-- <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4"> -->
              <b-pagination
                hide-goto-end-buttons
                class="paginator"
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                @change="getTasks"
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

          <div class="col-lg-2">

            <span class="btn-download txt-link d-block" @click="downloadExcel">
              <font-awesome-icon :icon="['fal', 'cloud-download']" class="mr-4-px tx-14-px" />
              {{ $t('Download TimeSheet') }}
            </span>

            <div class="mt-20-px">
              <router-link
                :to="{
                  name: 'projects.user-stories.assign-tasks',
                  params: {
                    companySlug: $route.params.companySlug,
                    projectSlug: $route.params.projectSlug,
                    userStorySlug: $route.params.userStorySlug,
                  },
                }"
                class="btn btn-success btn-sm wd-100"
              >
                {{ $tc('Assign Tasks', 2) }}
              </router-link>
            </div>

            <div class="mt-10-px">
              <router-link
                :to="{
                  name: 'projects.board',
                  params: {
                    companySlug: this.$route.params.companySlug,
                    projectSlug: this.$route.params.projectSlug,
                  },
                  query: { userStorySlug: this.$route.params.userStorySlug },
                }"
                class="btn btn-primary btn-sm wd-100"
              >
                {{ $t('User Story in Board') }} ({{ tasks.length }})
              </router-link>
            </div>

            <div>
              
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
