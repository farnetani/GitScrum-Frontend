<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import DatePicker from 'vue2-datepicker'
import TitleLoading from '@components/utils/title-loading'
import ListTasks from '@components/projects/tasks/list-tasks'

export default {
  page: {
    title: 'Change log',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, DatePicker, TitleLoading, ListTasks },
  data() {
    return {
      loading: true,
      changeLog: [],
      changeLogMeta: [],
      dates: '',
      resume: [],
      series: [],
      chartOptions: {
        colors: ['#464DEE'],
        chart: {
          height: 320,
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5,
          },
        },
        xaxis: {
          axisBorder: {
            show: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex, w }) {
            return (
              '<div class="p-2">' +
              '<span> ' +
              series[seriesIndex][dataPointIndex] +
              ' ' +
              this.$tc('Task', 2) +
              '</span>' +
              '</div>'
            )
          },
        },
      },
    }
  },
  mounted() {
    this.getChangeLog('', '')
  },
  methods: {
    getChangeLog(dateStart, dateEnd) {
      Axios()
        .get(
          'tasks/changelog/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&start=' +
            dateStart +
            '&end=' +
            dateEnd
        )
        .then((response) => {
          this.changeLog = response.data.data
          this.changeLogMeta = response.data.meta
          this.resume = response.data.resume

          let seriesData = []
          let xAxis = []

          for (let i = 0; i < this.changeLogMeta.chart_data.length; i++) {
            seriesData.push(this.changeLogMeta.chart_data[i].tasks)
            xAxis.push(this.changeLogMeta.chart_data[i].legend)
          }

          this.series = [
            {
              name: this.$t('Closed Tasks'),
              data: seriesData,
            },
          ]

          this.chartOptions = {
            xaxis: {
              categories: xAxis,
            },
          }

          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    changeDate(date) {
      this.loading = true
      let d0 = new Date(date[0])
      let d1 = new Date(date[1])
      let dateStart = d0.getFullYear() + '-' + (d0.getMonth() + 1) + '-' + d0.getDate()
      let dateEnd = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate()
      this.getChangeLog(dateStart, dateEnd)
    },
    periodStart() {
      return this.resume.period_start ? this.resume.period_start : '-'
    },
    completedPercentage() {
      return this.resume.completed_percentage ? this.resume.completed_percentage : '-'
    },
    closedIssuesCount() {
      return this.resume.closed_issues_count ? this.resume.closed_issues_count : '-'
    },
    workedDays() {
      return this.resume.worked_days ? this.resume.worked_days : '-'
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="changelog">
      <div class="row mb-30-px">
        <div class="col-md-12 pr-0">
          <TitleLoading :title="$t('Changelog')" :loading="loading" addclass="mb-2"></TitleLoading>
          <div class="d-flex justify-content-between">
            <DatePicker
              v-model="dates"
              range
              lang="en"
              type="date"
              confirm
              class="mt-1"
              @change="changeDate"
            ></DatePicker>
            <div></div>
            <div class="media">
              <div class="media-body text-right">
                <label class="tx-dark fw-500"></label>
                <p v-text="workedDays() + ' '"></p>
              </div>
            </div>
            <div class="media">
              <div class="media-body text-right">
                <label class="tx-dark fw-500">{{ $t('Tasks') }}</label>
                <p v-text="closedIssuesCount() + ' completed'"></p>
              </div>
            </div>
            <div class="media">
              <div class="media-body text-right">
                <label class="tx-dark fw-500">{{ $tc('Project', 2) }}</label>
                <p v-text="completedPercentage() + '% ' + $t('completed')"></p>
              </div>
            </div>
          </div>

          <div class="mt-4 mb-4">
            <apexchart
              type="line"
              height="250"
              class="row"
              :options="chartOptions"
              :series="series"
              style="margin-top:-25px"
            />
          </div>

          <div v-for="(date, dateKey) in changeLog" :key="dateKey" class="mb-4">
            <p class="tx-14px txt-muted mb-0" v-text="dateKey"></p>
            <div v-for="(workflow, workflowKey) in date" :key="workflowKey">
              <h6 class="tx-18px mb-20-px txt-dark tx-uppercase mt-4" v-text="workflowKey"></h6>
              <ListTasks class="mg-t-20" :items="workflow" :search="true" title="" :flag="true"></ListTasks>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
