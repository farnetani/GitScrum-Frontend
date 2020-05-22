<script>
import Axios from '@utils/axios'

export default {
  data() {
    return {
      data: [],
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
    }
  },
  created() {
    this.getWhiteLabel()
  },
  methods: {
    getWhiteLabel() {
      let domain = window.location.host
      
      let companySlug = this.currentCompany ? this.currentCompany.slug : null
      
      let whiteLabel = this.$store.getters['whiteLabel/getWhiteLabel']

      if ( !whiteLabel ){

        Axios()
          .get('whitelabel-domain/?domain=' + domain + '&company_slug=' + companySlug)
          .then((response) => {
            this.data = response.data.data.branding
            if (!this.data.name) {
              this.$router.push({ path: '/ooops' })
              return
            }
            this.$store.dispatch('whiteLabel/setWhiteLabel', this.data)
          })

      } else {
        this.data = whiteLabel
      }
      
    },
    checkUpgrade() {
      if (
        this.currentCompany != null &&
        this.currentCompany.subscription === 'free' &&
        this.$cookies.get('chosen_plan')
      ) {
        return true
      }

      return false
    },
    gaClickLogo(){
      this.$ga.event('header_bar', 'click_logo')
      this.$router.push({ name: 'dashboard.show' })
    }
  },
}
</script>

<template>
  <b-navbar-brand tag="li">
    <span class="cursor-pointer" @click="gaClickLogo">
      <img style="max-width: 122px; max-height: 22px; margin-left: 8px;" :src="data.logo_header" :alt="data.name" :title="data.name" />
    </span>
    <div v-if="checkUpgrade()">
      <span class="badge badge-danger upgrade-account">
        <a :href="'/subscription/checkout/' + this.$cookies.get('chosen_plan')">Upgrade Account</a>
      </span>
    </div>
  </b-navbar-brand>
</template>
