<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import Mentions from '@components/utils/mentions'
import TitleLoading from '@components/utils/title-loading'
import CommentEditor from '@components/utils/comment-editor'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Discussions',
    meta: [{ name: '', content: '' }],
  },
  components: { Layout, ListUsers, Mentions, ButtonLoading, TitleLoading, CommentEditor },
  data() {
    return {
      loading: true,
      loadingPriorities: true,
      searchLoading: '',
      comments: [],
      totalRows: 0,
      totalPages: 0,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      btnLoading: false,
      txtComment: '',
      createDiscussionOpen: false,
      filter: null,
      seachByProjectName: '',
      gridConfig: {
        style: [
          'max-width: 45px; padding: 13px 10px 15px 20px;',
          '',
          'max-width:290px; width:290px;',
          'max-width:155px; width:155px;',
          'max-width: 45px; padding-top:2px',
        ],
      },
      searchTerm: ''
    }
  },
  mounted() {
    this.getDiscussions(this.currentPage)
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },
    getDiscussions(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
        .get(
          'comments/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&commentable_type=projects' +
            '&commentable_id=null' +
            '&search=' + 
            this.searchTerm +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getDiscussions(1)
            return
          }
          this.comments = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
          this.searchLoading = false
        })
        .catch((error) => {
          console.error(error)
        })
    },

    search() {
      this.searchLoading = true
      this.comments = []
      this.currentPage = 1
      this.getDiscussions(1)
      this.loading = false
    },

    created(){
      this.getDiscussions(1)
    },

    cancel(){
      this.createDiscussionOpen = false
    },
  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
     <TitleLoading
        :title="$tc('Explore Discussions', totalRows)"
        :title-alternative="$t('Discussions')"
        :subtitle="$t('Discussion is essential to promote dialogue for project’s goals')"
      >
      </TitleLoading>
    </template>

    <div slot="content" class="project-discussions pt-70px">
       <div class="container">
        <div class="row mb-30-px">
          <div class="col-md-12 pr-0">
            <div class="d-flex justify-content-between mb-30-px">
              
              <div class="d-flex justify-content-end">
                <div>
                  <div class="form-group m-0">
                    <div class="input-group">
                      <input
                        v-model="searchTerm"
                        maxlength="45"
                        type="text"
                        class="form-control"
                        autocomplete="off"
                        :placeholder="$t('Search discussion')"
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
                <div v-if="authorize('discussions', 'create')" class="ml-20-px">
                  <button
                    slot="button"
                    type="button"
                    class="btn btn-primary btn-sm"
                    @click="createDiscussionOpen = !createDiscussionOpen"
                  >
                    {{ $t('Create a Discussion') }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="createDiscussionOpen" class="mb-30-px">
              <CommentEditor
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                @cancel="cancel"
                @text="created"
              ></CommentEditor>
            </div>

            <div class="divTable">
              <div class="divTableHead">
                <div class="divTableRow">
                  <div class="divTableCell text-left" :style="gridConfig.style[1]"
                    >{{ $tc('Discussion', 2, { n: '' }) }} {{ $tc('List', 1) }}
                  </div>
                  <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[2]">{{
                    $t('Comments')
                  }}</div>
                  <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[3]">{{
                    $tc('Participant', 2)
                  }}</div>
                </div>
              </div>

              <div class="divTableBody">
                <div v-for="(comment, index) in comments" :key="index" class="divTableRowBg">
                  <div class="divTableRow">
                    <div class="divTableCell text-center" :style="gridConfig.style[0] + ';padding:15px;'">
                      <ListUsers :user="comment.user" :link="true"></ListUsers>
                    </div>
                    <div class="divTableCell text-left" :style="gridConfig.style[1]">
                      <router-link
                        :to="{
                          name: 'projects.discussions.show',
                          params: {
                            companySlug: $route.params.companySlug,
                            discussionId: comment.id,
                          },
                        }"
                        class="txt-primary-title txt-link"
                        :alt="comment.comment"
                      >
                        {{ comment.comment | truncate(220) }}
                      </router-link>
                      <p class="mb-0">
                        <span v-b-popover.hover.top="comment.created_at.timezone">
                          {{ $t('Created at') }}
                          {{ comment.created_at.date_for_humans }}
                        </span>
                        /
                        <span v-b-popover.hover.top="comment.updated_at.timezone">
                          {{ $tc('Last reply at') }}
                          {{ comment.updated_at.date_for_humans }}
                        </span>
                      </p>
                    </div>
                    <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[2]">
                      <span class="info">
                        <font-awesome-icon :icon="['far', 'comments-alt']" style="font-size: 16px;" />
                        {{ comment.replies.length }}
                      </span>
                    </div>
                    <div
                      class="divTableCell d-flex align-items-center justify-content-end participants"
                      :style="gridConfig.style[3]"
                    >
                      <ListUsers
                        :users="comment.replies.map((reply) => reply.user)"
                        :owner="comment.user"
                        :link="true"
                      ></ListUsers>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
              <b-pagination
                hide-goto-end-buttons
                class="paginator"
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                @change="getDiscussions"
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
      </div>
    </div>
  </Layout>
</template>
