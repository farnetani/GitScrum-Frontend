<script>
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import TitleLoading from '@components/utils/title-loading'
import { taskManager, modalManager } from '@state/helpers'
import ProjectTaskTypes from '@components/projects/modal/settings/project-task-types'

export default {
  components: { ButtonLoading, TitleLoading, ProjectTaskTypes },
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
      types: [],
      currentPage: 0,
      totalPages: 1,
      searchTerm: '',
      searchLoading: false,
    }
  },
  methods: {
    ...taskManager,
    ...modalManager,

    modal(value) {
      this.currentPage = 0
      this.open({ name: value, object: [] })
    },

    loadMore() {
      this.currentPage = this.currentPage + 1
      if (this.currentPage <= this.totalPages) {
        this.loading = true
        this.getTaskTypes()
      }
    },

    getTaskTypes() {
      Axios()
        .get(
          'project-templates/type/?company_slug=' + 
          this.task.company.slug + 
          '&project_slug=' + 
          this.task.project.slug +
          '&search=' + 
          this.searchTerm +
          '&page=' +
          this.currentPage
        )
        .then((response) => {
          
          this.types = response.data.data
          this.searchLoading = false
          this.loading = false
        })
    },
    changeTaskType(type) {

      this.actionTask({ name: 'type.change', uuid: this.task.uuid, object: type})
      
      Axios()
      .put(
        'tasks/' +
          this.task.uuid +
          '/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug,
        {
          config_issue_type_id: type.id,
        }).then((response) => {
          this.task.type = type
        })

    },
    search() {
      this.searchLoading = true
      this.types = []
      this.currentPage = 1
      this.getTaskTypes()
    },
  },
}
</script>

<template>

<div class="mb-8-px">

  <b-dropdown v-if="authorize('tasks', 'create')" ref="dropdown" right class="dropdown-400px styled-dropdown" @shown="loadMore">
    <template v-slot:button-content >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'stamp']" style="font-size:14px"/></span>
      <span>{{ $t('Task Type') }}</span>
    </template>
    <b-dropdown-header>
      <div class="d-flex align-items-center justify-content-between">
        <TitleLoading :loading="loading" :title="$t('Task Type')"></TitleLoading>
        
        <div class="dropdown-header-icons">
          <div @click="modal('projectTaskTypes')">
            
            <font-awesome-icon :icon="['far', 'plus-square']" />
            <span>{{ $t('Create Task Type') }}</span>
           
          </div>
        </div>
      </div>
    </b-dropdown-header>
    <b-dropdown-form class="pb-10-px">
  
      <div class="input-group-search">
        <b-form-input v-model="searchTerm" 
          autocomplete="off" 
          :placeholder="$t('Search type')"
          @keydown.enter.prevent="search">
        </b-form-input>

        <ButtonLoading
          type="btn-sm"
          mode="button"
          :loading="searchLoading"
          :fa-icon="'far'"
          :icon="'search'"
          @action="search">
        </ButtonLoading>
      </div>
      
    </b-dropdown-form>
    <div class="scroll-activate-h200">
      <b-dropdown-item 
        v-for="type in types"
        :key="type.id"
        
        @click="changeTaskType(type)">
        <div class="d-flex justify-content-start">
          <span class="square-color" :style="'background:' + type.color"></span>
          {{ type.title }}
        </div>
      </b-dropdown-item>
    </div>
  </b-dropdown>
  <ProjectTaskTypes></ProjectTaskTypes>
</div>

</template>
