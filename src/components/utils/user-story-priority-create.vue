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
      newUserStoryPriority: this.defaultItem(),
      btnLoading: false,
    }
  },
  methods: {
    defaultItem() {
      return {
        id: null,
        title: '',
        color: '#ac725e',
      }
    },

    getUrl() {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/priority/'

      if (!this.projectSlug) {
        url += this.templateSelected.id + '/items/'
      }

      url += '?company_slug=' + this.currentCompany.slug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }

      return url
    },

    addPriority() {
      this.btnLoading = true
      let url = this.getUrl()
      Axios()
        .post(url, {
          title: this.newUserStoryPriority.title,
          color: this.newUserStoryPriority.color,
          type: 'issues',
        })
        .then((response) => {
          this.btnLoading = false
          this.templateSelected.items.push(response.data.data)
          this.newUserStoryPriority = this.defaultItem()
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
          {{ $t('Create an User Story Priority') }}
        </h5>
        <div class="item-input d-flex mt-10-px">
          <Swatches v-model="newUserStoryPriority.color" colors="text-advanced" popover-to max-height="400"></Swatches>
          <input
            v-model="newUserStoryPriority.title"
            type="text"
            class="form-control no-border-radius"
            placeholder="User Story Priority name"
          />
          <div class="input-group-append">
            <button
              v-if="!btnLoading"
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!newUserStoryPriority.title"
              @click="addPriority"
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
