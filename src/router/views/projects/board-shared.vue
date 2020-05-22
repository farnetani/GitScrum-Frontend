<script>
import Layout from '@layouts/tpl-main-large-shared'
import Axios from '@utils/axios'
import BoardTask from '@components/projects/board-task-public'

export default {
  page: {
    title: 'Board',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    BoardTask,
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      width: 0,
      token: '',
      colorColumn: '#000000',
      workflows: [],
      boxNewColumn: false,
      nameColumn: '',
    }
  },
  mounted() {
    this.getWorkflows()
    this.token = this.$route.params.token;
  },
  methods: {
    getWorkflows() {
      Axios()
        .get('share-board/public/' + this.$route.params.token + '/')
        /*
        .get(
          'projects-workflows/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        */
        .then((response) => {
          this.workflows = response.data.data
          this.width = this.workflows.length * 295 + 280
          this.loading = true
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
    <div slot="content" class="">
      <div class="ui">
        <div class="lists" :style="'width:' + width + 'px'">
          <b-spinner v-show="!loading" :label="$t('Loading')" variant="secondary" small class="mg-l-6"></b-spinner>

          <div class="">
            <div
              class="list row"
              style="min-width: calc(100% + 40px);"
            >
              <li
                v-for="workflow in workflows"
                :key="workflow.id"
                class="draggableColumn"
                style="max-height: calc(100vh - 40px) !important;"
              >
                <BoardTask :workflow="workflow" :token="token"></BoardTask>
              </li>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>