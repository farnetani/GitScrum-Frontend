<script>
import Axios from '@utils/axios'

export default {
  props: {
    currentCompany: {
      type: Object,
      required: true,
    },
    templateSelected: {
      type: Object,
      required: true,
    },
    projectSlug: {
      type: String,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    checklistItem: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      newTaskChecklist: this.defaultItem(),
      btnLoading: false,
    }
  },
  methods: {
    defaultItem() {
      return {
        id: null,
        title: '',
      }
    },

    getUrl() {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/checklist/'

      if (!this.projectSlug) {
        url += this.templateSelected.id + '/items/'
      }

      url += '?company_slug=' + this.currentCompany.slug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }

      return url
    },

    addChecklistItem() {
      let url = this.getUrl()
      this.btnLoading = true

      let params = {
        title: this.newTaskChecklist.title,
      }

      if (this.checklistItem) {
        this.$set(params, 'parent_id', this.templateSelected.id)
      }

      Axios()
        .post(url, params)
        .then((response) => {
          this.btnLoading = false
          let item = response.data.data
          if (item.parent_id !== null) {
            this.$delete(item, 'items')
          }

          this.templateSelected.items.push(item)
          this.newTaskChecklist = this.defaultItem()
        })
        .catch((e) => {
          this.btnLoading = false
        })
    },
  },
}
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <div class="create-template-item-div">
        <h5 class="fw-500 tx-14-px txt-001737 title m-0">
          {{ title }}
        </h5>
        <div class="item-input d-flex mt-10-px">
          <input
            v-model="newTaskChecklist.title"
            pattern=".{3,}"
            required
            type="text"
            class="form-control only-left-border-radius"
            :placeholder="$t('Checklist item name')"
          />
          <div class="input-group-append">
            <button
              v-if="!btnLoading"
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!newTaskChecklist.title"
              @click="addChecklistItem"
            >
              <font-awesome-icon :icon="['fa', 'check']" />
            </button>

            <button v-if="btnLoading" class="btn btn-sm btn-primary" type="button">
              <b-spinner :label="$t('Loading')" small class="title-loading"></b-spinner>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
