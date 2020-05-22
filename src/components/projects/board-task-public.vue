<script>
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import ListLabels from '@components/utils/list-labels'
import StartDueDates from '@components/projects/tasks/start-due-dates'
import BoardTaskOptions from '@components/projects/board-task-options'
import hexToRgba from 'hex-to-rgba'

export default {
  components: {
    ListUsers,
    StartDueDates,
    ListLabels,
    BoardTaskOptions,
  },
  props: {
    workflow: {
      type: Object,
      required: false,
      default() {
        return []
      },
    },
    token: {
      type: String,
      required: true
    },
  },

  data() {
    return {
      loading: true,
      loadMoreLoading: false,
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
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: 'tasks',
        disabled: false,
        ghostClass: 'ghost',
      }
    },
  },

  created() {
    this.getTasks()
  },
  methods: {
    
    getTasks() {
      if (this.currentPage <= this.totalPages) {

        Axios()
          .get(
            '/share-board/public/tasks/' + this.token + '/?workflow_id=' +
              this.workflow.id +
              '&page=' + this.currentPage
          )
          .then((response) => {
            
            let i = 0
            for(i in response.data.data) {
              this.tasks.push(response.data.data[i])
            }
            
            this.loading = false
            this.loadMoreLoading = false
            this.totalPages = response.data.total_pages
            this.totalTasks = response.data.total

            

          })
          .catch((e) => {
            console.error(e)
          })

      } else {
        this.loadMoreLoading = false
      }
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
      <BoardTaskOptions :workflow="workflow" :total="totalTasks" :show-add-card="false"></BoardTaskOptions>
    </header>

    <div style="max-height: 100vh" >
      <ul
        v-infinite-scroll="loadMore" 
        infinite-scroll-disabled="busy" 
        infinite-scroll-distance="300"
        group="tasks"
        class="column list-group"
      >
        <span>
          <li
            v-for="task in tasks"
            :key="task.slug"
            :data-task="task.uuid"
            :data-username="getUsers(task.users)"
            class="list-group-item task-card">

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

              <div v-if="task.type || task.effort" class="d-flex align-items-center flex-wrap">
                <div
                  v-if="task.type"
                  :alt="$t('Task Type')"
                  :title="$t('Task Type')"
                  class="task-type"
                  :style="'color: ' + invertColor(task.type.color, true) + ';background: ' + task.type.color"
                  >
                  <span >{{ task.type.title }}</span>
                </div>
                <div
                  v-if="task.effort"
                  :alt="$t('EFFORT')"
                  :title="$t('EFFORT')"
                  class="task-effort"
                >
                  <span >{{ task.effort.title }}</span>
                </div>
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
                      ><i v-b-popover.hover.top="Bug" class="fas fa-bug"></i
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
        </span>
      </ul>
      <div v-show="loadMoreLoading" class="text-center mt-2-px">
        <b-spinner tag="div" :label="$t('Loading')" small style="width: 12px;height: 12px;border-width: 2px;"></b-spinner>
      </div>
    </div>
    <div class="footer-column"></div>
  </div>
</template>

<style>
.content-task-card{
  cursor:default !important;
}

.board-task-options{
  display:none;
}

.board-task-options .board-task-icon{
  padding-left: 0 !important;
}

.task-title:hover{
  text-decoration: none !important;
  cursor:default !important;
}
</style>
