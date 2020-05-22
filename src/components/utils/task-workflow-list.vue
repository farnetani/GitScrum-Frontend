<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import Swatches from 'vue-swatches'
import vSelect from 'vue-select'

import 'vue-swatches/dist/vue-swatches.min.css'
import 'vue-select/dist/vue-select.css'

export default {
  components: { Draggable, Swatches, vSelect },
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
  watch: {
    templateSelected() {
      this.convertItemOptions()
    },
  },
  created() {
    this.convertItemOptions()
  },
  data() {
    return {
      stateOptions: this.setItemStateOptions(),
      emailExpression: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
    }
  },
  methods: {
    convertItemOptions() {
      this.templateSelected.items.forEach((item) => {
        item = this.setItemState(item)
        if (item.emails) {
          item.emails = item.emails.split(',')
        }
        this.$set(item, 'emailError', '')
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

    updateItem(params, id) {
      Axios()
        .put(
          'templates/workflow/' +
            this.templateSelected.id +
            '/items/' +
            id +
            '/?company_slug=' +
            this.currentCompany.slug,
          params
        )
        .then((_) => {})
        .catch((e) => {
          console.error(e)
        })
    },

    deleteItem(item) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete(
            'templates/workflow/' +
              this.templateSelected.id +
              '/items/' +
              item.id +
              '/?company_slug=' +
              this.currentCompany.slug
          )
          .then((response) => {
            this.templateSelected.items.splice(this.templateSelected.items.indexOf(item), 1)
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })

    },

    updateItemPosition(item) {
      this.updateItem(
        {
          position: item.moved.newIndex + 1,
        },
        item.moved.element.id
      )
    },

    updateItemDefault(value, id) {
      this.updateItem(
        {
          default: value,
        },
        id
      )
    },

    updateItemColor(color, id) {
      this.updateItem(
        {
          color: color,
        },
        id
      )
    },

    updateItemTitle(title, id) {
      if (title.length) {
        this.updateItem(
          {
            title: title,
          },
          id
        )
      }
    },

    validateEmail: function(email) {
      return this.emailExpression.test(email)
    },

    updateItemEmails(emails, item) {
      item.emailError = ''
      emails.forEach((email) => {
        if (!this.validateEmail(email)) {
          item.emailError = email
          emails.splice(emails.indexOf(email))
        }
      })
      if (!item.emailError.length) {
        this.updateItem(
          {
            emails: emails.join(),
          },
          item.id
        )
      }
    },
  },
}
</script>

<template>
  <div class="list-template-items-div">
    <div class="row" v-if="title">
      <div class="col-md-12">
        <h5 class="fw-500 tx-14-px txt-001737 title">
          {{ $t('Workflow Stages created') }}
        </h5>
      </div>
    </div>

    <table class="table table-card" v-if="templateSelected.items.length">
      <Draggable v-model="templateSelected.items" tag="tbody" ghost-class="ghost" @change="updateItemPosition($event)">
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
                  {{ $t('Default Stage') }}
                </b-form-radio>
              </div>
              <div class="flex-grow-1 text-right">
                <div class="d-inline-flex nav-item dropdown header-dropdown">
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
            <div class="form-group-swatches mb-10-px">
              <div class="input-group col-xs-12">
                <Swatches
                  v-model="item.color"
                  colors="text-advanced"
                  popover-to
                  max-height="400"
                  @close="updateItemColor($event, item.id)"
                ></Swatches>
                <b-form-input
                  class="only-right-border-radius"
                  v-model="item.title"
                  maxlength="25"
                  @change="updateItemTitle($event, item.id)"
                ></b-form-input>
              </div>
            </div>

            <div class="v-select-sm mb-10-px">
              <v-select
                v-model="item.state"
                class="d-flex"
                label="name"
                :options="stateOptions"
                :clearable="false"
                :searchable="false"
              ></v-select>
            </div>

            <v-select v-model="item.emails" taggable multiple @input="updateItemEmails($event, item)">
              <span slot="no-options">
                Type the email and press <strong>ENTER</strong> to confirm.
                <!-- {{ $t('Type the email and press <strong>ENTER</strong> to confirm.') }} -->
              </span>
            </v-select>
            <small class="d-block mt-5-px mb-10-px">
              {{ $t('Enter emails to receive notifications when the task is in this stage') }}
            </small>
            <!--
                  <v-select v-model="item.emails" taggable multiple @input="updateItemEmails($event, item)">
                    <span slot="no-options"> Type the email and press <strong>ENTER</strong> to confirm. </span>
                  </v-select>

                  <p v-if="item.emailError.length" class="alert alert-info">
                    The email <b>{{ item.emailError }}</b> isn't well formed. For that reason it was removed by the
                    list.
                  </p>
                  -->
          </td>
        </tr>
      </Draggable>
    </table>
    <div v-else class="alert alert-info">
      <span> {{ $t('List without Items') }} </span>
    </div>
  </div>
</template>
