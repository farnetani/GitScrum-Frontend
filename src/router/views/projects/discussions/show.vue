<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import Mentions from '@components/utils/mentions'
import CommentEditor from '@components/utils/comment-editor'
import ListOtherDiscussions from '@components/projects/discussions/list-other-discussions'
import ListComments from '@components/utils/list-comments'

export default {
  page: {
    title: 'Discussions',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    TitleLoading,
    Mentions,
    CommentEditor,
    ListOtherDiscussions,
    ListComments,
  },
  data() {
    return {
      loading: true,
      replyText: '',
      editComment: false,
      stDisabled: true,
      newDiscussion: '',
      txtComment: '',
      item: [],
      createDiscussionOpen: false,
      
      user: JSON.parse(localStorage.getItem('CURRENT_USER')),
    }
  },
  mounted() {
    this.getDiscussions()
  },
  methods: {
    getDiscussions() {
      Axios()
        .get(
          'comments/' +
            this.$route.params.discussionId +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&commentable_type=projects' +
            '&commentable_id=null'
        )
        .then((response) => {
          this.item = response.data.data
          this.loading = false
        })
        .catch((error) => {
          console.error(error)
        })
    },

    handleSaveComment(comment) {
      this.txtComment = ''
      this.item.replies.push(comment)
    },

    updateText(text){
      this.item.comment_mention = text
      this.editComment = false
    },

    reply(text){
      this.getDiscussions()

    },

    cancel(){
      this.editComment = false
    },

    deleteComment(){

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){

          Axios()
          .delete(
            'comments/' +
              this.$route.params.discussionId +
              '/?company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug
          )
          .then((response) => {
            this.$router.push({
              name: 'projects.discussions',
              params: { companySlug: this.$route.params.companySlug , projectSlug: this.$route.params.projectSlug },
            })
          })
        }
      })

    }

  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
     <TitleLoading
        :title="$t('Discussions')"
        :subtitle="$t('Discussion is essential to promote dialogue for project’s goals')"
      >
      </TitleLoading>
    </template>

    <div slot="content" class="project-discussions pt-70px">
      
      <div class="container">

        <div class="row mb-30-px">
          <div class="col-md-8">
            
            <div class="txt-909CB8 tx-11-px mb-10-px mt-30-px">
              <router-link
                :to="{
                  name: 'profile.user',
                  params: { username: item.user.username },
                }"
                class="lh-16px fw-600 tx-12-px txt-1E1E2F mr-5-px"
                v-text="item.user.name"
              >
              </router-link>
              {{ $t('Posted at') }}
                    <span v-text="item.created_at.date_for_humans"></span>
            </div>

            <div class="title mb-30-px">
              <div v-show="!editComment">
                
                <div v-html="item.comment_mention"></div>
                
                <hr />
                
                <div v-if="authorize('discussions', 'create')" class="d-flex justify-content-end">
                  <a href="javascript:;" class="mr-15-px" @click="deleteComment">{{ $t('Delete') }}</a>
                  <a href="javascript:;" @click="editComment = true">{{ $t('Edit Discussion') }}</a>
                </div>
              
              </div>

              <div v-show="editComment">
                <CommentEditor
                  :edit-mode="true"
                  :cancel-mode="true"
                  :edit-content="item.comment_mention"
                  :comment-id="item.id"
                  :company-slug="$route.params.companySlug"
                  :project-slug="$route.params.projectSlug"
                  @text="updateText"
                  @cancel="cancel"
                ></CommentEditor>

                <hr />

              </div>

            </div>

            <hr />

            <div v-if="!loading" class="post-comment">

              <CommentEditor
                :btn-title="$t('Topic reply')"
                :parent-id="item.id"
                :cancel-mode="false"
                :edit-mode="false"
                :comment-id="item.id"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                @text="reply"
                @cancel="cancel"
              ></CommentEditor>

            </div>

            <ListComments
                :data="item.replies"
                :show-title="true"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
              >
              </ListComments>

          </div>
          <div class="col-md-3 offset-md-1">
            <ListOtherDiscussions :company-slug="$route.params.companySlug" :project-slug="$route.params.projectSlug">
            </ListOtherDiscussions>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

