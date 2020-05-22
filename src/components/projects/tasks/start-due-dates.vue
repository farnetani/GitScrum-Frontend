<script>
import moment from 'moment'

export default {
  filters: {
    moment: function(date) {
      return moment(date).format('L h:mm A')
    },
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  methods: {
    showStart() {
      return (
        this.task.start_date.timezone !== undefined &&
        this.task.start_date.timezone !== '' &&
        this.task.start_date.timezone.timestamp !== ''
      )
    },
    showDue() {
      return (
        this.task.due_date.timezone !== undefined &&
        this.task.due_date.timezone !== '' &&
        this.task.due_date.timezone.timestamp !== ''
      )
    },
    moment: function(date) {
      return moment(date)
    },
    getDate(date) {
      if (date.timezone === undefined || date.timezone === '') return ''

      return date.timezone
    },
  },
}
</script>

<template>
  <div
    v-if="showStart() || showDue()"
    class="d-flex bg-gray-100"
    :data-start="getDate(task.start_date)"
    :data-end="getDate(task.due_date)"
  >
    <div v-show="showStart()" class="task-dates col-md" style="padding-right:0">
      <strong class="d-block" style="height: 12px;">Start</strong>
      {{ task.start_date.timezone }}
    </div>
    <div v-show="showDue()" class="task-dates col-md">
      <strong class="d-block" style="height: 12px;">Due</strong>
      <span class="date-start">{{ task.due_date.timezone }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.task-dates {
  padding: 0;

  hr {
    margin: 0;
    border-top-color: rgba(205, 205, 205, 1);
  }
}
</style>
