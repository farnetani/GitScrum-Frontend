<script>
import Axios from '@utils/axios'
import ListTasks from '@components/projects/tasks/list-tasks'

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
      relatedTasks: [],
      visible: true,
    }
  },
  created() {
    this.getRelatedtasks()
  },
  methods: {
    getRelatedtasks() {
      Axios()
        .get(
          'tasks/' +
            this.task.uuid +
            '/related-tasks/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug
        )
        .then((response) => {
          this.relatedTasks = response.data.data
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
  <div v-if="relatedTasks[0]">
    <b-container class="mt-20-px">
      <b-row class="mb-10-px">
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'tasks']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Related Tasks') }}</h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="1"></b-col>
        <b-col cols="11" class="task-left-content">
          <ListTasks v-show="!loading" :items="relatedTasks" :modal-flag="modalFlag"></ListTasks>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
