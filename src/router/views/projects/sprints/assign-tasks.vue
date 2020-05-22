<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import { modalManager } from '@state/helpers'
import AssignCards from '@components/utils/assign-cards'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  page: {
    title: 'Sprint Assign Tasks',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    vSelect,
    AssignCards,
    TitleLoading,
  },
  data() {
    return {
      loading: true,
      assignLoading: false,
      tasks: [],
      data: [],
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
      filtered: [],
      searchByName: '',
      assignedTasks: [],
    }
  },
  watch: {
    searchByName() {
      this.searchTitle()
    },
  },
  mounted() {
    this.getSprint()
    this.getTasks(1)
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },

    getSprint() {
      Axios()
        .get('sprints/' + this.$route.params.sprintSlug + 
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug)
        .then((response) => {
          this.data = response.data.data
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getTasks(page) {
      this.gotoScrollTop()
      this.loading = true
      Axios()
        .get(
          'tasks/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&page=' +
            page
        )
        .then((response) => {
          this.tasks = response.data.data
          this.filtered = this.tasks
          this.assignedTasks = this.filtered.filter((data) => data.sprint.title)
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
    assignTask(payload) {
      this.assignLoading = true
      Axios()
        .put(
          'tasks/' +
            payload.item.uuid +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            sprint_id: payload.id,
          }
        )
        .then((response) => {
          this.tasks[payload.index] = response.data.data
          this.filtered = this.tasks
          this.assignedTasks = this.filtered.filter((data) => data.sprint.title)
          this.assignLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    filterLabels(value) {
      this.filter = 'must'
    },
    searchTitle() {
      let titleStr = this.searchByName.toUpperCase()
      this.filtered = this.tasks.filter((task) => {
        return task.title.toUpperCase().includes(titleStr)
      })
    },
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
     <TitleLoading
        :title="$t('Sprints')"
        :subtitle="$t('Sprint is one timeboxed iteration of a continuous cycle')"
      >
      </TitleLoading>
    </template>

    <div slot="content" class="sprint pt-70px">
      
      <div class="container">

        <div class="d-flex justify-content-between mb-30-px">
          <div>
            <h1 class="txt-001737 tx-24-px fw-600 lh-30-px m-0" v-text="data.title"></h1>
          </div>
          <div>
            <router-link
              :to="{
                name: 'projects.sprints.show',
                params: { projectSlug: data.project.slug, sprintSlug: data.slug },
              }"
              class="mr-10-px"
            >
              {{ $t('Go back to Sprint') }}
            </router-link>
          </div>
        </div>
        <div class="d-flex justify-content-between mb-30-px">
          <div>
            <TitleLoading
              :title="$tc('Explore Tasks', tasks.length)"
              :title-alternative="$t('Tasks')"
              :subtitle="$t('Assign tasks to this Project Sprint')"
              :loading="loading"
            >
            </TitleLoading>
          </div>
          <div class="d-flex justify-content-end page-filters">
            <input
              v-model="searchByName"
              class="form-control search-box"
              :placeholder="$t('Search by title')"
              type="search"
            />
          </div>
        </div>
        <AssignCards
          :items="filtered"
          :assigneds="assignedTasks"
          :data="data"
          :loading="assignLoading"
          feature-title="Sprint"
          guest="sprint"
          @assign="assignTask"
        />
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
          <b-pagination
            v-model="currentPage"
            hide-goto-end-buttons
            class="paginator"
            :total-rows="totalRows"
            :per-page="perPage"
            @change="getTasks"
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
