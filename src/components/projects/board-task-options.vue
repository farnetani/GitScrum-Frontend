<script>
import Axios from '@utils/axios'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  components: {
    Swatches,
  },
  props: {
    workflow: {
      type: Object,
      required: false,
      default() {
        return []
      },
    },
    total: {
      type: Number,
      required: true,
    },
    showAddCard: {
      type: Boolean,
    },
    hideOptionsMenu: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      columnName: '',
      columnNotifications: '',
      columnStatus: '',
      hexColor: '',
      columnNameShow: false,
      columnNotificationsShow: false,
      columnStatusShow: false,
      hexColorShow: false,
      hideOptions: false,
    }
  },
  methods: {
    deleteColumn() {
      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          document.getElementById(this.workflow.slug).parentNode.remove()
          // document.getElementById(this.workflow.slug).remove()
          Axios()
            .delete('projects-workflows/' + this.workflow.id)
            .then((response) => {
              this.$emit('get-tasks')
            })
            .catch((e) => {
              console.error(e)
            })
        }
      })
    },
    editNotifications() {
      this.columnNotificationsShow = true
      this.columnNotifications = this.workflow.emails.length > 0 ? this.workflow.emails : ''
      this.hideOptions = true
    },
    editColumn() {
      this.columnNameShow = true
      this.columnName = this.workflow.title
      this.hideOptions = true
    },
    editColor() {
      this.hexColorShow = true
      this.hexColor = this.workflow.color
      this.hideOptions = true
    },
    editStatus() {
      this.columnStatusShow = true
      this.columnStatus = this.workflow.status.code
      this.hideOptions = true
    },
    updateColumnNotifications() {
      if (this.columnNotifications === '') return

      this.updateColumn({ emails: this.columnNotifications.split(',') })
      this.workflow.emails = this.columnNotifications
      this.hideOptions = true
    },
    updateColumnName() {
      if (this.columnName === '') return

      if (this.columnName.length >= 2) {
        this.workflow.title = this.columnName
        this.updateColumn({ title: this.columnName })
      } else {
        alert(this.$t('Column name must be at least 2 characters'))
      }
    },
    updateColumnColor() {
      if (this.hexColor) {
        this.updateColumn({ color: this.workflow.color })
      } else {
        alert(this.$t('Column color must be at least 2 characters'))
      }
    },
    updateColumnStatus() {
      if (this.columnStatus < 3) {
        if (this.columnStatus === 2) {
          this.workflow.status.title = this.$t('In Progress')
        } else if (this.columnStatus === 1) {
          this.workflow.status.title = this.$t('Done')
        } else {
          this.workflow.status.title = this.$t('TODO')
        }
        this.workflow.status.code = this.columnStatus
        this.updateColumn({ state: this.columnStatus })
      } else {
        alert(this.$t('Column color must be at least 2 characters'))
      }
    },
    updateColumn(params) {
      Axios()
        .put(
          '/projects-workflows/' +
            this.workflow.id +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          params
        )
        .then((response) => {
          this.columnNotifications = ''
          this.columnStatus = ''
          this.columnName = ''
          this.hexColor = ''
          this.closeEditModeColumn()
          this.hideOptions = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    closeEditModeColumn() {
      this.columnNotificationsShow = false
      this.columnStatusShow = false
      this.columnNameShow = false
      this.hexColorShow = false
      this.hideOptions = false
    },
  },
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between">
      <div v-if="!hideOptions || showAddCard" class="d-flex align-items-center board-task-title">
        {{ workflow.title | truncate(20) }}
        <span class="task-total d-flex" v-text="total"></span>
      </div>

      <div v-if="!showAddCard" class="d-flex">
        <div v-if="!hideOptions && !showAddCard" class="board-task-icon align-items-center d-flex pr-2">
          <font-awesome-icon :icon="workflowState(workflow.status.code)" style="font-size: 16px; color: #68748F;" />
        </div>
        <div v-if="!hideOptions && !showAddCard && !hideOptionsMenu" class="dropdown board-task-options" style="color:#68748F;">
          <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
            <i class="fas fa-ellipsis-h" color="#68748F"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-right">
            <li>
              <div class="nav">
                <div class="nav-item show">
                  <a href="javascript:;" class="dropdown-item" @click="editNotifications">
                    <span class="icon-size"><font-awesome-icon :icon="['far', 'bell']"/></span>
                    {{ $t('Notifications') }}
                  </a>
                  <a href="javascript:;" class="dropdown-item" @click="editColor">
                    <span class="icon-size"><font-awesome-icon :icon="['far', 'palette']"/></span>
                    {{ $t('Change Color') }}
                  </a>
                  <a href="javascript:;" class="dropdown-item" @click="editStatus">
                    <span class="icon-size"><font-awesome-icon :icon="['fal', 'toggle-on']"/></span>
                    {{ $t('Change Status') }}
                  </a>
                  <a href="javascript:;" class="dropdown-item" @click="editColumn">
                    <span class="icon-size"><font-awesome-icon :icon="['far', 'pencil-alt']"/></span>
                    {{ $t('Rename Column') }}
                  </a>
                  <div class="dropdown-divider"></div>
                  <a href="javascript:;" class="dropdown-item" @click="deleteColumn">
                    <span class="icon-size"><font-awesome-icon :icon="['far', 'trash-alt']"/></span>
                    {{ $t('Delete Column') }}
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!showAddCard" class="mt-10-px">
      <div v-if="hideOptions && columnNotificationsShow" class="editColumn">
        <div class="d-flex align-items-center justify-content-between">
          <span class="board-task-title">{{ $t('Emails to receive notifications') }}</span>
          <span class="icon-size text-right" :alt="$t('Close edit mode')" :title="$t('Close edit mode')">
            <font-awesome-icon
              :icon="['fa', 'times']"
              style="color: #68748F"
              class="cursor-pointer"
              @click="closeEditModeColumn"
            />
          </span>
        </div>
        <div class="mt-10-px mb-20-px">
          <b-form-textarea v-model="columnNotifications" rows="1" max-rows="6" trim></b-form-textarea>
          <small class="d-block">
            {{ $t('The separator should be a comma ( , ) to separate multiple email recipients') }}
          </small>
          <b-button class="btn btn-primary btn-xs mt-5-px" @click="updateColumnNotifications">
            {{ $t('Save') }}
          </b-button>
        </div>
      </div>

      <div v-if="hideOptions && columnStatusShow" class="editColumn">
        <div class=" d-flex justify-content-between">
          <span class="board-task-title">{{ $t('Choose column status') }}</span>
          <span class="icon-size text-right" :alt="$t('Close edit mode')" :title="$t('Close edit mode')">
            <font-awesome-icon
              :icon="['fa', 'times']"
              style="color: #68748F"
              class="cursor-pointer"
              @click="closeEditModeColumn"
            />
          </span>
        </div>

        <div class="mt-10-px mb-20-px d-flex">
          <div>
            <b-form-radio-group v-model="columnStatus">
              <b-form-radio value="0">{{ $t('TODO') }}</b-form-radio>
              <b-form-radio value="2">{{ $t('In Progress') }}</b-form-radio>
              <b-form-radio value="1">{{ $t('Done') }}</b-form-radio>
            </b-form-radio-group>

            <b-button class="btn btn-primary btn-xs mt-5-px" variant="primary" @click="updateColumnStatus">
              {{ $t('Save') }}
            </b-button>
          </div>
        </div>
      </div>

      <div v-if="hideOptions && columnNameShow" class="editColumn">
        <div class=" d-flex justify-content-between">
          <span class="board-task-title">{{ $t('Enter new column name') }}</span>
          <span class="icon-size text-right" :alt="$t('Close edit mode')" :title="$t('Close edit mode')">
            <font-awesome-icon
              :icon="['fa', 'times']"
              style="color: #68748F"
              class="cursor-pointer"
              @click="closeEditModeColumn"
            />
          </span>
        </div>

        <div class="mt-10-px mb-20-px d-flex justify-content-between">
          <div class="mt-0 mb-3">
            <b-form-input
              id="input-1"
              v-model="columnName"
              class="form-group mb-0"
              trim
              maxlength="22"
              style="padding:7px !important; font-size:12px; width:260px !important; color: #68748F; margin-top:2px;"
            ></b-form-input>
            <b-button class="btn btn-primary btn-xs mt-5-px" @click="updateColumnName">
              {{ $t('Save') }}
            </b-button>
          </div>
        </div>
      </div>

      <div v-if="hideOptions && hexColorShow" class="editColumn">
        <div class=" d-flex justify-content-between">
          <span class="board-task-title">{{ $t('Enter new column name') }}</span>
          <span class="icon-size text-right" :alt="$t('Close edit mode')" :title="$t('Close edit mode')">
            <font-awesome-icon
              :icon="['fa', 'times']"
              style="color: #68748F"
              class="cursor-pointer"
              @click="closeEditModeColumn"
            />
          </span>
        </div>
        <div class="d-flex justify-content-between mt-10-px mb-20-px">
          <div label="Choose column color mb-10-px">
            <Swatches
              v-model="workflow.color"
              class="mg-b-10"
              colors="text-advanced"
              popover-to=""
              max-height="400"
              @close="updateColumnColor"
            ></Swatches>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
