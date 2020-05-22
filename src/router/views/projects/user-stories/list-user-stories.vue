<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'User Story',
    meta: [{ name: '', content: '' }],
  },
  components: { Layout, ListUsers, TitleLoading, ButtonLoading },
  data() {
    return {
      loading: true,
      searchLoading: false,
      userStories: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      seachByProjectName: '',
      gridConfig: {
        style: [
          'max-width: 45px; padding: 13px 10px 15px 20px;',
          'max-width:440px; width:440px;',
          'max-width:127px; width:127px;',
          'max-width:176px; width:176px;',
          'max-width:120px; width:1200px;',
          'max-width: 45px; padding-top:2px',
        ],
      },
      searchTerm: ''
    }
  },
  mounted() {
    this.getUserStories(this.currentPage)
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },
    getUserStories(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
        .get(
          'user-stories/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&search=' + 
            this.searchTerm +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getUserStories(1)
            return
          }
          this.userStories = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
          this.searchLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    search() {
      this.searchLoading = true
      this.userStories = []
      this.currentPage = 1
      this.getUserStories(1)
      this.loading = false
    },
  },
}
</script>

<template>
  <Layout>
    
    <template slot="header-left">
     <TitleLoading
        :title="$tc('Explore User Stories', totalRows)"
        :title-alternative="$t('User Stories')"
        :subtitle="$t('User stories are short and simple descriptions of capabilities')"
      ></TitleLoading>
    </template>

    <div slot="content" class="user-story pt-70px">
      
      <div class="container">
        
        <div class="d-flex justify-content-between mb-30-px">
          
          <div class="d-flex justify-content-end">
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
            <div class="ml-20-px" v-if="authorize('userStories', 'create')">
              <button slot="button" type="button" class="btn btn-primary btn-sm" @click="modal('userstoryCreate')">
                {{ $t('Create an User Story') }}
              </button>
            </div>
          </div>
        </div>

        <div class="divTable">
          <div class="divTableHead">
            <div class="divTableRow">
              <div class="divTableCell text-center" :style="gridConfig.style[5]">
                <font-awesome-icon :icon="['far', 'columns']" style="font-size: 16px;" />
              </div>
              <div class="divTableCell text-left" :style="gridConfig.style[1]">
                {{ $tc('User Story', 1) }}
              </div>
              <div class="divTableCell text-right" :style="gridConfig.style[2]">
                {{ $tc('Priority', 1) }}
              </div>
              <div class="divTableCell text-right" :style="gridConfig.style[3]">
                {{ $t('Status') }}
              </div>
              <div class="divTableCell text-right" style="width:inherit">
                {{ $tc('Team', 1) }}
              </div>
              <div class="divTableCell" :style="gridConfig.style[4]">&nbsp;</div>
            </div>
          </div>

          <div class="divTableBody">
            <div v-for="(userStory, index) in userStories" :key="index" class="divTableRowBg">
              <div class="divTableRow">
                <div class="divTableCell text-center" :style="gridConfig.style[0]">
                  <ListUsers :user="userStory.user" :link="true"></ListUsers>
                </div>
                <div class="divTableCell text-left" :style="gridConfig.style[1]">
                  <div>
                    <router-link
                      :to="{
                        name: 'projects.user-stories.show',
                        params: {
                          companySlug: userStory.company.slug,
                          projectSlug: userStory.project.slug,
                          userStorySlug: userStory.slug,
                        },
                      }"
                      class="txt-primary-title txt-link"
                    >
                      {{ userStory.code }} -
                      {{ userStory.title }}
                    </router-link>
                    <p class="mb-0">
                      <span>{{ $tc('Task', 2) }}: {{ userStory.stats.tasks }}</span>
                      /
                      <span>
                        {{ $tc('Story Point', 2) }}:
                        {{ userStory.stats.story_points }}
                      </span>
                      /
                      <span>
                        {{ $t('Worked hours') }}:
                        {{ userStory.stats.worked_hours }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[2]">
                  <span
                    v-if="userStory.priority"
                    class="badge badge-primary"
                    :style="
                      'color: ' + invertColor(userStory.priority.color, true) + ';background:' + userStory.priority.color
                    "
                  >
                    {{ userStory.priority.title }}
                  </span>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[3]">
                  <span class="info">{{ userStory.stats.completed }}%</span>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-center">
                  <ListUsers :users="userStory.users" :link="true"></ListUsers>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[4]">
                  <span v-if="authorize('userStories', 'update')">
                    <router-link
                      :to="{
                        name: 'projects.user-stories.assign-tasks',
                        params: {
                          companySlug: userStory.company.slug,
                          projectSlug: userStory.project.slug,
                          userStorySlug: userStory.slug,
                        },
                      }"
                      class=""
                    >
                      {{ $tc('Assign Tasks', 2) }}
                    </router-link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- DivTable -->

        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
          <b-pagination
            hide-goto-end-buttons
            class="paginator"
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            @change="getUserStories"
          >
            <template slot="prev-text">
              <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
            </template>
            <template slot="next-text">
              <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
            </template>
          </b-pagination>
        </div>
      </div>
    </div>
  </Layout>
</template>
