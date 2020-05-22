<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'
import TaskModal from '@components/projects/modal/task'

export default {
  page: {
    title: 'Task',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    TaskModal
  },
  data() {
    return {
      loading: true,
    }
  },
  created(){
      this.getTask()
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      task.opened = true
      this.loading = false
      document.title = task.title
      this.open({ name: value, object: task })
    },

    getTask() {
      this.loading = true
      Axios()
        .get(
          'tasks/' + this.$route.params.taskSlug + 
          '/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
        )
        .then((response) => {
          this.modal('task', response.data.data)
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
    <div style="height:100%">
        <div style="height:100%" class="d-flex justify-content-center align-items-center">
            <div class="text-center">
                <b-spinner v-show="loading" :label="$t('Loading')" class="txt-68748F" small></b-spinner>
                <div style="margin:7px;">{{ $t('Loading Task') }}</div>
            </div>
        </div>
        <TaskModal></TaskModal>
    </div>
</template>

<style>
html, body{
  height:100%
}
</style>
