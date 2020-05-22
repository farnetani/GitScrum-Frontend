<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: { vSelect },
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
      fields: [],
      customField: [],
      selectValues: [],
      selectableOptions: [],
      loading: true,
      visible: true,
    }
  },
  created() {
    this.getCustomFields()
  },
  methods: {
    
    getCustomFields() {
      Axios()
      .get(
        'task-fields/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug +
          '&task_uuid=' +
          this.task.uuid 
      )
      .then((response) => {
        this.fields = response.data.data
        this.handleValues()
        this.loading = false
      })
    },

    handleValues() {
      for (let i = 0; i < this.fields.length; i++) {
        if (this.fields[i].meta) {
          let optionsArray = this.fields[i].meta
          if (!this.fields[i].meta.length) {
            optionsArray = Object.values(this.fields[i].meta)
          }

          let selectableOptions = []
          for (let j = 0; j < optionsArray.length; j++) {
            selectableOptions.push({
              id: optionsArray[j],
              label: optionsArray[j],
            })
          }

          this.$set(this.fields[i], 'selectableOptions', selectableOptions)
        }
      }
    },

    update(param) {
      Axios().post(
        'task-fields/?company_slug=' +
          this.task.company.slug +
          '&project_slug=' +
          this.task.project.slug +
          '&task_uuid=' +
          this.task.uuid ,
        param
      )
    },
    updateField(field) {
      this.update({
        field_id: field.id,
        value: field.value,
      })
    },
    updateFieldCheckbox(field) {
      this.update({
        field_id: field.id,
        value: !field.value,
      })
    },
    updateFieldSelected(field) {
      this.update({
        field_id: field.id,
        value: field.value ? field.value.label : '',
      })
    },
  },
}
</script>

<template>
  <div v-if="fields[0]">
    <b-container class="mt-20-px">
      <b-row class="mb-10-px">
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'file-alt']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Custom Fields') }}</h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="1"></b-col>
        <b-col cols="11" class="task-left-content">
          <b-row>
            <div v-for="field in fields" :key="field.id" class="col-md-6">
              <div v-if="field.type === 'text'" class="mb-10-px">
                <label class="d-block tx-12-px txt-A7AFB7" v-text="field.name"></label>
                <b-form-input
                  v-model="field.value"
                  class="input-xs"
                  :disabled="!authorize('tasks', 'update')"
                  @change="updateField(field)"
                ></b-form-input>
              </div>
              <div v-if="field.type === 'textarea'" class="mb-10-px">
                <label class="d-block tx-12-px txt-A7AFB7" v-text="field.name"></label>
                <b-form-textarea
                  v-model="field.value"
                  rows="3"
                  max-rows="6"
                  class="input-xs"
                  :disabled="!authorize('tasks', 'update')"
                  @change="updateField(field)"
                ></b-form-textarea>
              </div>
              <div v-if="field.type === 'checkbox'" class="mb-10-px">
                <b-form-checkbox
                  v-model="field.value"
                  value="true"
                  :disabled="!authorize('tasks', 'update')"
                  @change="updateFieldCheckbox(field)"
                >
                  <label class="d-block tx-12-px txt-A7AFB7" v-text="field.name"></label>
                </b-form-checkbox>
              </div>
              <div v-if="field.type === 'select'" class="mb-10-px">
                <label class="d-block tx-12-px txt-A7AFB7" v-text="field.name"></label>

                <v-select
                  v-model="field.value"
                  :options="field.selectableOptions"
                  :disabled="!authorize('tasks', 'update')"
                  title="label"
                  @input="updateFieldSelected(field)"
                ></v-select>
              </div>
            </div>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
