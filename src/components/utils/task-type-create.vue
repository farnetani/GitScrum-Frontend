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
      newTaskType: this.defaultItem(),
      btnLoading: false,
    }
  },
  methods: {
    defaultItem() {
      return {
        id: null,
        title: '',
        color: '#ac725e',
        blocked: false,
      }
    },

    getUrl() {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/type/'

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
          code: this.newTaskType.code,
          title: this.newTaskType.title,
          color: this.newTaskType.color,
          type: 'issues',
        })
        .then((response) => {
          this.btnLoading = false
          this.templateSelected.items.push(response.data.data)
          this.newTaskType = this.defaultItem()
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
          {{ $t('Create a Task Type') }}
        </h5>
        <div class="item-input d-flex mt-10-px">
          <Swatches v-model="newTaskType.color" colors="text-advanced" popover-to max-height="400"></Swatches>
          <input
            v-model="newTaskType.code"
            style="max-width:165px"
            maxlength="4"
            autocomplete="false"
            class="form-control only-right-border-radius mr-5-px"
            :placeholder="$t('Task type code')"
          />
          <input
            v-model="newTaskType.title"
            maxlength="25"
            autocomplete="false"
            class="form-control only-left-border-radius ml-5-px"
            :placeholder="$t('Task type name')"
          />
          <div class="input-group-append">
            <button
              v-if="!btnLoading"
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!newTaskType.title"
              @click="additem"
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
