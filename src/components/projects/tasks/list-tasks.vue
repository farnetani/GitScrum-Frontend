<script>
import { modalManager } from '@state/helpers'
import ListUsers from '@components/utils/list-users'
import Timer from '@components/projects/tasks/timer'

export default {
  components: { ListUsers, Timer },
  props: {
    items: {
      type: Array,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    flag: {
      type: Boolean,
      required: false,
    },
    search: {
      type: Boolean,
      required: false,
    },
    modalFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      loading: true,
      gridConfig: {
        style: [
          'max-width: 45px; padding: 13px 10px 15px 20px;',
          'max-width:587px; width:587px;',
          'max-width:105px; width:105px;',
          'max-width:176px; width:176px;',
          'max-width:123px; width:123px;',
        ],
      },
    }
  },
  watch: {
    items() {
      this.totalRows = this.items.length
    },
  },
  created() {
    this.loading = false
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      if (this.modalFlag) {

        this.$router.push({
          name: 'projects.board.task-details',
          params: {
            companySlug: task.company.slug,
            projectSlug: task.project.slug,
            taskSlug: task.uuid,
          },
        })
        
      } else {
        this.open({ name: value, object: task })
      }
    },

    dueDate(date) {
      if (this.flag === true) {
        let currentDate = new Date()
        let taskDueDate = new Date(date)

        if (taskDueDate > currentDate) {
        } else {
          return 'color: red'
        }
      }
    },
    progressBar(item) {
      if (item.workflow) {
        return item.workflow.color
      }
      return ''
    },
  },
}
</script>

<template>
  <div class="list-tasks">

    <div v-for="(item, index) in items" :key="index" class="box-shadow">
      <b-card @click="modal('task', item)">
        <b-media tag="div">
          <template v-slot:aside>
            <ListUsers v-not-visible="'tablet'" :user="item.user" :link="true"> </ListUsers>
          </template>
          <div class="task-card-content">
            <div>
              <h2 v-if="item.code">{{ item.code }} - {{ item.title }}</h2>
              <h2 v-if="!item.code">{{ item.title }}</h2>
              <div class="subtitle1">
                <span>
                  {{ $t('Created by') }} {{ item.user.name }} {{ $t('at') }}
                  <span v-b-popover.hover.top="item.created_at.timezone"
                    >{{ item.created_at.date_for_humans }}
                  </span>
                </span>
                <span v-if="item.start_date.timezone" v-b-popover.hover.top="item.start_date.timezone">
                    {{ $t('Start Date') }}: {{ item.start_date.date_for_humans }}
                </span>
                <span v-if="item.start_date.timezone && item.due_date.timezone">
                  /
                </span>
                <span v-if="item.due_date.timezone" v-b-popover.hover.top="item.due_date.timezone" :style="dueDate(item.due_date.timezone)">
                    {{ $t('Due Date') }}: {{ item.due_date.date_for_humans }}
                </span>
              </div>
            </div>
            <ListUsers v-not-visible="'tablet'" :users="item.users" :link="true" :limit="2"></ListUsers>
          </div>
          <div class="task-card-badge">
            <span
              v-if="item.workflow"
              class="badge badge-primary"
              :style="'color: ' + invertColor(item.workflow.color, true) + ';background:' + item.workflow.color"
            >
              {{ item.workflow.title }}
            </span>
            <span
              v-if="item.type"
              class="badge badge-primary"
              :style="'color: ' + invertColor(item.type.color, true) + ';background:' + item.type.color"
            >
              {{ item.type.title }}
            </span>
            <span v-if="item.effort" class="badge  badge-primary badge-light"> {{ item.effort.title }} </span>

            <Timer v-if="item.timer && authorize('tasks', 'read')" :task="item"></Timer>
          </div>
        </b-media>
        
      </b-card>
      <div v-show="item.stats.checklist_percentage" class="progress">
        <div
          class="progress-bar"
          :style="
            'background-color: ' + progressBar(item) + ' !important;width:' + item.stats.checklist_percentage + '%;'
          "
        ></div>
      </div>
    </div>

  </div>
</template>
