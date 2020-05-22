<script>
import Layout from '@layouts/auth'
import Axios from '@utils/axios'
import Logo from '@layouts/partials/logo'
import ButtonLoading from '@components/utils/button-loading'
import SocialLogin from '@components/utils/social-login'
import Alert from '@components/utils/alert'

export default {
  page: {
    title: 'Boost Productivity',
    meta: [{ name: 'description', content: 'AuthLogin' }],
  },
  components: { Layout, Logo, SocialLogin, Alert, ButtonLoading },
  data() {
    return {
      email: '',
      password: '',
      ipv4: '',
      alertMessage: '',
      alertStatus: false,
      btnLoading: false,
      loading: false,
      invitationCode: null,
      invitationCodeSuccess: null,
      errors: [],
      disabledEmail: false,
      remember: true,
      purchase: false,
      showSocial: true
    }
  },
  beforeCreate() {
    if (localStorage.getItem('ACCESS_TOKEN') && !this.$route.query.invitation) {
      this.$router.push({
        name: 'workspaces.projects',
      })
    }
  },
  mounted() {
    let urlParams = new URLSearchParams(window.location.search)

    if (urlParams.get('ref') === 'purchase') {
      this.purchase = true
    }

    if (this.$route.query.invitation) {
      
      this.invitationCode = this.$route.query.invitation
      this.emailRequest()
    }

    this.whois()

  },
  methods: {
    whois(){
      
      if ( window.location.hostname !== 'gitscrum.com' ){
        this.showSocial = false;
      }

    },
    emailRequest() {
      Axios()
        .post('accounts/code/invitation', { token: this.invitationCode })
        .then((response) => {
          this.invitationCodeSuccess = true
          this.email = response.data.data.email
          if (this.email !== null) {
            this.disabledEmail = true
          }
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
          this.disabledEmail = true
          this.invitationCodeSuccess = false
        })
    },

    validateForm() {
      this.errors = []

      if (!this.email) {
        this.errors.push(this.$t('Email is required'))
      }

      if (!this.password) {
        this.errors.push(this.$t('Password is required'))
      }

      if (this.errors.length) {
        return false
      }

      return true
    },

    signup() {
      if (!this.validateForm()) {
        return
      }

      this.alertStatus = false
      this.loading = true

      let myip = require('quick-local-ip');

      let params = {
        email: this.email,
        password: this.password,
        ipv4: myip.getLocalIP4(),
      }

      if (this.invitationCode) {
        this.$set(params, 'token_invitation', this.invitationCode)
      }

      Axios()
      .post('auth/login', params)
      .then((response) => {
        this.email = ''
        this.password = ''
        this.authentication(response, this.remember)
      })
      .catch((error) => {
        this.alertMessage = error.response.data.message
        this.alertStatus = true
        this.loading = false
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
        <h3 class="txt-1E1E2F tx-24px">{{ $t('Sign in') }} </h3>
        <h6 class="txt-1E1E2F tx-14px"
          >{{ $t('or') }}
          <router-link
            v-if="invitationCode && invitationCodeSuccess !== false"
            :to="{
              name: 'auth.create-account',
              query: { invitation: invitationCode },
            }"
            class="text-primary"
          >
            <span class="fw-600">{{ $t('Create an account') }}</span>
          </router-link>

          <router-link v-if="!invitationCode || invitationCodeSuccess === false" :to="{ name: 'auth.create-account' }" class="text-primary">
            <span class="fw-600">{{ $t('Create an account') }}</span>
          </router-link>
        </h6>
      </div>

      <div v-if="purchase">
        <h4 class="mt-20-px txt-EF5958 fw-600">{{
          $t('To purchase one of Gitscrum plans, you need to login or create a new account')
        }}</h4>
      </div>

      <p v-if="errors.length" class="alert alert-info mt-4">
        <b>{{ $t('Please correct the following error(s)') }}</b>
        <span v-for="error in errors" :key="error" class="d-block">
          {{ error }}
        </span>
      </p>

      <Alert class="mt-4" :message="alertMessage" :status="alertStatus"></Alert>

      <div v-if="invitationCodeSuccess !== false" class="mt-33px">
        <div class="form-group mb-19px">
          <input
            v-model="email"
            type="email"
            :placeholder="$tc('Email', 1)"
            class="form-control"
            maxlength="120"
            value
            :disabled="disabledEmail"
            required="true"
          />
        </div>

        <div class="form-group mb-19px">
          <input
            v-model="password"
            type="password"
            :placeholder="$tc('Password', 1)"
            class="form-control"
            maxlength="60"
            required="true"
          />
        </div>

        <p class="tx-11 lh-16 text-left ml-3 mr-3 mb-4 txt-1E1E2F">
          {{ $t('By clicking Sign in or Sign up with') }}
          <a href="https://site.gitscrum.com/legal/terms-and-conditions" target="_blank" class="text-primary">{{
            $t('Terms and Conditions')
          }}</a>
          {{ $t('and') }}
          <a href="https://site.gitscrum.com/legal/privacy-policy" target="_blank" class="text-primary">{{
            $t('Privacy Policy')
          }}</a
          >.
        </p>

        <div class="mb-4 text-left d-none">
          <b-form-checkbox id="checkbox-1" v-model="remember" name="checkbox-1">
            {{ $t('Remember me') }}
          </b-form-checkbox>
        </div>

        <div class="mg-b-20">
          <ButtonLoading
            :loading="loading"
            :title="$t('Confirm')"
            :title-loading="$t('Authenticating')"
            mode="button"
            @action="signup"
          ></ButtonLoading>
        </div>
      </div>

      <SocialLogin v-if="showSocial" v-show="invitationCodeSuccess !== false"></SocialLogin>

      <div v-if="invitationCodeSuccess !== false" class="mt-10px mb-5">
        <router-link :to="{ name: 'auth.forgot-password' }" class="text-primary">
          {{ $t('Forgot Password') }}
        </router-link>
      </div>
      <div v-if="invitationCodeSuccess === false" class="mt-10px mb-5">
          <a href="//site.gitscrum.com/">{{ $t('Go to GitScrum') }}</a>
        </div>
    </div>
  </Layout>
</template>
