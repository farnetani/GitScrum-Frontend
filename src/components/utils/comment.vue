<script>
import Axios from '@utils/axios'
import CommentEditor from '@components/utils/comment-editor'
import ListUsers from '@components/utils/list-users'
import Mentions from '@components/utils/mentions'

export default {
  components: {
    ListUsers,
    Mentions,
    CommentEditor,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    mainCommentId: {
      type: Number | null,
      required: true,
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
      replyMode: false,
      postCommentEndpoint: this.getPostCommentEndpoint(),
      postCommentParams: this.getPostCommentParams(),
      user: JSON.parse(localStorage.getItem('CURRENT_USER')),
    }
  },
  methods: {
    getPutCommentEndpoint() {
      return 'comments/' + this.comment.id
    },

    getPostCommentEndpoint() {
      const parentId = this.mainCommentId ? this.mainCommentId : this.comment.id
      return (
        'comments/?company_slug=' +
        this.companySlug +
        '&project_slug=' +
        this.projectSlug +
        '&commentable_type=projects' +
        '&commentable_id=' +
        parentId
      )
    },

    getPostCommentParams() {
      const parentId = this.mainCommentId ? this.mainCommentId : this.comment.id

      return {
        comment_text: null,
        parent_id: parentId,
      }
    },

    reply() {
      this.replyMode = !this.replyMode
    },

    edit() {
      this.editMode = !this.editMode
    },

    handleEditComment(commentSuccess) {
      if (commentSuccess) {
        this.comment.comment = commentSuccess
        this.comment.comment_mention = commentSuccess.replace(/(?:\r\n|\r|\n)/g, '<br />')
        this.edit()
      }
    },

    handleReplyComment(comment) {
      if (comment) {
        this.$emit('add-comment', comment)
        this.replyMode = !this.replyMode
      }
    },

    handleCancelComment(closeFlag, action) {
      switch (action) {
        case 'edit':
          this.editMode = false
          break
        case 'reply':
          this.replyMode = false
          break
        default:
          break
      }
    },

    remove() {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.$emit('remove-comment', this.comment)
        }
      })
      
    },

    updateText(){
      this.$emit('update-text', true)
    }
  },
}
</script>

<template>
  <div :id="comment.id" class="comment">
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

    <div class="">
      <div v-show="!editMode">
        <span class="text tx-14-px" v-html="comment.comment_mention"> </span>
      </div>
      
      <div v-show="editMode" class="ml-40-px mt-10-px" style="width: 100%;">
        <Mentions
          ref="mentions"
          element-type="textarea"
          :mention-users="true"
          :content-text="comment.comment"
          :company-slug="companySlug"
          :project-slug="projectSlug"
          :placeholder="$t('Write a new comment')"
          :element-rows="4"
          :button-text="$t('Save')"
          :show-cancel-btn="true"
          :endpoint="getPutCommentEndpoint()"
          http-status="PUT"
          @edit-success="handleEditComment"
          @cancel="handleCancelComment($event, 'edit')"
        ></Mentions>
      </div>
    </div>
    <div v-show="!editMode" class="col-12 p-0">
      <div class="buttons-row ml-40-px d-flex">
        <div>
          <span class="txt-link fw-700" :class="replyMode ? 'active' : ''" @click="reply">
            {{ $t('Reply') }}
          </span>
        </div>
        <div v-show="authorize('comments', 'update', comment.is_mine)">
          <span class="action-separator"> . </span>
          <span class="txt-link" @click="edit">{{ $t('Edit') }}</span>
        </div>
        <div v-if="authorize('comments', 'delete', comment.is_mine)">
          <span class="action-separator"> . </span>
          <span class="txt-link" @click="remove">{{ $t('Remove') }}</span>
        </div>
      </div>
    </div>
    <div v-show="replyMode" class="col-12 p-0">
      {{comment.id}} {{companySlug}}
      
      <CommentEditor
        :edit-mode="false"
        :cancel-mode="false"
        :company-slug="companySlug"
        :project-slug="projectSlug"
        :commentable-id="mainCommentId"
        :parent-id="comment.id"
        :btn-title="$t('Reply Comment')"
        :btn-subtitle="$t('Sending')"
        :redirect="false"
        commentable-type="issues"
        @text="updateText"
      ></CommentEditor>

      <!--
      <div class="d-flex mt-30-px">
        <div style="width: 100%">
          <Mentions
            ref="mentions"
            element-type="textarea"
            :mention-users="true"
            :content-text="''"
            :company-slug="companySlug"
            :project-slug="projectSlug"
            :placeholder="$t('Reply to the comment')"
            :element-rows="4"
            :button-text="$t('Reply')"
            :show-cancel-btn="true"
            :endpoint="postCommentEndpoint"
            :endpoint-params="postCommentParams"
            @save-success="handleReplyComment"
            @cancel="handleCancelComment($event, 'reply')"
          ></Mentions>
        </div>
      </div>
      -->
    </div>
  </div>
</template>
