<script>
import Axios from '@utils/axios'

export default {
  components: {},
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    activities: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      workflows: null,
    }
  },
  methods: {
    getWorkflows() {
      if (!this.workflows) {
        this.loading = true
        Axios()
          .get(
            'project-templates/workflow/?company_slug=' +
              this.task.company.slug +
              '&project_slug=' +
              this.task.project.slug
          )
          .then((response) => {
            this.workflows = response.data.data
            this.loading = false
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },
    changeWorkflow(workflow) {
      this.loading = true
      Axios()
        .put('board-tasks/?company_slug=' + this.task.company.slug + '&project_slug=' + this.task.project.slug, {
          task_uuid: this.task.uuid,
          position: 1,
          workflow_id: workflow.id,
        })
        .then((response) => {
          let oldWorkflow = this.task.workflow
          this.task.workflow = workflow
          this.loading = false
          this.$eventBus.$emit('task-change-workflow', { oldWorkflow, task: this.task })
        })
    },
  },
}
</script>

<template>
  <div class="task-workflows">

    <b-dropdown v-if="authorize('tasks', 'update')" @show="getWorkflows">
      <template v-slot:button-content>
        <div :style="'color: ' +
            invertColor(task.workflow.color, true) +
            ';background:' + task.workflow.color">
          <span class="icon-size">
            <font-awesome-icon :icon="workflowState(task.workflow.state)" style="font-size: 16px;" />
          </span>
          <span class="text-uppercase ml-5-px fw-700">{{ task.workflow.title }}</span>
          <span class="ml-10-px">
            <font-awesome-icon v-show="!loading" :icon="['far', 'caret-down']" style="font-size: 16px;" />
            <b-spinner
              v-show="loading"
              :label="$t('Loading')"
              variant="secondary"
              small
              class="title-loading"
            ></b-spinner>
          </span>
        </div>
      </template>
      <b-dropdown-item v-for="(workflow, index) in workflows" :key="index" @click="changeWorkflow(workflow)">
        <div class="d-flex align-items-center justify-content-start">
          <span class="icon-size">
            <font-awesome-icon :icon="workflowState(workflow.state)" style="font-size: 16px;" />
          </span>
          <span>{{ workflow.title }}</span>
        </div>
      </b-dropdown-item>
    </b-dropdown>

    <div v-if="!authorize('tasks', 'update')"  
      class="cursor-default workflow"
      :style="'color: ' +
        invertColor(task.workflow.color, true) +
        ';background:' + task.workflow.color">
      <span class="icon-size">
        <font-awesome-icon :icon="workflowState(task.workflow.state)" style="font-size: 16px;" />
      </span>
      <span class="text-uppercase ml-5-px fw-700">{{ task.workflow.title }}</span>
    </div>
  </div>
  
</template>
