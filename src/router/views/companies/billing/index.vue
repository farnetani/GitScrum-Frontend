<script>
import Layout from '@layouts/tpl-main'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import SideBar from '@components/companies/side-bar'
import Alert from '@components/utils/alert'
import Ads from '@components/utils/ads'

export default {
  page: {
    title: 'Company Billing',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, SideBar, Alert, Ads },
  data() {
    return {
      invoices: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      alertMessage: '',
      alertStatus: false,
      isCanceled: null,
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      loading: false,
      gridConfig: {
        style: [
          '',
          'max-width:250px; width:250px;',
          '',
          'max-width:140px; width:140px;',
          'max-width: 140px; width:140px',
        ],
      },
    }
  },
  mounted() {
    this.getSubscriptions(this.currentPage)
    this.getIsCanceled()
  },
  methods: {
    scrollToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },

    getSubscriptions(page) {
      this.scrollToTop()
      this.loading = true
      Axios()
        .get('invoices/?company_slug=' + this.currentCompany.slug + '&page=' + page)
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getSubscriptions(1)
            return
          }
          this.invoices = response.data.data
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

    getIsCanceled() {
      Axios()
        .get('subscriptions/canceled')
        .then((response) => {
          this.isCanceled = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },

    cancelSubscriptions() {
      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to cancel your subscription?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){

          Axios()
          .delete('subscription/?company_slug=' + this.currentCompany.slug)
          .then((response) => {
            location.reload();
          })
          .catch((e) => {
            console.error(e)
          })

        }
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
          <div class="d-lg-flex">
            <TitleLoading
              :title="$t('Billing')"
              :loading="loading"
              addclass="text-dark font-weight-bold mb-0 mr-5"
            ></TitleLoading>
          </div>

          <div class="divTable mt-20-px">
            <div class="divTableBody d-flex bd-highlight">
              <div class="divTableRowBg p-2 flex-fill bd-highlight mr-15-px p-3">
                <span class="d-block tx-18-px fw-600">{{ currentCompany.stats.plan.title }}</span>
                <span v-if="currentCompany.stats.plan.users === 'Unlimited'" class="txt-12-px">
                  {{ $t('Unlimited users') }}
                </span>
                <span v-else  class="txt-12-px">
                  {{ $t('up to users', { users: currentCompany.stats.plan.users }) }}
                </span>
              </div>
              <div v-if="currentCompany.stats.plan.interval === 'monthly' && currentCompany.stats.plan.plan !== ''" class="divTableRowBg p-2 flex-fill bd-highlight p-3 text-right">
                <a v-if="!isCanceled" href="javascript:;" class="tx-12-px" @click="cancelSubscriptions">{{ $t('Cancel Subscription') }}</a>
                <span v-else>{{ $t('Subscription must be canceled at') }}<span class="d-block tx-12-px fw-600">{{ isCanceled }}</span></span>
              </div>
            </div>
          </div>

          <div v-show="!totalRows">
            <Ads type="large"></Ads>
          </div>

          <Alert :message="$t('You do not have an invoice')" :status="!totalRows" class="mg-b-20"></Alert>

          <div class="divTable mt-20-px">
            <div v-show="totalRows" class="divTableHead">
              <div class="divTableRow">
                <div class="divTableCell text-left" :style="gridConfig.style[1]">{{ $t('Invoice Document') }}</div>
                <div class="divTableCell text-left" :style="gridConfig.style[2]">{{ $t('Subscription') }} </div>
                <div class="divTableCell text-center" :style="gridConfig.style[3]">
                  {{ $t('Date') }}
                </div>
                <div class="divTableCell text-center" :style="gridConfig.style[4]">
                  {{ $t('Period') }}
                </div>
              </div>
            </div>

            

            <div class="divTableBody">
              <div v-for="(item, index) in invoices" :key="index" class="divTableRowBg">
                <div class="divTableRow">
                  <div class="divTableCell text-left" :style="gridConfig.style[1]">
                    <a :href="item.document_url.data.url" target="_blank">
                      {{ item.document_id }} {{ $t('Invoice Download') }}
                    </a>
                  </div>
                  <div class="divTableCell text-left" :style="gridConfig.style[2]">
                    <span v-text="item.name"></span>
                  </div>
                  <div class="divTableCell text-left" :style="gridConfig.style[3]">
                    <span v-text="item.date"></span>
                  </div>
                  <div class="divTableCell text-left" :style="gridConfig.style[4]">
                    <span v-text="item.period.name"></span>
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
              @change="getSubscriptions"
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
