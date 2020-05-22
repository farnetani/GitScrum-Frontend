<script>
import Axios from '@utils/axios'
// import Mentions from '@components/utils/mentions'

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    paramName: {
      type: String,
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
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    permissionFeature: {
      type: String,
      required: true,
    },
    plusHeight: {
      type: Number,
      default: 0,
      required: false
    }
  },
  // components: { Mentions },
  data() {
    return {
      tempTitle: this.title,
      editMode: false,
      oldTitle: this.title,
    }
  },
  methods: {
    updateTitle() {
      if (this.tempTitle.length) {
        this.$emit('change-title', this.tempTitle)
        Axios()
          .put(this.endpoint, { [this.paramName]: this.tempTitle })
          .then((response) => {
            // this.$emit('change-title', this.tempTitle)
          })
          .catch((error) => {
            console.error(error)
          })
      } else {
        this.tempTitle = this.oldTitle
      }
      this.editMode = !this.editMode
    },
    enterUpdate() {
      this.editMode = true
      this.updateTitle()
      
    },
    updateEditMode() {
      this.editMode = !this.editMode
      this.$refs.txttitle.style.height = this.$refs.boxtitle.clientHeight + this.plusHeight + 'px'
      this.$nextTick(() => {
        this.$refs.txttitle.focus()
      })
    },
  },
}
</script>

<template>
  <div class="editable-text">
    <div
      v-if="authorize(permissionFeature, 'update')"
      class="editable-title"
      :class="editMode ? 'none' : 'block'"
      @click="updateEditMode"
    >
      <span class="txt-001737 tx-24-px fw-600 lh-30-px">
        <div ref="boxtitle">{{ tempTitle }}</div>
      </span>
    </div>
    <div v-else>
      <div class="block" style="cursor: default;">
        <span class="txt-001737 tx-24-px fw-600 lh-30-px">
          <div ref="boxtitle">{{ tempTitle }}</div>
        </span>
      </div>
    </div>
    <textarea
      id="title"
      ref="txttitle"
      v-model="tempTitle"
      class="txt-001737 tx-24-px fw-600 wd-100"
      :class="editMode ? 'block' : 'none'"
      :placeholder="placeholder"
      @keydown.enter.prevent="enterUpdate"
      @keyup.enter="enterUpdate"
      @focusout="updateTitle"
    ></textarea>

    <!--
    <Mentions
      :company-slug="companySlug"
      :project-slug="projectSlug"
      elementType="textarea"
      :contentText="title"
      :mentionUsers="true"
      :showButtons="false"
    ></Mentions>
    -->
  </div>
</template>
