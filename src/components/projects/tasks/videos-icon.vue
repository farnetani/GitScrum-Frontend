<script>
import Axios from '@utils/axios'
import ButtonLoading from '@components/utils/button-loading'
import TitleLoading from '@components/utils/title-loading'
import { taskManager } from '@state/helpers'

export default {
  components: { ButtonLoading, TitleLoading },
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
      loading: false,
      youtubeURL: '',
      alertMessage: '',
      alertStatus: false,
    }
  },
  methods: {
    ...taskManager,

    addVideo() {
      this.loading = true
      this.alertStatus = false
      Axios()
        .post('videos/?company_slug=' + this.task.company.slug + '&project_slug=' + this.task.project.slug, {
          task_uuid: this.task.uuid,
          youtube_url: this.youtubeURL,
        })
        .then((response) => {
          this.youtubeURL = ''
          this.task.stats.videos += 1
          this.actionTask({ name: 'video.addList', object: response.data.data })
          this.loading = false
        })
    },
  },
}
</script>

<template>

<div class="mb-8-px">

  <b-dropdown v-if="authorize('tasks', 'create')" ref="dropdown" right class="dropdown-400px styled-dropdown">
    <template v-slot:button-content >
      <span class="icon-size"><font-awesome-icon :icon="['far', 'video']" style="font-size:14px"/></span>
      <span>{{ $t('Videos') }}</span>
    </template>
    <b-dropdown-header>
      <div class="d-flex align-items-center justify-content-between">
        <TitleLoading :title="$t('Videos')" :loading="loading"></TitleLoading>
        <div class="dropdown-header-icons">
          <div>
            <font-awesome-icon :icon="['far', 'video']" />
            <span>{{$t('Add YouTube videos')}}</span>
          </div>
        </div>
      </div>
    </b-dropdown-header>
    <b-dropdown-form>
  
      <b-form-input v-model="youtubeURL" size="sm" :placeholder="$t('Copy the YouTube URL to add video')" class="mb-5px"></b-form-input>

      <div class="d-flex justify-content-end">
        <ButtonLoading
          type="btn-md"
          mode="button"
          :loading="loading"
          :title="$t('Add Video')"
          :title-loading="$t('Adding')"
          @action="addVideo"
        ></ButtonLoading>
      </div>
      
    </b-dropdown-form>
  </b-dropdown>

</div>
</template>
