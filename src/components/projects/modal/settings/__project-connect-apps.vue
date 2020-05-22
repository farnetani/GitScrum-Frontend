<script>
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import { modalManager } from '@state/helpers'

export default {
  components: { TitleLoading },
  data() {
    return {
      loading: true,
      apps: [],
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'projectConnectApps') {
        object.item.name = ''
        this.getApps()
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

    getApps() {
      Axios()
        .get(
          'projects-apps/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.loading = false
          this.apps = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <b-modal ref="modal" hide-footer lazy size="xl" title="Connect Apps">
    <div class="row">
      <div class="col-md-3 modal-background"></div>
      <div class="col-md-9">
        <div class="pd-25">
          <h3 class="mg-b-0">
            <TitleLoading title="Project Connect Apps" :loading="loading">
            </TitleLoading>
          </h3>

          <p class="mg-b-30">
            INTEGRATE WITH TOOLS YOU ALREADY USE PAINLESS INTEGRATIONS
          </p>

          <div class="row row-sm">
            <div
              v-for="app in apps"
              :key="app.name"
              :data-category="app.category"
              class="col-md-3 mg-b-15"
            >
              <div class="card card-body bd text-center">
                <img :src="app.logo" class="connect-apps-image" />
                <h5
                  class="card-title tx-dark tx-medium mg-t-10 mg-b-20"
                  v-text="app.name"
                ></h5>
                <button
                  class="btn btn-primary btn-block"
                  :class="{
                    'btn-light ': app.connected,
                    'btn-primary': !app.connected,
                  }"
                >
                  <span v-if="!app.connected"><strong>Connect</strong></span>
                  <span v-if="app.connected">Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>
