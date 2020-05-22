<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  components: { Draggable, Swatches },
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
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {}
  },
  methods: {
    getUrl(id) {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/effort/'

      if (!this.projectSlug) {
        url += this.templateSelected.id + '/items/'
      }

      if (id) {
        url += id + '/'
      }

      url += '?company_slug=' + this.currentCompany.slug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }

      return url
    },

    updateItem(params, id) {
      let url = this.getUrl(id)
      Axios()
        .put(url, params)
        .then((response) => {})
        .catch((e) => {
          console.error(e)
        })
    },

    deleteItem(item) {
      let url = this.getUrl(item.id)
      Axios()
        .delete(url)
        .then((response) => {
          this.templateSelected.items.splice(this.templateSelected.items.indexOf(item), 1)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateItemDefault(value, id) {
      this.updateItem(
        {
          default: value,
        },
        id
      )
    },

    updateItemTitle(title, id) {
      this.updateItem(
        {
          title: title,
        },
        id
      )
    },

    updateItemEffort(effort, id) {
      this.updateItem(
        {
          effort: effort,
        },
        id
      )
    },

    updateItemPosition(item) {
      this.updateItem(
        {
          position: item.moved.newIndex + 1,
        },
        item.moved.element.id
      )
    },
  },
}
</script>

<template>
  <div class="list-template-items-div">
    <div class="row" v-if="title">
      <div class="col-md-12">
        <h5 class="fw-500 tx-14-px txt-001737 title">
          {{ $t('Task Effort List') }}
        </h5>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <table class="table table-card" v-if="templateSelected.items.length">
          <Draggable
            v-model="templateSelected.items"
            tag="tbody"
            ghost-class="ghost"
            @change="updateItemPosition($event)"
          >
            <tr v-for="item in templateSelected.items" :key="item.id">
              <td style="width: 1530px !important;">
                <div class="stage-workflow-title d-flex justify-content-between mb-10-px">
                  <div>
                    <b-form-radio
                      v-model="item.default"
                      class="txt-68748F"
                      value="true"
                      name="typeDefault"
                      @change="updateItemDefault(1, item.id)"
                    >
                      {{ $t('Default Task Effort') }}
                    </b-form-radio>
                  </div>
                  <div class="flex-grow-1 text-right">
                    <div class="d-inline-flex nav-item dropdown header-dropdown no-border">
                      <a class="nav-title dropdown-toggle txt-909CB8" href="javascript:;" data-toggle="dropdown">
                        <font-awesome-icon :icon="['fa', 'ellipsis-h']" style="font-size:18px; color: #909CB8;" />
                      </a>
                      <div class="dropdown-menu dropdown-menu-right navbar-dropdown" style="width:100px">
                        <div class="mt-10-px">
                          <a href="javascript:;" class="header-dropdown-item" @click="deleteItem(item)">
                            <span>{{ $t('Delete') }}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group form-group-swatches mb-0">
                  <div class="input-group col-xs-12">
                    <b-form-input
                      v-model="item.title"
                      class="mr-5-px"
                      @change="updateItemTitle($event, item.id)"
                    ></b-form-input>
                    <b-form-input
                      v-model="item.effort"
                      class="ml-5-px"
                      @change="updateItemEffort($event, item.id)"
                    ></b-form-input>
                  </div>
                </div>
              </td>
            </tr>
          </Draggable>
        </table>
        <div v-else class="alert alert-info">
          <span> {{ $t('List without Items') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
