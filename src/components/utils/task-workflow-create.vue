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
      newItem: this.defaultItem(),
      btnLoading: false,
      stateOptions: this.setItemStateOptions(),
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

    setItemStateOptions() {
      return [
        {
          value: 0,
          name: 'TODO',
        },
        {
          value: 2,
          name: 'In Progress',
        },
        {
          value: 1,
          name: 'Done',
        },
      ]
    },

    addItem() {
      this.btnLoading = true
      Axios()
        .post('templates/workflow/' + this.templateSelected.id + '/items/?company_slug=' + this.currentCompany.slug, {
          title: this.newItem.title,
          color: this.newItem.color,
          type: 'issues',
        })
        .then((response) => {
          this.btnLoading = false
          const item = this.setItemState(response.data.data)
          this.templateSelected.items.push(item)
          this.newItem = this.defaultItem()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    setItemState(item) {
      const s = this.stateOptions.find((s) => s.value === item.state)
      item.state = {
        value: item.state,
        name: s.name,
      }
      return item
    },
  },
}
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <div class="create-template-item-div">
        <h5 class="fw-500 tx-14-px txt-001737 title m-0">
          {{ $t('Create a Workflow Stage') }}
        </h5>
        <div class="item-input d-flex mt-10-px">
          <Swatches v-model="newItem.color" colors="text-advanced" popover-to max-height="400"></Swatches>
          <input
            v-model="newItem.title"
            type="text"
            class="form-control no-border-radius"
            :placeholder="$t('Stage name')"
          />
          <div class="input-group-append">
            <button
              v-if="!btnLoading"
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!newItem.title"
              @click="addItem"
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
