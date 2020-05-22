<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import SideBar from '@components/companies/side-bar'
import ListUsers from '@components/utils/list-users'
import Alert from '@components/utils/alert'
import Ads from '@components/utils/ads'
import ButtonLoading from '@components/utils/button-loading'

export default {
  page: {
    title: 'Company Team',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, Alert, SideBar, ListUsers, Ads, ButtonLoading },
  data() {
    return {
      teammates: [],
      inviteNames: [],
      inviteEmails: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      activeUsers: 0,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      alertMessage: '',
      alertStatus: false,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      loading: false,
      gridConfig: {
        style: [
          'max-width: 45px; padding: 15px 10px 15px 20px;',
          '',
          'max-width:150px; width:150px;',
          'max-width:220px; width:220px;',
          'max-width:50px; width:50px;',
          'max-width: 45px; padding-top:2px',
        ],
      },
      showInvite: false,
      inviteCompanyLink: '',
      invitationLinkLoading: false,
      enableShareableLink: false,
      linkCopied: false,
      emailExpression: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
      sendInvitesLoading: false,
    }
  },
  mounted() {
    this.getTeammates(this.currentPage)
  },
  methods: {
    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getTeammates(page) {
      this.scrollToTop()
      this.loading = true
      this.activeUsers = 0
      Axios()
        .get('team-members/?company_slug=' + this.currentCompany.slug + '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getTeammates(1)
            return
          }
          this.teammates = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page

          this.getActiveUsers()

          this.loading = false
        })
        .catch((e) => {
          this.loading = false
          // console.error(e)
        })
    },

    getActiveUsers() {
      Axios()
        .get('team-members/active-users/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.activeUsers = response.data.data
        })
    },

    updateStatusCurrent(username) {
      Axios()
        .put(
          'team-members/toggle/ArchiveOrUnarchive/?company_slug=' + this.currentCompany.slug + '&username=' + username
        )
        .then((_) => {
          this.getTeammates(this.currentPage)
        })
      // .catch((e) => {
      //   console.error(e)
      // })
    },

    remove(username, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('team-members/?company_slug=' + this.currentCompany.slug + '&username=' + username, {})
          .then((response) => {
            this.alertMessage = this.$t('Team member was deleted successfully')
            this.alertStatus = true
            this.getTeammates(this.currentPage)
          })
        }
      })
      
    },

    canCreateProject(username, item) {
      Axios()
        .put('team-members/toggle/CreateProject/?company_slug=' + this.currentCompany.slug + '&username=' + username)
        .then((response) => {
          if ( !item.status.can_create_projects) {
item.status.can_create_projects = true;
          } else {
            item.status.can_create_projects = false
          }
        })
      // .catch((e) => {
      //   console.error(e)
      // })
    },

    toggleShowInvite() {
      this.showInvite = !this.showInvite
      if (this.showInvite) {
        this.alertStatus = false
        if (!this.inviteCompanyLink) {
          this.getInvitationLink()
        }
      }
    },

    getInvitationLink() {
      this.invitationLinkLoading = true

      Axios()
        .get('team-members/users/invite/shareable?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.enableShareableLink = response.data.data.share_enabled
          if (this.enableShareableLink) {
            this.inviteCompanyLink = response.data.data.url
          }
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          this.invitationLinkLoading = false
        })
    },

    handleShareableLink(status) {
      this.invitationLinkLoading = true
      this.linkCopied = false

      Axios()
        .post('team-members/users/invite/shareable?company_slug=' + this.currentCompany.slug + '&status=' + status)
        .then((response) => {
          this.enableShareableLink = response.data.data.share_enabled
          this.inviteCompanyLink = response.data.data.url
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          this.invitationLinkLoading = false
        })
    },

    updateInvitationLink() {
      this.invitationLinkLoading = true
      this.linkCopied = false
      this.inviteCompanyLink = ''

      Axios()
        .put('team-members/users/invite/shareable?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.inviteCompanyLink = response.data.data.url
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          this.invitationLinkLoading = false
        })
    },

    copyLink() {
      this.linkCopied = false
      let taElement = document.getElementById('shareableLink')

      const el = document.createElement('textarea')
      el.value = this.inviteCompanyLink || ''
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)

      taElement.focus()
      taElement.select()
      this.linkCopied = true
    },

    resetInviteFields() {
      this.inviteNames = []
      this.inviteEmails = []
    },

    checkForm() {
      this.errors = []

      this.inviteEmails.forEach((email) => {
        if (!this.validEmail(email)) {
          this.errors.push(email)
        }
      })

      if (this.errors.length) {
        return false
      }

      return true
    },

    validEmail(email) {
      return this.emailExpression.test(email)
    },

    sendInvites() {
      this.alertStatus = false
      this.alertMessage = ''
      if (this.inviteEmails.length === 0) {
        this.alertMessage = this.$t('Email is mandatory')
        this.alertStatus = true
      } else {
        if (!this.checkForm()) {
          this.alertMessage = this.$t('One or more email field is incorrect')
          this.alertStatus = true
          return
        }
        this.sendInvitesLoading = true

        Axios()
          .post('team-members/invite/?company_slug=' + this.currentCompany.slug, {
            emails: this.inviteEmails,
            names: this.inviteNames,
          })
          .then((response) => {
            this.alertMessage = this.$t('Invitations successfully sent')
            this.alertStatus = true
            this.sendInvitesLoading = false
            this.resetInviteFields()
          })
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="company-team">
      <div class="row mb-30-px">
        <div class="col-md-3">
          <SideBar></SideBar>
        </div>
        <div class="col-md-9">
          <div class="d-flex justify-content-between align-items-center">
            <TitleLoading
              :title="$t('Company Team Members')"
              :loading="loading"
              addclass="text-dark font-weight-bold mb-0 mr-5"
            >
            </TitleLoading>
            <div v-not-visible="'tablet'">
              <a v-if="activeUsers.invitation" class="tx-14-px" href="javascript:;" @click="toggleShowInvite">
                {{ $t('Invite Members') }}
              </a>
              <span v-else class="tx-12-px font-weight-bold txt-EF5958">
                {{ $t('You need to upgrade your account') }}
              </span>
            </div>
          </div>

          <div class="txt-6C7293">
            {{ currentCompany.stats.plan.title }} /
            <span v-if="currentCompany.stats.plan.users == 'Unlimited'">
              {{ $t('Unlimited users') }}
            </span>
            <span v-else>
              {{ $t('up to users', { users: currentCompany.stats.plan.users }) }}
            </span>
          </div>

          <div v-show="!loading && activeUsers">
            <Ads v-if="currentCompany.subscription === 'free' || !activeUsers.invitation" type="large"></Ads>
          </div>

          <Alert :message="alertMessage" :status="alertStatus" class="mg-b-20 mt-10-px"></Alert>

          <div v-show="showInvite" v-not-visible="'tablet'" class="row invite-container mt-10-px">
            <div class="col-md-12">
              <div class="d-flex justify-content-between mb-10-px">
                
                <TitleLoading
                  :title="$t('Shareable Link')"
                  :subtitle="$t('Anyone with this link can join the company')"
                  :loading="invitationLinkLoading"
                >
                </TitleLoading>

                <div class="d-flex justify-content-between">    
                  <b-form-checkbox
                    v-model="enableShareableLink"
                    :disabled="invitationLinkLoading"
                    @change="handleShareableLink"
                  >
                    <span>{{ $t('Enable') }}</span>
                  </b-form-checkbox>
                </div>

              </div>
              <div>
                

                <div v-show="enableShareableLink" class="mt-8-px">
                  <textarea
                    id="shareableLink"
                    v-model="inviteCompanyLink"
                    :disabled="invitationLinkLoading"
                    type="text"
                    class="form-control tx-12-px cursor-pointer"
                    style="word-break: break-all; line-height: 15px; padding: 10px 15px; height:50px; background-color: #ffffff"
                    readonly
                    @click="
                      $event.target.focus()
                      $event.target.select()
                      copyLink()
                    "
                  />

                  <div class="d-flex justify-content-between">
                    <div class="text-left tx-10-px fw-500 mt-5-px">
                      <span v-show="!linkCopied" class="txt-9EA9C1">
                        {{ $t('Click to copy') }}
                      </span>
                      <span v-show="linkCopied" class="txt-3D4F9F">
                        {{ $t('Copied to clipboard') }}
                      </span>
                    </div>
                    <a
                      v-show="enableShareableLink"
                      href="javascript:;"
                      class="txt-68748F fw-500 lh-15-px tx-10-px tx-uppercase mt-5-px"
                      @click="updateInvitationLink"
                    >
                      {{ $t('Update Link') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-12 mt-15-px">
              <div class="d-flex justify-content-between mb-15-px">
                <TitleLoading
                  :title="$t('Invite your Team')"
                  :subtitle="$t('Bring teammates to your company. After accepting the invitation, you must add teammates to the projects.')"
                  :loading="sendInvitesLoading"
                >
                </TitleLoading>
              </div>
              <div class="invite-form invite-form-company">
                  <div class="form-row">
                    <div class="col-md-6 form-group">
                      <input v-model="inviteNames[0]" type="text" :placeholder="$t('Full Name')" />
                    </div>
                    <div class="col-md-6 form-group">
                      <input v-model="inviteEmails[0]" type="email" :placeholder="$t('Enter the email address')" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="col-md-6 form-group">
                      <input v-model="inviteNames[1]" type="text" :placeholder="$t('Full Name')" />
                    </div>
                    <div class="col-md-6 form-group">
                      <input v-model="inviteEmails[1]" type="email" :placeholder="$t('Enter the email address')" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="col-md-6 form-group">
                      <input v-model="inviteNames[2]" type="text" :placeholder="$t('Full Name')" />
                    </div>
                    <div class="col-md-6 form-group">
                      <input v-model="inviteEmails[2]" type="email" :placeholder="$t('Enter the email address')" />
                    </div>
                  </div>

                  <div class="d-flex justify-content-end justify-content-end p-0">
                    <ButtonLoading
                    :loading="loading"
                    :title="$t('Send Invite')"
                    :title-loading="$t('Sending')"
                    type="btn-md"
                    @action="sendInvites"
                    ></ButtonLoading>
                  </div>
                  
              </div>
            </div>
            
          </div>

          <div v-not-visible="'tablet'" class="mt-10-px">
            <router-link :to="{ 'name': 'companies.teams.log' }" class="txt-link txt-68748F">
              {{ $t('See the people you have already invited') }}  
              <font-awesome-icon :icon="['far', 'angle-right']" class="ml-5-px" />
            </router-link>
          </div>

          <div class="divTable mt-20-px">
            <div v-not-visible="'tablet'" class="divTableHead">
              <div class="divTableRow">
                <div class="divTableCell text-center" :style="gridConfig.style[5]">
                  <font-awesome-icon :icon="['far', 'portrait']" style="font-size: 16px;" />
                </div>
                <div class="divTableCell text-left" :style="gridConfig.style[1]">{{ $t('Name') }} </div>
                <div class="divTableCell text-center" :style="gridConfig.style[2]">
                  {{ $t('Status') }}
                </div>
                <div class="divTableCell text-left" :style="gridConfig.style[3]">
                  {{ $t('Can be create project') }}
                </div>
                <div class="divTableCell" :style="gridConfig.style[4]"></div>
              </div>
            </div>

            <div class="divTableBody">
              <div v-for="(item, index) in teammates" :key="index" class="divTableRowBg">
                <div class="divTableRow">
                  <div class="divTableCell text-center" :style="gridConfig.style[0]">
                    <ListUsers :user="item.user" :link="true"></ListUsers>
                  </div>
                  <div class="divTableCell text-left" :style="gridConfig.style[1]">
                    <router-link
                      :to="{
                        name: 'profile.user',
                        params: { username: item.user.username },
                      }"
                      class="txt-primary-title"
                      v-text="item.user.name"
                    />
                    <span class="info">
                      <span v-text="item.user.headline"></span>
                      <span v-if="item.user.headline"> / </span>
                      {{ $t('Accepted') }}
                      <span v-if="item.accepted_at"> {{ $t('at') }} <span v-text="item.accepted_at"></span> </span>
                    </span>
                  </div>
                  <div
                    class="divTableCell d-flex align-items-center justify-content-center"
                    :style="gridConfig.style[2]"
                  >
                  <div v-if="item.status.current === 'active'" >
                    <span class="badge" style="background:#26DC8E;margin-top:2px;">
                      {{ $t('Active') }}
                    </span>
                    </div>
                    <div v-else class="d-flex align-items-center">
                    <span class="badge" style="background:#A7AFB7;margin-top:2px;">{{ $t('Inactive') }}</span>
                    <font-awesome-icon v-b-popover.hover.top="$t('XXX does not have access to your company and projects', { username: item.user.name })" :icon="['fal', 'question-circle']" class="ml-5-px"  />
                    </div>
                  </div>
                  <div
                    v-not-visible="'tablet'" 
                    class="divTableCell d-flex align-items-center justify-content-start"
                    :style="gridConfig.style[3]"
                  >
                    <div v-if="!item.status.company_owner" class="d-flex align-items-center">
                      <b-form-checkbox
                        
                        :checked="item.status.can_create_projects"
                        switch
                        @change="canCreateProject(item.user.username, item)"
                      >
                      </b-form-checkbox>
                      <font-awesome-icon v-show="item.status.can_create_projects" v-b-popover.hover.top="$t('XXX can create projects within his company', { username: item.user.name })" :icon="['fal', 'question-circle']" class="ml-5-px"  />
                      <font-awesome-icon v-show="!item.status.can_create_projects" v-b-popover.hover.top="$t('XXX cannot create projects within his company', { username: item.user.name })" :icon="['fal', 'question-circle']" class="ml-5-px"  />
                    </div>
                    <div v-else>
                      <strong  class="txt-68748F tx-12-px">Company Owner</strong>
                    </div>
                  </div>
                  <div v-not-visible="'tablet'" class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[4]">
                    <div v-if="!item.status.company_owner" class="dropdown header-dropdown">
                      <div class="dropdown-toggle" data-toggle="dropdown">
                        <div class="dropdown-ellipsis">
                          <font-awesome-icon :icon="['far', 'ellipsis-v']" />
                        </div>
                      </div>
                      <div class="dropdown-menu dropdown-menu-right" style="min-width: 222px; padding:6px 10px 6px">
                        <a
                          class="header-dropdown-item"
                          style="margin-top:10px"
                          href="javascript:;"
                          @click="updateStatusCurrent(item.user.username)"
                        >
                          <span v-if="item.status.current === 'active'">
                            <span class="icon-size"><font-awesome-icon :icon="['fa', 'user-slash']"/></span>
                            <span class="fw-600 ml-2">{{ $t('Disable') }}</span>
                          </span>
                          <span v-if="item.status.current !== 'active'">
                            <span class="icon-size"><font-awesome-icon :icon="['fa', 'user-alt']"/></span>
                            <span class="ml-2">{{ $t('Activate') }}</span>
                          </span>
                        </a>
                        <a class="header-dropdown-item" href="javascript:;" @click="remove(item.user.username, index)">
                          <span class="icon-size"><font-awesome-icon :icon="['fa', 'user-times']"/></span>
                          <span class="ml-2">{{ $t('Remove') }}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
            <b-pagination
              hide-goto-end-buttons
              class="paginator"
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              @change="getTeammates"
            >
              <template slot="prev-text">
                <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
              </template>
              <template slot="next-text">
                <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
              </template>
            </b-pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
