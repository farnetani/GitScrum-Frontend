<script>
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  CodeBlock,
  HardBreak,
  HorizontalRule,
  Link,
  Bold,
  Italic,
  Strike,
  Underline,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    ButtonLoading
  },
  props: {
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: true,
    },
    commentableType:{
      type: String,
      required: false,
      default: 'projects'
    },
    commentableId:{
      type: String,
      required: false,
      default: null
    },
    commentId: {
      type: Number,
      required: false,
      default: 0
    },
    parentId: {
      type: Number,
      required: false,
      default: null
    },
    editMode: {
      type: Boolean,
      required: false,
      default: false
    },
    cancelMode: {
      type: Boolean,
      required: false
    },
    editContent: {
      type: String,
      required: false,
      default: ''
    },
    btnTitle: {
      type: String,
      required: false,
      default: ''
    },
    btnSubtitle: {
      type: String,
      required: false,
      default: ''
    },
    redirect: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      loading: false,
      editor: new Editor({
        extensions: [
          new CodeBlock(),
          new HardBreak(),
          new HorizontalRule(),
          new Link(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline()
        ],
        content: this.editContent,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    
    save() {
      
      let content = this.editor.view.dom.innerHTML
      if ( content !== '<p><br></p>'){

        this.loading = true
        this.editor.view.dom.innerHTML = ''

        Axios()
        .post('comments/?company_slug=' +
        this.companySlug +
        '&project_slug=' +
        this.projectSlug +
        '&commentable_type=' +
        this.commentableType +
        '&commentable_id=' +
         this.commentableId +
        '&parent_id=' + 
        this.parentId,
        {
          comment_text: content
        })
        .then((response) => {

          this.$emit('text', content)

          this.loading = false
          if ( !this.parentId ){

            let data = response.data.data

            if ( this.redirect ){
              this.$router.push({
                name: 'projects.discussions.show',
                params: {
                  companySlug: this.companySlug,
                  discussionId: data.id,
                },
              })
            }

          }

          this.editor.view.dom.innerHTML = ''

        })
      }
    },

    update() {
      
      this.$emit('text', this.editor.view.dom.innerHTML)

      Axios()
        .put('comments/' + 
        this.commentId +
        '?company_slug=' +
        this.companySlug +
        '&project_slug=' +
        this.projectSlug +
        '&commentable_type=' +
        this.commentableType +
        '&commentable_id=' + this.commentableId,{
          comment_text: this.editor.view.dom.innerHTML
        })
        .then((response) => {

        })
        
    },

    cancel(){
      this.$emit('cancel', true)
    }
  },
  
}
</script>

<template>
  <div>
    <div class="editor mb-10-px">
      
      

      <EditorContent class="editor__content" :editor="editor" />

    </div>

    <div class="comment-editor-button d-flex justify-content-end align-items-center">

      <EditorMenuBar v-slot="{ commands, isActive }" :editor="editor">

        <div class="menubar">

          <button
            class="btn menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <font-awesome-icon :icon="['far', 'bold']" />
          </button>

          <button
            class="btn menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <font-awesome-icon :icon="['far', 'italic']" />
          </button>

          <button
            class="btn menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            <font-awesome-icon :icon="['far', 'strikethrough']" />
          </button>

          <button
            class="btn menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <font-awesome-icon :icon="['far', 'underline']" />
          </button>
          
        </div>
      </EditorMenuBar>

      <a v-if="cancelMode" href="javascript:;" style="left: 18px;position: absolute;top: 10px;" @click="cancel">{{ $t('Cancel') }}</a>

        <ButtonLoading
          v-if="!editMode"
          type="btn-md"
          mode="button"
          :loading="loading"
          :title="(btnTitle) ? btnTitle : $t('Create Discussion')"
          :title-loading="(btnSubtitle) ? btnSubtitle : $t('Creating')"
          @action="save"
        ></ButtonLoading>

        <ButtonLoading
          v-if="editMode"
          type="btn-md"
          mode="button"
          :loading="loading"
          :title="(btnTitle) ? btnTitle : $t('Update Discussion')"
          :title-loading="(btnSubtitle) ? btnSubtitle : $t('Updating')"
          @action="update"
        ></ButtonLoading>

    </div>

  </div>
</template>
