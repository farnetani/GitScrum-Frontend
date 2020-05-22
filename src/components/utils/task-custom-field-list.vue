<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: {
    Draggable,
    vSelect,
  },
  props: {
    templateSelected: {
      type: Object,
      required: true,
    },
    customFieldOptions: {
      type: Array,
      required: true,
    },
    currentCompany: {
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
    return {
      ready: false,
      newSelectableOptionName: [],
    }
  },
  mounted() {
    this.templateSelected.items.forEach((item) => {
      this.appendParam(item)
      if (typeof item.type === 'string') {
        this.prepareType(item)
      }
    })
    this.ready = true
  },
  methods: {
    getUrl(id) {
      let url = ''

      if (this.projectSlug) {
        url += 'project-'
      }

      url += 'templates/field/'

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

    appendParam(item) {
      let optionArray = []
      if (this.projectSlug) {
        optionArray = this.appendProjectParam(item)
      } else {
        optionArray = this.appendCompanyParam(item)
      }

      this.$set(item, 'optionCustomFieldSelect', optionArray)
    },

    appendCompanyParam(item) {
      let optionArray = []
      if (item.meta && item.meta !== null && item.meta.length) {
        optionArray = item.meta.split(',')
        optionArray.forEach((opt, key) => {
          optionArray[key] = {
            id: opt,
            name: opt,
          }
        })
      }
      return optionArray
    },

    appendProjectParam(item) {
      let optionArray = []
      if (item.meta && item.meta !== null) {
        optionArray = Object.values(item.meta)
        optionArray.forEach((opt, key) => {
          optionArray[key] = {
            id: opt,
            name: opt,
          }
        })
      }

      return optionArray
    },

    prepareType(item) {
      for (let i = 0; i < this.customFieldOptions.length; i++) {
        if (item.type === this.customFieldOptions[i].code) {
          item.type = this.customFieldOptions[i]
          break
        }
      }
      return item
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

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          let url = this.getUrl(item.id)
          Axios()
          .delete(url)
          .then((response) => {
            this.templateSelected.items.splice(this.templateSelected.items.indexOf(item), 1)
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })

    },

    updateItemName(name, id) {
      this.updateItem(
        {
          name: name,
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

    updateItemType(itemType, item) {
      if (itemType.code === 'select') {
        this.$set(item, 'optionCustomFieldSelect', [])
      }

      this.updateItem(
        {
          type: itemType.code,
        },
        item.id
      )
    },

    updateSelectableOption(item) {
      let meta = null
      if (!this.projectSlug) {
        meta = this.buildCompanyMeta(item.optionCustomFieldSelect)
      } else {
        meta = this.buildProjectMeta(item.optionCustomFieldSelect)
      }
      this.updateItem(
        {
          meta: meta,
        },
        item.id
      )
    },

    addSelectableOption(item) {
      let option = {
        id: null,
        name: this.newSelectableOptionName[item.id],
      }
      item.optionCustomFieldSelect.push(option)
      this.newSelectableOptionName[item.id] = ''
      this.updateSelectableOption(item)
    },

    delSelectableOption(item, option) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          item.optionCustomFieldSelect.splice(item.optionCustomFieldSelect.indexOf(option), 1)
          this.updateSelectableOption(item)
        }
      })

    },

    buildCompanyMeta(selectableOptions) {
      let meta = []
      selectableOptions.forEach((opt) => {
        meta.push(opt.name)
      })
      return meta.join(',')
    },

    buildProjectMeta(selectableOptions) {
      
      let meta = []

      selectableOptions.forEach((opt) => {
        meta.push(opt.name)
      })

      return meta.join(',')
    },
  },
}
</script>

<template>
  <div class="list-template-items-div">
    <div class="row" v-if="title">
      <div class="col-md-12">
        <h5 class="fw-500 tx-14-px txt-001737 title">
          {{ $t('Task Custom Fields created') }}
        </h5>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <table class="table table-card" v-show="templateSelected.items">
          <Draggable
            v-model="templateSelected.items"
            tag="tbody"
            ghost-class="ghost"
            @change="updateItemPosition($event)"
          >
            <tr v-for="item in templateSelected.items" :key="item.id">
              <td style="width: 1530px !important;">
                <div class="custom-field d-flex justify-content-between mb-10-px">
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
                <div class="form-group-swatches">
                  <div class="input-group col-xs-12">
                    <b-form-input v-model="item.name" @change="updateItemName($event, item.id)"></b-form-input>
                    <div class="v-select-sm ml-5-px only-left-border-radius">
                      <v-select
                        v-model="item.type"
                        style="min-width:240px"
                        :options="customFieldOptions"
                        :clearable="false"
                        :searchable="false"
                        @input="updateItemType($event, item)"
                      ></v-select>
                    </div>
                  </div>
                  <div v-if="item.type.code === 'select'">
                    <div class="selectable-options mt-20-px">
                      <div class="selectable-options-create">
                        <div class="item-input d-flex">
                          <input
                            v-model="newSelectableOptionName[item.id]"
                            class="form-control mr-15-px"
                            :placeholder="$t('Option label name')"
                            type="text"
                          />
                          <font-awesome-icon
                            :icon="['far', 'plus-circle']"
                            class="txt-464DEE"
                            style="height: 32px; cursor: pointer;"
                            @click="addSelectableOption(item)"
                          />
                        </div>
                      </div>
                      <div class="selectable-options-list">
                        <div v-if="item.optionCustomFieldSelect && item.optionCustomFieldSelect.length">
                          <span class="txt-68748F tx-12-px fw-500 sub-title">
                            {{ $t('Options List') }}
                          </span>
                          <hr class="m-0 mt-10-px" />
                          <div v-for="option in item.optionCustomFieldSelect" :key="option.id">
                            <div class="item-input d-flex mt-10-px">
                              <input
                                v-model="option.name"
                                class="form-control mr-15-px"
                                :placeholder="$t('Option label name')"
                                type="text"
                                @change="updateSelectableOption(item)"
                              />
                              <font-awesome-icon
                                @click="delSelectableOption(item, option)"
                                :icon="['far', 'minus-circle']"
                                class="txt-A2B3CA"
                                style="height: 32px; cursor: pointer;"
                              />
                            </div>
                          </div>
                        </div>
                        <div v-else class="alert alert-info m-0">
                          {{ $t('List without options') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </Draggable>
        </table>
        <div v-show="!templateSelected.items.length" class="alert alert-info">
          <span> {{ $t('List without Items') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
