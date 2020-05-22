<script>
import Layout from '@layouts/auth'
import Axios from '@utils/axios'
import Logo from '@layouts/partials/logo'
import Alert from '@components/utils/alert'
import ButtonLoading from '@components/utils/button-loading'

export default {
  page: {
    title: 'Reset Password',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, Logo, Alert, ButtonLoading },
  data() {
    return {
      errors: [],
      email: '',
      newPassword: '',
      lading: false,
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
    validateForm(event) {
      this.errors = []

      if (!this.email) {
        this.errors.push(this.$t('Email is required'))
      }

      if (!this.newPassword) {
        this.errors.push(this.$t('New Password is required'))
      }

      if (this.errors.length) {
        return false
      }

      return true
    },
    updatePassword(event) {
      if (!this.validateForm(event)) {
        event.preventDefault()
        return
      }

      this.btnLoading = true

      Axios()
        .post('accounts/new-password', {
          token: this.$route.params.token,
          email: this.email,
          password: this.newPassword,
          password_confirmation: this.newPassword,
        })
        .then((response) => {
          this.$router.push('auth.login')
        })
        .catch((error) => {
          console.log(error)
          this.loading = false
          this.alertStatus = true
          this.alertMessage = response.data.message.password
        })
    },
  },
}
</script>

<template>
  <Layout>
    <div class="authentication mt-60px">
      <ul><Logo></Logo></ul>

      <div class="mt-33px">
        <h3 class="txt-1E1E2F tx-24px">{{ $t('Reset Password') }}</h3>

        <p v-if="errors.length" class="alert alert-info mt-4">
          <b>{{ $t('Please correct the following error(s)') }}</b>
          <span v-for="error in errors" :key="error" class="d-block">{{ error }}</span>
        </p>

        <Alert class="mt-3" :message="alertMessage" :status="alertStatus"></Alert>

        <p class="mb-0">{{ $t('Please enter your new password in the field bellow') }}</p>

        <div class="mt-33px">
          <div class="form-group mb-19px">
            <input
              v-model="email"
              class="form-control"
              type="email"
              maxlength="120"
              autocomplete="off"
              :placeholder="$t('Your current e-mail')"
              required
            />
          </div>

          <div class="form-group mb-19px">
            <input
              v-model="newPassword"
              class="form-control"
              type="password"
              maxlength="120"
              autocomplete="off"
              :placeholder="$t('Your new password')"
              required
            />
          </div>
        </div>

        <div class="mb-19px">
          <ButtonLoading
            :loading="loading"
            :title="$t('Update My Password')"
            :title-loading="$t('Sending')"
            @action="updatePassword"
          ></ButtonLoading>
        </div>

        <div class="mt-10px mb-5">
          <router-link :to="{ name: 'auth.login' }" class="text-primary tx-bold">
            {{ $t('Go to Login') }}
          </router-link>
        </div>
      </div>
    </div>
  </Layout>
</template>