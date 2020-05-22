<script>
import Axios from '@utils/axios'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  components: { Swatches },
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
  },
  data() {
    return {
      newTaskEffort: this.defaultItem(),
      btnLoading: false,
    }
  },
  methods: {
    defaultItem() {
      return {
        id: null,
        title: '',
        effort: 0,
      }
    },

    getUrl() {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/effort/'

      if (!this.projectSlug) {
        url += this.templateSelected.id + '/items/'
      }

      url += '?company_slug=' + this.currentCompany.slug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }

      return url
    },

    additem() {
      this.btnLoading = true
      let url = this.getUrl()
      Axios()
        .post(url, {
          title: this.newTaskEffort.title,
          effort: this.newTaskEffort.effort,
        })
        .then((response) => {
          this.btnLoading = false
          this.templateSelected.items.push(response.data.data)
          this.newTaskEffort = this.defaultItem()
        })
        .catch((e) => {
          console.error(e)
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
          {{ $t('Create a Task Effort') }}
        </h5>
        <div class="item-input d-flex mt-10-px">
          <b-form-input
            v-model="newTaskEffort.title"
            class="mr-5-px"
            :placeholder="$t('Task effort name')"
            autocomplete="false"
            maxlength="25"
          ></b-form-input>
          <b-form-input
            v-model="newTaskEffort.effort"
            class="ml-5-px only-left-border-radius"
            :placeholder="$t('Task effort points')"
            maxlength="6"
            autocomplete="false"
            style="max-width: 170px"
          ></b-form-input>
          <div class="input-group-append">
            <button
              v-if="!btnLoading"
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!newTaskEffort.title"
              @click="additem()"
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
