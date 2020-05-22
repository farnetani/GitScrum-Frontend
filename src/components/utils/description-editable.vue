<script>
import Axios from '@utils/axios'
import autoResize from '@utils/autoResize.js'
// import Mentions from '@components/utils/mentions'

export default {
  mixins: [autoResize],
  props: {
    description: {
      type: String,
      required: true,
    },
    descriptionMention: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    updateEndpoint: {
      type: String,
      required: false,
      default: null,
    },
    paramName: {
      type: String,
      required: true,
    },
    companySlug: {
      type: String,
      required: true,
    },
    // projectSlug: {
    //   type: String,
    //   required: false,
    // },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    permissionFeature: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editMode: false,
      editableDescription: this.description,
      oldDescription: this.description,
      oldDescriptionMention: this.descriptionMention,
    }
  },
  created() {
    //this.descriptionMention = this.descriptionMention.trim()
    if (this.updateEndpoint === null) {
      this.updateEndpoint = this.endpoint
    }
  },
  methods: {
    updateDescription() {
      if (this.oldDescription !== this.editableDescription) {
        Axios()
          .put(this.updateEndpoint, { [this.paramName]: this.editableDescription })
          .then((response) => {
            this.getDescription()
          })
          .catch((error) => {
            console.error(error)
            this.getDescription()
          })
      } else {
        this.editMode = !this.editMode
      }
    },

    getDescription() {
      Axios()
        .get(this.endpoint)
        .then((response) => {
          this.$emit('update-description', response.data.data)
          this.oldDescription = response.data.data[this.paramName]
          this.oldDescriptionMention = response.data.data[this.paramName + '_mention']

          this.editMode = !this.editMode
        })
        .catch((error) => {
          console.error(error)
          this.editMode = !this.editMode
        })
    },

    updateEditMode() {
      this.editMode = !this.editMode
      this.$nextTick(() => {
        this.$refs.txtdescription.focus()
      })
    },
  },
}
</script>

<template>
  <div class="editable-description">
    <div
      v-if="authorize(permissionFeature, 'update')"
      class="description p-10-px"
      :class="editMode ? 'none' : 'block'"
      @click="updateEditMode"
    >
      <div class="d-flex txt-68748F tx-14-px fw-normal lh-20-px">
        <span v-html="descriptionMention.trim() ? descriptionMention : $t('Click to add a description')"></span>
      </div>
    </div>
    <div v-else>
      <div class="d-flex txt-68748F tx-14-px fw-normal lh-20-px" style="cursor: default;">
        <span v-html="descriptionMention.trim() ? descriptionMention : $t('Dont have a description')"></span>
      </div>
    </div>
    <textarea
      id="description"
      ref="txtdescription"
      v-model="editableDescription"
      class="txt-68748F tx-14-px fw-normal lh-20-px wd-100"
      :class="editMode ? 'block' : 'none'"
      :placeholder="placeholder"
      @input="resize"
      @focus="resize"
      @focusout="updateDescription"
    ></textarea>

    <!--
    <Mentions
      :company-slug="companySlug"
      :project-slug="projectSlug"
      elementType="textarea"
      :contentText="description"
      :mentionUsers="true"
      :showButtons="false"
    ></Mentions>
    -->
  </div>
</template>
