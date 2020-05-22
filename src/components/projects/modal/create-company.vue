<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'
import ButtonLoading from '@components/utils/button-loading'

export default {
  components: {ButtonLoading},
  data() {
    return {
      loading: false,
      btnLoading: false,
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      companies: JSON.parse(localStorage.getItem('COMPANIES_USER')),
      companyName: ''
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'createCompany') {
        object.item.name = ''
        this.$refs['modal'].show()
      }
    },
  },
  methods: {
    hideModal() {
      this.closeModal(this.$refs['modal'])
    },
    toggleModal() {
      this.$refs['modal'].toggle('#toggle-btn')
    },
    addCompany(){
      if(this.companyName.length === 0){
        return alert(this.$t('Company name is mandatory'))
      }

      this.loading = true
      Axios()
        .post('companies', {name: this.companyName})
        .then(response => {
          this.resetData()
          this.companies.push(response.data.data)

          localStorage.setItem('CURRENT_COMPANY', JSON.stringify(response.data.data))
          localStorage.setItem('COMPANIES_USER', JSON.stringify(this.companies))
          location.href = '/projects'
        }).catch(error => {
          this.resetData()
          return alert(error.data.message)
        })
    },
    resetData(){
      this.loading = false
      this.companyName = ''
    }
  },
}
</script>

<template>
  <b-modal id="modal" ref="modal" hide-footer lazy size="md">
    <div slot="modal-title">
      <div class="d-flex" style="align-items: center;">
        <span class="title">{{ $t('Create another company') }}</span>
        <div class="d-flex">
          <b-spinner
            v-show="loading"
            :label="$t('Loading')"
            variant="secondary"
            small
            class="title-loading"
          ></b-spinner>
        </div>
      </div>
      <span class="subTitle">{{ $t('Enter company name') }}</span>
    </div>
    <div class="modalContent">
      <div class="project-user-story-priorities">
        <b-card>
          <div class="col-sm-12">
            <div class="col-sm-12">
              <div class="input-group">
                <input
                  v-model="companyName"
                  maxlength="45"
                  class="form-control"
                  type="text"
                  :placeholder="$t('Company name')"
                />
                <div class="d-flex ml-1 align-items-center checklist-save-btn">
                  <ButtonLoading
                    :loading="btnLoading"
                    :title="$t('Create')"
                    :title-loading="$t('Loading')"
                    @action="addCompany"
                  ></ButtonLoading>
                </div>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </b-modal>
</template>
