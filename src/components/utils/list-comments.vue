<script>
import Axios from '@utils/axios'
import CommentEditor from '@components/utils/comment-editor'
import ListComments from '@components/utils/list-comments'
import ListUsers from '@components/utils/list-users'

export default {
  name: 'ListComments',
  components: {
    CommentEditor,
    ListComments,
    ListUsers
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    mainCommentId: {
      type: String,
      required: false,
      default: null,
    },
    showTitle: {
      type: Boolean,
      required: false,
      default: false,
    },
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editMode: false,
      currentComment: [],
      btnTitle: '',
      btnSubTitle: '',
      editContent: '',
      openType: null,
      
      
      editOpenId: 0,
      
      user: JSON.parse(localStorage.getItem('CURRENT_USER')),
    }
  },
  methods: {
    
    addComment(newComment, comment, mainComment, data) {
      if (mainComment) {
        data.push(newComment)
      } else {
        comment.replies.push(newComment)
      }
    },

    reply(comment) {

      this.editMode = false
      this.openType = 'reply'
      this.btnTitle = this.$t('Reply Comment')
      this.btnSubTitle = this.$t('Sending')
      
      this.editOpenId = comment.id

    },

    edit(comment) {

      this.editMode = true
      this.openType = 'edit'
      this.btnTitle = this.$t('Update Comment')
      this.btnSubTitle = this.$t('Updating')

      if ( comment ) {
        this.editContent = comment.comment_mention
      }

      this.editOpenId = comment.id
    },

    remove() {
      
    },

    updateText(evt){
      
      let foundComment = this.data.find((t) => t.id === this.editOpenId)
      foundComment.comment_mention = evt

      this.editOpenId = 0

      //this.currentComment.comment_mention = evt
    },

    cancel(comment){

      this.editOpenId = 0

    },

    handleReplyComment(comment) {
      if (comment) {
        this.$emit('add-comment', comment)
        this.replyMode = !this.replyMode
      }
    },

    removeComment(comment, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('comments/' + comment.id)
          .then((response) => {
            
            let foundComment = this.data.find((t) => t.id === comment.id)
            this.data.splice(this.data.indexOf(foundComment), 1)

          })
          .catch((e) => {
            console.error(e)
          })
        }
      })
      
    },

  },
}
</script>

<template>
  <div>
    <div v-show="showTitle">
      <span class="comments-title mb-30-px mt-30-px">
        {{ $t('Explore the XX answers', { total: data.length }) }}
      </span>
    </div>

    <div v-for="(comment, index) in data" :key="index">

      <!--
      <Comment
        :comment="comment"
        :main-comment-id="mainCommentId ? mainCommentId : null"
        :company-slug="companySlug"
        :project-slug="projectSlug"
        @add-comment="addComment($event, comment, mainCommentId, data)"
        @remove-comment="removeComment"
      ></Comment>
      -->

      <div class="comment">
        <div class="d-flex justify-content-between">
          <div class="d-flex">
            <div class="mr-12px">
              <ListUsers :user="comment.user" :link="true" size="18"></ListUsers>
            </div>
            <div class="comment-avatar">
              <router-link
                :to="{
                  name: 'profile.user',
                  params: { username: comment.user.username },
                }"
                v-text="comment.user.name"
              >
              </router-link>
              <span>
                {{ $t('Commented at') }} {{ comment.created_at.date_for_humans}}
              </span>
            </div>
          </div>

          <div class="buttons-row ml-40-px d-flex">
            <!--
            <div>
              <span class="txt-link fw-700" @click="reply(comment)">
                {{ $t('Reply') }}
              </span>
            </div>
            -->
            <div v-show="authorize('comments', 'update', comment.is_mine)" class="ml-10-px">
              <span class="txt-link" @click="edit(comment)">{{ $t('Edit') }}</span>
            </div>
            <div v-if="authorize('comments', 'delete', comment.is_mine)" class="ml-10-px">
              <span class="txt-link" @click="removeComment(comment)">{{ $t('Remove') }}</span>
            </div>
          </div>

        </div>

        <div v-show="editOpenId !== comment.id" class="comment-content" v-html="comment.comment_mention"> </div>
        
        <div v-show="editOpenId === comment.id" class="mt-10-px">

          <CommentEditor
            v-show="openType === 'edit'"
            :edit-mode="true"
            :edit-content="comment.comment_mention"
            :cancel-mode="true"
            :company-slug="companySlug"
            :project-slug="projectSlug"
            :comment-id="comment.id"
            :btn-title="btnTitle"
            :btn-subtitle="btnSubTitle"
            :redirect="false"
            commentable-type="issues"
            @text="updateText"
            @cancel="cancel(comment)"
          ></CommentEditor>

          <!--
          <CommentEditor
            v-show="openType === 'reply'"
            :edit-mode="false"
            :cancel-mode="true"
            :company-slug="companySlug"
            :project-slug="projectSlug"
            :comment-id="comment.id"
            :btn-title="btnTitle"
            :btn-subtitle="btnSubTitle"
            :redirect="false"
            commentable-type="issues"
            @text="updateText"
            @cancel="cancel(comment)"
          ></CommentEditor>
          -->

        </div>
        
      </div>

      <div v-if="comment.replies.length">
        <div class="ml-40-px">

          <ListComments
            :data="comment.replies"
            :main-comment-id="mainCommentId ? mainCommentId : comment.id"
            :show-title="false"
            :company-slug="companySlug"
            :project-slug="projectSlug"
          ></ListComments>

        </div>
      </div>
    </div>
  </div>
</template>
