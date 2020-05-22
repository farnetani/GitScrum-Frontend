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
      attachments: [],
      loading: true,
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
      if ( data.item.name === 'attachment.reload' ){
        this.getAttachments(this.currentPage)
      }
    },
  },
  created() {
    this.getAttachments(this.currentPage)
  },
  methods: {
    checkMyTask() {
      let isMine = false

      if (this.task) {
        let currentUser = JSON.parse(localStorage.getItem('CURRENT_USER'))

        if (this.task.user.username === currentUser.username) {
          isMine = true
        } else {
          isMine = false
        }
      }

      return isMine
    },

    scrollToElem() {
      if (document.getElementById('task-attachments')) {
        let top = document.getElementById('task-attachments').offsetTop
        $('#b-modal-task').animate({ scrollTop: top }, 'slow')
      }
    },

    getAttachments(page) {
      this.scrollToElem()
      this.loading = true
      Axios()
        .get(
          'attachments/?company_slug=' +
            this.task.company.slug +
            '&project_slug=' +
            this.task.project.slug +
            '&attachmentable_type=issues' +
            '&attachmentable_id=' +
            this.task.uuid +
            '&page=' +
            page
        )
        .then((response) => {
          if (response.data.data.length === 0 && page !== 1) {
            this.getAttachments(1)
            return
          }
          this.attachments = response.data.data
          if (response.data.data[0] && response.data.data[0].download && response.data.data[0].download.url) {
            this.task.image = response.data.data[0].download.url
          }
          this.totalRows = response.data.total
          this.totalPages = response.data.total_pages
          this.perPage = response.data.per_page
          this.currentPage = response.data.current_page
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
        })
    },
    removeAttachment(attachment, index) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.attachments.splice(index, 1)
          Axios()
            .delete('attachments/' + attachment.id)
            .then((response) => {
              this.task.stats.attachments -= 1

              if (this.attachments[0] && this.attachments[0].mimetype.includes('image')) {
                this.task.image = this.attachments[0].download.url
              } else {
                this.task.image = null
              }
            })
        }
      })

    },
    isImage(attachment) {
      return attachment.mimetype.includes('image')
    },

    getIconByType(type) {
      let icon = ''
      switch (type) {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.oasis.opendocument.spreadsheet':
          icon = '-excel'
          break
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessing':
          icon = '-word'
          break
        case 'application/pdf':
          icon = '-pdf'
          break
        case 'text/plain':
          icon = '-alt'
          break
        default:
          icon = ''
      }

      return icon
    },
  },
}
</script>

<template>
  <div v-if="attachments[0]">
    <b-container class="mt-20-px">
      <b-row class="mb-10-px">
        <b-col cols="1" class="task-left-icon">
          <font-awesome-icon :icon="['far', 'paperclip']" />
        </b-col>
        <b-col cols="11" class="task-left-content">
          <h5>{{ $t('Attachments') }}</h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="1"></b-col>
        <b-col cols="11" class="task-left-content">
          <silentbox-group>
            <div class="d-flex align-content-start flex-wrap">
              <div v-for="(attachment, index) in attachments" :key="attachment.id" class="gallery-box mb-10-px">
                <div v-if="isImage(attachment)">
                  <div>

                    <b-dropdown v-if="authorize('tasks', 'delete', checkMyTask)" right class="gallery-dropdown styled-dropdown">
                      <template v-slot:button-content>
                        <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                      </template>
                      <b-dropdown-item @click="removeAttachment(attachment, index)">
                        <font-awesome-icon :icon="['far', 'trash']"/>
                        {{ $t('Delete') }}
                      </b-dropdown-item>
                    </b-dropdown>

                    <silentbox-item :src="attachment.download.url" :description="attachment.filename">
                      <div class="gallery-image">
                        <ListUsers :user="attachment.user" :link="true" size="22"></ListUsers>
                        <img :src="attachment.download.url" style="width:100%;" />
                      </div>
                    </silentbox-item>
                  </div>

                  <div class="mt-5-px">
                    <silentbox-item :src="attachment.download.url" :description="attachment.filename">
                      <span
                        class="d-block tx-12-px fw-500 txt-6C7293 txt-link"
                        style="margin-bottom:-3px;"
                        :alt="attachment.filename"
                        :title="attachment.filename"
                      >
                        {{ attachment.filename | truncate(52) }}
                      </span>
                      <span class="d-block tx-11-px txt-9EA9C1" v-b-popover.hover.top="attachment.created_at.timezone">
                        {{ attachment.created_at.date_for_humans }}
                      </span>
                    </silentbox-item>
                  </div>
                </div>

                <div v-if="!isImage(attachment)" class="wd-100p">
                  <div>
                    <div class="dropdown gallery-dropdown header-dropdown" v-if="authorize('tasks', 'delete', checkMyTask)">
                      <div class="dropdown-toggle" data-toggle="dropdown">
                        <div class="txt-A7AFB7">
                          <font-awesome-icon :icon="['far', 'ellipsis-h']" style="font-size:20px" class="txt-68748F" />
                        </div>
                      </div>
                      <div class="dropdown-menu dropdown-menu-right" style="min-width:130px;">
                        <a class="header-dropdown-item mt-10-px" href="javascript:;" @click="removeAttachment(attachment, index)">
                          <span class="icon-size"><font-awesome-icon :icon="['far', 'trash']"/></span>
                          <span class="ml-2">{{ $t('Delete') }}</span>
                        </a>
                      </div>
                    </div>
                    <a :href="attachment.download.url" class="" target="_blank">
                      <div class="gallery-image">
                        <ListUsers :user="attachment.user" :link="true" size="22"></ListUsers>
                        <span class="icons d-block">
                          <font-awesome-icon
                            :icon="['fal', 'file' + getIconByType(attachment.mimetype)]"
                            class="txt-9EA9C1"
                            style="font-size:60px"
                          />
                        </span>
                      </div>
                    </a>
                  </div>

                  <div class="mt-5-px">
                    <a :href="attachment.download.url" class="" target="_blank">
                      <span
                        class="d-block tx-12-px fw-500 txt-6C7293 txt-link"
                        style="margin-bottom:-3px;"
                        :alt="attachment.filename"
                        :title="attachment.filename"
                      >
                        {{ attachment.filename | truncate(52) }}
                      </span>
                    </a>
                    <span class="d-block tx-11-px txt-9EA9C1" v-b-popover.hover.top="attachment.created_at.timezone">
                      {{ attachment.created_at.date_for_humans }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </silentbox-group>
          <div v-if="totalPages > 1" class="d-flex justify-content-center mg-b-30">
            <b-pagination
              hide-goto-end-buttons
              class="paginator"
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              @change="getAttachments"
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
