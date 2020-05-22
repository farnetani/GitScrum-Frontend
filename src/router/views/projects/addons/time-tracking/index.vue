<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import DatePicker from 'vue2-datepicker'
import ListUsers from '@components/utils/list-users'
import TitleLoading from '@components/utils/title-loading'
import moment from 'moment'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Time Tracking',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    DatePicker,
    ListUsers,
    TitleLoading,
  },
  data() {
    return {
      loading: false,
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      gridConfig: {
        style: ['max-width:55px; width:55px;', '', 'max-width:250px; width:250px;'],
      },
      dates: [],
      items: [],
      stats: [],
      resume: [],
      series: [],
      chartOptions: {
        chart: {
          type: 'bar',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val
          },
          offsetY: -20,
          style: {
            fontSize: '11px',
            colors: ['#304758'],
          },
        },

        xaxis: {
          categories: [
            '00-01',
            '01-02',
            '02-03',
            '03-04',
            '04-05',
            '05-06',
            '06-07',
            '07-08',
            '08-09',
            '09-10',
            '10-11',
            '11-12',
            '12-13',
            '13-14',
            '14-15',
            '15-16',
            '16-17',
            '17-18',
            '18-19',
            '19-20',
            '20-21',
            '21-22',
            '22-23',
            '23-24',
          ],
          position: 'top',
          labels: {
            offsetY: -18,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          tooltip: {
            enabled: false,
            offsetY: -35,
          },
        },
        fill: {
          gradient: {
            shade: 'light',
            type: 'horizontal',
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [50, 0, 100, 100],
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
            formatter: function(val) {
              return val
            },
          },
        },
      },
    }
  },
  created() {
    this.getTimeTracking(this.currentPage, '', '')
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },

    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getTimeTracking(page, dateStart, dateEnd) {
      this.scrollToTop()
      this.loading = true
      Axios()
        .get(
          'time-trackings/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&start=' +
            dateStart +
            '&end=' +
            dateEnd +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.data.length === 0 && page !== 1) {
            this.getTimeTracking(1, '', '')
            return
          }
          this.items = response.data.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.resume = response.data.data.resume

          this.series = [
            {
              name: this.$t('Closed tasks'),
              data: response.data.data.stats,
            },
          ]
          this.loading = false
        })
        .catch((error) => {
          console.error(error)
        })
    },

    changeDate(date) {
      this.loading = true
      let d0 = new Date(date[0])
      let d1 = new Date(date[1])
      let dateStart = d0.getFullYear() + '-' + (d0.getMonth() + 1) + '-' + d0.getDate() + ' 00:00'
      let dateEnd = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate() + ' 23:59'
      this.getTimeTracking(
        1,
        moment.utc(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        moment.utc(dateEnd).format('YYYY-MM-DD HH:mm:ss')
      )
    },

    periodStart() {
      return this.resume.period_start ? moment.utc(this.resume.period_start).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    periodEnd() {
      return this.resume.period_end ? moment.utc(this.resume.period_end).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    periodHours() {
      return this.resume.worked_hours ? this.resume.worked_hours : '-'
    },

    downloadExcel() {
      Axios()
        .get(
          '/export-time-trackings/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&start_date=' +
            this.resume.period_start +
            '&end_date=' +
            this.resume.period_end,
          { responseType: 'blob' }
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'time-tracking.xlsx')
          document.body.appendChild(link)
          link.click()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    removeTime(id) {

      this.$bvModal.msgBoxConfirm(this.$t('Are you sure you want to delete this time tracking?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){

          Axios()
          .delete(
          '/time-trackings/' +
            id +
            '/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
          )
          .then((response) => {
            let found = this.items.find((t) => t.time.id === id)
            this.items.splice(this.items.indexOf(found), 1)
          })
          .catch((error) => {
            this.alertMessage = 'Error. ' + error.response.data.message
            this.alertStatus = true
          })

        }
      })
      
    },
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
      <TitleLoading
        :title="$t('Time Tracking')" :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="time-stracking pt-60px">
      <div class="container">
        <div class="row mb-30-px">
          <div class="col-md-12">
            
            <div class="d-flex justify-content-between">
              <DatePicker
                v-model="dates"
                range
                lang="en"
                type="date"
                class="mt-1"
                confirm
                @change="changeDate"
                :not-after="new Date()"
              ></DatePicker>
              <div></div>
              <div>
                <button class="btn btn-primary" @click="downloadExcel">
                  {{ $t('Export') }}
                </button>
              </div>
            </div>
            <div class="d-flex justify-content-start mt-10-px mb-15-px">
              <div class="media">
                <div class="media-body mr-4">
                  <label class="mb-0">{{ $t('Start Date') }}</label>
                  <p v-text="periodStart()"></p>
                </div>
              </div>
              <div class="media">
                <div class="media-body mr-4">
                  <label class="mb-0">{{ $t('Due Date') }}</label>
                  <p v-text="periodEnd()"></p>
                </div>
              </div>

              <div class="media">
                <div class="media-body mr-4">
                  <label class="mb-0">{{ $t('Hours Worked') }}</label>
                  <p v-text="periodHours()"></p>
                </div>
              </div>
            </div>

            <apexchart type="bar" height="250" :options="chartOptions" :series="series" class="row" />

            <div class="divTable">
              <div class="divTableHead">
                <div class="divTableRow">
                  <div class="divTableCell" :style="gridConfig.style[0]"> </div>
                  <div class="divTableCell text-left" :style="gridConfig.style[1]">
                    {{ $tc('Task', 1) }}
                  </div>
                  <div class="divTableCell text-right" :style="gridConfig.style[4]">
                    {{ $t('Worked') }}
                  </div>
                </div>
              </div>
              <div class="divTableBody card">
                <div v-for="(item, index) in items" :key="index" class="divTableRowBg">
                  <div class="divTableRow">
                    <div class="divTableCell text-center" :style="gridConfig.style[0]">
                      <ListUsers :link="true" :user="item.user"> </ListUsers>
                    </div>

                    <div class="divTableCell text-left rockstar-king" :style="gridConfig.style[1]">
                      <a href="javascript:;" class="txt-primary-title txt-link"  @click="modal('task', item.task)">
                        {{ item.task.title }}
                      </a>
                      <span class="d-block info">
                        <span v-text="item.time.start.timezone"></span>
                        /
                        <span v-text="item.time.end.timezone"></span>
                      </span>
                    </div>
                    <div class="divTableCell text-right rockstar-king" :style="gridConfig.style[2]">
                      <span style="    padding: 0 0 10px 18px;" class="ranking-number text-right d-block tx-20px fw-700 text-primary">
                        {{ item.time.total }}
                      </span>
                      <div
                      v-if="authorize('tasks', 'delete')"
                      class="card-delete"
                      @click="removeTime(item.time.id)"
                    >
                      {{ $t('Delete') }}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mg-b-20 mg-t-20">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th width="10"></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="align-middle"> </td>
                      <td class="align-middle">
                        <div class="mt-1"> </div>
                      </td>
                      <td class="align-middle text-right"> </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="totalPages > 1" class="d-flex justify-content-center mg-b-30">
                <b-pagination
                  hide-goto-end-buttons
                  class="paginator"
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                  @change="getTimeTracking($event, '', '')"
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
