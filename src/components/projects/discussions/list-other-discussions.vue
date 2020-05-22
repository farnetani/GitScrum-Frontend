<script>
import Axios from '@utils/axios'

export default {
  props: {
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      discussions: [],
      limit: 3,
    }
  },
  created() {
    this.getDiscussions()
  },
  methods: {
    getDiscussions() {
      this.loading = true

      Axios()
        .get(
          'comments/?company_slug=' +
            this.companySlug +
            '&project_slug=' +
            this.projectSlug +
            '&commentable_type=projects' +
            '&commentable_id=null' +
            '&limit=' +
            this.limit
        )
        .then((response) => {
          this.discussions = response.data.data
          this.loading = false
        })
        .catch((error) => {
          console.error(error)
        })
    },

    getRepliesCount(data) {
      let total = data.length

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          if (this.getRepliesCount(data[i].replies)) {
            total += data[i].replies.length
          }
        }
      }

      return total
    },
  },
}
</script>

<template>
  <div class="other-discussions">
    <div class="title">
      <span class="d-flex d-flex-wrap">{{ $t('Other discussions') }}</span>
      <div class="d-flex space-loading">
        <b-spinner v-show="loading" :label="$t('Loading')" small class="title-loading"></b-spinner>
      </div>
    </div>

    <div v-if="!loading" class="list">
      <div v-for="(discussion, index) in discussions" :key="index" class="discussion">
        <div class="row mt-20-px mb-8-px">
          <div class="col-sm-12">
            <div>
              <router-link
                :to="{
                  name: 'projects.discussions.show',
                  params: {
                    companySlug: companySlug,
                    discussionId: discussion.id,
                  },
                }"
                class="tx-12-px cursor-pointer txt-primary-title"
              >
                {{ discussion.comment | truncate(120) }}
              </router-link>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div class="comments fw-normal tx-11-px txt-9EA9C1">
              <font-awesome-icon :icon="['far', 'comments-alt']" style="font-size: 16px;" />
              <span class="tx-11-px txt-68748F ml-2">
                {{ $t('Comments') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
