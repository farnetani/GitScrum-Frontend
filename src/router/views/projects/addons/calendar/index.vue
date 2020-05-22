<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'

export default {
  page: {
    title: 'Calendar',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, FullCalendar },
  data() {
    return {
      dates: '',
      loading: true,
      events: [],
      calendarPlugins: [dayGridPlugin],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      Axios()
        .get(
          'calendar/?company_slug=' + this.$route.params.companySlug + '&project_slug=' + this.$route.params.projectSlug
        )
        .then((response) => {
          this.events = response.data.data
          this.loading = false
        })
        .catch((error) => {})
    },
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
      <TitleLoading
        :title="$t('Calendar')"></TitleLoading>
    </template>

    <div slot="content" class="calendar pt-60px">
      <div class="container">
        <div class="row mb-30-px">
          <div class="col-md-12 pr-0">
            <FullCalendar default-view="dayGridMonth" :events="events" :plugins="calendarPlugins" />
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss">
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';
</style>
