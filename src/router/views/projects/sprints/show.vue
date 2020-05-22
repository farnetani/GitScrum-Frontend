<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import ListTasks from '@components/projects/tasks/list-tasks'
import TitleLoading from '@components/utils/title-loading'
import Burndown from '@components/projects/sprints/burndown'
import DatePicker from 'vue2-datepicker'
import DescriptionEditable from '@components/utils/description-editable'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import LabelEdit from 'label-edit'
import Activities from '@components/utils/activities'

export default {
  page: {
    title: 'Sprint',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    ListUsers,
    ListTasks,
    Burndown,
    DatePicker,
    DescriptionEditable,
    vSelect,
    LabelEdit,
    Activities,
    TitleLoading
  },
  data() {
    return {
      loading: false,
      sprint: null,
      tasks: [],
      sprintDates: [],
      sprintStatus: '',
      sprintStatuses: [],
      sprintEndpoint: this.getSprintEndpoint(),
      timeboxEditMode: false,
      timeboxChangesLoading: false,
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
    }
  },
  mounted() {
    this.getSprint()
    this.getSprintStatuses()
    this.getTasks(this.currentPage)
  },
  methods: {
    
    getSprintStatuses() {
      Axios()
        .get('sprints/statuses?company_slug=' + this.$route.params.companySlug)
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].title,
              code: data[i].slug,
            })
          }
          this.sprintStatuses = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getSprintEndpoint() {
      return (
        'sprints/' +
        this.$route.params.sprintSlug +
        '/?company_slug=' +
        this.$route.params.companySlug +
        '&project_slug=' +
        this.$route.params.projectSlug
      )
    },

    getSprint() {
      Axios()
        .get('sprints/' + this.$route.params.sprintSlug + 
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug)
        .then((response) => {
          this.sprint = response.data.data
          this.sprintStatus = this.sprint.status.title
          document.title = this.sprint.title

          if (this.sprint.date_start && this.sprint.date_finish) {
            this.sprintDates[0] = new Date(this.sprint.date_start)
            this.sprintDates[1] = new Date(this.sprint.date_finish)
          }

          if (this.timeboxChangesLoading) {
            this.handleDatePicker()
          }

          this.timeboxChangesLoading = false
          this.loading = true
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getTasks(page) {
      this.gotoScrollTop();
      this.loading = true
      Axios()
        .get(
          'tasks/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&sprint_slug=' +
            this.$route.params.sprintSlug +
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
          this.loading = false
          console.error(e)
        })
    },

    deleteSprint() {
        
      if( this.title ){
        Axios()
        .delete(this.getSprintEndpoint())
        .then((response) => {
          this.$router.push({
            name: 'projects.sprints',
            params: {
              companySlug: this.$route.params.companySlug,
              projectSlug: this.$route.params.projectSlug,
            },
          })
        })
        .catch((e) => {
          console.error(e)
        })
      } else{
        alert(this.$t('You must fill in at least the first field'))
      }

    },

    update(params) {
      Axios()
        .put('sprints/' + this.$route.params.sprintSlug + 
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug, params)
        .then((response) => {
          if (this.timeboxChangesLoading) {
            this.getSprint()
          }
        })
        .catch((e) => {
          console.error(e)
        })
    },

    changeDate(date) {
      this.timeboxChangesLoading = true

      let dateStartFormated = null
      let dateFinishFormated = null

      if (this.sprintDates) {
        if (this.sprintDates[0]) {
          let dateStart = new Date(this.sprintDates[0])
          dateStartFormated = dateStart.getFullYear() + '-' + (dateStart.getMonth() + 1) + '-' + dateStart.getDate()
        }

        if (this.sprintDates[1]) {
          let dateFinish = new Date(this.sprintDates[1])
          dateFinishFormated = dateFinish.getFullYear() + '-' + (dateFinish.getMonth() + 1) + '-' + dateFinish.getDate()
        }
      }

      let params = {
        date_start: dateStartFormated,
        date_finish: dateFinishFormated,
      }

      this.update(params)
    },

    updateStatus(status) {
      let params = {
        sprint_status_id: status,
      }
      this.update(params)
    },

    handleDatePicker() {
      this.timeboxEditMode = !this.timeboxEditMode
      this.$refs.datepick.popupVisible = this.timeboxEditMode
    },

    downloadExcel() {
      Axios()
        .get(
          '/export-time-trackings/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&sprint_slug=' +
            this.$route.params.sprintSlug,
          { responseType: 'blob' }
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', this.sprint.title + '.xlsx')
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
      this.sprint.title = title
    }
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
     <TitleLoading
        :title="$t('Sprints')"
        :subtitle="$t('Sprint is one timeboxed iteration of a continuous cycle')"
      >
      </TitleLoading>
    </template>

    <div slot="content" class="sprint pt-70px">
      
      <div class="container">
        <div v-if="sprint" class="row mb-30-px">
          <div class="col-lg-12">
            <div class="wd-100">

              <div class="title-component">
                <LabelEdit v-if="authorize('sprints', 'update')" :placeholder="$t('Sprint Name')" class="wd-100" :text="sprint.title" @text-updated-blur="titleUpdate" @text-updated="titleUpdate"></LabelEdit>
                <span v-else class="vlabeledit-label" v-text="sprint.title"></span>
              </div>
              
              <div class="d-flex justify-content-between">
                <div class="d-flex justify-content-start" style="height: 25px;">
                  <span class="tx-14-px fw-600">{{ $t('Timebox') }}</span>
                  <div v-if="sprint" class="sprint-timebox ml-10-px wd-150">
                    <div :class="timeboxEditMode ? 'none' : ''">
                      <span class="fw-normal txt-68748F" v-text="sprint.timebox"></span>
                      <font-awesome-icon
                        v-if="authorize('sprints', 'update')"
                        :icon="['far', 'calendar-alt']"
                        class="calendar-edit txt-3D4F9F ml-10-px txt-9EA9C1"
                        @click="handleDatePicker"
                      />
                    </div>
                    <div :class="timeboxEditMode ? 'd-flex timebox-datepicker' : 'none'">
                      <DatePicker
                        ref="datepick"
                        v-model="sprintDates"
                        range
                        lang="en"
                        format="YYYY-MM-DD"
                        confirm
                        :disabled="timeboxChangesLoading"
                        @change="changeDate"
                        @blur="handleDatePicker"
                      ></DatePicker>
                      <b-spinner
                        v-show="timeboxChangesLoading"
                        :label="$t('Loading')"
                        variant="secondary"
                        small
                        class="title-loading m-7-px"
                      ></b-spinner>
                    </div>
                  </div>
                  <div v-if="sprint" class="tx-14-px fw-600 ml-20-px">
                    {{ $t('Duration') }}
                    <span class="fw-normal ml-10-px txt-68748F" v-text="sprint.duration"></span>
                  </div>
                </div>
                <div class="d-flex justify-content-start v-select-mini sprint-status">
                  
                  <b-spinner
                    v-show="loading"
                    :label="$t('Loading')"
                    variant="secondary"
                    small
                    class="title-loading mt-4-px mr-10-px"
                  ></b-spinner>

                  <v-select
                    v-model="sprintStatus"
                    :options="sprintStatuses"
                    class="d-flex tx-uppercase"
                    label="label"
                    :clearable="false"
                    :searchable="false"
                    @input="updateStatus"
                  >
                    <!-- <slot name="selected-option" v-bind="typeof option === 'object' ? option : { [label]: option }">

                      {{ option }}
                    </slot> -->
                  </v-select>
                </div>
              </div>
            </div>
          </div>


          <div class="col-lg-12 mb-15-px">
            
            <div v-if="sprint.stats" class="d-flex align-items-center">
              <span class="txt-909CB8 percentage-text"> {{ parseFloat(sprint.stats.percentage) | percent(0) }}</span>
              <div class="progress wd-100 ml-10-px">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :aria-valuenow="sprint.stats.percentage + 1"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="'width:' + sprint.stats.percentage + '%'"
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
                <span v-if="sprint.stats" class="number mt-5-px mb-4-px" v-text="sprint.stats.worked_hours"></span>
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
                    <span v-if="sprint.stats" v-text="sprint.stats.story_points"> </span>
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
                  <span v-if="sprint.stats" class="number mt-5-px mb-4-px">
                    {{ sprint.stats.closed_tasks }}/{{ sprint.stats.total_tasks }}
                  </span>
                  <span class="text pb-10-px">
                    {{ $tc('Task', 2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-7">

            <b-tabs class="tabs-burndown" style="margin-left: -8px;">
              <b-tab :title="$t('Burndown by Task')" active>
                <Burndown v-if="sprint.charts" type-name="Task" :data="sprint.charts.burndown_tasks"></Burndown>
              </b-tab>
              <b-tab :title="$t('Burndown by Effort')">
                <Burndown v-if="sprint.charts" type-name="Effort" :data="sprint.charts.burndown_efforts"></Burndown>
              </b-tab>
            </b-tabs>

          </div>

          <div class="col-lg-2">

            <span class="btn-download txt-link d-block" @click="downloadExcel">
              <font-awesome-icon :icon="['fal', 'cloud-download']" class="mr-4-px tx-14-px" />
              {{ $t('Download TimeSheet') }}
            </span>

            <div class="mt-20-px">
              <router-link
                v-if="authorize('sprints', 'update')"
                :to="{
                  name: 'projects.sprints.assign-tasks',
                  params: {
                    companySlug: $route.params.companySlug,
                    projectSlug: $route.params.projectSlug,
                    sprintSlug: $route.params.sprintSlug,
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
                  query: { sprintSlug: this.$route.params.sprintSlug },
                }"
                class="btn btn-primary btn-sm wd-100"
              >
                {{ $t('Sprint in Board') }} ({{ tasks.length }})
              </router-link>
            </div>

            <div>
              
            </div>

          </div>

          <div class="col-lg-3 mt-10-px">

            <div v-if="sprint.users" class="hero-card text-left mb-10-px">
              <h3 class="tx-16-px fw-600 m-0">{{ $tc('Team', 1) }}</h3>
              <div class="p-5-px">
                <ListUsers
                  :link="true"
                  :users="sprint.users"
                  :limit="100"
                ></ListUsers>
              </div>
            </div>
            
            <div class="hero-card text-left mb-10-px">
              <h3 class="tx-16-px fw-600 m-0">{{ $t('Sprint Goals') }}</h3>
              <DescriptionEditable
                v-if="sprint"
                class="text-left"
                :description="sprint.description"
                :description-mention="sprint.description_mention"
                :endpoint="sprintEndpoint"
                param-name="description"
                :placeholder="$t('Sprint Goals Description')"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                permission-feature="sprints"
              ></DescriptionEditable>
            </div>

            <div class="hero-card text-left mb-10-px">

              <div v-if="sprint.user" class="d-flex">
                <div class="mr-12-px">
                  <ListUsers
                    :link="true"
                    :user="sprint.user"
                    :limit="100"
                  ></ListUsers>
                </div>
                <div>
                  <router-link
                    v-if="sprint.user"
                    :to="{
                      name: 'profile.user',
                      params: { username: sprint.user.username },
                    }"
                    class="d-block lh-16-px fw-600 tx-14-px txt-1E1E2F"
                    v-text="sprint.user.name"
                  >
                  </router-link>
                  <span class="d-block d-flex txt-909CB8 tx-12-px">
                    {{ $t('Created on') }}&nbsp;
                    <span v-if="sprint.created_at" v-text="sprint.created_at.date_for_humans"></span>
                  </span>
                </div>
              </div>

            </div>

            <div v-if="authorize('sprints', 'delete')" class="hero-card text-left">
                <a
                  href="javascript:;"
                  class="txt-68748F fw-500 lh-15-px tx-10-px mr-10-px tx-uppercase"
                  :title="$t('Delete Sprint')"
                  @click="deleteSprint"
                >
                  <font-awesome-icon :icon="['far', 'trash']" class="mr-5-px" style="font-size:12px; color: #909CB8;" />
                  {{ $t('Delete Sprint') }}
                </a>
            </div>

          </div>

          <div class="col-lg-9 mt-20-px">

            <ListTasks class="mg-t-20" :items="tasks" :search="true" title="" :flag="true"></ListTasks>
          
            <div v-if="totalRows" class="d-flex justify-content-center mt-4">
            <!-- <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4"> -->
              <b-pagination
                v-model="currentPage"
                hide-goto-end-buttons
                class="paginator"
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
        </div>
      </div>
    </div>
  </Layout>
</template>
