<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'

import LabelEdit from 'label-edit'

import DescriptionEditable from '@components/utils/description-editable'

import Activities from '@components/utils/activities'
import Assignees from '@components/projects/tasks/assignees'
import CustomFields from '@components/projects/tasks/custom-fields'
import Checklists from '@components/projects/tasks/checklists'
import ChecklistsIcon from '@components/projects/tasks/checklists-icon'
import Subtasks from '@components/projects/tasks/subtasks'
import SubtasksIcon from '@components/projects/tasks/subtasks-icon'
import MoveTasks from '@components/projects/tasks/move-tasks'

/*
import SubtasksConvertIcon from '@components/projects/tasks/subtasks-convert-icon'
*/
import PermanentLink from '@components/projects/tasks/permanent-link'
import Related from '@components/projects/tasks/related'
import Attachments from '@components/projects/tasks/attachments'
import AttachmentsIcon from '@components/projects/tasks/attachments-icon'
import Videos from '@components/projects/tasks/videos'
import Types from '@components/projects/tasks/types'
import Efforts from '@components/projects/tasks/efforts'
import VideosIcon from '@components/projects/tasks/videos-icon'
import Comments from '@components/projects/tasks/comments'
import Timetracking from '@components/projects/tasks/timetracking'
import Timer from '@components/projects/tasks/timer'
import Labels from '@components/projects/tasks/labels'
import LabelsIcon from '@components/projects/tasks/labels-icon'
import TypesIcon from '@components/projects/tasks/types-icon'
import EffortsIcon from '@components/projects/tasks/efforts-icon'
import SprintsIcon from '@components/projects/tasks/sprints-icon'
import UserStoriesIcon from '@components/projects/tasks/user-stories-icon'
import WorkflowsIcon from '@components/projects/tasks/workflows-icon'
import Markdown from '@components/utils/markdown'
import DatePicker from 'vue2-datepicker'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import moment from 'moment'

import Mentions from '@components/utils/mentions'

export default {
  components: {
    LabelEdit,
    DescriptionEditable,
    Activities,
    Assignees,
    CustomFields,
    Checklists,
    ChecklistsIcon,
    Subtasks,
    SubtasksIcon,
    PermanentLink,
    Related,
    Attachments,
    AttachmentsIcon,
    Videos,
    Types,
    Efforts,
    VideosIcon,
    Comments,
    Timetracking,
    Timer,
    Labels,
    LabelsIcon,
    MoveTasks,
    DatePicker,
    TypesIcon,
    EffortsIcon,
    SprintsIcon,
    UserStoriesIcon,
    WorkflowsIcon,
  },
  data() {
    return {
      task: [],
      efforts: [],
      types: [],
      workflows: [],

      taskEffort: [],
      taskType: [],

      loading: true,
      editMode: false,
      modalShow: false,
      currentURL: '',

      refreshActivities: [],
      isClosed: false,
      txtComment: '',
      currentUser: JSON.parse(localStorage.getItem('CURRENT_USER'))
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      
      if (object.item.name === 'task') {
        object.item.name = ''
        this.task = object.item.object
        this.init()
      }

    },
  },
  created() {
    /*
    this.$store.dispatch('projectData/currentProject', {
      projectSlug: this.$route.params.projectSlug,
      companySlug: this.$route.params.companySlug
    })
    */
  },
  methods: {
    checkMyTask(task) {
      
      let isMine = false

      if (this.task) {
        
        if ( !this.currentUser ){
          isMine = false
        } else if (this.task.user.username === this.currentUser.username) {
          isMine = true
        } else {
          isMine = false
        }
      }
      return isMine
    },

    hideModal() {

      this.closeModal(this.$refs['modal'])
      
      if ( typeof(this.task.opened) === "undefined" ) {
        history.pushState(null, null, this.currentURL)
      } else {
        location.href = this.currentURL
      }
      this.isClosed = true

    },

    init() {
      this.editMode = false
      this.loading = false
      this.modalShow = true
      this.isClosed = false
      this.pushStateOpen()
    },

    pushStateOpen() {
      
      if ( !this.task.opened ) {
        this.currentURL = this.$router.history.current.path
      } else {
        this.currentURL = '/' + this.task.company.slug + '/' + this.task.project.slug
      }

      let urlModal = this.$router.resolve({
          name: 'projects.board.task-details',
          params: {
            companySlug: this.task.company.slug,
            projectSlug: this.task.project.slug,
            taskSlug: this.task.uuid,
          },
        }).href
        
      history.pushState(null, null, urlModal)
    },
    deleteTask() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete this task?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete(
            'tasks/' +
              this.task.uuid +
              '/?company_slug=' +
              this.task.company.slug +
              '&project_slug=' +
              this.task.project.slug
          )
          .then((response) => {
            this.hideModal()
            this.$eventBus.$emit('task-deleted', this.task)
            this.modalShow = false
          })
        }
      })

    },
    getWorkflows() {
      Axios()
        .get(
          'project-templates/workflow/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug
        )
        .then((response) => {
          this.loading = false
          this.workflows = response.data.data
        })
    },
    editTask() {
      this.editMode = true
      this.getTaskEfforts()
      this.getTaskTypes()
      this.taskEffort = this.task.effort
      this.taskType = this.task.type
    },
    editTaskCancel() {
      this.editMode = false
    },
    editTaskUpdate() {
      Axios()
        .put(
          'tasks/' +
            this.task.uuid +
            '/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug,
          {
            title: this.task.title,
            description: this.task.description,
            config_issue_effort_id: this.taskEffort.id,
            config_issue_type_id: this.taskType.id,
          }
        )
        .then((response) => {
          //this.task.slug = response.data.data.slug
          this.task.title = this.task.title
          this.task.description = this.task.description
          this.task.effort = this.taskEffort
          this.task.type = this.taskType
          this.pushStateOpen()
        })
        .catch((e) => {})

      this.editMode = false
    },
    update(params) {
      Axios()
        .put(
          'tasks/' +
            this.task.uuid +
            '/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug,
          params
        )
        .then((response) => {
          if ( params.title ) {
            //this.task.slug = response.data.data.slug
            this.pushStateOpen()
          }
          return response
        })
        .catch((e) => {})
    },
    changeBlocked(evt) {
      this.update({ is_blocker: evt })
      this.task.settings.is_blocker = evt
    },
    changeDraft(evt) {
      this.update({ is_draft: evt })
      this.task.settings.is_draft = evt
    },
    changeBug(evt) {
      this.update({ is_bug: evt })
      this.task.settings.is_bug = evt
    },
    changeArchived(evt) {
      this.update({ is_archived: evt })
      this.task.settings.is_archived = evt
      this.$eventBus.$emit('reload-column', this.task)
    },
    changeStartDate(evt) {
      this.update({
        start_date: evt === null ? null : moment(String(evt)).format('YYYY-MM-DD HH:mm:ss'),
      })
      if (evt !== null) {
        this.task.start_date.timezone = moment(String(evt)).format('YYYY-MM-DD HH:mm:ss')
        this.task.start_date.timestamp = moment(String(evt)).format('X')
      } else {
        this.task.start_date.timezone = ''
        this.task.start_date.timestamp = ''
      }
    },
    changeDueDate(evt) {
      this.update({
        due_date: evt === null ? null : moment(String(evt)).format('YYYY-MM-DD HH:mm:ss'),
      })
      if (evt !== null) {
        this.task.due_date.timezone = moment(String(evt)).format('YYYY-MM-DD HH:mm:ss')
        this.task.due_date.timestamp = moment(String(evt)).format('X')
      } else {
        this.task.due_date.timezone = ''
        this.task.due_date.timestamp = ''
      }
    },
    titleUpdate(evt) {
      this.task.title = evt
      this.update({ title: evt })
    },
    removeSprint() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.update({ sprint_id: null })
          this.task.sprint = {}
          this.task.sprint.title = null
        }
      })

    },
    removeUserStory() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.update({ user_story_id: null })
        this.task.user_story = {}
        this.task.user_story.title = null
        }
      })
      
    },

    updateDescription(data) {
      this.task.description = data.description
      this.task.description_mention = data.description_mention
    },

    duplicateTask(){
      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to copy this task?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.hideModal()
          Axios()
            .post(
              'tasks/' +
                this.task.uuid +
                '/duplicate/?company_slug=' +
                this.task.company.slug +
                '&project_slug=' +
                this.task.project.slug
            )
            .then((response) => {
              this.$eventBus.$emit('reload-column', this.task)
              
            })
        }
      })
    }
  },
}
</script>

<template>
    <b-modal v-if="modalShow" id="b-modal-task" ref="modal" v-model="modalShow" size="lg" hide-footer hide-header>
      <div class="container modal-task">
        <button v-if="authorize('tasks', 'read')" type="button" aria-label="Close" class="close" @click="hideModal">×</button>
        <div v-if="task.workflow" :style="'border-top: 10px solid ' + task.workflow.color"> </div>
        <div class="row task-content">
          <div class="col-12 col-md-9 task-left">
            <div class="row">
              <div class="col-md-1 d-none d-sm-block"></div>
              <div class="col-12 col-md-11">
                <div class="d-flex justify-content-between align-items-center">
                  <WorkflowsIcon :task="task" :activities="refreshActivities"></WorkflowsIcon>

                  <div class="d-none d-sm-block">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <b-form-checkbox
                          v-model="task.settings.is_blocker"
                          :disabled="!authorize('tasks', 'update', checkMyTask(task))"
                          switch
                          @input="changeBlocked"
                        >
                          <span class="txt-A7AFB7 tx-12-px">{{ $t('Blocked') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div v-if="authorize('tasks', 'update', checkMyTask(task))" class="ml-30-px">
                        <b-form-checkbox
                          v-model="task.settings.is_draft"
                          :disabled="!authorize('tasks', 'update', checkMyTask(task))"
                          switch
                          @input="changeDraft"
                        >
                          <span class="txt-A7AFB7 tx-12-px">{{ $t('Draft') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="ml-30-px">
                        <b-form-checkbox
                          v-model="task.settings.is_bug"
                          :disabled="!authorize('tasks', 'update', checkMyTask(task))"
                          switch
                          @input="changeBug"
                        >
                          <span class="txt-A7AFB7 tx-12-px">{{ $t('Bug') }}</span>
                        </b-form-checkbox>
                      </div>
                      <div class="ml-30-px">
                        <b-form-checkbox
                          v-model="task.settings.is_archived"
                          :disabled="!authorize('tasks', 'update', checkMyTask(task))"
                          switch
                          @input="changeArchived"
                        >
                          <span class="txt-A7AFB7 tx-12-px fw-700">{{ $t('Archived') }}</span>
                        </b-form-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="container">
              <div class="row mt-10-px">
                <div class="col-md-1 text-right mt-5-px d-none d-sm-block">
                  <font-awesome-icon
                    :icon="['far', 'align-justify']"
                    style="font-size:22px"
                    class="txt-9EA9C1 mr-10-px"
                  />
                </div>
                <div class="col-12 col-md-11">
                  <LabelEdit v-if="authorize('tasks', 'update', checkMyTask(task))" class="wd-100" :text="task.title" v-on:text-updated-blur="titleUpdate"  v-on:text-updated-enter="titleUpdate"  v-on:text-updated="titleUpdate" :placeholder="$t('Task Title')"></LabelEdit>
                  <span v-else class="vlabeledit-label" v-text="task.title"></span>
                </div>
              </div>
            </div>
            <div class="container">
              <div class="row mt-5-px">
                <div class="col-md-1 d-none d-sm-block"> </div>
                <div class="col-12 col-md-11">
                  <span class="tx-11-px txt-A7AFB7" style="position:relative;top:-4px;">
                    <span v-if="task.code">
                      <span class="fw-600 tx-14px ">{{ task.code }}</span>
                      &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
                    </span>
                    {{ $t('Task created by') }}
                    <router-link
                      :to="{
                        name: 'profile.user',
                        params: { username: task.user.username },
                      }"
                    >
                      {{ task.user.name }}
                    </router-link>
                    {{ $t('at') }}
                    <span
                      v-b-popover.hover.top="momentLocale(task.created_at.timestamp)"
                      v-text="task.created_at.date_for_humans"
                    >
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div class="container">
              <div class="row mt-15-px">
                <div class="col-md-1 text-right mt-5-px d-none d-sm-block">
                  <font-awesome-icon :icon="['far', 'users']" style="font-size:22px" class="txt-9EA9C1 mr-10-px" />
                </div>
                <div class="col-12 col-md-11">
                  <div class="d-flex justify-content-between assignees-dates">
                    <Assignees :task="task" :activities="refreshActivities"></Assignees>

                    <div class="d-flex justify-content-end" style="position: relative; top: -10px;">
                      <div class="">
                        <span class="d-block txt-A7AFB7 start_date_content">{{ $t('Start date') }}</span>
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

                      <div class="ml-10-px">
                        <span class="d-block txt-A7AFB7 due_date_content">{{ $t('Due date') }}</span>
                        <DatePicker
                          v-model="task.due_date.timezone"
                          lang="en"
                          type="datetime"
                          format="YYYY-MM-DD hh:mm A"
                          :time-picker-options="{
                            start: '00:00',
                            step: '00:30',
                            end: '23:30',
                          }"
                          confirm
                          class="due_date_input"
                          :disabled="!authorize('tasks', 'update', checkMyTask(task))"
                          :not-before="task.start_date.timezone"
                          @change="changeDueDate"
                        ></DatePicker>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Labels :task="task"></Labels>
                  </div>

                  <div class="d-flex justify-content-between">
                    <div> </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="container">
              <div
                class="row mt-15-px"
                v-if="
                  authorize('tasks', 'update', checkMyTask(task)) || (task.description && task.description.trim() !== '')
                "
              >
                <div class="col-md-1 text-right mt-8-px d-none d-sm-block">
                  <font-awesome-icon :icon="['far', 'align-right']" style="font-size:22px" class="txt-9EA9C1 mr-10-px" />
                </div>
                <div class="col-12 col-md-11">
                  <DescriptionEditable
                    style="margin: -5px  0 0 -8px;"
                    :description="task.description"
                    :description-mention="task.description_mention"
                    :endpoint="
                      'tasks/' +
                        this.task.uuid +
                        '/?company_slug=' +
                        this.$route.params.companySlug +
                        '&project_slug=' +
                        this.$route.params.projectSlug
                    "
                    :update-endpoint="
                      'tasks/' +
                        this.task.uuid +
                        '/?company_slug=' +
                        this.$route.params.companySlug +
                        '&project_slug=' +
                        this.$route.params.projectSlug
                    "
                    param-name="description"
                    :placeholder="$t('Task Description')"
                    :company-slug="$route.params.companySlug"
                    :project-slug="$route.params.projectSlug"
                    permission-feature="tasks"
                    @update-description="updateDescription"
                  ></DescriptionEditable>
                </div>
              </div>
            </div>

            <div class="container">
              <div class="row mt-15-px">
                <div class="col-md-1 text-right mt-8-px d-none d-sm-block"></div>
                <div class="col-12 col-md-11">
                  <div>

                    <Types :task="task"></Types>
                    <Efforts :task="task"></Efforts>

                    <span v-if="task.sprint.title !== null" class="badge extra-selected">
                      {{ $tc('Sprint', 1) }}:&nbsp;
                      <b>
                        <router-link
                          :to="{
                            name: 'projects.sprints.show',
                            params: {
                              companySlug: task.company.slug,
                              projectSlug: task.project.slug,
                              sprintSlug: task.sprint.slug,
                            },
                          }"
                          class="txt-link txt-primary"
                          :alt="task.sprint.title"
                          :title="task.sprint.title"
                        >
                          {{ task.sprint.title }}
                        </router-link>
                        <span v-if="authorize('tasks', 'update', checkMyTask(task))" class="txt-link mr-0-px ml-10-px" @click="removeSprint">
                          <font-awesome-icon :icon="['far', 'times']" style="font-size:14px" class="txt-3D4F9F" />
                        </span>
                      </b>
                    </span>
                  </div>
                  <div v-if="task.user_story.title !== null" class="mt-5-px">
                    <span class="badge extra-selected">
                      {{ $tc('User Story', 1) }}:&nbsp;
                      <b>
                        <router-link
                          :to="{
                            name: 'projects.user-stories.show',
                            params: {
                              companySlug: task.company.slug,
                              projectSlug: task.project.slug,
                              userStorySlug: task.user_story.slug,
                            },
                          }"
                          class="txt-link txt-primary"
                          :alt="task.user_story.title"
                          :title="task.user_story.title"
                        >
                          {{ task.user_story.title | truncate(55) }}
                        </router-link>
                        <span v-if="authorize('tasks', 'update', checkMyTask(task))" class="txt-link mr-0-px ml-10-px" @click="removeUserStory">
                          <font-awesome-icon :icon="['far', 'times']" style="font-size:14px" class="txt-3D4F9F" />
                        </span>
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Checklists :task="task"></Checklists>
            <CustomFields :task="task"></CustomFields>
            <Attachments :task="task"></Attachments>
            <Videos :task="task"></Videos>

            <Related
              class="d-none d-sm-flex"
              :task="task"
              :modal-flag="true"
            ></Related>

            <Subtasks
              class="d-none d-sm-flex"
              :task="task"
              :modal-flag="true"
            ></Subtasks>

            <Comments :task="task"></Comments>

            <b-container v-if="currentUser" class="mt-20-px">
              <b-row class="mb-10-px">
                <b-col cols="1" class="task-left-icon">
                  <font-awesome-icon :icon="['far', 'rss']" />
                </b-col>
                <b-col cols="11" class="task-left-content">
                  <h5>{{ $t('Recent Activity') }}</h5>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="1"></b-col>
                <b-col cols="11" class="task-left-content">
                  <Activities
                    :company-slug="task.company.slug"
                    :project-slug="task.project.slug"
                    :task-slug="task.slug"
                    context="issue"
                  >
                  </Activities>
                </b-col>
              </b-row>
            </b-container>

          </div>

          <!-- xxxxxxxxxxxxxxxxxxxxxxxxxxxx -->

          <div class="col-md-3 task-right d-none d-sm-block">
            
            <div v-if="currentUser">
              <div class="row d-block" style="height:45px"> </div>
              <div v-if="authorize('tasks', 'read')" class="d-flex justify-content-between">
                  <Timer
                    v-if="task.timer"
                    :key="task.uuid"
                    :task="task"
                    :close="isClosed"
                    :scope="'modal'"
                  ></Timer>

                  <div v-if="!task.timer" style="width:10;height:55px;"></div>

                  <!--
                  <div class="text-center ml-2">
                    <div class="upvote">
                      <font-awesome-icon :icon="['far', 'chevron-up']" style="font-size:14px" class="txt-68748F" />
                      <span>19</span>
                    </div>
                    <small class="txt-68748F tx-10-px" style="margin-top: -1px; display: block;">{{
                      $t('upvote')
                    }}</small>
                  </div>
                  -->
                  
                <b-dropdown v-if="authorize('tasks', 'update', checkMyTask(task))" right class="menu-options styled-dropdown">
                  <template v-slot:button-content>
                    <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                  </template>
                  <b-dropdown-item @click="duplicateTask">
                    <font-awesome-icon :icon="['far', 'clone']"/>
                    {{ $t('Copy Task') }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="deleteTask">
                    <font-awesome-icon :icon="['far', 'trash']"/>
                    {{ $t('Delete') }}
                  </b-dropdown-item>
                </b-dropdown>

              </div>
              <div class="task-actions">

                <PermanentLink :task="task"></PermanentLink>

                <Timetracking v-if="task.timer" :task="task"></Timetracking>
                
                <ChecklistsIcon :task="task"></ChecklistsIcon>
                <SubtasksIcon :task="task"></SubtasksIcon>
                <AttachmentsIcon :task="task"></AttachmentsIcon>
                <VideosIcon :task="task"></VideosIcon>
                <LabelsIcon :task="task"></LabelsIcon>
                <MoveTasks :task="task" :project="task.project" :company-slug="task.company.slug"></MoveTasks>
              </div>

              <div v-if="task.type || task.effort || task.has_sprints || task.has_user_stories" class="task-actions mt-30-px">
                <p>{{ $t('Task Categorization') }}</p>
                <TypesIcon v-if="task.type" :task="task" :activities="refreshActivities"></TypesIcon>
                <EffortsIcon v-if="task.effort" :task="task" :activities="refreshActivities"></EffortsIcon>
                <SprintsIcon v-if="task.has_sprints" :task="task" :activities="refreshActivities"></SprintsIcon>
                <UserStoriesIcon v-if="task.has_user_stories" :task="task" :activities="refreshActivities"></UserStoriesIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
</template>
