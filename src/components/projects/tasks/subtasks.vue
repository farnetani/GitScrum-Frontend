<script>
import Axios from '@utils/axios'
import ListTasks from '@components/projects/tasks/list-tasks'
import { taskManager } from '@state/helpers'

export default {
  components: { ListTasks },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
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
      subtasks: [],
      visible: true,
    }
  },
  computed: {
    ...taskManager,
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'subtask.addList' ){
        this.subtasks.push(data.item.object)
      }
    },
  },
  created() {
    this.getSubtasks()
  },
  methods: {
    getSubtasks() {
      Axios()
        .get(
          'tasks/' +
            this.task.uuid +
            '/sub-tasks/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug
        )
        .then((response) => {
          this.subtasks = response.data.data
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
  <div v-if="subtasks[0]">

    <b-container class="mt-20-px">
      <b-row class="mb-10-px">
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'tasks']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Subtasks') }}</h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="1"></b-col>
        <b-col cols="11" class="task-left-content">
          <ListTasks v-show="!loading" :items="subtasks" :modal-flag="modalFlag"></ListTasks>
        </b-col>
      </b-row>
    </b-container>

  </div>
</template>
