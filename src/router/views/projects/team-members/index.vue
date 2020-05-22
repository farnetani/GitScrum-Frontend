<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import ListUsers from '@components/utils/list-users'
import Alert from '@components/utils/alert'
import Invite from '@components/projects/team-members/invite'

export default {
  page: {
    title: 'Project Team Members',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, ListUsers, Alert, Invite },
  data() {
    return {
      teammates: [],
      listTeammates: [],
      
      permissions: [],
      selectedTeamMembers: [],
      listCompanyTeamMembers: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      alertMessage: '',
      alertStatus: false,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      loading: true,
      btnLoading: false,
      showInvite: false,
      newOwner: null,
      linkCopied: false,
      emailExpression: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
      sendInvitesLoading: false,
      
    }
  },
  
  mounted() {
    this.getTeamMembers(this.currentPage)
    
    this.getPermissions()
    this.getTeammates()
  },
  methods: {
    getTeamMembers(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
        .get(
          '/project-team-members/' +
          '?company_slug=' +
          this.$route.params.companySlug+
          '&project_slug=' +
          this.$route.params.projectSlug +
          '&page=' +
          page
        )
        .then((response) => {
          this.teammates = response.data.data
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

    getPermissions() {
      Axios()
        .get(
          'projects-users-roles/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.permissions = []
          let arr = response.data.data
          for (let i = 0; i < arr.length; i++) {
            let key = Object.keys(arr[i])
            this.permissions.push(key[0])
          }
        })
        .catch((e) => {})
    },
    
    remove(username, name, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove XXX from project?', { username: name }), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.loading = true
          Axios()
            .delete(
              'project-team-members/' +
                '?company_slug=' +
                this.$route.params.companySlug +
                '&project_slug=' +
                this.$route.params.projectSlug +
                '&username=' +
                username
            )
            .then((response) => {
              this.$store.dispatch('project/setProject', null)
              this.getTeamMembers()
            })
            .catch((e) => {
              // console.error(e)
              this.loading = true
            })
        }
      })

    },

    
    
    updateRole(role, username) {
      Axios()
        .post(
          'projects-users-roles/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            username: username,
            role_name: role,
          }
        )
        .then((response) => {
          this.getTeamMembers()
        })
      // .catch((e) => {
      //   console.error(e)
      // })
    },
    changeOwner() {
      Axios()
        .post(
          'project-team-members/transfer/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            username: this.newOwner.code,
          }
        )
        .then((response) => {
          this.newOwner = null
          this.getTeamMembers()
        })
      // .catch((e) => {
      //   console.error(e)
      // })
    },
    
    getTeammates() {
      this.loading = true
      Axios()
        .get('team-members/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          let arr = []
          let data = response.data.data

          for (let i = 0; i < data.length; i++) {
            if (!data[i]['user']['is_leader']) {
              arr.push({
                code: data[i]['user']['username'],
                label: data[i]['user']['name'],
                avatar: data[i]['user']['avatar'],
                headline: data[i]['user']['headline'],
                company_owner: data[i]['status']['company_owner'],
              })
            }
          }
          this.loading = false
          this.listTeammates = arr
        })
        .catch((e) => {
          this.loading = false
          // console.error(e)
        })
    },
  },
}
</script>

<template>
  <Layout>

    <template slot="header-left">
      <TitleLoading :title="$t('Project Team Members')" :loading="loading"></TitleLoading>
    </template>

    <template slot="header-right"></template>

    <div slot="content" class="project-members pt-60px">
      
      <div class="container-fluid">

        <div class="d-flex justify-content-center">
          
          <div class="d-flex justify-content-center flex-wrap">
            <div v-for="(item, index) in teammates" :key="index" class="box shadow-sm">
            
              <div class="avatar">
                <ListUsers :user="item.user" :link="true" size="68"></ListUsers>
              </div>
              <div class="box-inner">
                <p class="name">
                  <router-link
                    :to="{
                      name: 'profile.user',
                      params: { username: item.user.username },
                    }"
                    v-text="item.user.name" />
                </p>
                <p class="headline" v-text="item.user.headline"></p>
                
                <a
                  v-if="!item.is_leader"
                  class="user-remove"
                  href="javascript:;"
                  @click="remove(item.user.username, item.user.name, index)"
                >
                  {{ $t('Remove') }}
                </a>
                
                <div class="user-role">
                  <b-dropdown v-if="!item.is_leader && authorize('teamMembers', 'update')" 
                    :text="item.role.name" right 
                    class="styled-dropdown badge-team-members"
                    
                    >
                    <template v-slot:button-content>
                      <div :style="'background:' + item.color">
                        <span>{{ item.role.name | capitalize }}</span>
                        <font-awesome-icon :icon="['far', 'angle-down']" style="position:relative; margin-left:4px;" />
                      </div>
                    </template>
                    <b-dropdown-item 
                      v-for="(permission, i) in permissions"
                      :key="i"
                      href="#"
                      @click="updateRole(permission, item.user.username)">
                        {{ permission | capitalize }}
                      </b-dropdown-item>
                  </b-dropdown>
                  <div v-if="!item.is_leader && !authorize('teamMembers', 'update')" class="styled-dropdown badge-team-members">
                    <div :style="'background:' + item.color">
                      <span> {{ item.role.name | capitalize }}</span>
                    </div>
                  </div>

                  <div v-show="item.is_leader" class="styled-dropdown badge-team-members">
                    <div :style="'background:' + item.color">
                      <span>{{ $t('Project Leader') }}</span>
                    </div>
                  </div>
                </div>

                <div class="header-project-collaboration text-center">
                  <p>{{ $t('Contribution') }}: {{ parseFloat(item.contribution) | percent(0) }}</p>
                  <b-progress class="project-list-progress" :value="item.contribution" :max="100"></b-progress>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <b-pagination
          v-model="currentPage"
          hide-goto-end-buttons
          class="paginator"
          :total-rows="totalRows"
          :per-page="perPage"
          @change="getTeamMembers"
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
  </Layout>
</template>
