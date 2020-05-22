<script>
import Layout from '@layouts/auth'
import Axios from '@utils/axios'
import Logo from '@layouts/partials/logo'
import Alert from '@components/utils/alert'
import ButtonLoading from '@components/utils/button-loading'

export default {
  page: {
    title: 'Forgot Password',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, Logo, Alert, ButtonLoading },
  data() {
    return {
      errors: [],
      email: '',
      loading: false,
      alertStatus: false,
      alertMessage: '',
    }
  },
  beforeCreate() {
    if(localStorage.getItem('ACCESS_TOKEN') && !this.$route.query.invitation){
      this.$router.push({
        name: 'workspaces.projects',
      })
    }
  },
  methods: {
    validateForm() {
      this.errors = []

      if (!this.email) {
        this.errors.push(this.$t('Email is required'))
      }

      if (this.errors.length) {
        return false
      }

      return true
    },
    changePassword() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      Axios()
        .post('accounts/reset-password', {
          email: this.email,
        })
        .then((response) => {
          this.loading = false
          this.alertStatus = true
          this.alertMessage = response.data.message
        })
        .catch((error) => {
          console.log(error)
          this.loading = false
          this.alertStatus = true
          this.alertMessage = this.$t('Invalid email')
        })

      this.email = ''
    },
  },
}
</script>

<template>
  <Layout>
    <div class="authentication mt-60px">
      <ul><Logo></Logo></ul>

      <div class="mt-33px">
        <h3 class="txt-1E1E2F tx-24px">{{ $t('Forgot Password') }}</h3>

        <p v-if="errors.length" class="alert alert-info mt-4">
          <b>{{ $t('Please correct the following error(s)') }}</b>
          <span v-for="error in errors" :key="error" class="d-block">{{ error }}</span>
        </p>

        <Alert class="mt-3" :message="alertMessage" :status="alertStatus"></Alert>

        <p>{{ $t('Please provide the email that') }}</p>

        <div class="form-group mt-33px">
          <input
            v-model="email"
            class="form-control"
            type="email"
            maxlength="120"
            autocomplete="off"
            :placeholder="$t('Write your e-mail')"
            required
          />
        </div>

        <div class="mb-19px">
          <ButtonLoading
            :loading="loading"
            :title="$t('Change Password')"
            :title-loading="$t('Sending')"
            @action="changePassword"
          ></ButtonLoading>
        </div>

        <div class="mt-10px mb-5">
          <router-link :to="{ name: 'auth.login' }" class="text-primary">
            {{ $t('I already have an account') }}
          </router-link>
        </div>
      </div>
    </div>
  </Layout>
</template>