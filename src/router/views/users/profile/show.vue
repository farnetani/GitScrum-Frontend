<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import appConfig from '@src/app.config'
import ListLabels from '@components/utils/list-labels'
import ListUsers from '@components/utils/list-users'
import GlanceYear from '@components/utils/glance-year'
import DatePicker from 'vue2-datepicker'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import UploadImage from '@components/utils/upload-image'

export default {
  page: {
    title: 'User Profile',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    ListLabels,
    ListUsers,
    DatePicker,
    GlanceYear,
    vSelect,
    UploadImage,
  },
  props: {
    selectedTab: {
      type: String,
      default: 'overview',
    },
  },
  data() {
    return {
      loading: true,
      btnLoading: false,
      profile: 'default',
      user: [],
      skills: [],
      projects: [],
      workExperiences: [],
      workPresent: 'true',
      modalAction: null,
      workExperienceId: 0,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      currentUser: JSON.parse(window.localStorage.getItem('CURRENT_USER')),
      work: [],
      calendarActivities: [],
      username: null,
      timezones: [],
      selectedTimezone: {},

      avatarOptions: {
        url: appConfig.APIBaseURL + '/profile/logo/',
        http: 'POST',
        thumbnailWidth: 128,
        maxFilesize: 100,
        headers: { Authorization: localStorage.getItem('ACCESS_TOKEN') },
        paramName: 'avatar_image',
      },

      userLogs: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      profileUpdatedError: false,
      profileUpdated: false,
      currentEmail: ''
    }
  },
  mounted() {
    if (this.$route.params.username !== undefined) {
      this.username = this.$route.params.username
    } else {
      this.username = this.currentUser.username
    }

    this.getProfile()
    this.getSkills()
    this.getWorkExperience()
    this.getCalendarActivities()
  },
  methods: {
    goBackProfile() {
      this.profile = 'default'
    },
    deleteAccount() {

      this.$bvModal.msgBoxConfirm(this.$t('Are you sure you want to delete your user account?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('profile')
          .then((response) => {
            Axios().post('auth/logout')
            localStorage.removeItem('ACCESS_TOKEN')
            localStorage.removeItem('CURRENT_USER')
            localStorage.removeItem('COMPANIES_USER')
            localStorage.removeItem('CURRENT_COMPANY')

            location.href = '/login'
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })
    },

    updateUserDetails() {
      this.btnLoading = true

      Axios()
        .put('profile', {
          name: this.user.name,
          email: this.user.email,
          username: this.user.username,
          summary: this.user.summary,
          headline: this.user.headline,
          location: this.user.location,
          timezone_id: this.selectedTimezone.code,
        })
        .then((response) => {
          if ( response.data.message !== undefined ){
           this.profileUpdatedError = response.data.message + ' (' + this.user.email + ')'
           this.user.email = this.currentEmail
          } else {
            this.profileUpdated = 'Profile updated successfully'
            this.user.email = this.user.email
          }
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getProfile() {
      Axios()
        .get('profile?username=' + this.username)
        .then((response) => {
          this.user = response.data.data
          this.currentEmail = this.user.email
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getSettings() {
      this.profile = 'settings'
      Axios()
        .get('timezones?username=' + this.username)
        .then((response) => {
          let arr = []
          for (let i = 0; i < response.data.data.length; i++) {
            if (this.user.timezone_id === response.data.data[i]['id'])
              this.selectedTimezone = {
                code: response.data.data[i]['id'],
                label: response.data.data[i]['timezone'],
              }

            arr.push({
              code: response.data.data[i]['id'],
              label: response.data.data[i]['timezone'],
            })
          }

          this.loading = false
          this.timezones = arr
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getProjects() {
      Axios()
        .get('projects/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.projects = response.data.data
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getCalendarActivities() {
      Axios()
        .get('glance-year/user/' + this.username)
        .then((response) => {
          this.calendarActivities = Object.values(response.data.data)
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getWorkExperience() {
      this.loading = true
      Axios()
        .get('profile-experiences?username=' + this.username)
        .then((response) => {
          this.workExperiences = response.data.data
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getSkills() {
      this.loading = true
      Axios()
        .get('profile-skills?username=' + this.username)
        .then((response) => {
          this.skills = response.data.data
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getSessions(page) {
      this.loading = true
      this.profile = 'sessions'
      Axios()
        .get('user-logs/?company_slug=' + this.currentCompany.slug + '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getMyLogs(1)
            return
          }
          this.userLogs = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    modalAddSkill() {
      this.$bvModal.show('skills')
    },

    modalEditAbout() {
      this.$bvModal.show('about')
    },

    saveAbout() {
      Axios()
        .put('profile', {
          summary: this.user.summary,
        })
        .then((response) => {
          this.getWorkExperience()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    saveSkills() {
      let data = []

      this.skills.forEach(function(entry) {
        if (typeof entry === 'object') {
          data.push(entry.title)
        } else {
          data.push(entry)
        }
      })

      Axios()
        .put('profile-skills', {
          skills: data,
        })
        .then((response) => {
          this.getSkills()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    modalAddWorkExperience() {
      this.modalAction = 'add'
      this.work = {}
      this.$bvModal.show('workExperience')
    },

    saveWorkExperience() {
      let dateStart, dateEnd, d0, d1

      if (this.workPresent === 'true') {
        d0 = new Date(this.work.date)

        dateStart =
          d0.getFullYear() + '-' + ('0' + (d0.getMonth() + 1)).slice(-2) + '-' + ('0' + d0.getDate()).slice(-2)
      }

      if (this.workPresent === 'false') {
        d0 = new Date(this.work.dateRange[0])
        d1 = new Date(this.work.dateRange[1])

        dateStart =
          d0.getFullYear() + '-' + ('0' + (d0.getMonth() + 1)).slice(-2) + '-' + ('0' + d0.getDate()).slice(-2)

        dateEnd = d1.getFullYear() + '-' + ('0' + (d1.getMonth() + 1)).slice(-2) + '-' + ('0' + d1.getDate()).slice(-2)
      }

      let object = {
        company: this.work.company,
        position: this.work.position,
        date_start: dateStart,
        date_finish: dateEnd,
        description: this.work.description,
      }

      if (this.modalAction === 'add') {
        Axios()
          .post('profile-experiences', object)
          .then((response) => {
            this.work.company = ''
            this.work.position = ''
            this.work.date = ''
            this.work.dateRange = ''
            this.work.description = ''
            this.workExperiences.push(response.data.data)
          })
          .catch((e) => {
            console.error(e)
          })
      } else if (this.modalAction === 'edit') {
        Axios()
          .put('profile-experiences/' + this.workExperienceId, object)
          .then((response) => {
            this.getWorkExperience()
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },

    deleteWorkExperience(workExperience, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('profile-experiences/' + workExperience.id)
          .then((response) => {
            this.workExperiences.splice(index, 1)
          })
          .catch((e) => {
            console.error(e)
          })
        }
      })
      
    },

    modalEditWorkExperience(workExperience) {
      this.modalAction = 'edit'
      this.workExperienceId = workExperience.id
      this.work = {}
      this.work.company = workExperience.company.name
      this.work.position = workExperience.position.name

      if (workExperience.date_finish.original === null) {
        this.workPresent = 'true'
        this.work.date = workExperience.date_start.original
      } else {
        this.workPresent = 'false'

        let dtStart = new Date(workExperience.date_start.original)
        let dtFinish = new Date(workExperience.date_finish.original)

        this.work.dateRange = [dtStart, dtFinish]
      }

      this.work.description = workExperience.description
      this.$bvModal.show('workExperience')
    },

    updateAvatar(avatar) {
      if (this.user.avatar !== avatar && avatar !== null) {
        this.user.avatar = avatar
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="user-profile">
      <div class="user-profile-cover"></div>

      <div class="row">
        <div class="col-md-3">
          <div class="user-profile-box user-profile-box-right">
            <div class="user-profile-photo">
              <img :src="user.avatar" />
            </div>
            <div class="tx-20-px p-15-px">
              <h3 class="fw-600 mb-0 mt-0" v-text="user.name"></h3>
              <h5 v-show="user.headline" class="mt-5-px tx-14-px txt-68748F fw-400 mb-0" v-text="user.headline"></h5>
              <h5 v-show="user.location" class="mt-20-px tx-12-px txt-68748F fw-400 mb-0">
                <font-awesome-icon :icon="['fal', 'map-marker-alt']" style="font-size:13px" />
                <span class="ml-1" v-text="user.location"></span>
              </h5>
            </div>

            <div v-if="currentUser.username === user.username" class="tx-20-px p-15-px">
              <button class="btn btn-primary btn-block" @click="getSettings">{{ $t('Edit Profile') }}</button>
              <a href="javascript:;" class="tx-link tx-12-px" @click="getSessions(currentPage)">{{ $t('View Sessions') }}</a>
            </div>

            <div class="mt-15-px mb-15-px line-divider"></div>

            <div class="p-15-px">
              <div class="mb-10-px d-flex justify-content-between align-items-center">
                <h5 class="tx-18 fw-600 mb-0">{{ $t('Skills') }}</h5>

                <a v-if="currentUser.username === user.username" href="javascript:;" class="text-primary" @click="modalAddSkill">
                  {{ $t('Manage') }}
                </a>
              </div>
              <ListLabels :labels="skills" custom-class="badge badge-skills"></ListLabels>
            </div>
          </div>
        </div>

        <div class="col-md-9 mb-30-px">
          <div v-show="profile === 'default'" class="ml-10-px">
            <div class="user-profile-box mt-30-px">
              <div class="p-20-px">
                <GlanceYear :data="calendarActivities" :slug="username" type="user"> </GlanceYear>
              </div>
            </div>

            <div class="user-profile-box mt-30-px">
              <div class="p-20-px">
                <div class="d-flex justify-content-between align-items-center mb-20-px">
                  <h5 class="tx-18-px fw-500 mb-0">
                    {{ $t('About') }}
                  </h5>
                  <a
                    v-if="currentUser.username === user.username"
                    href="javascript:;"
                    class="text-primary"
                    @click="modalEditAbout"
                  >
                    {{ $t('Edit About') }}
                  </a>
                </div>
                <p class="tx-12-px txt-68748F" v-text="user.summary"></p>
              </div>
            </div>

            <div class="user-profile-box mt-30-px">
              <div class="p-20-px">
                <div class="d-flex justify-content-between align-items-center mb-20-px">
                  <h5 class="tx-18-px fw-500 mb-0">
                    {{ $t('Work Experience') }}
                  </h5>
                  <a
                    v-if="currentUser.username === user.username"
                    href="javascript:;"
                    class="text-primary"
                    @click="modalAddWorkExperience"
                  >
                    + {{ $t('Add New') }}
                  </a>
                </div>
                <div v-for="(workExperience, index) in workExperiences" :key="workExperience.id" class="media">
                  <div class="media-body">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-0 pb-0">
                          <span class="fw-600">{{ workExperience.position.name }}</span> at
                          {{ workExperience.company.name }}
                        </h6>
                        <span class="txt-9EA9C1">
                          {{ workExperience.date_start.formated }} -
                          {{ workExperience.date_finish.formated }}
                        </span>
                        <p v-text="workExperience.description"></p>
                      </div>
                      <div>
                        <div class="dropdown header-dropdown">
                          <div class="dropdown-toggle" data-toggle="dropdown">
                            <div class="p-2 txt-A7AFB7 txt-link">
                              <font-awesome-icon :icon="['fa', 'ellipsis-v']" style="font-size:16px" />
                            </div>
                          </div>
                          <div class="dropdown-menu dropdown-menu-right" style="min-width:140px; padding:6px 10px">
                            <a
                              class="header-dropdown-item"
                              style="margin-top:10px"
                              href="javascript:;"
                              @click="modalEditWorkExperience(workExperience)"
                            >
                              <font-awesome-icon :icon="['fa', 'pen']" style="font-size:16px" />
                              <span class="fw-600 ml-2">{{ $t('Edit') }}</span>
                            </a>
                            <a
                              class="header-dropdown-item"
                              href="javascript:;"
                              @click="deleteWorkExperience(workExperience, index)"
                            >
                              <font-awesome-icon :icon="['fa', 'trash']" style="font-size:16px" />
                              <span class="ml-2">{{ $t('Delete') }}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="profile === 'sessions'">
            <div class="ml-10-px">
              <div class="user-profile-box mt-30-px">
                <div class="p-20-px">
                  <h2 class="tx-18-px fw-500 mb-20-px">
                    <a href="javascript:;" title="Go back to Profile" alt="Go back to Profile" @click="goBackProfile">
                      <font-awesome-icon :icon="['far', 'angle-left']" class="text-primary" style="font-size:16px" />
                    </a>
                    <span class="ml-2">{{ $t('Sessions') }}</span>
                  </h2>
                  <table class="table">
                    <thead>
                      <tr>
                        <th width="120">IP</th>
                        <th>{{ $t('Browser') }}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(userLog, index) in userLogs" :key="index">
                        <td v-text="userLog.ipv4"></td>
                        <td v-text="userLog.agent"></td>
                        <td width="130" class="text-right" v-text="userLog.created_at.date_for_humans"></td>
                      </tr>
                    </tbody>
                  </table>

                  <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                    <b-pagination
                      hide-goto-end-buttons
                      class="paginator"
                      v-model="currentPage"
                      :total-rows="totalRows"
                      :per-page="perPage"
                      @change="getMyLogs"
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
          </div>

          <div v-show="profile === 'settings'">
            <div class="ml-10-px">
              <div class="user-profile-box mt-30-px">
                <div class="p-20-px">
                  <h2 class="tx-18-px fw-500 mb-20-px">
                    <a href="javascript:;" title="Go back to Profile" alt="Go back to Profile" @click="goBackProfile">
                      <font-awesome-icon :icon="['far', 'angle-left']" class="text-primary" style="font-size:16px" />
                    </a>
                    <span class="ml-2">{{ $t('Profile') }}</span>
                  </h2>

                  <b-alert v-if="profileUpdatedError" show variant="danger" dismissible>
                    {{ profileUpdatedError }}
                  </b-alert>

                  <b-alert v-if="profileUpdated" show variant="success" dismissible>
                    {{ profileUpdated }}
                  </b-alert>

                  <div class="row mb-10-px">
                    <div class="col-md-6">
                      <label class="form-label">
                        {{ $t('Fullname') }}
                        <span class="tx-danger">*</span>
                      </label>
                      <input v-model="user.name" maxlength="45" class="form-control" type="text" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">
                        {{ $t('Username') }}
                      </label>
                      <input v-model="user.username" maxlength="45" class="form-control" type="text" readonly />
                    </div>
                  </div>

                  <div class="row mb-10-px">
                    <div class="col-md-12">
                      <label class="form-label">
                        {{ $t('Email') }}
                        <span class="tx-danger">*</span>
                      </label>
                      <input v-model="user.email" maxlength="45" class="form-control" type="text" />
                    </div>
                  </div>

                  <div class="row mb-10-px">
                    <div class="col-md-6">
                      <label class="form-label">
                        {{ $t('Headline') }}
                      </label>
                      <input v-model="user.headline" maxlength="45" class="form-control" type="text" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ $t('Timezone') }}</label>
                      <v-select v-model="selectedTimezone" :options="timezones" label="label" :clearable="false" />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <label class="form-label">
                        {{ $t('Location') }}
                      </label>
                      <input v-model="user.location" maxlength="45" class="form-control" type="text" />
                    </div>

                    <div class="col-md-6">
                      <div class="row mt-20-px">
                        <div class="col-lg">
                          <UploadImage
                            :button-text="$t('Upload a Profile Photo')"
                            :options="avatarOptions"
                            :profile-image-round="false"
                            @get-image="updateAvatar"
                          ></UploadImage>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row mt-20-px">
                    <div class="col-md-6">
                      <b-button v-if="btnLoading" class="btn btn-primary">
                        <b-spinner small type="grow"></b-spinner>
                        {{ $t('Updating Profile...') }}
                      </b-button>

                      <button v-if="!btnLoading" class="btn btn-primary" type="submit" @click="updateUserDetails">
                        {{ $t('Update Profile') }}
                      </button>
                    </div>
                    <div class="col-md-6 text-right">
                      <a href="javascript:;" class="text-left text-danger tx-10-px" @click="deleteAccount">{{
                        $t('DELETE ACCOUNT')
                      }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <b-modal id="workExperience" size="md" title="Work Experience" @ok="saveWorkExperience">
        <div class="container">
          <div class="col-md-12">
            <div class="mb-2">
              <label class="form-label">
                {{ $t('Position') }}
                <span class="tx-danger">*</span>
              </label>
              <b-form-input
                v-model="work.position"
                :placeholder="$t('Position')"
                maxlength="255"
                required
              ></b-form-input>
            </div>

            <div class="mb-2">
              <label class="form-label">
                {{ $t('Company') }}
                <span class="tx-danger">*</span>
              </label>
              <b-form-input v-model="work.company" :placeholder="$t('Company')" maxlength="255" required></b-form-input>
            </div>

            <div class="mb-2">
              <b-form-checkbox id="checkbox-1" v-model="workPresent" value="true" unchecked-value="false">
                {{ $t('I am currently working in this role') }}
              </b-form-checkbox>
            </div>

            <div v-show="workPresent === 'false'" class="mb-2">
              <label class="form-label d-block">
                {{ $t('Start Date - End Date') }}
              </label>
              <DatePicker v-model="work.dateRange" range lang="en" type="date" confirm></DatePicker>
            </div>

            <div v-show="workPresent === 'true'" class="mb-2">
              <label class="form-label d-block">
                {{ $t('Start Date') }}
              </label>
              <DatePicker v-model="work.date" lang="en" type="date" confirm></DatePicker>
            </div>

            <hr />
            <div class="mb-2">
              <label class="form-label">
                {{ $tc('Description', 1) }}
              </label>
              <b-form-textarea
                v-model="work.description"
                :placeholder="$tc('Description', 1)"
                rows="6"
                max-rows="6"
              ></b-form-textarea>
            </div>
          </div>
        </div>
      </b-modal>
      <b-modal id="about" size="md" title="About You" @ok="saveAbout">
        <div class="container">
          <div class="col-md-12">
            <div class="mb-2">
              <label class="form-label">
                {{ $t('Profile Summary') }}
              </label>
              <b-form-textarea v-model="user.summary" placeholder="" rows="8" max-rows="6"></b-form-textarea>
              <small>{{ $t('Profile_Text') }}</small>
            </div>
          </div>
        </div>
      </b-modal>
      <b-modal id="skills" size="md" :title="$t('Skills')" @ok="saveSkills">
        <div class="container">
          <div class="col-md-12">
            <div class="mb-2">
              <label class="form-label"> </label>
              <v-select v-model="skills" taggable multiple label="title" />
              <small> </small>
            </div>
          </div>
        </div>
      </b-modal>
    </div>
  </Layout>
</template>
