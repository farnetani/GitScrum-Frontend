<script>
import Layout from '@layouts/auth'
import Axios from '@utils/axios'
import Logo from '@layouts/partials/logo'

export default {
  page: {
    title: 'Confirm Email',
    meta: [{ name: 'description', content: '-' }],
  },
  components: { Layout, Logo },

  data() {
    return {
      showCongrats: false,
      showFail: false,
    }
  },
  beforeCreate() {
    if(localStorage.getItem('ACCESS_TOKEN')){
      this.goDashboard()
    }
  },
  created() {
    Axios()
      .post('accounts/confirm/' + this.$route.params.token)
      .then((response) => {
        if (response.status === 200) {
          this.authentication(response)
        }
      })
      .catch((error) => {
        console.log(error)
        this.showFail = true
      })
  },
  methods: {
    goDashboard() {
      this.$router.push({ name: 'workspaces.projects' })
    },
    goSignin() {
      this.$router.push({ name: 'auth.login' })
    },
  },
}
</script>

<template>
  <Layout>
    <div class="authentication mt-60px">
      <ul><Logo></Logo></ul>

      <div class="mt-30-px">
        <div v-show="showFail">
          <h2 class="">{{ $t('Sorry. Invalid Token!') }}</h2>

          <p style="font-size:50px" class="pd-b-20 pd-t-25">&#128165;</p>

          <h5 class="mg-b-20">
            <strong>
              {{ $t('Try clicking on the email link again.') }}
            </strong>
          </h5>

          <button class="btn btn-primary btn-block font-weight-bold" @click="goSignin">
            {{ $t('Go to Sign in') }}
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>