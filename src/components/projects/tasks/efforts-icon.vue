<script>
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import TitleLoading from '@components/utils/title-loading'
import { taskManager, modalManager } from '@state/helpers'
import ProjectTaskEfforts from '@components/projects/modal/settings/project-task-efforts'


export default {
  components: { TitleLoading, ButtonLoading, ProjectTaskEfforts },
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
      efforts: [],
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
        this.getTaskEfforts()
      }
    },

    getTaskEfforts() {
      Axios()
        .get(
          'project-templates/effort/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug +
            '&search=' + 
            this.searchTerm +
            '&page=' +
            this.currentPage
        )
        .then((response) => {

          this.efforts = response.data.data
          this.searchLoading = false
          this.loading = false
        })
    },

    changeTaskEffort(effort) {
      
      this.actionTask({ name: 'effort.change', uuid: this.task.uuid, object: effort})

      Axios()
      .put(
        'tasks/' +
          this.task.uuid +
          '/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug,
        {
          config_issue_effort_id: effort.id,
        }).then((response) => {
          this.task.effort = effort
        })

    },
    search() {
      this.searchLoading = true
      this.types = []
      this.currentPage = 1
      this.getTaskEfforts()
    },
  },
}
</script>

<template>
<div class="mb-8-px">

  <b-dropdown v-if="authorize('tasks', 'create')" ref="dropdown" right class="dropdown-400px styled-dropdown" @shown="loadMore">
    <template v-slot:button-content >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'dumbbell']" style="font-size:14px"/></span>
      <span>{{ $t('Task Effort') }}</span>
    </template>
    <b-dropdown-header>
      <div class="d-flex align-items-center justify-content-between">
        <TitleLoading :loading="loading" :title="$t('Task Effort')"></TitleLoading>
        
        <div class="dropdown-header-icons">
          <div @click="modal('projectTaskEfforts')">
            
            <font-awesome-icon :icon="['far', 'plus-square']" />
            <span>{{ $t('Create Task Effort') }}</span>
           
          </div>
        </div>
      </div>
    </b-dropdown-header>
    <b-dropdown-form class="pb-10-px">
  
      <div class="input-group-search">
        <b-form-input v-model="searchTerm" 
          autocomplete="off" 
          :placeholder="$t('Search effort')"
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
        v-for="effort in efforts"
        :key="effort.id"
        
        @click="changeTaskEffort(effort)">
        <div class="d-flex justify-content-start">
          {{ effort.title }} - {{ effort.effort }} {{ $t('points') }}
        </div>
      </b-dropdown-item>
    </div>
  </b-dropdown>
  <ProjectTaskEfforts></ProjectTaskEfforts>
</div>


















<!--


  <div class="dropdown mb-8-px">
    <button
      class="btn btn-block dropdown-toggle"
      data-toggle="dropdown"
      @click="loadMore"
      :disabled="!authorize('tasks', 'create')"
    >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'dumbbell']" style="font-size:14px"/></span>
      <span>{{ $t('Task Effort') }}</span>
    </button>
    <div ref="dropdown" class="dropdown-menu navbar-dropdown" style="margin:3px 0 0 0; width: 335px;height: 400px;">
      <b-dd-form class="dropdown-padding">
        
        <div class="sprints-search mb-15-px">
          <div class="form-group m-0">
            <div class="input-group">
              <input
                v-model="searchTerm"
                maxlength="45"
                type="text"
                class="form-control"
                autocomplete="off"
                :placeholder="$t('Search effort')"
                @keydown.enter.prevent="search"
                style="height: 32px"
              />
              <div class="input-group-append">
                <ButtonLoading
                  type="btn-sm"
                  mode="button"
                  :loading="searchLoading"
                  :fa-icon="'far'"
                  :icon="'search'"
                  @action="search"
                ></ButtonLoading>
              </div>
            </div>
          </div>
        </div>

        <div v-if="efforts.length" class="sprints-list" v-on:scroll.passive="handleScroll">
          <ul class="list">
            <li
              v-for="effort in efforts"
              :key="effort.id"
              class="mb-10-px p-10-px"
              @click="changeTaskEffort(effort)"
              :class="effort.selected ? 'selected' : ''"
            >
              <div class="d-flex justify-content-between">
                <span class="d-block tx-12-px fw-500" :class="effort.selected ? 'txt-3D4F9F' : 'txt-68748F'">
                  {{ effort.title }}
                </span>
                <div>
                  <font-awesome-icon
                    v-if="effort.selected && !effort.selectTaskEffortLoading"
                    :icon="['far', 'check-double']"
                    class="txt-464DEE"
                    style="font-size: 12px;"
                  />
                  <b-spinner
                    v-show="effort.selectTaskEffortLoading"
                    :label="$t('Loading')"
                    small
                    class="btn-small-loading"
                  ></b-spinner>
                </div>
              </div>
            </li>
          </ul>
          <div class="text-center">
            <b-spinner
              v-show="loadingMore"
              :label="$t('Loading')"
              variant="secondary"
              small
              class="title-loading"
            ></b-spinner>
          </div>
        </div>

      </b-dd-form>
    </div>
  </div>
-->

</template>
