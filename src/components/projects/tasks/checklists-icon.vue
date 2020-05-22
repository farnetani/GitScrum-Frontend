<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import ButtonLoading from '@components/utils/button-loading'
import TitleLoading from '@components/utils/title-loading'
import { taskManager } from '@state/helpers'

export default {
  components: { vSelect, TitleLoading, ButtonLoading },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    checklistId: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      title: '',
      alertMessage: '',
      alertStatus: false,
      boxSelected: 'create',
      templateItem: null,
      templateItems: [],
    }
  },
  methods: {
    ...taskManager,

    addChecklist() {
      this.btnLoading = true
      this.alertStatus = false
      Axios()
        .post('task-checklists/?company_slug=' + this.task.company.slug + '&project_slug=' + this.task.company.slug, {
          parent_id: this.checklistId,
          task_uuid: this.task.uuid,
          title: this.title,
        })
        .then((response) => {
          this.title = ''
          this.btnLoading = false
          this.actionTask({ name: 'checklist.addList', object: response.data.data })
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
        })
    },

    getTemplateTaskChecklists() {
      this.loading = true
      this.alertStatus = false
      Axios()
        .get(
          'project-templates/checklist/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.templateItems = response.data.data
          this.templateItem =  response.data.data[0]
          this.loading = false

          if (this.templateItems.length === 0) {
            this.alertMessage = this.$t('Dont have any checklist to apply')
            this.alertStatus = true
          }
        })
        .catch((e) => {
          this.loading = false
        })
    },

    applyTemplate() {
      this.btnLoading = true

      Axios()
        .post(
          'task-checklists/' +
            this.templateItem.id +
            '/apply/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            task_uuid: this.task.uuid,
          }
        )
        .then((response) => {
          this.btnLoading = false
          this.actionTask({ name: 'checklist.reload' })
        })
        .catch((e) => {
          this.btnLoading = false
        })
    },

    openCreate() {
      this.boxSelected = 'create'
    },

    openTemplate() {
      this.boxSelected = 'template'
      this.getTemplateTaskChecklists()
    },
  },
}
</script>

<template>
  <div class="mb-8-px">

    <b-dropdown v-if="authorize('tasks', 'create')"  ref="dropdown" right class="dropdown-400px styled-dropdown" @shown="openCreate">
      <template v-slot:button-content >
        <span class="icon-size"><font-awesome-icon :icon="['far', 'list']" style="font-size:14px"/></span>
        <span>{{ $tc('Checklist', 1) }}</span>
      </template>
      <b-dropdown-header>
        <div class="d-flex align-items-center justify-content-between">
          <TitleLoading :title="$tc('Checklist', 1)" :loading="loading"></TitleLoading>
          <div class="dropdown-header-icons">
            <div @click="openCreate">
              <font-awesome-icon :icon="['far', 'plus-square']" />
              <span>{{$t('Create a Checklist')}}</span>
            </div>
            <div @click="openTemplate">
              <font-awesome-icon :icon="['far', 'dolly-flatbed-alt']" />
              <span>{{$t('Use Template')}}</span>
            </div>
          </div>
        </div>
      </b-dropdown-header>
      <b-dropdown-form>
    
        <div v-show="boxSelected === 'create'">
          <b-form-input v-model="title" size="sm" :placeholder="$t('Write a title for checklist')" class="mb-5px"></b-form-input>
          <div class="d-flex justify-content-end">
            <ButtonLoading
              type="btn-md"
              mode="button"
              :loading="btnLoading"
              :title="$t('Add Checklist')"
              :title-loading="$t('Adding')"
              @action="addChecklist"
            ></ButtonLoading>
          </div>
        </div>

        <div v-show="boxSelected === 'template'">
          <v-select
            v-model="templateItem"
            :options="templateItems"
            :clearable="false"
            :searchable="false"
            label="title"
            class="mb-5px"
          ></v-select>
          <div class="d-flex justify-content-end">
            <ButtonLoading
              type="btn-md"
              mode="button"
              :loading="btnLoading"
              :title="$t('Add Template Checklist')"
              :title-loading="$t('Adding')"
              @action="applyTemplate"
            ></ButtonLoading>
          </div>
        </div>
      </b-dropdown-form>
    </b-dropdown>

  </div>
</template>
