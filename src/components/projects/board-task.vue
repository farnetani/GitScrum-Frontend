<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import ListUsers from '@components/utils/list-users'
import ListLabels from '@components/utils/list-labels'
import StartDueDates from '@components/projects/tasks/start-due-dates'
import Types from '@components/projects/tasks/types'
import Efforts from '@components/projects/tasks/efforts'
import BoardTaskOptions from '@components/projects/board-task-options'
import Timer from '@components/projects/tasks/timer'
import { modalManager, taskFilter } from '@state/helpers'
import { isMobile } from 'mobile-device-detect';
import Mentions from '@components/utils/mentions'
import hexToRgba from 'hex-to-rgba'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: {
    Draggable,
    ListUsers,
    StartDueDates,
    Types,
    Efforts,
    ListLabels,
    BoardTaskOptions,
    Mentions,
    Timer,
    vSelect,
  },
  props: {
    workflow: {
      type: Object,
      required: false,
      default() {
        return []
      },
    },
  },

  data() {
    return {
      loading: true,
      loadMoreLoading: false,
      canDragTasks: isMobile,

      showAddCard: false,
      showAddCardLoading: false,
      addTaskStatus: true,
      cardTitle: '',
      issueTitle: '',
      taskMember: '',
      taskMembers: [],
      totalTasks: 0,
      tasks: [],
      drag: false,
      objectTask: [],
      hideTasks: false,
      currentPage: 1,
      totalPages: 1,

      isArchived: false,
      filters: [],
      getTaskRequest: false
    }
  },
  computed: {
    ...taskFilter,

    dragOptions() {
      return {
        animation: 0,
        group: 'tasks',
        disabled: false,
        ghostClass: 'ghost',
      }
    },
  },
  watch:{
    statusFilter(data){
      
      if ( data.filter[0] ){
        let params = ''

        data.filter.forEach( (element, key) => {
          let value = Object.values(element)
          params += '&' + Object.keys(element) + '=' + value
        });

        this.filters = params
        this.loading = true
        this.tasks = []
        this.getTasks()
      }
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('task-deleted')
    this.$eventBus.$off('task-change-workflow')
  },

  created() {
    this.getTasks()
    this.$eventBus.$on('reload-column', this.handleReloadColumnEvent)
    this.$eventBus.$on('task-deleted', this.handleTaskDeletedEvent)
    this.$eventBus.$on('task-change-workflow', this.handleTaskChangedWorkflowEvent)
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },

    handleTaskChangedWorkflowEvent(data) {
      if (this.workflow.slug === data.oldWorkflow.slug) {
        let foundTask = this.tasks.find((t) => t.slug === data.task.slug)
        this.tasks.splice(this.tasks.indexOf(foundTask), 1)
      }

      if (this.workflow.slug === data.task.workflow.slug) {
        this.tasks.unshift(data.task)
      }
    },

    handleTaskDeletedEvent(task) {
      if (this.workflow.slug === task.workflow.slug) {
        let foundTask = this.tasks.find((t) => t.slug === task.slug)
        this.tasks.splice(this.tasks.indexOf(foundTask), 1)
      }
    },

    handleReloadColumnEvent(task){
      this.currentPage = 1
        
      if ( task ){
        if ( task === true || task.workflow.id === this.workflow.id ){
          this.filters = ''
          this.loading = true
          this.tasks = []
          this.getTasks()
          return true
        }
      }

      if ( !task ){
        this.loading = true
        this.tasks = []
        this.getTasks()
      }

    },

    getTasks() {
      let userStorySlug = this.$route.query.userStorySlug ? this.$route.query.userStorySlug : ''
      let sprintSlug = this.$route.query.sprintSlug ? this.$route.query.sprintSlug : ''
      let taskIsArchived = this.$store.getters['tasksArchived/getIsArchived']

      if (!this.getTaskRequest && this.currentPage <= this.totalPages) {
        
        this.getTaskRequest = true

        Axios()
          .get(
            '/board-tasks/?workflow_id=' +
              this.workflow.id +
              '&company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug +
              '&user_story_slug=' +
              userStorySlug +
              '&sprint_slug=' +
              sprintSlug + 
              '&is_archived=' +
              taskIsArchived +
              '&page=' + this.currentPage +
              this.filters
          )
          .then((response) => {
            
            let i = 0
            for(i in response.data.data) {
              this.tasks.push(response.data.data[i])
            }
            
            this.getTaskRequest = false
            this.loading = false
            this.loadMoreLoading = false
            this.totalPages = response.data.total_pages
            this.totalTasks = response.data.total

            if (this.$route.params.taskSlug !== undefined) {
              let selectedTask = this.tasks.find((task) => {
                return task.uuid === this.$route.params.taskSlug
              })
              if (selectedTask !== undefined) this.modal('task', selectedTask)
            }

          })
          .catch((e) => {
            console.error(e)
          })

      } else {
        this.loadMoreLoading = false
      }
    },

    getTaskTeamMembers() {

      let root = document.getElementById('project-team-members')
      let elements = root.getElementsByClassName('list-users')
      let arr = []

      for (let i = 0; i < elements[0].children.length; i++) {
        
        arr.push(
        {
          value: elements[0].children[i].dataset.username,
          label: elements[0].children[i].dataset.fullname,
          avatar: elements[0].children[i].dataset.avatar
        }
        )
      }

      return arr;

    },

    getTaskMembers() {
      
        this.taskMembers = this.getTaskTeamMembers()
        this.addTaskStatus = true
        this.showAddCardLoading = false
    },

    hasImage(image) {
      return image !== false
    },

    isDraft(draft) {
      return draft
    },

    isBlocker(blocker) {
      return blocker
    },

    isBug(bug) {
      return bug
    },

    moveTask(evt) {
      let total = document.getElementById(this.workflow.slug).getElementsByClassName('task-card').length
      let task = null
      if (evt.removed) {
        this.totalTasks = total - 1
      } else {
        this.totalTasks = total
        let taskId = 0
        let taskPosition = 0

        if (evt.added === undefined) {
          task = evt.moved.element
          taskId = evt.moved.element.uuid
          taskPosition = evt.moved.newIndex
        } else {
          task = evt.added.element
          taskId = evt.added.element.uuid
          taskPosition = evt.added.newIndex
        }

        Axios()
          .put(
            '/board-tasks/?company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug,
            {
              task_uuid: taskId,
              workflow_id: this.workflow.id,
              position: taskPosition + 1,
            }
          )
          .then((response) => {
            let foundTask = this.tasks.find((t) => t.slug === task.slug)
            foundTask.workflow = this.workflow
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },

    getUsers(users) {
      let strUsers = ''

      if (!users.length) {
        return ''
      }

      for (let i = 0; i < users.length; i++) {
        strUsers += users[i].username + ','
      }

      return strUsers.slice(0, -1)
    },

    getDate(date) {
      if (date === undefined) return ''

      return date.timezone
    },

    openAddCard() {
      this.showAddCard = true
      this.getTaskMembers();
    },

    closeAddCard() {
      this.showAddCard = false
    },

    createTask() {
      let title = this.cardTitle

      if (this.issueTitle.length > 1) {
        let taskIsArchived = this.$store.getters['tasksArchived/getIsArchived']
        
        this.showAddCardLoading = true
        this.showAddCard = false

        Axios()
          .post(
            '/tasks/?company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug +
              '&user_story_slug=' +
              this.$route.query.userStorySlug +
              '&sprint_slug=' +
              this.$route.query.sprintSlug +
              '&is_archived=' +
              taskIsArchived,
            {
              position: 0,
              title: this.issueTitle,
              username: this.taskMember.value,
              config_workflow_id: this.workflow.id,
            }
          )
          .then((response) => {
            this.tasks.unshift(response.data.data)
            this.showAddCardLoading = false
            this.issueTitle = ''
            this.cardTitle = ''
          })
          .catch((e) => {
            console.error(e)
          })
      } else {
        alert(this.$t('You must fill in the task title'))
      }
    },

    hasIcons(task) {
      return (
        this.isDraft(task.settings.is_draft) ||
        this.isBug(task.settings.is_bug) ||
        this.isBlocker(task.settings.is_blocker) ||
        task.stats.checklists ||
        task.stats.time_trackers ||
        task.stats.videos ||
        task.stats.comments ||
        task.stats.attachments ||
        task.stats.checklists
      )
    },

    updateTaskTitleText(text) {
      this.cardTitle = text
    },

    loadMore: function() {
      if ( !this.loading ){
        this.currentPage += 1
        this.loadMoreLoading = true
        this.getTasks()        
      }
    },
    backgroundColor(hexColor) {
      return hexToRgba(hexColor, '0.06')
    },
  },

}
</script>

<template>
  <div
    :id="workflow.slug"
    class="board-workflow"
    :data-title="workflow.title"
    :data-slug="workflow.slug"
    :style="'border-top-color:' + workflow.color"
  >
    <header>
      <BoardTaskOptions :workflow="workflow" :total="totalTasks" :show-add-card="showAddCard"></BoardTaskOptions>
    </header>

    <footer v-show="!loading" class="shadow-base">
      <span
        v-if="getProjectRole(false) !== 'guest' && !showAddCard && !showAddCardLoading"
        class="cursor-pointer add-card"
        @click="openAddCard"
      >
        {{ $t('+ Add a new Task') }}
      </span>
      <span v-show="showAddCardLoading" class="ml-10-px" style="position:relative; top:-10px; margin-bottom:-8px;">
        <b-spinner :label="$t('Loading')" class="txt-68748F" small></b-spinner>
      </span>
      <div v-show="showAddCard">
        <div v-show="addTaskStatus">
          <div class="box-add-task" style="margin-bottom:10px;">
            <b-form-textarea
              v-model="issueTitle"
              :placeholder="$t('Write task title')"
              rows="3"
              max-rows="6"
              style="padding: 8px 10px;"
            ></b-form-textarea>
            <!--
            <Mentions
              ref="mentions"
              element-type="input"
              :mention-users="true"
              :content-text="cardTitle"
              :company-slug="$route.params.companySlug"
              :project-slug="$route.params.projectSlug"
              :placeholder="$t('Write task title')"
              @update-text="updateTaskTitleText"
            >
            </Mentions>
            -->
            <div class="members">
              <div class="item-input d-flex mt-10-px">
                <v-select
                  v-model="taskMember"
                  :options="taskMembers"
                  :placeholder="$t('Assign teammate')"
                  :clear-on-select="true"
                  style="width:100%; margin-bottom:0; font-size:13px; color: #9EA9C1;"
                >
                  <template slot="option" slot-scope="option">
                    <div class="d-flex align-items-center justify-content-start members-line">
                      <div class="">
                        <ListUsers :user="option" :link="true" size="26"></ListUsers>
                      </div>
                      <div class="wd-100 d-flex justify-content-between align-items-center">
                        <div class="ml-10-px userdata">
                          <span class="fw-600">{{ option.label }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </v-select>
              </div>
            </div>
          </div>
          <div class="list-bg-color d-flex">
            <div class="cursor-pointer btn btn-primary btn-xs" @click="createTask">
              {{ $t('Add Task') }}
            </div>
            <div class="cursor-pointer d-flex ml-3 align-items-center close-add-card" @click="closeAddCard">
              <i class="fas fa-times" style="font-size:20px"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <div class="pos-relative">
      <b-spinner v-show="loading" :label="$t('Loading')" small class="title-loading mg-l-8"></b-spinner>
    </div>

    <div style="max-height: 100vh" >
      <Draggable
        v-infinite-scroll="loadMore" 
        infinite-scroll-disabled="busy" 
        infinite-scroll-distance="300"
        :disabled="canDragTasks"
        group="tasks"
        class="column list-group"
        draggable=".list-group-item"
        tag="ul"
        :list="tasks"        
        v-bind="dragOptions"
        @change="moveTask" 
      >
        <transition-group type="transition" name="" >
          <li
            v-for="task in tasks"
            :key="task.slug"
            :data-task="task.uuid"
            :data-username="getUsers(task.users)"
            class="list-group-item task-card"
            @click="modal('task', task)">

            <div class="content-task-card" :style="(task.type) ? 'background: ' + backgroundColor(task.type.color) : ''">
              <span class="task-title">
                <strong v-if="task.code">{{ task.code }} - </strong>
                {{ task.title }}
              </span>

              <div v-if="hasImage(task.image)" class="cover-container">
                <img v-lazy="task.image" class="cover task-image" />
              </div>

              <div v-if="task.labels[0]">
                <ListLabels v-if="task.labels[0]" :labels="task.labels" :limit="15"></ListLabels>
              </div>

              <div v-if="task.type || task.effort || task.timer" class="d-flex align-items-center flex-wrap">
                
                <Types v-if="task.type" :task="task"></Types>
                <Efforts :task="task"></Efforts>
                
                <Timer v-if="task.timer && authorize('tasks', 'read')" :task="task"></Timer>
              
              </div>

              <div
                v-if="task.users.length > 0"
                class="col-md d-flex justify-content-start"
                style="padding: 0 0 10px 10px;"
              >
                <ListUsers size="26" :users="task.users" :link="false" :limit="6"></ListUsers>
              </div>

              <StartDueDates class="task-startDueDates" :task="task"></StartDueDates>

              <div v-if="hasIcons(task)" class="has-icons" style="padding-bottom: 10px;">
                <div class="d-flex justify-content-between">
                  <div>
                    <span class="d-flex task-stats">
                      <small v-if="task.stats.checklists" class="tx-gray-600 pd-r-10"
                        ><i v-b-popover.hover.top="$t('Checklist')" class="fas fa-list-ol"></i>
                        {{ task.stats.checklists }}</small
                      >
                      <small v-if="task.stats.time_trackers" class="tx-gray-600 pd-r-10"
                        ><i v-b-popover.hover.top="$t('Time Tracking')" class="fas fa-clock"></i>
                        {{ task.stats.time_trackers }}</small
                      >
                      <small v-if="task.stats.videos" class="tx-gray-600 pd-r-10"
                        ><i v-b-popover.hover.top="$t('Video')" class="far fa-play-circle"></i>
                        {{ task.stats.videos }}</small
                      >
                      <small v-if="task.stats.comments" class="tx-gray-600 pd-r-10"
                        ><i v-b-popover.hover.top="$t('Comment')" class="fas fa-comment-alt"></i>
                        {{ task.stats.comments }}</small
                      >
                      <small v-if="task.stats.attachments" class="tx-gray-600 pd-r-10"
                        ><i v-b-popover.hover.top="$t('Attachment')" class="fas fa-paperclip"></i>
                        {{ task.stats.attachments }}</small
                      >
                    </span>
                  </div>

                  <div class="task-icons">
                    <small v-if="isBug(task.settings.is_bug)" class="tx-danger pd-l-10"
                      ><i v-b-popover.hover.top="$t('bug')" class="fas fa-bug"></i
                    ></small>

                    <small v-if="isBlocker(task.settings.is_blocker)" class="tx-warning pd-l-10"
                      ><i v-b-popover.hover.top="$t('Blocker')" class="fas fa-shield-alt"></i
                    ></small>

                    <small v-if="isDraft(task.settings.is_draft)" class="tx-primary pd-l-10">
                      <i v-b-popover.hover.top="$t('Task Draft - Only you can see')" class="fas fa-eye"></i>
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="task.stats.checklists && task.stats.checklist_percentage"
              class="task-progress"
              :data-width="task.stats.checklist_percentage"
            >
              <b-progress :max="100">
                <b-progress-bar
                  :value="task.stats.checklist_percentage"
                  :style="'background-color:' + workflow.color + ' !important'"
                >
                </b-progress-bar>
              </b-progress>
            </div>
          </li>
        </transition-group>
      </Draggable>
      <div v-show="loadMoreLoading" class="text-center mt-2-px">
          <b-spinner tag="div" :label="$t('Loading')" small style="width: 12px;height: 12px;border-width: 2px;"></b-spinner>
        </div>
    </div>
    <div class="footer-column"></div>
  </div>
</template>
