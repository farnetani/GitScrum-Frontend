<script>
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import ListUsers from '@components/utils/list-users'
import ButtonLoading from '@components/utils/button-loading'

export default {
   components: { TitleLoading, ListUsers, ButtonLoading },
  data() {
    return {
      loading: false,
      sendInvitesLoading: false,
      inviteProjectLink: '',
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      enableShareableLink: false,
      invitationLinkLoading: false,
      activeUsers: [],
      inviteNames: [],
      inviteEmails: [],
      listCompanyTeamMembers: [],
      totalInvites: [0,1,2],
      fields: [
        { key: 'user.name', label: '' },
        { key: 'user.username', label: '' }
      ],
    }
  },
  methods:{

    getInvitationLink() {
      this.invitationLinkLoading = true

      Axios()
        .get(
          'project-team-members/users/invite/shareable?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.enableShareableLink = response.data.data.share_enabled
          if (this.enableShareableLink) {
            this.inviteProjectLink = response.data.data.url
          }
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          this.invitationLinkLoading = false
        })
    },

    getActiveUsers() {
      Axios()
        .get('team-members/active-users/?company_slug=' + 
          this.$route.params.companySlug + 
          '&project_slug=' +
          this.$route.params.projectSlug)
        .then((response) => {
          this.activeUsers = response.data.data
        })
    },
    handleShareableLink(status) {
      this.invitationLinkLoading = true
      this.linkCopied = false

      Axios()
        .post(
          'project-team-members/users/invite/shareable?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&status=' +
            status
        )
        .then((response) => {
          this.enableShareableLink = response.data.data.share_enabled
          this.inviteProjectLink = response.data.data.url
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          // console.error(e)
          this.invitationLinkLoading = false
        })
    },
    toggleShowInvite() {
      this.showInvite = !this.showInvite
      if (this.showInvite) {
        this.alertStatus = false
        if (!this.inviteProjectLink) {
          this.getInvitationLink()
        }
      }
      this.inviteNames = []
      this.inviteEmails = []
    },
    onCopy(){
      this.$copyText(this.inviteProjectLink)
      this.copySuccess = 'Copied'
    },
    updateInvitationLink() {
      this.invitationLinkLoading = true
      this.linkCopied = false
      this.inviteProjectLink = ''

      Axios()
        .put(
          'project-team-members/users/invite/shareable?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.inviteProjectLink = response.data.data.url
          this.invitationLinkLoading = false
        })
        .catch((e) => {
          this.invitationLinkLoading = false
        })
    },
    getListCompanyTeamMembers() {
      this.loading = true
      Axios()
        .get(
          'project-team-members/not-added/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          console.log(response.data.data)
          this.listCompanyTeamMembers = response.data.data
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
        })
    },
    

    sendInvites(e) {
      this.alertStatus = false
      this.alertMessage = ''
      
      this.sendInvitesLoading = true

      Axios()
      .post(
        'project-team-members/invite/?company_slug=' +
          this.currentCompany.slug +
          '&project_slug=' +
          this.$route.params.projectSlug,
        {
          emails: this.inviteEmails,
          names: this.inviteNames,
        }
      )
      .then((response) => {
        this.alertMessage = this.$t('Invitations successfully sent')
        this.alertStatus = true
        this.sendInvitesLoading = false
       
        this.inviteNames = []
        this.inviteEmails = []
      })

    },
    addTeamMember(username) {
      this.btnLoading = true
      Axios()
        .post(
          'project-team-members/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            username: username,
          }
        )
        .then((response) => {
          this.btnLoading = false
          this.selectedTeamMembers = null

          this.$store.dispatch('project/setProject', null)
          this.getListCompanyTeamMembers()

        })
        .catch((e) => {})
    },
  }
}
</script>

<template>
  <div>
    <b-button
    v-if="activeUsers.invitation && authorize('teamMembers', 'create')" 
    variant="primary"
    @click="toggleShowInvite">{{ $t('Invite Members') }}</b-button>

    <b-dropdown class="dropdown-invite styled-dropdown" :text="$t('Invite Members')" @shown="getInvitationLink">
      <b-dropdown-form>

        <div class="d-flex justify-content-between mb-20-px">
          <b-form-checkbox
            v-model="enableShareableLink"
            :disabled="invitationLinkLoading"
            @change="handleShareableLink"
          >
            <TitleLoading
              :title="$t('Shareable Link')"
              :subtitle="$t('Anyone with this link can join the project')"
              :loading="invitationLinkLoading"
              class="mt-2px"
            ></TitleLoading>
          </b-form-checkbox>
          <div>
              <a
                v-show="enableShareableLink"
                href="javascript:;"
                class="txt-68748F fw-500 lh-15-px tx-10-px tx-uppercase"
                @click="updateInvitationLink"
              >
                {{ $t('Update Link') }}
              </a>
          </div>
        </div>

        <div v-show="enableShareableLink">
          <b-input-group class="mb-3">
            <b-input v-model="inviteProjectLink" 
              :readonly="true" 
              autocomplete="off"></b-input>
            <b-input-group-append>
              <b-button 
              v-clipboard:copy="inviteProjectLink"
              v-clipboard:success="onCopy"
              variant="outline-secondary" >
                <font-awesome-icon :icon="['far', 'copy']" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>


        <b-tabs content-class="mt-3" justified>
          <b-tab :title="$t('Invite External Users')" active>
            
            <div v-for="invite in totalInvites" :key="invite" class="form-row">
              <div class="col-md-6 form-group">
                <div role="group">
                  <label for="input-live">{{ $t('Full Name') }}</label>
                  <b-form-input
                    v-model="inviteNames[invite]"
                    type="text"
                    :placeholder="$t('Full Name')"
                    trim
                  ></b-form-input>
                </div>
              </div>
              <div class="col-md-6 form-group">
                <div role="group">
                  <label for="input-live">{{ $t('Email') }}</label>
                  <b-form-input
                    v-model="inviteEmails[invite]"
                    type="email"
                    :placeholder="$t('Email')"
                    trim
                  ></b-form-input>

                </div>
              </div>
            </div>

            <ButtonLoading 
              :loading="sendInvitesLoading"
              :title="$t('Send Invite')"
              :title-loading="$t('Sending')"
              mode="button"
              type="btn-md"
              class="d-flex justify-content-end"
              @action="sendInvites"></ButtonLoading>

          </b-tab>
          <b-tab :title="$t('Invite Internal Users')" @click="getListCompanyTeamMembers">
            
              <div style="height:208px; overflow-y:auto;">
                <b-table class="table-small" hover :items="listCompanyTeamMembers" :fields="fields" >
                  <template v-slot:cell(user.name)="data">
                    <div class="d-flex align-items-center">
                      <ListUsers :user="data.item.user" :link="true" size="22"></ListUsers>
                      <div class="ml-2">{{ data.item.user.name }}</div>
                    </div>
                  </template>
                  <template v-slot:cell(user.username)="data">
                    <div class="d-flex justify-content-end">
                      <b-button size="sm" @click="addTeamMember(data.item.user.username)">Add to Project</b-button>
                    </div>
                  </template>
                </b-table>
              </div>

          </b-tab>
        </b-tabs>
      </b-dropdown-form>
    </b-dropdown>
  </div>
</template>
