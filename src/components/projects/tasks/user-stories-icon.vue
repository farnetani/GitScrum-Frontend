<script>
import Axios from '@utils/axios'
import Alert from '@components/utils/alert'
import ButtonLoading from '@components/utils/button-loading'

export default {
  components: { Alert, ButtonLoading },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    // refresh: {
    //   type: Array,
    //   required: true,
    // },
    activities: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      userStories: [],

      alertMessage: '',
      alertStatus: false,
      currentPage: 0,
      totalPages: 1,
      perPage: 15,
      loadingMore: false,
      userStorySelected: [],
      searchTerm: '',
      termSearched: false,
      searchLoading: false,
    }
  },
  methods: {
    handleScroll(ev) {
      if (
        ev.target.scrollHeight - 400 <= ev.target.scrollTop &&
        !this.loadingMore &&
        this.currentPage <= this.totalPages
      ) {
        this.loadMore()
      }
    },

    loadMore() {
      this.currentPage = this.currentPage + 1
      if (this.currentPage <= this.totalPages) {
        this.loadingMore = true
        this.getUserStories()
      }
    },

    getUserStories() {
      this.loading = true
      this.alertStatus = false
      Axios()
        .get(
          'user-stories/?company_slug=' + 
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug +
          '&search=' + 
          this.searchTerm +
          '&page=' +
          this.currentPage
        )
        .then((response) => {
          
          this.currentPage = response.data.current_page
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          if (this.userStories.length && this.currentPage > this.total_pages) {
            this.currentPage = 1
            this.getUserStories()
          } else {
            for (let i = 0; i < response.data.data.length; i++) {
              let userStory = response.data.data[i]
              this.$set(userStory, 'selected', false)
              this.$set(userStory, 'selectUserStoryLoading', false)
              this.userStories.push(userStory)
            }
          }
          
          this.loadingMore = false
          this.searchLoading = false
          this.loading = false
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
          this.loading = false
          this.loadingMore = false
        })
    },

    selectUserStory(userStory) {
      if (this.userStorySelected && this.userStorySelected.selected) {
        let userStoryIndex = this.userStories.indexOf(this.userStorySelected)
        if ( this.userStories[userStoryIndex] ){
          this.userStories[userStoryIndex].selected = false
        }
      }
      userStory.selected = true
      this.userStorySelected = userStory
      this.task.user_story = userStory
    },

    changeTaskUserStory(userStory) {
      this.alertStatus = false
      userStory.selectUserStoryLoading = true
      Axios()
        .put(
          'tasks/' +
            this.task.uuid +
            '/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug,
          {
            user_story_id: userStory.id,
          }
        )
        .then((response) => {
          if (response.data.message) {
            this.alertMessage = 'Error. ' + response.data.message
            this.alertStatus = true
          } else {
            this.selectUserStory(userStory)
          }
          userStory.selectUserStoryLoading = false
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
          userStory.selectUserStoryLoading = false
        })
    },

    search() {
      this.searchLoading = true
      this.userStories = []
      this.currentPage = 1
      this.termSearched = true
      this.getUserStories()
    },
  },
}
</script>

<template>
  <div class="dropdown mb-8-px">
    <button
      class="btn btn-block dropdown-toggle"
      data-toggle="dropdown"
      @click="loadMore"
      :disabled="!authorize('tasks', 'create')"
    >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'box-full']" style="font-size:14px"/></span>
      <span>{{ $t('User Stories') }}</span>
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
                :placeholder="$t('Search user story')"
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

        <div v-if="userStories.length" class="sprints-list" v-on:scroll.passive="handleScroll">
          <ul class="list">
            <li
              v-for="userStory in userStories"
              :key="userStory.id"
              class="mb-10-px p-10-px"
              @click="changeTaskUserStory(userStory)"
              :class="userStory.selected ? 'selected' : ''"
            >
              <div>
                <span class="d-block tx-12-px fw-500 mb-5-px" :class="userStory.selected ? 'txt-3D4F9F' : 'txt-68748F'">
                  {{ userStory.title }}
                </span>
                <div class="d-flex justify-content-between">
                  <span class="d-block tx-10-px ls-003" :class="userStory.selected ? 'txt-3D4F9F' : 'txt-68748F'">
                    {{ userStory.priority.title }}
                  </span>
                  <font-awesome-icon
                    v-if="userStory.selected && !userStory.selectUserStoryLoading"
                    :icon="['far', 'check-double']"
                    class="txt-464DEE"
                    style="font-size: 12px;"
                  />
                  <b-spinner
                    v-show="userStory.selectUserStoryLoading"
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
</template>
