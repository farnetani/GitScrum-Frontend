<script>
import DatePicker from 'vue2-datepicker'
import { taskManager } from '@state/helpers'

export default {
  components: {
    DatePicker
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
  },
  data() {
    return {
      type: []
    }
  },
  computed: {
    ...taskManager
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'type.change' ){
        this.type = data.item.object
      }
    },
  },
  created(){
    this.setType()
  },
  methods: {
    changeStartDate(){
      this.type = this.task.type
    }
  }
}
</script>

<template>
  <div class="">
    <span class="d-block txt-A7AFB7 start_date_content">{{ title }}</span>
    <DatePicker
      v-model="task.start_date.timezone"
      lang="en"
      type="datetime"
      format="YYYY-MM-DD hh:mm A"
      :time-picker-options="{
        start: '00:00',
        step: '00:30',
        end: '23:30',
      }"
      confirm
      class="start_date_input"
      :disabled="!authorize('tasks', 'update', checkMyTask(task))"
      :not-after="task.due_date.timezone"
      @change="changeStartDate"
    ></DatePicker>
  </div>
</template>
