<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import TitleLoading from '@components/utils/title-loading'
import ButtonLoading from '@components/utils/button-loading'
import { modalManager } from '@state/helpers'

export default {
  page: {
    title: 'Sprints',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, ListUsers, TitleLoading, ButtonLoading },
  data() {
    return {
      loading: false,
      searchLoading: false,
      seachByProjectName: '',
      sprints: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      gridConfig: {
        style: [
          'max-width: 45px; padding: 13px 10px 15px 20px;',
          'max-width:543px; width:543px;',
          'max-width:127px; width:127px;',
          'max-width:120px; width:120px;',
          'max-width:158px; width:158px;',
          'max-width: 45px; padding-top:2px',
        ],
      },
      searchTerm: ''
    }
  },
  mounted() {
    this.getSprints(this.currentPage)
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    getSprints(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
        .get(
          'sprints/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&search=' + 
            this.searchTerm +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getSprints(1)
            return
          }
          this.sprints = response.data.data
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
          this.searchLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    search() {
      this.searchLoading = true
      this.sprints = []
      this.currentPage = 1
      this.getSprints(1)
      this.loading = false
    },
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
      <TitleLoading
        :title="$tc('Explore Sprints', totalRows)"
        :title-alternative="$t('Sprints')"
        :subtitle="$t('Sprint is one timeboxed iteration of a continuous cycle')"
        :loading="loading"
      ></TitleLoading>
    </template>

    <div slot="content" class="sprint pt-70px">
      
      <div class="container">

        <div class="d-flex justify-content-between mb-30-px">
          
          <div class="d-flex justify-content-end">
            <div class="form-group m-0">
              <div class="input-group">
                <input
                  v-model="searchTerm"
                  maxlength="45"
                  type="text"
                  class="form-control"
                  autocomplete="off"
                  :placeholder="$t('Search sprint')"
                  @keydown.enter.prevent="search"
                  style="height: 32px"
                />
                <div class="input-group-append">
                  <ButtonLoading
                    type="btn-sm"
                    mode="button"
                    :loading="searchLoading"
                    :fa-icon="'far'"
                    :icon="'search'"
                    @action="search"
                  ></ButtonLoading>
                </div>
              </div>
            </div>
            <div class="ml-20-px" v-if="authorize('sprints', 'create')">
              <button slot="button" type="button" class="btn btn-primary btn-sm" @click="modal('sprintCreate')">
                {{ $t('Create a Sprint') }}
              </button>
            </div>
          </div>
        </div>
        <div class="divTable">
          <div class="divTableHead">
            <div class="divTableRow">
              <div class="divTableCell text-center" :style="gridConfig.style[5]">
                <font-awesome-icon :icon="['far', 'columns']" style="font-size: 16px;" />
              </div>
              <div class="divTableCell text-left" :style="gridConfig.style[1]">
                {{ $t('Sprints List') }}
              </div>
              <div class="divTableCell text-right" :style="gridConfig.style[2]">{{ $t('Status') }}</div>
              <div class="divTableCell text-right" :style="gridConfig.style[3]">{{ $t('Completed') }}</div>
              <div class="divTableCell text-right" :style="gridConfig.style[4]">{{ $tc('Team', 1) }}</div>
            </div>
          </div>

          <div class="divTableBody">
            <div v-for="(sprint, index) in sprints" :key="index" class="divTableRowBg">
              <div class="divTableRow">
                <div class="divTableCell text-center" :style="gridConfig.style[0]">
                  <ListUsers :user="sprint.user" :link="true"></ListUsers>
                </div>
                <div class="divTableCell text-left" :style="gridConfig.style[1]">
                  <router-link
                    :to="{
                      name: 'projects.sprints.show',
                      params: {
                        companySlug: $route.params.companySlug,
                        projectSlug: $route.params.projectSlug,
                        sprintSlug: sprint.slug,
                      },
                    }"
                    class="txt-primary-title txt-link"
                  >
                    {{ sprint.code }} - {{ sprint.title }}
                  </router-link>
                  <p class="mb-0">
                    <span>{{ $t('Timebox') }}: {{ sprint.timebox }}</span>
                    /
                    <span> {{ $t('Duration') }}: {{ sprint.duration }} </span>
                  </p>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end pr-1" :style="gridConfig.style[2]">
                  <span class="badge badge-light" style="text-transform:uppercase;">
                    {{ sprint.status.title }}
                  </span>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[3]">
                  <span class="info">{{ sprint.stats.completed }}%</span>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end" :style="gridConfig.style[4]">
                  <ListUsers :users="sprint.users" :link="true"></ListUsers>
                </div>
                <div class="divTableCell d-flex align-items-center justify-content-end">
                  <span v-if="authorize('sprints', 'update')">
                    <router-link
                      :to="{
                        name: 'projects.sprints.assign-tasks',
                        params: {
                          companySlug: sprint.company.slug,
                          projectSlug: sprint.project.slug,
                          sprintSlug: sprint.slug,
                        },
                      }"
                    >
                      {{ $tc('Assign Tasks', 2) }}
                    </router-link>
                  </span>
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
            @change="getSprints"
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
  </Layout>
</template>
