<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import TitleLoading from '@components/utils/title-loading'
import moment from 'moment'
import { modalManager } from '@state/helpers'

export default {
  name: 'Gantt',
  components: {
    Layout,
    ListUsers,
    TitleLoading
  },
  data() {
    return {
      loading: true,
      tasks: [],
      task: [],
      duration: [],
    }
  },
  created() {
    this.getTasks()
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },
    getTasks() {
      this.loadingTask = true
      Axios()
        .get('tasks/' + this.$route.params.companySlug + '/' + this.$route.params.projectSlug + '/gantt-tasks/')
        .then((response) => {
          this.tasks = response.data.data
          this.duration = response.data.duration
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
          console.error(e)
        })
    },
    getDate(start, plus) {
      return moment(start)
        .add(plus, 'day')
        .format('MMM DD')
    },
    getDateDay(start, plus) {
      return moment(start)
        .add(plus, 'day')
        .format('DD')
    },
    getDateWeek(start, plus) {
      return moment(start)
        .add(plus, 'day')
        .format('ddd')
    },
    getDateAndWeek(start, plus) {
      return moment(start)
        .add(plus, 'day')
        .format('MMM DD - ddd')
    },
    hasDate(item, firstDate, startDate, endDate) {
      let current = moment(firstDate, 'YYYY-MM-DD').add(item, 'day')
      let start = moment(startDate, 'YYYY-MM-DD').subtract(1, 'day')
      let end = moment(endDate, 'YYYY-MM-DD').add(1, 'day')

      if (current.isBetween(start, end)) {
        return true
      } else {
        return false
      }
    },
  },
}
</script>
<template>
  <Layout>

    <template slot="header-left">
      <TitleLoading :title="$t('Gantt Chart')" :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="gantt-chart pt-60px">
      <div v-show="!loading" class="gantt">
        <div class="container-fluid">
          <div class="gantt-dates">
            <div class="row flex-nowrap">
              <div class="col-1 gantt-line-fixed" style="width:52px !important;max-width:52px !important"> </div>
              <div class="col-6 tx-11-px gantt-title-fixed">
                <span class="tx-11-px">{{ $tc('Task', 2) }}</span>
              </div>
              <div class="col-2 tx-11-px pl-10-px" style="width:140px !important;max-width:140px !important">
                <span class="tx-11-px">{{ $t('Start Date') }}</span>
              </div>
              <div class="col-2 tx-11-px pl-10-px" style="width:140px !important;max-width:140px !important">
                <span class="tx-11-px">{{ $t('Due Date') }}</span>
              </div>
              <div
              
                v-for="(dateItem, dateKey) in duration.days"
                :key="dateKey"
                class="col-1"
                style="width: 60px !important;max-width: 60px !important"
              >
                <span :alt="getDate(duration.start_date, dateKey)">
                  <span v-if="dateKey % 5" class="gantt-day-text">
                    <span style="font-weight:700">{{ getDateDay(duration.start_date, dateKey) }}</span>
                    <span class="text-uppercase tx-10-px">{{ getDateWeek(duration.start_date, dateKey) }}</span>
                  </span>
                  <span v-else class="gantt-day-text">
                    <span style="font-weight:600">{{ getDate(duration.start_date, dateKey) }}</span>
                    <span class="text-uppercase tx-10-px">{{ getDateWeek(duration.start_date, dateKey) }}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div v-for="(item, index) in tasks" :key="index">
            <div class="gantt-lines row flex-nowrap">
              <div class="gantt-line-fixed col-1" style="width:52px !important;max-width:52px !important; padding-top: 10px;">
                <ListUsers :user="item.user" :link="true" size="30"></ListUsers>
              </div>
              <div class="gantt-line-fixed col-6">
                <span class="txt-link txt-3D4F9F fw-600" @click="modal('task', item)">
                  <span class="tx-12-px" v-text="item.code"></span>
                  <span class="ml-5-px tx-12-px">{{ item.title | truncate(50) }}</span>
                </span>
                <div class="gantt-badges">
                  <span
                    class="tx-11-px badge badge-primary priority"
                    :style="'color: ' + invertColor(item.workflow.color, true) + ';background:' + item.workflow.color"
                    v-text="item.workflow.title"
                  ></span>
                  <span
                    class="tx-11-px badge badge-primary priority"
                    :style="'color: ' + invertColor(item.type.color, true) + ';background:' + item.type.color"
                    v-text="item.type.title"
                  ></span>
                </div>
              </div>
              <div class="gantt-line col-2 gantt-date-border" style="width:140px !important;max-width:140px !important">
                <span class="gantt-dates-text" v-text="item.start_date.timezone"></span>
              </div>
              <div class="gantt-line col-2 gantt-date-border" style="width:140px !important;max-width:140px !important">
                <span class="gantt-dates-text" v-text="item.due_date.timezone"></span>
              </div>
              <div
                v-for="(dateItem, dateKey) in duration.days"
                :key="dateKey"
                class="gantt-line col-1 gantt-date-border"
                style="width: 60px !important;max-width: 60px !important"
              >
                <span v-show="hasDate(dateKey, duration.start_date, item.start_date.timezone, item.due_date.timezone)" v-b-popover.hover.top="getDateAndWeek(duration.start_date, dateKey)" class="gantt-progress" :style="'background-color:' + item.workflow.color"></span>
              </div>
            </div>

            <div v-for="(itemSubtask, indexSubtask) in item.subtasks" :key="indexSubtask">
              <div class="gantt-lines row flex-nowrap">
                <div class="gantt-line-fixed col-1" style="width:52px !important;max-width:52px !important; padding-top: 10px;">
                  <ListUsers :user="item.user" :link="true" size="30"></ListUsers>
                </div>
                <div class="gantt-line-fixed gantt-line-subtask col-4">
                  <span class="txt-link txt-3D4F9F fw-600" @click="modal('task', itemSubtask)">
                    <span class="tx-12-px" v-text="itemSubtask.code"></span>
                    <span class="ml-5-px tx-12-px">{{ itemSubtask.title | truncate(40) }}</span>
                  </span>
                  <div class="gantt-badges">
                    <span
                      v-if="itemSubtask.workflow"
                      class="tx-11-px badge badge-primary priority"
                      :style="
                        'color: ' +
                          invertColor(itemSubtask.workflow.color, true) +
                          ';background:' +
                          itemSubtask.workflow.color
                      "
                      v-text="itemSubtask.workflow.title"
                    ></span>
                    <span
                      v-if="itemSubtask.type"
                      class="tx-11-px badge badge-primary priority"
                      :style="
                        'color: ' + invertColor(itemSubtask.type.color, true) + ';background:' + itemSubtask.type.color
                      "
                      v-text="itemSubtask.type.title"
                    ></span>
                  </div>
                </div>
                <div class="gantt-line col-2 gantt-date-border" style="width:140px !important;max-width:140px !important">
                  <span
                    v-if="itemSubtask.start_date"
                    class="gantt-dates-text"
                    v-text="itemSubtask.start_date.timezone"
                  ></span>
                </div>
                <div class="gantt-line col-2 gantt-date-border" style="width:140px !important;max-width:140px !important">
                  <span
                    v-if="itemSubtask.due_date"
                    class="gantt-dates-text"
                    v-text="itemSubtask.due_date.timezone"
                  ></span>
                </div>
                <div
                  v-for="(dateItemSubtask, dateKeySubtask) in duration.days"
                  :key="dateKeySubtask"
                  class="gantt-line gantt-date-border col-1"
                  style="width: 60px !important;max-width: 60px !important"
                >
                  <span
                    v-if="itemSubtask.start_date && itemSubtask.due_date"
                    v-show="
                      hasDate(
                        dateKeySubtask,
                        duration.start_date,
                        itemSubtask.start_date.timezone,
                        itemSubtask.due_date.timezone
                      )
                    "
                    v-b-popover.hover.top="getDateAndWeek(duration.start_date, dateKeySubtask)"
                    class="gantt-progress" :style="'background-color:' + itemSubtask.workflow.color"
                  >
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
