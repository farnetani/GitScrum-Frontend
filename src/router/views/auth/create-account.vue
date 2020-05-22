<script>
import Layout from '@layouts/auth'
import Axios from '@utils/axios'
import Logo from '@layouts/partials/logo'
import Alert from '@components/utils/alert'
import SocialLogin from '@components/utils/social-login'
import ButtonLoading from '@components/utils/button-loading'

export default {
  page: {
    title: 'Create Account',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, Logo, Alert, SocialLogin, ButtonLoading },
  data() {
    return {
      name: '',
      companyName: '',
      email: null,
      password: '',
      ipv4: '',
      alertMessage: '',
      alertStatus: false,
      showSignup: true,
      showSignupComplete: false,
      lnkResend: true,
      loading: false,
      invitationCode: null,
      invitationCodeSuccess: null,
      disabledEmail: false,
      remember: true,
      showSocial: false,
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
    if (this.$route.query.invitation) {
      this.invitationCode = this.$route.query.invitation

      this.emailRequest()
      this.whois()
    }
  },
  methods: {
    whois(){

      if ( window.location.hostname !== 'gitscrum.com' ){
        this.showSocial = false;
      }

    },
    validateForm() {
      this.errors = []

      if (!this.name) {
        this.errors.push(this.$t('Name is required'))
      }

      if (!this.invitationCode && !this.companyName) {
        this.errors.push(this.$t('Company Name is required'))
      }

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
          this.invitationCodeSuccess = false
        })
    },

    signin() {
      if (!this.validateForm()) {
        return
      }

      this.alertStatus = false
      this.loading = true

      let params = {
        name: this.name,
        company_name: this.companyName,
        email: this.email,
        password: this.password,
        ipv4: this.ipv4,
      }

      if (this.invitationCode) {
        this.$set(params, 'token_invitation', this.invitationCode)
      }

      Axios()
        .post('accounts/', params)
        .then((response) => {
          if (response.status === 201) {

            if ( !response.data.email_confirmed ){
              this.showSignup = false
              this.showSignupComplete = true
              this.loading = false
              return ;
            }

            if (this.invitationCode) {
              Axios()
                .post('auth/login', { email: this.email, password: this.password })
                .then((response) => {
                  if (response.status === 200) {
                    this.authentication(response, this.remember)
                  }
                })
            } else {
              this.showSignup = false
              this.showSignupComplete = true
              this.loading = false
            }
          }
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
          this.loading = false
        })
    },
    resend() {
      Axios()
        .post('accounts/confirm/resend', {
          email: this.email,
        })
        .then((response) => {
          this.lnkResend = false
          this.alertMessage = this.$t('Email has been sent successfully')
          this.alertStatus = true
        })
        .catch((error) => {
          this.alertMessage = 'Error. ' + error.response.data.message
          this.alertStatus = true
        })
    },
  },
}
</script>

<template>
  <Layout>
    <div class="authentication mt-60px">
      <ul><Logo></Logo></ul>

      <div v-show="showSignupComplete" class="mt-33px">
        <h3 class="txt-1E1E2F tx-24px fw-700">{{ $t('Congratulations') }}</h3>

        <div class="mt-10px mb-2">
          <router-link :to="{ name: 'auth.login' }" class="text-primary">
            {{ $t('Go to Login') }}
          </router-link>
        </div>

        <Alert :message="alertMessage" :status="alertStatus" class=" mt-33px"></Alert>

        <h5 class="mb-19px mt-33px tx-14px lh-18px">
          {{ $t('We have sent an email with a confirmation link') }}
          <strong>{{ $t('Please open your e-mail and click the confirmation link.') }}</strong>
        </h5>

        <a v-if="lnkResend" class="text-primary" href="javascript:;" @click="resend">
          {{ $t('Resend email to confirmation') }}
        </a>
      </div>

      <div v-show="showSignup" class="mt-33px">
        <div v-if="invitationCode" class="mt-33px">
          <h3 class="txt-1E1E2F tx-24px">{{ $t('Accept the Team Invitation') }}</h3>
        </div>

        <div v-if="!invitationCode" class="mt-33px">
          <h3 class="txt-1E1E2F tx-24px">{{ $t('Sign Up') }}</h3>
          <h6 v-if="!invitationCode" class="txt-1E1E2F tx-14px"
            >{{ $t('or') }}
            <router-link :to="{ name: 'auth.login' }" class="text-primary">{{
              $t('Sign In to your account')
            }}</router-link></h6
          >
        </div>

        <Alert :message="alertMessage" :status="alertStatus"></Alert>

        <div v-if="invitationCodeSuccess !== false" class="mt-33px">
          
          <div v-if="invitationCode" class="invitation-box mt-3 mb-3">
            <div class="alert alert-primary" role="alert">
              <h6
                ><strong>{{ $t('Do you already have an account?') }}</strong></h6
              >
              <div class="mt-2">
                <router-link
                  :to="{
                    name: 'auth.login',
                    query: { invitation: invitationCode },
                  }"
                  class="text-primary btn btn-light"
                >
                  {{ $t('Yes, I want to use my account') }}
                </router-link>
              </div>
            </div>

            <hr>

          </div>

            <div class="form-group mb-19px">
              <input
                v-model="name"
                type="text"
                name="name"
                class="form-control"
                maxlength="120"
                :placeholder="$t('Fullname')"
                value
                required
              />
            </div>

            <input type="hidden" name="token_invitation" value />

            <div v-if="!invitationCode" class="form-group mb-19px">
              <input
                v-model="companyName"
                type="text"
                name="company"
                class="form-control"
                maxlength="120"
                :placeholder="$t('Company Name')"
                value
                required
              />
            </div>

            <div class="form-group mb-19px">
              <input
                v-model="email"
                type="email"
                name="email"
                class="form-control"
                maxlength="120"
                :placeholder="$tc('Email', 1)"
                value
                :disabled="disabledEmail"
                required
              />
            </div>

            <div class="form-group mb-19px">
              <input
                v-model="password"
                type="password"
                name="password"
                class="form-control"
                maxlength="60"
                :placeholder="$t('Password')"
                required
              />
            </div>

            <p class="tx-11 lh-16 text-left ml-3 mr-3 mb-4 txt-1E1E2F">
              {{ $t('By clicking Sign in or Sign up with') }}
              <strong class="fw-700">{{ $t('GitScrum’s') }}</strong
              >&nbsp;
              <a href="https://site.gitscrum.com/terms-and-conditions/" target="_blank" class="text-primary">
                {{ $t('Terms and Conditions') }}
              </a>
              {{ $t('and') }}
              <a href="https://site.gitscrum.com/privacy-policy/" target="_blank" class="text-primary">
                {{ $t('Privacy Policy') }} </a
              >.
            </p>

            <!--
            <div class="mb-4 text-left">
              <b-form-checkbox id="checkbox-1" v-model="remember" name="checkbox-1">
                {{ $t('Remember me') }}
              </b-form-checkbox>
            </div>
            -->

            <div class="mg-b-20">
              <ButtonLoading
                :loading="loading"
                :title="$t('Create Account')"
                :title-loading="$t('Sending')"
                @action="signin"
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
    </div>
  </Layout>
</template>
