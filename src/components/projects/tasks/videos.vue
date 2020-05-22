<script>
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'
import { taskManager } from '@state/helpers'

export default {
  components: { ListUsers },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      videos: [],
      loading: true,
      btnLoading: false,
      visible: true,
      totalRows: 0,
      totalPages: 1,
      perPage: 15,
      currentPage: this.$route.query.page ? this.$route.query.page : 1,
    }
  },
  computed: {
    ...taskManager,
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'video.addList' ){
        this.videos.push(data.item.object)
      }
    },
  },
  created() {
    this.getVideos(this.currentPage)
  },
  methods: {
    scrollToElem() {
      if (document.getElementById('task-videos')) {
        let top = document.getElementById('task-videos').offsetTop
        $('#b-modal-task').animate({ scrollTop: top }, 'slow')
      }
    },

    getVideos(page) {
      this.scrollToElem()
      this.loading = true
      Axios()
        .get(
          'videos/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug +
            '&task_uuid=' +
            this.task.uuid +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getVideos(1)
            return
          }
          this.videos = response.data.data
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
    removeVideo(video, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
        
          this.videos.splice(index, 1)
          Axios()
          .delete('videos/' + video.id)
          .then((response) => {
            this.task.stats.video -= 1
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
  <div v-if="videos[0]">
    <b-container class="mt-20-px">
      <b-row class="mb-10-px">
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'video']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Videos') }}</h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="1"></b-col>
        <b-col id="videos" cols="11" class="task-left-content">
          <silentbox-group>
            <div class="d-flex align-content-start flex-wrap">
              <div v-for="(video, index) in videos" :key="index" class="gallery-box mb-10-px">
                <div>

                  <b-dropdown v-if="authorize('tasks', 'delete', checkMyTask)" right class="gallery-dropdown styled-dropdown">
                    <template v-slot:button-content>
                      <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                    </template>
                    <b-dropdown-item @click="removeVideo(video, index)">
                      <font-awesome-icon :icon="['far', 'trash']"/>
                      {{ $t('Delete') }}
                    </b-dropdown-item>
                  </b-dropdown>

                  <silentbox-item :src="video.url" :description="video.title">
                    <div class="gallery-image">
                      <ListUsers :user="video.user" :link="true" size="22"></ListUsers>
                      <img :src="video.thumbnail" style="width:100%; position:relative; top:-50px" />
                    </div>
                  </silentbox-item>
                </div>

                <div class="mt-5-px">
                  <silentbox-item :src="video.url" :description="video.title">
                    <span
                      class="d-block tx-12-px fw-500 txt-6C7293 txt-link"
                      style="margin-bottom:-3px;"
                      :alt="video.title"
                      :title="video.title"
                    >
                      {{ video.title | truncate(52) }}
                    </span>
                    <span class="d-block tx-11-px txt-9EA9C1" v-b-popover.hover.top="video.created_at.timezone">
                      {{ video.created_at.date_for_humans }}
                    </span>
                  </silentbox-item>
                </div>
              </div>
            </div>
          </silentbox-group>
          <div v-if="totalPages > 1" class="d-flex justify-content-center mg-b-30">
            <b-pagination
              v-model="currentPage"
              hide-goto-end-buttons
              class="paginator"
              :total-rows="totalRows"
              :per-page="perPage"
              @change="getVideos"
            >
              <template slot="prev-text">
                <font-awesome-icon :icon="['far', 'angle-left']" style="font-size:18px; color: #909CB8;" />
              </template>
              <template slot="next-text">
                <font-awesome-icon :icon="['far', 'angle-right']" style="font-size:18px; color: #909CB8;" />
              </template>
            </b-pagination>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
