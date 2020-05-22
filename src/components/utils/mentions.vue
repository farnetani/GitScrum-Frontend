<script>
import Axios from '@utils/axios'
import At from 'vue-at'

export default {
  components: {
    At,
  },
  props: {
    elementType: {
      type: String,
      required: true,
      default: '',
    },
    mentionUsers: {
      type: Boolean,
      required: true,
      default: false,
    },
    contentText: {
      type: String,
      required: true,
      default: '',
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String | undefined,
      required: true,
    },
    elementRows: {
      type: Number,
      required: false,
      default: 1,
    },
    showButtons: {
      type: Boolean,
      required: false,
      default: false,
    },
    buttonText: {
      type: String,
      required: false,
      default: '',
    },
    showCancelBtn: {
      type: Boolean,
      required: false,
      default: false,
    },
    endpoint: {
      type: String,
      required: false,
      default: '',
    },
    endpointParams: {
      type: Object,
      required: false,
      default: () => {},
    },
    httpStatus: {
      type: String,
      required: false,
      default: 'POST',
    },
  },
  data() {
    return {
      mentionUserSymbol: '@',
      mentionTaskSymbol: '#',
      mentionEmojiSymbol: ':',
      usersList: [],
      emojisList: [],
      tasksList: [],
      rowHeightDefault: 20,
      btnLoading: false,
      buttonsShow: this.showButtons
    }
  },
  computed: {
    classObject() {
      return {
        'textarea-layout': this.elementType === 'textarea',
        'input-layout': this.elementType === 'input',
      }
    },

    calcElementHeight() {
      return this.elementRows * this.rowHeightDefault
    },
  },
  watch: {
    contentText() {
      if (this.contentText === '') {
        this.clear()
      }
    },
    /*
    projectSlug() {
      if (this.mentionUsers && this.projectSlug && this.companySlug) {
        this.getUsersList()
      }
    },
    */
  },
  created() {
    if (this.buttonText.length) {
      this.buttonsShow = true
    }
    /*
    this.$store.dispatch('projectMembers/actionGetTeamMembers', {
      projectSlug: this.$route.params.projectSlug,
      companySlug: this.$route.params.companySlug
    })
    */
  },
  mounted() {
    this.clear()

    if (this.mentionUsers && this.projectSlug && this.companySlug) {
     // this.getUsersList()
    }
  },
  methods: {
    onDivInput: function(e) {
      this.txtComment = e.target.innerText
      if (!this.buttonsShow) {
        this.$emit('update-text', this.txtComment)
      }
    },

    clear() {
      this.$refs.contentRef.innerText = this.contentText
    },
/*
    getUsersList() {
      let data = this.teamMembers
      this.fillUsersList(data)
    },
    */

    fillUsersList(users) {
      if (users && users.length) {
        users.forEach((userElement) => {
          let userObject = {
            name: userElement.user.name,
            username: userElement.user.username,
            usernameTag: '@' + userElement.user.username,
            avatar: userElement.user.avatar,
          }

          this.usersList.push(userObject)
        })
      }
    },

    // TODO: GET EMOJIS
    getEmojisList() {
      this.emojisList = []
    },

    // TODO: GET TASKS
    getTasksList() {
      this.tasksList = []
    },

    getEndpointParams() {
      if (this.endpointParams) {
        this.endpointParams.comment_text = this.txtComment
        return this.endpointParams
      }
      return {
        comment_text: this.txtComment,
      }
    },

    save() {
      this.txtComment = this.$refs.contentRef.innerText
      if (!this.endpoint || !this.txtComment) {
        this.$emit('save-success', false)
        return
      }

      this.btnLoading = true
      switch (this.httpStatus) {
        case 'POST':
          this.post()
          break
        case 'PUT':
          this.put()
          break
        default:
          break
      }
    },

    cancel() {
      this.$emit('cancel', true)
    },

    post() {
      Axios()
        .post(this.endpoint, this.getEndpointParams())
        .then((response) => {
          this.txtComment = ''
          this.clear()
          this.$emit('save-success', response.data.data)
          this.btnLoading = false
        })
        .catch((error) => {
          console.error(error)
          this.btnLoading = false
          this.$emit('save-success', false)
        })
    },

    put() {
      Axios()
        .put(this.endpoint, this.getEndpointParams())
        .then((response) => {
          this.$emit('edit-success', this.txtComment)
          this.txtComment = ''
          this.clear()
          this.btnLoading = false
        })
        .catch((error) => {
          console.error(error)
          this.btnLoading = false
          this.$emit('edit-success', false)
        })
    },

    // TODO: APPLY MENTION BY BUTTON
    applyUserMention() {
      // $('#contentElement').focus()
      this.$refs.contentRef.innerText = this.$refs.contentRef.innerText.concat(' ' + this.mentionUserSymbol)
    },
  },
}

// project slug: {{ $route.params.projectSlug === undefined }};
// contenteditable
</script>

<template>
  <div class="mention-group">
    <div class="mention" disabled>
      <At :at="mentionTaskSymbol" :members="tasksList">
        <At :at="mentionEmojiSymbol" :members="emojisList">
          <At :at="mentionUserSymbol" :members="usersList" name-key="username">
            <template slot="item" slot-scope="s">
              <div class="mention-row d-flex">
                <div class="ml-10-px">
                  <img class="avatar-30" :src="s.item.avatar" />
                </div>
                <div style="width:100%">
                  <span class="mention-fullname" v-text="s.item.name"></span>
                  <span class="d-block mention-username" v-text="s.item.usernameTag"></span>
                </div>
              </div>
            </template>
            <div
              id="contentElement"
              ref="contentRef"
              class="content"
              :class="classObject"
              :contenteditable="projectSlug !== undefined"
              :data-placeholder="placeholder"
              :style="{
                'min-height': calcElementHeight + 'px',
              }"
              @focusout="onDivInput($event)"
            ></div>
            <div v-if="buttonsShow" class="mention-buttons d-flex">
              <div class="col-sm-6 p-0 d-flex">
                <b-button v-if="btnLoading" variant="primary" class="btn btn-primary btn-flat btn-sm">
                  <b-spinner small type="grow"></b-spinner>
                  {{ $t('Creating') }}
                </b-button>

                <button v-if="!btnLoading" class="btn btn-primary btn-flat btn-sm" @click="save">
                  {{ buttonText ? buttonText : $t('Create') }}
                </button>

                <div v-if="showCancelBtn" class="btn btn-sm cancel-btn">
                  <i class="fas fa-times" @click="cancel"></i>
                </div>
              </div>
              <!--
              <div class="col-sm-6 d-flex justify-content-end mention-symbols">
                <button
                  type="button"
                  class="btn btn-sm btn-link"
                  @click="applyUserMention"
                >
                  <i class="fas fa-at"></i>
                </button>
              </div>
              -->
            </div>
          </At>
        </At>
      </At>
    </div>
  </div>
</template>
