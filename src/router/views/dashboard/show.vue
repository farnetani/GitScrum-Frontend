<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import Ads from '@components/utils/ads'
import Alert from '@components/utils/alert'
import TitleLoading from '@components/utils/title-loading'
import ListTasks from '@components/projects/tasks/list-tasks'
import Activities from '@components/utils/activities'
import GlanceYear from '@components/utils/glance-year'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  page: {
    title: 'Dashboard',
    meta: [{ name: 'description', content: 'ProjectsList' }],
  },
  components: {
    Layout,
    Ads,
    Alert,
    vSelect,
    TitleLoading,
    ListTasks,
    Activities,
    GlanceYear,
  },
  data() {
    return {
      loading: true,
      loadingTask: true,
      projects: [],
      projectSelected: null,
      tasks: [],
      projectsTasks: [],
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      currentUser: JSON.parse(window.localStorage.getItem('CURRENT_USER')),
      calendarActivities: [],
      showCompanyActivity: true,
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,



      series: [{
          name: 'Website Blog',
          type: 'column',
          data: []
        }, 
        {
          name: 'Social Media',
          type: 'line',
          data: []
        }
      ],
        chartOptions: {
          chart: {
              height: 200,
              type: 'line',
              toolbar: {
                show: false
              }
            },
            style: {
              fontSize: '16px'
            },
            colors: ['#464DEE', '#0CC777'],
            stroke: {
              width: [0, 3]
            },
            legend: {
              show: false
            },
            dataLabels: {
              enabled: true,
              enabledOnSeries: [1],
              style: {
                fontSize: '14px',
                fontWeight: 'bold',
                colors: ['#0CC777', '#0CC777'],
              },
            },
            labels: [],
            xaxis: {
              type: 'string',
              labels: {
                show: false,
              },
              tooltip: {
                enabled: false,
                offsetY: -35,
              },
              
            },            
            yaxis: [{
              show: false,
              labels: {
                show: false,
                formatter: function(val) {
                  return val
                },
              },
              title: {
                text: 'Total Tasks',
              },          
            }, 
            {
              show: false,
            }]
        },
    }
  },
  created() {
    this.getTasks(this.currentPage)
    this.getProjects()
    this.getCalendarActivities()
    this.getProjectsTasks()
  },
  methods: {
    getTasks(page) {
      this.gotoScrollTop();
      this.loadingTask = true
      
      let projectSlug = null;

      if ( this.projectSelected ){
        projectSlug = this.projectSelected.value
      }

      Axios()
        .get('tasks?assignee=me&workflow=open&company_slug=' + this.currentCompany.slug + 
          '&project_slug=' + projectSlug + 
          '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getTasks(1)
            return
          }

          if (!this.projectSelected){
            this.projectSelected = this.projects[0]
          }

          this.tasks = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loadingTask = false

        })
        .catch((e) => {
          console.error(e)
        })
    },
    getProjects() {
      
      Axios()
        .get('projects?company_slug=' + this.currentCompany.slug)
        .then((response) => {

          let data = response.data.data
          
          this.projects.push({    
            value: null,
            text: this.$t('All Projects')
          })
          data.forEach((item, key) => {
            
            this.projects.push({
              value: item.slug,
              text: item.name
            })

          })

          this.projectSelected = this.projects[0]

        })
        .catch((e) => {
          console.error(e)
        })
    },
    getProjectsTasks() {
      
      Axios()
        .get('companies/projects-tasks?company_slug=' + this.currentCompany.slug)
        .then((response) => {

          this.projectsTasks = response.data.data

          this.chartOptions = {
            chart: {
              height: 200,
              type: 'line',
              toolbar: {
                show: false
              }
            },
            style: {
              fontSize: '16px'
            },
            colors: ['#464DEE', '#0CC777'],
            stroke: {
              width: [0, 3]
            },
            legend: {
              show: false
            },
            dataLabels: {
              enabled: true,
              enabledOnSeries: [1],
              style: {
                fontSize: '14px',
                fontWeight: 'bold',
                colors: ['#0CC777', '#0CC777'],
              },
            },
            labels: this.projectsTasks.projects,
            xaxis: {
              type: 'string',
              labels: {
                show: false,
              },
              tooltip: {
                enabled: false,
                offsetY: -35,
              },
              
            },            
            yaxis: [{
              show: false,
              labels: {
                show: false,
                formatter: function(val) {
                  return val
                },
              },
              title: {
                text: 'Total Tasks',
              },          
            }, 
            {
              opposite: false,
              show: false,
            }]
          }
          



          this.series = [{
              name: 'Total Tasks',
              type: 'column',
              data: this.projectsTasks.tasks
            }, 
            {
              name: 'Tasks for me',
              type: 'line',
              data: this.projectsTasks.tasksForMe
            }
          ]

          
         
          console.log(this.chartOptions)

        })
        .catch((e) => {
          console.error(e)
        })
    },
    getCalendarActivities() {
      Axios()
        .get('glance-year/user/' + this.currentUser.username)
        .then((response) => {
          this.calendarActivities = Object.values(response.data.data)
          this.loading = false
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
    <div slot="content" class="dashboard">
      <div class="row mb-30-px">
        <div class="col-md-8">
          <div v-not-visible="'tablet'" class="box-shadow mb-30-px">
            <GlanceYear :data="calendarActivities" :slug="currentUser.username" type="user"> </GlanceYear>
          </div>
          
          <div v-not-visible="'tablet'" class="box-shadow mb-30-px">
            <font-awesome-icon :icon="['far', 'tasks']" class="txt-9EA9C1" style="position:relative; top:-1px;" />
            <span class="tx-16-px fw-500 ml-8-px">{{ $t('Projects / Tasks for me') }}</span>
            <apexchart type="line" height="200" :options="chartOptions" :series="series"></apexchart>
          </div>

          <Ads v-if="currentCompany.subscription === 'free'" type="large"></Ads>

          <b-container>
            <b-row align-v="center">
              <b-col>
                <TitleLoading :title="$t('My Next Tasks')" :loading="loadingTask"></TitleLoading>
              </b-col>
              <b-col>
                <v-select
                  v-model="projectSelected"
                  :options="projects"
                  label="text"
                  @input="getTasks"
                ></v-select>
              </b-col>
            </b-row>
          </b-container>



          <ListTasks
            id="task-assignees"
            class="mt-20-px"
            :items="tasks"
            :search="true"
            title=""
            :flag="true"
          ></ListTasks>

          <div v-if="!tasks.length && !loadingTask">
            <Alert :message="$t('You have no task to perform on this project')" :status="true"></Alert>
          </div>

          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
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
        <div v-not-visible="'tablet'" class="col-sm-3 offset-md-1">
          <img src="https://gitscrum-static.s3.amazonaws.com/img/boot-gitscrum.png" style="box-shadow: 0 0 6px rgba(0,0,0,.08); border-radius: 4px; width: 270px;" />
          <!--
          <TitleLoading
            :title="$t('Company Recent Activity')"
            :loading="loadingTask"
            addclass="text-dark font-weight-bold mb-0 mr-5"
          ></TitleLoading>
          <div v-if="showCompanyActivity" slot="sidebar">
            <Activities :company-slug="currentCompany.slug" context="company"></Activities>
          </div>
          -->
        </div>
      </div>
    </div>
  </Layout>
</template>
