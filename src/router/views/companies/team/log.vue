<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import SideBar from '@components/companies/side-bar'
import ListUsers from '@components/utils/list-users'
import Alert from '@components/utils/alert'
import Ads from '@components/utils/ads'

export default {
  page: {
    title: 'Company Team',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, Alert, SideBar, ListUsers, Ads },
  data() {
    return {
      teammates: [],
      inviteNames: [],
      inviteEmails: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      alertMessage: '',
      alertStatus: false,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      loading: false,
      gridConfig: {
        style: [
          '',
          'max-width:200px; width:200px;',
          'max-width:60px; width:60px;',
        ],
      },
      currentUserEmail: null,
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
      Axios()
        .get('team-members/invitations/?company_slug=' + this.currentCompany.slug + '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getTeammates(1)
            return
          }
          this.currentUserEmail = response.data.currentUserEmail
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

    deleteInvitation(item) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          
          this.loading = true
          Axios()
          .delete('team-members/invitations/?company_slug=' + this.currentCompany.slug + '&id=' + item.id)
          .then((response) => {
            this.getTeammates(this.currentPage)
            this.alertStatus = true
            this.alertMessage = response.data.data.message
            this.loading = false
          })
            
        }

      })

    },

    resendInvitation(row) {
      Axios()
        .get('team-members/invitations/resend?company_slug=' + this.currentCompany.slug + '&id=' + row.id)
        .then((response) => {
          this.alertStatus = true
          this.alertMessage = response.data.data.message
        })
        .catch((e) => {
          console.error(e)
        })
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
              :title="$t('See the people you have already invited')"
              :loading="loading"
              addclass="text-dark font-weight-bold mb-0 mr-5"
            >
            </TitleLoading>
            
          </div>

          <Alert :message="alertMessage" :status="alertStatus" class="mt-10-px"></Alert>

          <div>
            <router-link :to="{ 'name': 'companies.teams.index' }" class="txt-link txt-68748F">
                <font-awesome-icon :icon="['far', 'angle-left']" class="mr-5-px" />
                {{ $t('Go Back Team Members')}}
            </router-link>
          </div>

          <div class="divTable mt-20-px">
            <div class="divTableHead">
              <div class="divTableRow">
                <div class="divTableCell text-left" :style="gridConfig.style[0]">{{ $t('Name') }} </div>
                <div class="divTableCell text-center" :style="gridConfig.style[1]">
                  {{ $t('Accepted at') }}
                </div>
                <div class="divTableCell text-right" :style="gridConfig.style[2]">
                  {{ $t('Resend') }}
                </div>
                <div class="divTableCell text-right" :style="gridConfig.style[2]">
                  {{ $t('Delete') }}
                </div>
              </div>
            </div>

            <div class="divTableBody">
              <div v-for="(item, index) in teammates" :key="index" class="divTableRowBg">
                <div class="divTableRow">
                  <div class="divTableCell text-left" :style="gridConfig.style[0]">
                    <span v-text="item.name"></span>
                    <div class="tx-12-px txt-68748F">
                      <span v-text="item.email"></span>
                    </div>
                  </div>
                  <div
                    class="divTableCell text-left d-flex align-items-center"
                    :style="gridConfig.style[1]" >
                    
                    <span v-if="item.accepted_at" class="txt-11-px" v-text="item.accepted_at"></span>
                  
                  </div>
                  <div
                    class="divTableCell text-right d-flex align-items-center"
                    :style="gridConfig.style[2]" >
                    <a
                        v-if="item.creator.email !== currentUserEmail && item.accepted_at === null"
                        href="javascript:;"
                        alt="Resend"
                        title="Resend"
                        @click="resendInvitation(item)" >
                        <font-awesome-icon :icon="['fal', 'paper-plane']" class="ml-5-px" />
                    </a>
                  </div>
                  <div
                    class="divTableCell text-right d-flex align-items-center"
                    :style="gridConfig.style[2]"
                  >
                    <a
                        v-if="item.creator.email !== currentUserEmail && item.accepted_at === null"
                        href="javascript:;"
                        alt="Delete"
                        title="Delete"
                        @click="deleteInvitation(item)" >
                        <font-awesome-icon :icon="['fal', 'trash-alt']" class="ml-5-px" />
                    </a>
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
