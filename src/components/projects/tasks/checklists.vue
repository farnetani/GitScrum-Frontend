<script>
import Axios from '@utils/axios'
import Draggable from 'vuedraggable'
import InputEditable from '@components/utils/input-editable'
import ButtonLoading from '@components/utils/button-loading'
import { taskManager } from '@state/helpers'

export default {
  components: {
    Draggable,
    ButtonLoading,
    InputEditable,
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      checklists: [],
      loading: true,
      btnLoading: false,
      enabled: true,
      showEditParent: 0,
      progressbar: 0,
      showById: null,

      showChecklistForm: 0,
      checklistItem: '',
    }
  },
  computed: {
    ...taskManager,

    dragOptions() {
      return {
        animation: 0,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost',
      }
    },
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'checklist.addList' ){
        this.checklists.push(data.item.object)
      }

      if ( data.item.name === 'checklist.reload' ){
        this.getChecklists()
      }
    },
  },
  created() {
    this.getChecklists()
  },
  methods: {
    getChecklists() {
      Axios()
        .get(
          'task-checklists/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug +
            '&task_uuid=' +
            this.task.uuid
        )
        .then((response) => {
          this.checklists = response.data.data
          this.progressbar = response.data.stats.completed_percent
        })
    },

    addChecklistItem(index) {
      this.btnLoading = true
      this.alertStatus = false
      Axios()
        .post('task-checklists/?company_slug=' + 
        this.task.company.slug + 
        '&project_slug=' + 
        this.task.company.slug, 
        {
          parent_id: this.checklists[index].id,
          task_uuid: this.task.uuid,
          title: this.checklists[index].titleItem.trim(),
        })
        .then((response) => {
          this.toggleFormChecklist(index)
          this.getChecklists()
          this.btnLoading = false
        })
    },

    getProgressbarPercent(checklistItemId) {
      let total = 0
      let checked = 0

      for (let i = 0; i < this.checklists.length; i++) {
        total += this.checklists[i].children.length
        for (let j = 0; j < this.checklists[i].children.length; j++) {
          if (this.checklists[i].children[j].id === checklistItemId) {
            this.checklists[i].children[j].done.status = !this.checklists[i].children[j].done.status
          }
          if (this.checklists[i].children[j].done.status) {
            checked++
          }
        }
      }

      this.progressbar = parseFloat(((checked / total) * 100)).toFixed(0);
    },

    toggleChecklistItem(checklistItem) {
      let newStatus = checklistItem.done.status ? 'false' : 'true'
      this.getProgressbarPercent(checklistItem.id)
      Axios()
        .put(
          'task-checklists/' +
            checklistItem.id +
            '/toggle/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug +
            '&task_uuid=' +
            this.task.uuid,
          {
            status: newStatus,
          }
        )
    },
    removeChecklist(checklistId, checklist, title) {

     let message = this.$t('Do you really want to remove?') + ' "' + title + '"'

      this.$bvModal.msgBoxConfirm(message, this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.loading = true

          Axios()
          .delete('task-checklists/' + checklistId)
          .then((response) => {
            let arr = []

            if (checklist !== '') {
              // In case of a checklistitem
              for (let i = 0; i < checklist.children.length; i++) {
                if (checklist.children[i].id !== checklistId) {
                  arr.push(checklist.children[i])
                }
              }
              checklist.children = arr
            } else {
              this.getChecklists()
            }
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })

    },
    checklistMove(evt) {
      let id = null
      let newPosition = null

      if (evt.moved) {
        id = evt.moved.element.id
        newPosition = evt.moved.newIndex + 1
      }

      if (id && newPosition) {
        Axios()
          .put(
            'task-checklists/' +
              id +
              '/?company_slug=' +
              this.task.company.slug +
              '&project_slug=' +
              this.task.project.slug,
            {
              position: newPosition,
            }
          )
          .then((response) => {})
          .catch((e) => {})
      }
    },
    updateTitle(checklist){
      
      checklist.object.title = checklist.text

      Axios()
      .put(
        'task-checklists/' +
          checklist.object.id +
          '/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug +
          '&task_uuid=' +
          this.task.uuid,
        {
          title: checklist.text,
        }
      )

    },

    toggleFormChecklist(checklist) {
      this.showChecklistForm = checklist.id
    },
  },
}
</script>

<template>
  <div v-if="checklists[0]">

    <b-container class="mt-20-px">
      <b-row>
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'list']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Checklists') }}</h5>
        </b-col>
      </b-row>
      <b-row class="mb-15-px">
        <b-col cols="1" class="task-left-icon">
          <span>{{ parseFloat(progressbar) | percent(0) }}</span>
        </b-col>
        <b-col cols="11" class="task-left-content">
          <b-progress>
            <b-progress-bar :style="{ 'background-color': task.workflow.color }" :value="progressbar" :max="100"></b-progress-bar>
          </b-progress>
        </b-col>
      </b-row>
      <Draggable :list="checklists" :disabled="!enabled" group="list" v-bind="dragOptions" @change="checklistMove">
        
        <b-row 
          v-for="(checklist, index) in checklists" 
          :key="checklist.id" 
          class="mb-10-px"
          @mouseover="showById = checklist.id" 
          @mouseout="showById = null">
          <b-col cols="1" class="task-left-icon">
            <font-awesome-icon v-if="authorize('tasks', 'update')" v-show="showById === checklist.id" :icon="['fas', 'arrows-alt']"></font-awesome-icon>
          </b-col>
          <b-col cols="11" class="task-left-content vlabeledit-label">

            <InputEditable v-if="authorize('tasks', 'update')" 
              :placeholder="$t('Task Title')"
              :text="checklist.title" 
              :current-object="checklist"
              @text-updated-blur="updateTitle"  
              @text-updated-enter="updateTitle">
            </InputEditable>
            <span class="vlabeledit-label" v-else v-text="checklist.title"></span>

            <span
              v-if="authorize('tasks', 'update')"
              v-show="showById === checklist.id"
              class="checklist-remove"
              @click="removeChecklist(checklist.id, '', checklist.title)"
            >
              <font-awesome-icon :icon="['fas', 'times']" style="color:#1E1E2F"></font-awesome-icon>
            </span>

            <div v-if="checklist.user" class="checklist-details">
              {{ $t('Created by') }} <span v-text="checklist.user.name"></span> {{ $t('at') }}
              <span v-text="checklist.created_at.date_for_humans"></span>
            </div>

              <Draggable
                class="checklist-item"
                :group="{ name: `list-item-${checklist.id}` }"
                :list="checklist.children"
                v-bind="dragOptions"
                @change="checklistMove">

              <b-row 
                v-for="checklistItem in checklist.children"
                :key="checklistItem.id"
                class="checklist-item-line"
                @mouseover="showById = checklistItem.id"
                @mouseout="showById = null"
              >
                <b-col cols="1" class="task-left-icon">
                  <font-awesome-icon v-if="authorize('tasks', 'update')" :icon="['fas', 'arrows-alt']"></font-awesome-icon>
                </b-col>
                <b-col cols="11">
                  <div class="d-flex wd-100">
                    <b-form-checkbox
                      v-if="showEditParent !== checklistItem.id"
                      :disabled="!authorize('tasks', 'update')"
                      :checked="checklistItem.done.status"
                      @change="toggleChecklistItem(checklistItem)"
                    ></b-form-checkbox>

                    <InputEditable v-if="authorize('tasks', 'update')" 
                      :placeholder="$t('Task Title')"
                      :text="checklistItem.title" 
                      :current-object="checklistItem"
                      @text-updated-blur="updateTitle"  
                      @text-updated-enter="updateTitle">
                    </InputEditable>
                    <span v-else class="vlabeledit-label" v-text="checklistItem.title"></span>
                  </div>
                  <span
                    v-if="authorize('tasks', 'update')"
                    class="checklist-remove"
                    @click="removeChecklist(checklistItem.id, checklist, checklistItem.title)"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" style="color:#9EA9C1"></font-awesome-icon>
                  </span>
                  <div v-if="checklistItem.user" class="checklist-details">
                    {{ $t('Created by') }}
                    <span v-text="checklistItem.user.name"></span> at
                    <span v-text="checklistItem.created_at.date_for_humans"> </span>
                    <span v-if="checklistItem.done.user && checklistItem.done.status" class="d-block">
                      {{ $t('Checked by') }}
                      <span v-text="checklistItem.done.user.name"> </span>
                    </span>
                  </div>
                </b-col>
              </b-row>
            </Draggable>
            <div v-if="authorize('tasks', 'update')" class="new-checklist-item">

              <div v-if="showChecklistForm === checklist.id">
                <b-form-textarea
                  v-model="checklist.titleItem"
                  :placeholder="$t('Add checklist item')"
                  rows="3"
                  max-rows="60"
                  @keyup.enter="addChecklist"
                ></b-form-textarea>
                 <b-link @click="toggleFormChecklist(index)">{{ $t('Cancel') }}</b-link>
                <ButtonLoading
                  type="btn-md"
                  :loading="btnLoading"
                  :title="$t('add checklist item')"
                  :title-loading="$t('Loading')"
                  @action="addChecklistItem(index)"
                ></ButtonLoading>
              </div>

              <b-link v-if="showChecklistForm !== checklist.id" @click="toggleFormChecklist(checklist)">
                {{ $t('add checklist item') }}
              </b-link>

            </div>
          </b-col>
        </b-row>
        
      </Draggable>
    </b-container>

  </div>
</template>
