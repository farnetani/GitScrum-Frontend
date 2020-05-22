
<!--
<script>
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import { modalManager } from '@state/helpers'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: { vSelect, TitleLoading },
  data() {
    return {
      loading: true,
      btnLoading: false,
      permissions: [],
      teammates: [],
      selectedTeamMembers: [],
      listCompanyTeamMembers: [],
      role: [],
      fields: [
        {
          key: 'user.photo',
          label: '',
          sortable: false,
          class: 'wd-20 align-middle',
        },
        {
          key: 'user.name',
          label: 'Name',
          sortable: true,
          class: 'align-middle',
        },
        {
          key: 'role',
          label: 'Permission',
          sortable: false,
          class: 'align-middle',
        },
        {
          key: 'trash',
          label: '',
          sortable: false,
          class: 'wd-30 text-right',
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 20,
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      alertMessage: '',
      alertStatus: false,
    }
  },
  computed: {
    ...modalManager,
  },
  watch: {
    statusModal(object) {
      if (object.item.name === 'projectTeam') {
        object.item.name = ''
        this.getPermissions()
        this.getTeam()
        this.getListCompanyTeamMembers()
        this.$refs['modal'].show()
      }
    },
  },
  methods: {
    hideModal() {
      
      this.closeModal(this.$refs['modal'])
    },
    toggleModal() {
      this.$refs['modal'].toggle('#toggle-btn')
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
    getTeam() {
      Axios()
        .get(
          'project-team-members/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.loading = false
          this.teammates = response.data.data
        })
        .catch((e) => {})
    },
    addTeamMember() {
      this.btnLoading = true
      Axios()
        .post(
          'project-team-members/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            users: this.selectedTeamMembers,
          }
        )
        .then((response) => {
          this.btnLoading = false
          this.selectedTeamMembers = null
          this.getTeam()
          this.getListCompanyTeamMembers()
        })
        .catch((e) => {})
    },
    deleteTeamMember(username, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
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
              this.getTeam()
              this.getListCompanyTeamMembers()
            })
            .catch((e) => {
              console.error(e)
            })
        }
      })

    },
    getListCompanyTeamMembers() {
      Axios()
        .get(
          'project-team-members/not-added/' +
            '?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          let arr = []
          let data = response.data.data

          for (let i = 0; i < data.length; i++) {
            arr.push({
              code: data[i]['user']['username'],
              label: data[i]['user']['name'],
            })
          }
          this.loading = false
          this.listCompanyTeamMembers = arr
        })
        .catch((e) => {})
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
        .then((response) => {})
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
</script>

<template>
  <b-modal ref="modal" hide-footer lazy size="xl" title="Project Team">
    <div class="row">
      <div class="col-md-3 modal-background"></div>
      <div class="col-md-9">
        <div class="pd-25">
          <h3 class="mg-b-30">
            <TitleLoading title="Project Team" :loading="loading">
            </TitleLoading>
          </h3>

          <div class="mg-b-20">
            <h6>Assign Team Members</h6>
            <v-select
              v-model="selectedTeamMembers"
              :options="listCompanyTeamMembers"
              multiple
            >
            </v-select>

            <div class="mg-t-5">
              <b-button
                v-if="btnLoading"
                variant="primary"
                class="btn btn-primary font-weight-bold"
              >
                <b-spinner small type="grow"></b-spinner>
                Adding ...
              </b-button>

              <button
                v-if="!btnLoading"
                class="btn btn-primary font-weight-bold"
                type="submit"
                @click="addTeamMember"
              >
                Add Project Member
              </button>
            </div>
          </div>

          <h6 class="mg-b-20">List Team Members</h6>

          <table class="table">
            <thead>
              <tr>
                <th class="wd-5p">&nbsp;</th>
                <th class="wd-45p">Name</th>
                <th>Status</th>
                <th>Can be create Project</th>
                <th width="20"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(teammate, index) in teammates" :key="index">
                <td class="align-middle">
                  <div class="az-img-user">
                    <router-link
                      :to="{
                        name: 'profile.user',
                        params: { username: teammate.user.username },
                      }"
                    >
                      <img :src="teammate.user.avatar" class="rounded-circle" />
                    </router-link>

                  </div>
                </td>
                <td class="align-middle">
                  <router-link
                    :to="{
                      name: 'profile.user',
                      params: { username: teammate.user.username },
                    }"
                    class="tx-inverse tx-bold"
                    >{{ teammate.user.name }}
                  </router-link>
                </td>
                <td class="align-middle">
                  <span
                    v-if="!teammate.status.company_owner"
                    style="cursor:pointer"
                    :class="[
                      teammate.status.current === 'active'
                        ? 'text-success'
                        : 'text-danger',
                    ]"
                    @click="updateStatusCurrent(teammate.user.username)"
                  >
                    {{ teammate.status.current }}
                  </span>
                </td>
                <td class="align-middle">
                  <v-select
                    v-if="row.item.is_leader === false"
                    v-model="role[row.item.user.username]"
                    :value="row.item.role.name"
                    :options="permissions"
                    :allow-empty="false"
                    label="name"
                    @input="updateRole($event, teammate.user.username)"
                  ></v-select>
                  <span v-if="teammate.is_leader === true">Project Leader</span>
                </td>
                <td class="align-middle"> </td>
              </tr>
            </tbody>
          </table>

          <b-table
            v-show="!loading"
            ref="table"
            show-empty
            stacked="md"
            :items="teammates"
            :fields="fields"
            :current-page="currentPage"
            :per-page="perPage"
            :filter="filter"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
          >
            <template slot="user.photo" slot-scope="row">
              <div class="az-img-user avatar-xs">
                <router-link
                  :to="{
                    name: 'profile.user',
                    params: { username: row.item.user.username },
                  }"
                >
                  <img :src="row.item.user.avatar" class="rounded-circle" />
                </router-link>
              </div>
            </template>

            <template slot="user.name" slot-scope="row">
              <span class="tx-13">
                <router-link
                  :to="{
                    name: 'profile.user',
                    params: { username: row.item.user.username },
                  }"
                  >{{ row.value }}
                </router-link>
              </span>
            </template>

            <template slot="role" slot-scope="row">
              <v-select
                v-if="row.item.is_leader === false"
                v-model="role[row.item.user.username]"
                :value="row.item.role.name"
                :options="permissions"
                :allow-empty="false"
                label="name"
                @input="updateRole($event, row.item.user.username)"
              ></v-select>
              <span v-if="row.item.is_leader === true">Project Leader</span>
            </template>

            <template slot="trash" slot-scope="row">
              <a
                href="javascript:;"
                @click="deleteTeamMember(row.item.user.username, row.index)"
              >
                <i class="fas fa-times"></i>
              </a>
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </b-modal>
</template>
-->