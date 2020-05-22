<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { modalManager } from '@state/helpers'

export default {
  components: { vSelect },
  data() {
    return {
      step: 1,
      projects: [],
      inviteProjects: [],
      inviteEmails: '',
      inviteMessage: '',
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      showInviteWithLink: false,
      inviteWithLink: false,
      companyInviteLink: 'Loading',
    }
  },
  watch: {
    inviteWithLink: function(val) {
      if (this.inviteProjects.slug === undefined) {
        this.inviteWithLink = false
        return false
      }

      if (this.inviteProjects && this.inviteProjects.slug) {
        if (this.inviteWithLink) {
          Axios()
            .post(
              'project-team-members/users/invite/shareable?company_slug=' +
                this.currentCompany.slug +
                '&project_slug=' +
                this.inviteProjects.slug
            )
            .then((response) => {
              // left empty on purpose
              this.companyInviteLink = response.data.invitation.url
            })
            .catch((e) => {
              console.error(e)
            })
        } else {
          Axios()
            .delete(
              'project-team-members/users/invite/shareable?company_slug=' +
                this.currentCompany.slug +
                '&project_slug=' +
                this.inviteProjects.slug
            )
            .then((response) => {
              // left empty on purpose
              this.companyInviteLink = 'Loading'
            })
            .catch((e) => {
              console.error(e)
            })
        }
      }
    },
    inviteProjects: function(project) {
      if (project && project.slug !== undefined) {
        this.companyInviteLink = 'Loading'
        this.showInviteWithLink = true
        this.step = 2
      }
    },
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    getProjects() {
      Axios()
        .get('projects/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.projects = response.data.data
          this.companyInviteLink = response.data.data.shared_link
        })
        .catch((e) => {
          console.error(e)
        })
    },
    sendInvites() {

      Axios()
        .post(
          'project-team-members/invite/?company_slug=' +
            this.currentCompany.slug +
            '&project_slug=' +
            this.inviteProjects.slug,
          {
            emails: this.inviteEmails,
            message: this.inviteMessage,
          }
        )
        .then((response) => {
          this.inviteProjects = []
          this.inviteEmails = []
          this.inviteMessage = []
        })
        .catch((e) => {
          console.error(e)
        })
    },
    copyLink() {
      const el = document.createElement('textarea')
      el.value = this.companyInviteLink || ''
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    goBack(event) {
      this.step = 1
    },
  },
}
</script>
<template>
  <li class="nav-item dropdown header-dropdown">
    <a class="nav-title dropdown-toggle" href="javascript:;" data-toggle="dropdown" @click="getProjects">
      {{ $t('Invite') }}
    </a>
    <div
      class="dropdown-menu navbar-dropdown"
      style="width:350px; padding: 0 0 8px !important; margin-top: 4px !important;"
    >
      <div class="header-dropdown-subitem">
        <b-dropdown-form>
          <div class="d-flex justify-content-between" style="height: 25px;">
            <div class="wd-5">
              <span v-show="step === 2" @click.prevent="goBack(1)">
                <font-awesome-icon :icon="['fa', 'chevron-left']" class="tx-22-px" />
              </span>
            </div>
            <div style="height: 25px;" class="tx-14-px">{{ $t('Invite new team members') }}</div>
            <div></div>
          </div>
        </b-dropdown-form>
      </div>

      <div v-if="projects" style="width: 100%; padding: 0 20px 20px;">
        <b-dropdown-form>
          <div v-show="step === 1">
            <span class="d-block lh-10 tx-10-px">
              Step 1
            </span>
            <span class="d-block tx-12-px">
              Choose Project
            </span>
            <v-select v-model="inviteProjects" :options="projects" taggable label="name" />
          </div>

          <div v-show="step === 1">
            <div class="mb-3">
              <span class="d-block lh-10 tx-10-px">Project</span>
              <span class="d-block fw-600">{{ inviteProjects.name }}</span>
            </div>

            <div class="mb-3">
              <label class="mb-2">Email of the project's team members</label>
              <v-select v-model="inviteEmails" taggable multiple />
            </div>

            <div>
              <label class="mb-2">Write a custom message</label>
              <textarea v-model="inviteMessage" rows="3" class="form-control mb-md-2"></textarea>
            </div>

            <button type="button" class="btn btn-sm btn-mini btn-primary" @input="sendInvites">
              Invite Team Members
            </button>

            <hr v-if="showInviteWithLink" />

            <div v-if="showInviteWithLink" class="tag">
              <b-form-checkbox v-model="inviteWithLink" name="check-button" class="mb-3" switch>
                <span class="tx-bold ">Invite with Link</span>
              </b-form-checkbox>
              <div v-if="inviteWithLink">
                <input v-model="companyInviteLink" type="text" class="form-control" value />
                <small class="d-block mb-2">
                  Anyone with this link can join the project
                </small>
                <button type="button" class="btn btn-sm btn-primary" @click.prevent="copyLink">Copy1234 </button>
              </div>
            </div>
          </div>
        </b-dropdown-form>
      </div>
      <div v-else style="width: 100%; padding: 0 20px 20px;">
        <span class="fw-500 txt-464DEE">
          {{ $t('Before inviting members to your company, you must create your first project') }}
        </span>
        <button class="mt-3 btn btn-primary btn-block" @click="modal('projectCreate')">
          <span class="fw-500 tx-12-px ml-2">{{ $t('I want to create my first project now') }}</span>
        </button>
      </div>
    </div>
  </li>
</template>
