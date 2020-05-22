<script>
import Axios from '@utils/axios'
import TaskCustomFieldCreate from '@components/utils/task-custom-field-create'
import TaskCustomFieldList from '@components/utils/task-custom-field-list'

export default {
  components: {
    TaskCustomFieldCreate,
    TaskCustomFieldList,
  },
  props: {
    templateSelected: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      items: [],
      btnLoading: false,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      newTaskCustomField: this.defaultItem(),
      customFieldOptions: this.setCustomFieldsOptions(),
    }
  },
  methods: {
    setCustomFieldsOptions() {
      return [
        { label: 'Small text', code: 'text' },
        { label: 'Long text', code: 'textarea' },
        { label: 'Checkbox', code: 'checkbox' },
        { label: 'Selectable options', code: 'select' },
      ]
    },

    defaultItem() {
      return {
        id: null,
        title: '',
        type: { label: 'Small text', code: 'text' },
        optionCustomFieldSelectable: false,
        optionCustomFieldSelect: [],
        meta: '',
        popoverShow: false,
      }
    },

    updateTemplateName() {
      if (this.templateSelected.name.length) {
        Axios()
          .put('templates/field/' + this.templateSelected.id + '?company_slug=' + this.currentCompany.slug, {
            name: this.templateSelected.name,
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },

    updateSelected(params) {
      Axios()
        .put('templates/field/' + this.templateSelected.id + '/?company_slug=' + this.currentCompany.slug, params)
        .then((response) => {
          if (this.templateSelected.is_default) {
            this.$emit('update-list', true)
          }
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateIsPrivate() {
      this.updateSelected({
        is_private: Boolean(!this.templateSelected.is_private),
      })
    },

    updateIsDefault() {
      this.updateSelected({
        is_default: Boolean(this.templateSelected.is_default),
      })
    },
  },
}
</script>

<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <div class="template-selected-div">
          <div class="template-selected-input d-flex mb-15-px">
            <input
              v-model="templateSelected.name"
              class="form-control"
              :placeholder="$t('Task Checklist Template Name')"
              @change="updateTemplateName"
            />
          </div>
          <div class="form-check m-0">
            <label class="form-check-label txt-6C7293 tx-12-px">
              <input
                v-model="templateSelected.is_default"
                type="checkbox"
                class="form-check-input"
                @change="updateIsDefault"
              />
              {{ $t('Template is standart for all projects') }}
              <i class="input-helper"></i>
            </label>
          </div>

          <div class="form-check mb-0 mt-10-px">
            <label class="form-check-label txt-6C7293 tx-12-px">
              <input
                v-model="templateSelected.is_private"
                type="checkbox"
                class="form-check-input"
                @change="updateIsPrivate"
              />
              {{ $t('Share Workflow Template on GitScrum Marketplace') }}
              <i class="input-helper"></i>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-20-px">
      <div class="col-md-12">
        <TaskCustomFieldCreate
          :custom-field-options="customFieldOptions"
          :current-company="currentCompany"
          :template-selected="templateSelected"
        ></TaskCustomFieldCreate>
      </div>
    </div>
    <div class="row mt-20-px mb-15-px">
      <div class="col-md-12">
        <hr class="m-0" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <TaskCustomFieldList
          :template-selected="templateSelected"
          :custom-field-options="customFieldOptions"
          :current-company="currentCompany"
          :title="true"
        ></TaskCustomFieldList>
      </div>
    </div>
  </div>
</template>
