<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import Alert from '@components/utils/alert'

export default {
  page: {
    title: 'Teammates - Audit log',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, Alert },
  data() {
    return {
      teammates: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      alertMessage: '',
      alertStatus: false,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      currentUserEmail: null,
      loading: true,
    }
  },
  mounted() {
    this.getAuditLogs(this.currentPage)
  },
  methods: {
    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getAuditLogs(page) {
      this.scrollToTop()
      this.loading = true
      Axios()
        .get('team-members/invitations?company_slug=' + this.currentCompany.slug + '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getTasks(1)
            return
          }
          this.currentUserEmail = response.data.currentUserEmail
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

    deleteInvitation(row) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          Axios()
          .delete('team-members/invitations/?company_slug=' + this.currentCompany.slug + '&id=' + row.item.id)
          .then((response) => {
            this.teammates.splice(row.index, 1)
            this.alertStatus = true
            this.alertMessage = response.data.data.message
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

    onClickPaginationEventhandler(page) {
      if (this.lastVisitedPage === page) {
        return
      }
      this.currentPage = page
      this.lastVisitedPage = this.currentPage
      this.getAuditLogs()
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="col-sm-12">
      <div class="row">
        <div class="col-sm-4 pr-0 mb-4">
          <div class="d-lg-flex">
            <TitleLoading
              :title="$t('Audit Log')"
              :loading="loading"
              addclass="text-dark font-weight-bold mb-0 mr-5"
            ></TitleLoading>
          </div>
        </div>

        <div class="col-sm-12">
          <Alert :message="alertMessage" :status="alertStatus"></Alert>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th></th>
                <th width="220">Created</th>
                <th width="20"></th>
                <th width="20"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(teammate, index) in teammates" :key="index">
                <td>
                  <strong>{{ teammate.name }}</strong>
                </td>
                <td>
                  <strong>{{ teammate.email }}</strong>
                </td>
                <td>{{ teammate.accepted_at }}</td>
                <td>{{ teammate.created_at }}</td>
                <td>
                  <a
                    v-if="teammate.creator.email === currentUserEmail && teammate.accepted_at === null"
                    href="javascript:;"
                    alt="Resend"
                    title="Resend"
                    @click="resendInvitation(teammate)"
                  >
                    <i class="fas fa-sync"></i>
                  </a>
                </td>
                <td>
                  <a
                    v-if="teammate.creator.email === currentUserEmail && teammate.accepted_at === null"
                    href="javascript:;"
                    alt="Delete"
                    title="Delete"
                    @click="deleteInvitation(row)"
                  >
                    <i class="far fa-trash-alt"></i
                  ></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <b-pagination
          hide-goto-end-buttons
          class="paginator"
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          @change="getAuditLogs"
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
