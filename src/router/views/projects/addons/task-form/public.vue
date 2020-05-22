<script>
import Layout from '@layouts/empty'
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import VueGoodshare from "vue-goodshare";
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  page: {
    title: 'Form2Task',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, ButtonLoading, vSelect, VueGoodshare},
  data() {
    return {
      fields: [],
      loading: false,
      formBoxEnable: true,
      selectableOptions: [],
      project: [],
      title: '',
      description: '',
      dinamicFields: []
    }
  },
  created() {
    this.getFormData()
  },
  methods: {
    getFormData() {
      Axios()
        .get(
          'form-answers/public/data/' +
          this.$route.params.token
        )
        .then((response) => {

          this.project = response.data.data
          this.handleValues()

          document.title = this.project.config_form_answer.main_title

          if (this.project.background) {
            document.getElementById('background-left').style.backgroundImage = 'url(' + this.project.background + ')'
          }

          this.loading = false

        })
    },

    handleValues() {
      for (let i = 0; i < this.project.form_answer_fields.length; i++) {
        if (this.project.form_answer_fields[i].meta) {
          let optionsArray = this.project.form_answer_fields[i].meta
          if (!this.project.form_answer_fields[i].meta.length) {
            optionsArray = Object.values(this.project.form_answer_fields[i].meta)
          }

          let selectableOptions = []
          for (let j = 0; j < optionsArray.length; j++) {
            selectableOptions.push({
              id: optionsArray[j],
              label: optionsArray[j],
            })
          }

          this.$set(this.project.form_answer_fields[i], 'selectableOptions', selectableOptions)
        }
      }
    },

    formSubmit(){
      
      if ( !this.title ) {

        alert('The first question is mandatory')

      } else {

        this.loading = true
        let myip = require('quick-local-ip');

        let params = {
          title: this.title,
          description: this.description,
          fields: this.sortData(),
          ipv4: myip.getLocalIP4(),
        }
        Axios()
        .post('form-answers/' + this.$route.params.token, params)
        .then((response) => {
          this.loading = false
          this.formBoxEnable = false
        })
        .catch((error) => {
          this.alertMessage = error.response.data.message
          this.alertStatus = true
          this.loading = false
        })

      }

    },

    sortData(){

      let data = []
      for (let index = 0; index < this.project.form_answer_fields.length; index++) {
        
        data.push({ 
          id: this.project.form_answer_fields[index].id, 
          value: this.dinamicFields[index] 
        })
      }

      return data

    }

  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="form-shared">
      <b-overlay rounded="md" :show="loading">
        <div style="position:absolute; top:10px; right:15px; z-index: 2;">
          <VueGoodshare class="share-social-networks" has_icon button_design="gradient"></VueGoodshare>
        </div>
        <div class="container-fluid full-height">
          <div class="row row-height">
            <div class="col-lg-6 content-left">
              <div id="background-left" class="content-left-wrapper">
                <div v-if="project.name" class="content-text">
                  <img :src="project.logo" :alt="project.name" style="width:70px;height:70px;border-radius:4px;margin:0 0 20px;" class="img-fluid">
                  <p class="mb-0-px" v-text="project.company.name"></p>
                  <h2 v-text="project.name"></h2>
                  <p v-text="project.description"></p>
                </div>
              </div>
            </div>

            <div class="col-lg-6 content-right">
                <div v-if="project.name" v-show="formBoxEnable" class="form-box">

                  <h1 v-text="project.config_form_answer.main_title"></h1>

                  <div class="mt-20-px mb-15-px">
                    <label class="d-block tx-14-px txt-A7AFB7" v-text="project.config_form_answer.field_title"></label>
                    <b-form-input v-model="title" placeholder=""></b-form-input>
                  </div>

                  <div class="mb-15-px">
                    <label class="d-block tx-14-px txt-A7AFB7" v-text="project.config_form_answer.field_description"></label>
                    <b-form-textarea
                      id="textarea"
                      v-model="description"
                      placeholder=""
                      rows="3"
                      max-rows="6"
                    ></b-form-textarea>
                  </div>

                  <div>
                    <div v-for="(field, index) in project.form_answer_fields" :key="field.id">
                      <div v-if="field.type === 'text'" class="d-block mb-10-px">
                        <label class="d-block tx-14-px txt-A7AFB7" v-text="field.name"></label>
                        <b-form-input
                          v-model="dinamicFields[index]"
                        ></b-form-input>
                      </div>
                      <div v-if="field.type === 'textarea'" class="d-block mb-10-px">
                        <label class="d-block tx-14-px txt-A7AFB7" v-text="field.name"></label>
                        <b-form-textarea
                          v-model="dinamicFields[index]"
                          rows="3"
                          max-rows="6"
                        ></b-form-textarea>
                      </div>
                      <div v-if="field.type === 'checkbox'" class="d-block mb-10-px">
                        <b-form-checkbox
                          v-model="dinamicFields[index]"
                          value="true"
                        >
                          <label class="d-block tx-14-px txt-A7AFB7" v-text="field.name"></label>
                        </b-form-checkbox>
                      </div>
                      <div v-if="field.type === 'select'" class="d-block mb-10-px">
                        <label class="d-block tx-14-px txt-A7AFB7" v-text="field.name"></label>

                        <v-select
                          v-model="dinamicFields[index]"
                          :options="field.selectableOptions"
                          title="label"
                        ></v-select>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end mt-15-px">
                    <ButtonLoading
                      :loading="loading"
                      :title="$t('Confirm')"
                      :title-loading="$t('Sending')"
                      type="btn-md"
                      mode="button"
                      @action="formSubmit"
                    ></ButtonLoading>
                  </div>

                </div>

                <div v-show="!formBoxEnable" class="form-box">
                  <h2 class="text-center">
                    {{ $t('I appreciate your answer!') }}
                    <span class="d-block mt-10-px">{{ $t('Thank you!') }}</span>
                  </h2>
                </div>

            </div>
            
          </div>
          
        </div>
        <div class="column-powered">
          <a href="https://site.gitscrum.com" target="_blank">{{ $t('Powered by GitScrum') }}</a>
        </div>
      </b-overlay>
    </div>
  </Layout>
</template>
