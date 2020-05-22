<script>
import Axios from '@utils/axios'
import moment from 'moment'
import { BroadcastChannel } from 'broadcast-channel'

export default {
  props: {
    displayTitle: {
      type: Boolean,
      required: false,
      default: false,
    },
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
    scope: {
      type: String,
      required: false,
      default: 'board',
    },
  },
  data() {
    return {
      time: '00:00:00',
      btnStart: true,
      btnStop: false,
      seconds: 0,
      clockIsReady: false,
      timestampStarted: 0,
      key: 'task-' + this.task.uuid,
      started: false,
      clock: false,
      startedUTC: false,
      channel: null,
      modalTitle: 'Stop work log time on task',
      modalClockTime: '00:00:00',
      timerLogComment: '',
      timeTrackerPreloaded: false,
    }
  },
  watch: {
    close: function(val) {
      this.reset()
    },
  },
  mounted() {
    this.getTimers(this.task)
  },
  beforeDestroy() {},
  created() {
    this.channel = new BroadcastChannel(this.key)
    this.channel.onmessage = (event) => {
      // CONVERT RAWUTC TO MOMENT
      event.startedUTC = moment.utc(event.startedRawUTC)
      this.handleTaskTimerEvent(event)
    }
    
    if (this.task.time_tracker !== null) {
      this.clockStartFrom(moment.utc(this.task.time_tracker))
      this.timeTrackerPreloaded = true
      this.clockIsReady = true
    } else {
      if (this.scope !== 'modal') {
        this.timeTrackerPreloaded = true
        this.clockIsReady = true
      }
    }
  },
  methods: {
    clockStart(seconds) {
      if (this.started === false) {
        this.btnStart = false
        this.btnStop = true
        this.seconds = seconds
        this.started = true
        this.clock = setInterval(this.clockTicker, 1000)
        this.startedUTC = moment.utc(
          moment()
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
        )
      }
    },
    clockStop() {
      if (this.started === true) {
        this.btnStart = true
        this.btnStop = false
        this.time = '00:00:00'
        this.started = false
        this.task.time_tracker = null
        clearInterval(this.clock)
      }
    },
    clockStartFrom(startedUTC) {
      let UTCNow = moment.utc(
        moment()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
      )
      var duration = moment.duration(UTCNow.diff(startedUTC))
      this.seconds = duration.asSeconds()

      this.startedUTC = startedUTC
      this.btnStart = false
      this.btnStop = true
      this.started = true

      this.clock = setInterval(this.clockTicker, 1000)
    },
    handleTaskTimerEvent(event) {
      let status = event.status
      if (this.task.uuid === event.uuid) {
        if (status === 'start' && this.started === false) this.clockStartFrom(event.startedUTC)
        else if (status === 'end' && this.started === true) this.clockStop()
        else if (status === 'cancel' && this.started === true) this.clockStop()
      }
    },
    init() {
      this.reset()
    },
    clickhandler() {},
    getTimers(task) {
      if (!this.timeTrackerPreloaded) {
        Axios()
          .get(
            '/time-trackings/?company_slug=' +
              this.task.company.slug +
              '&project_slug=' +
              this.task.project.slug +
              '&task_uuid=' +
              this.task.uuid
          )
          .then((response) => {
            this.clockIsReady = true
            if (
              response.data.resume !== undefined &&
              response.data.resume.period_start !== null &&
              response.data.resume.period_end === null
            ) {
              this.clockStartFrom(moment.utc(response.data.resume.period_start))
            }
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },
    sendTime(status) {
      Axios()
        .post(
          'timer/' + status + '/?company_slug=' + this.task.company.slug + '&project_slug=' + this.task.project.slug,
          {
            task_uuid: this.task.uuid,
            comment: this.timerLogComment,
          }
        )
        .then((response) => {
          this.channel.postMessage({
            uuid: this.task.uuid,
            status: status,
            key: this.key,
            startedRawUTC: moment.utc(this.startedUTC).format('YYYY-MM-DD HH:mm:ss'),
          })
          this.task.time_tracker = moment.utc(this.startedUTC).format('YYYY-MM-DD HH:mm:ss')
        })
        .catch((e) => {
          console.error(e)
        })
    },
    start() {
      this.clockStart(0)
      this.sendTime('start')
    },
    stop() {
      this.$refs['modal'].show()
      this.modalClockTime = this.time
      this.task.time_tracker = null
    },
    confirmTimeSave() {
      this.clockStop()
      this.sendTime('end')
      this.timerLogComment = ''
    },
    cancelTimeSave() {
      this.clockStop()
      this.sendTime('cancel')
      this.timerLogComment = ''
      this.task.time_tracker = null
    },
    reset() {
      this.clockStop()
      clearInterval(this.clockTicker)
    },
    clockTicker() {
      this.seconds += 1

      let UTCNow = moment.utc(
        moment()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
      )
      this.time = moment.utc(UTCNow.diff(this.startedUTC)).format('HH:mm:ss')
    },
  },
}
</script>

<template>
  <div class="badge timer" @click.stop.prevent="clickhandler">
    <h5 v-if="displayTitle" class="mg-b-10">{{ $t('Task Time Tracking') }}</h5>

    <b-spinner v-if="!clockIsReady" v-show="!clockIsReady" :label="$t('Loading')" variant="secondary" small></b-spinner>

    <div v-else class="d-flex justify-content-between task-timer timer-content">
      <div id="time">{{ time }}</div>
      <span :disabled="true" class="cursor-pointer" v-show="btnStart && clockIsReady" @click.stop.prevent="start"
        ><i class="fas fa-play"></i
      ></span>
      <span v-show="btnStop && clockIsReady" class="cursor-pointer" @click.stop.prevent="stop"
        ><i class="fas fa-stop"></i
      ></span>
    </div>

    <b-modal
      id="modal"
      ref="modal"
      class="modalConfirmBody"
      lazy
      size="md"
      :title="modalTitle"
      ok-title="Confirm"
      cancel-title="Discard"
      @ok="confirmTimeSave"
      @cancel="cancelTimeSave"
    >
      <div class=" modalTimer card pd-t-6 pd-r-10 pd-l-10  mg-t-20 mg-b-20 mg-l-20 mg-r-20">
        <p class=" mg-l-20 mg-r-20"> {{ $t('Work Log') }}: {{ modalClockTime }}</p>
        <hr />
        <p class=" mg-l-20 mg-r-20 tx-bold ">{{ task.title }}</p>
      </div>
      <div class="pd-t-6 pd-r-0  mg-t-20 mg-b-20 mg-l-20 mg-r-20">
        <b-form-textarea
          v-model="timerLogComment"
          :placeholder="$t('Write a comment')"
          trim
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
    </b-modal>
  </div>
</template>
