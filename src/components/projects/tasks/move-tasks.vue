<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import TitleLoading from '@components/utils/title-loading'
import Alert from '@components/utils/alert'

import 'vue-select/dist/vue-select.css'

export default {
  components: { vSelect, TitleLoading, Alert },
  props: {
    companySlug: {
      type: String,
      required: true,
    },
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    project: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      loading: false,
      openMoveTasks: false,
      visible: true,
      projects: [],
      workflows: [],
      selectedProject: this.project,
      selectedWorkflow: {},
      btnLoading: false,
      isBtnSaveVisible: false,
      alertMessage: '',
      alertStatus: false,
    }
  },
  watch: {
    selectedProject() {
      this.getWorkflows()
    },
    selectedWorkflow() {
      if (this.selectedWorkflow && this.selectedWorkflow.code) this.isBtnSaveVisible = true
    },
  },
  methods: {
    openArea() {
      this.openMoveTasks = !this.openMoveTasks
    },
    moveTask() {
      this.btnLoading = true

      Axios()
        .post('tasks/' + this.task.uuid + '/move', {
          company_slug: this.task.company.slug,
          project_slug: this.task.project.slug,
          new_company_slug: this.task.company.slug,
          new_project_slug: this.selectedProject.code,
          new_workflow_id: this.selectedWorkflow.code,
        })
        .then((response) => {
          if (response.data.message) {
            this.alertMessage = 'Error. ' + response.data.message
            this.alertStatus = true
            this.btnLoading = false
          } else {
            this.btnLoading = false
            // reload page to new project board and open task modal

            this.$router.push({
              name: 'projects.board.task-details',
              params: {
                companySlug: this.task.company.slug,
                projectSlug: this.selectedProject.code,
                taskSlug: this.task.uuid,
              },
            })
          }
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
        })
    },
    getProjects() {
      if (this.$refs.dropdown.className === 'dropdown-menu navbar-dropdown') {
        this.loading = true
        this.isBtnSaveVisible = false

        Axios()
          .get('projects/?company_slug=' + this.task.company.slug)
          .then((response) => {
            if (response.data.message) {
              this.alertMessage = 'Error. ' + response.data.message
              this.alertStatus = true
            } else {
              let arr = []
              for (let i = 0; i < response.data.data.length; i++) {
                if (this.selectedProject.slug === response.data.data[i]['slug'])
                  this.selectedProject = {
                    code: response.data.data[i]['slug'],
                    label: response.data.data[i]['name'],
                  }

                arr.push({
                  code: response.data.data[i]['slug'],
                  label: response.data.data[i]['name'],
                })
              }
              this.projects = arr

              // this.getWorkflows()
            }

            this.loading = false
          })
          .catch((error) => {
            this.alertMessage = 'Error. ' + error.response.data.message
            this.alertStatus = true
          })
      }
    },
    getWorkflows() {
      this.isBtnSaveVisible = false
      this.selectedWorkflow = {}
      this.workflows = []
      Axios()
        .get(
          'projects-workflows/?company_slug=' + this.task.company.slug + '&project_slug=' + this.selectedProject.code
        )
        .then((response) => {
          if (response.data.message) {
            this.alertMessage = 'Error. ' + response.data.message
            this.alertStatus = true
          } else {
            let arr = []
            for (let i = 0; i < response.data.data.length; i++) {
              if (this.selectedWorkflow.slug === response.data.data[i]['slug'])
                this.selectedWorkflow = {
                  code: response.data.data[i]['id'],
                  label: response.data.data[i]['title'],
                }

              arr.push({
                code: response.data.data[i]['id'],
                label: response.data.data[i]['title'],
              })
            }

            this.workflows = arr
          }
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
        })
    },
  },
}
</script>

<template>
  <div class="dropdown mb-8-px">
    <button
      class="btn btn-block dropdown-toggle"
      data-toggle="dropdown"
      @click="getProjects"
      :disabled="!authorize('tasks', 'update')"
    >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'exchange']" style="font-size:14px"/></span>
      <span>{{ $t('Move') }}</span>
    </button>
    <div ref="dropdown" class="dropdown-menu navbar-dropdown" style="margin:3px 0 0 0; width: 335px;">
      <b-dd-form class="dropdown-padding">
        <div class="header-dropdown-topitem">
          <div class="d-flex justify-content-between align-items-center">
            <div>{{ $t('Move to another Project') }}</div>
            <div class="d-flex justify-content-end"> </div>
          </div>
        </div>

        <b-spinner
          v-show="projects.length === 0 && loading"
          :label="$t('Loading')"
          variant="secondary"
          small
          class="title-loading"
        ></b-spinner>

        <div class="header-dropdown-topitem">
          <div>
            <div class="mt-5-px pd-b-10">
              <label>{{ $tc('Project', 1) }}</label>
              <v-select v-model="selectedProject" :options="projects" label="label" :clearable="false"></v-select>
            </div>
            <div class="mt-15-px pd-b-10">
              <label>{{ $t('Workflow Stage') }}</label>
              <v-select v-model="selectedWorkflow" :options="workflows" label="label" :clearable="false"></v-select>
            </div>

            <div class="mt-10-px">
              <b-button v-if="btnLoading" variant="primary" class="btn btn-mini btn-primary">
                <b-spinner small type="grow"></b-spinner>
                {{ $t('Moving...') }}
              </b-button>

              <button
                v-if="!btnLoading"
                class="btn btn-mini btn-primary"
                type="submit"
                :disabled="!isBtnSaveVisible"
                @click="moveTask"
              >
                {{ $t('Move') }}
              </button>
            </div>
          </div>
        </div>
        <Alert
          v-show="alertMessage.length && alertStatus"
          class="p-10-px"
          :message="alertMessage"
          :status="alertStatus"
        ></Alert>
      </b-dd-form>
    </div>
  </div>
</template>
