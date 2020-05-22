<script>
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import TitleLoading from '@components/utils/title-loading'
import { taskManager } from '@state/helpers'

export default {
  components: { TitleLoading, ButtonLoading },
  props: {
    task: {
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
      btnLoading: false,
      subtaskTitle: '',
      alertMessage: '',
      alertStatus: false,
    }
  },
  methods: {
    ...taskManager,

    createTask() {
      this.btnLoading = true
      this.alertStatus = false

      if (this.subtaskTitle.length > 3) {
        this.showAddCardLoading = true
        this.showAddCard = false

        Axios()
          .post('/tasks/?company_slug=' + 
          this.task.company.slug + 
          '&project_slug=' + 
          this.task.project.slug, {
            title: this.subtaskTitle,
            parent_id: this.task.uuid,
            config_workflow_id: this.task.workflow.id,
          })
          .then((response) => {
            
            this.subtaskTitle = ''
            this.btnLoading = false
            this.actionTask({ name: 'subtask.addList', object: response.data.data })

          })
      } else {
        // alert('You must fill in the task title')
        this.alertMessage = this.$t('Subtask name must to have at least 4 characters')
        this.alertStatus = true
        this.btnLoading = false
      }
    },
  },
}
</script>

<template>
<div class="mb-8-px">

  <b-dropdown v-if="authorize('tasks', 'create')" ref="dropdown" right class="dropdown-400px styled-dropdown">
    <template v-slot:button-content >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'tasks']" style="font-size:14px"/></span>
      <span>{{ $t('Subtasks') }}</span>
    </template>
    <b-dropdown-header>
      <div class="d-flex align-items-center justify-content-between">
        <TitleLoading :loading="loading" :title="$t('Subtasks')"></TitleLoading>
        <div class="dropdown-header-icons">
          <div>
            <font-awesome-icon :icon="['far', 'plus-square']" />
            <span>{{$t('Create a Subtask')}}</span>
          </div>
        </div>
      </div>
    </b-dropdown-header>
    <b-dropdown-form>
  
      <b-form-input v-model="subtaskTitle" size="sm" :placeholder="$t('Write a title for subtask')" class="mb-5px"></b-form-input>
      <div class="d-flex justify-content-end">
        <ButtonLoading
          type="btn-md"
          mode="button"
          :loading="btnLoading"
          :title="$t('Add Subtask')"
          :title-loading="$t('Adding')"
          @action="createTask"
        ></ButtonLoading>
      </div>
      
    </b-dropdown-form>
  </b-dropdown>

</div>
</template>
