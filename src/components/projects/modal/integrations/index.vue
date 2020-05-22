<script>
import Axios from '@utils/axios'
import appConfig from '@src/app.config'
import { modalManager } from '@state/helpers'
import TitleLoading from '@components/utils/title-loading'

export default {
  components: {
    TitleLoading,
  },
  data() {
    return {
      loading: true,
      
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'projectIntegrations') {
        object.item.name = ''
        this.$refs['modal'].show()
      }
    },
  },
  created(){
    
  },
  
  methods: {
    hideModal() {
      this.closeModal(this.$refs['modal'])
    },    
  },
}
</script>

<template>
  <b-modal ref="modal" hide-footer lazy size="md" hide-header>
    <div class="text-center" style="background:#fff; padding:40px;">
        <div>We are working to improve our integrations <br> <strong>Soon it will be available again</strong></div>
    </div>
  </b-modal>
</template>
