<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import Sidebar from '@components/projects/addons/sidebar-task-form'
import TaskFormEnable from '@components/projects/addons/task-form-enable'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Form2Taskm',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, ButtonLoading, Sidebar, TaskFormEnable },
  data() {
    return {
      configFormAnswer: null,
      loading: true,
      btnLoading: false,
      enableShareableLinkLoading: false,
      enableShareableLink: false,
      formAnswerTitle: '',
      fieldTitle: '',
      fieldDescription: '',
      token: '',
      shareableLink: '',
      linkCopied: false,
    }
  },
  created() {
    this.getConfigFormAnswers()
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    getConfigFormAnswers() {
      Axios()
        .get(
          'config-form-answers/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug
        )
        .then((response) => {
          
          let data = response.data.data
          this.configFormAnswer = data
          this.formAnswerTitle = data.main_title
          this.fieldTitle = data.field_title
          this.fieldDescription = data.field_description
          this.loading = false
        })
    },

    formSubmit(){
      this.btnLoading = true
      Axios()
        .put(
          'config-form-answers/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' + 
          this.$route.params.projectSlug, {
            main_title: this.formAnswerTitle,
            field_title: this.fieldTitle,
            field_description: this.fieldDescription
          }
        )
        .then((response) => {
          this.btnLoading = false
        })
    },
    configFormAnswerConfig(status){
      this.configFormAnswer.enabled = status
    }
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="calendar">
      <b-overlay :show="loading" no-wrap></b-overlay>

      <div class="row mb-30-px">
        <div class="col-md-3">
          <Sidebar></Sidebar>
        </div>
        <div class="col-md-9">
         
          <div>

            <TaskFormEnable v-if="configFormAnswer" :config="configFormAnswer" @enableShareableLink="configFormAnswerConfig"></TaskFormEnable>

            <div class="mt-15-px">

              <div>
                <label>{{ $t('Form2Task Title') }}</label>
                <b-form-input v-model="formAnswerTitle" :disabled="!configFormAnswer.enabled"></b-form-input>
              </div>

              <div class="mt-10-px">
                <label>{{ $t('Ask a question, the answer will be the task title') }}</label>
                <b-form-input v-model="fieldTitle" :disabled="!configFormAnswer.enabled"></b-form-input>
              </div>

              <div class="mt-10-px">
                <label>{{ $t('Ask a question, the answer will be the task description') }}</label>
                <b-form-input v-model="fieldDescription" :disabled="!configFormAnswer.enabled"></b-form-input>
              </div>

              <div v-if="configFormAnswer.enabled">
                <div class="d-flex justify-content-between mt-15-px">
                  <div>
                    <button class="btn btn-secondary" @click="modal('projectTaskCustomFields')">Manage Custom Fields</button>
                  </div>
                  <ButtonLoading
                    :loading="btnLoading"
                    :title="$t('Confirm')"
                    :title-loading="$t('Sending')"
                    type="btn-md"
                    mode="button"
                    @action="formSubmit"
                  ></ButtonLoading>
                </div>

                <p class="mt-10-px tx-12-px txt-68748F">
                  {{ $t('You can add custom fields to the Form2Task.') }} {{ $t('Whenever you modify the custom fields they will appear in the tasks.') }}
                </p>
              </div>
              
            </div>

          </div>

        </div>
      </div>
    </div>
  </Layout>
</template>
