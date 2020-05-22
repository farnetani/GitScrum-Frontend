<script>
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import { taskManager } from '@state/helpers'

export default {
  components: { ListUsers },
  props: {
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: false,
      default: '',
    },
    taskSlug: {
      type: String,
      required: false,
      default: '',
    },
    context: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      activities: [],
      loading: true,
      restricted: false,
    }
  },
  computed: {
    ...taskManager,
  },
  watch: {
    statusTask(data){
      this.loading = true
      this.getActivities()
    },
  },
  created() {
    this.getActivities()
  },
  methods: {
    getActivities() {
      let endpoint = '?company_slug=' + this.companySlug

      if (this.projectSlug !== '') {
        endpoint += '&project_slug=' + this.projectSlug
      }

      if (this.taskSlug !== '') {
        endpoint += '&slug=' + this.taskSlug
      }

      endpoint += '&from_context=' + this.context

      Axios()
        .get('activities/' + endpoint)
        .then((response) => {
          this.loading = false
          this.activities = response.data.data
        })
        .catch((e) => {
          this.loading = false
          this.restricted = true
        })
    },
  },
}
</script>

<template>
  <div class="">
    <b-spinner v-show="loading" :label="$t('Loading')" variant="secondary" small></b-spinner>
    <div v-if="!restricted">
      <div
        v-for="item in activities"
        :key="item.id"
        class="d-flex align-items-center ml-7-px mt-10-px tx-12-px txt-1E1E2F"
      >
        <ListUsers :user="item.user" :link="true" size="30"></ListUsers>
        <div class="ml-10-px">
          <router-link
            :to="{
              name: 'profile.user',
              params: { username: item.user.username },
            }"
            class="fw-600 txt-1E1E2F"
            v-text="item.user.name"
          >
          </router-link>
          <span class="ml-5-px fw-500" v-text="item.message"></span>
          <div class="tx-11-px lh-13-px txt-A7AFB7" :title="item.created_at.timezone">
            {{ item.created_at.date_for_humans }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
