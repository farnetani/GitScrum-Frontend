<!--
<script>
import Axios from '@utils/axios'
import { modalManager } from '@state/helpers'

export default {
  data() {
    return {
      notifications: null,
      newNotifications: 0,
      isDropDownOpened: false,
    }
  },
  computed: {
    notSeenNotifications() {
      return this.notifications.filter((notification) =>
        notification ? !notification.seen_at : false
      )
    },
  },
  created: function() {
    this.listNotifications()
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      if (task.code) {
        this.open({ name: value, object: task })
      }
    },

    listNotifications() {
      Axios()
        .get('notifications')
        .then((response) => {
          this.notifications = response.data.data
          this.newNotifications = this.notSeenNotifications.length
          this.markNotificationsAsSeen()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getNotificationsIds() {
      return this.notSeenNotifications.map((notification) => notification.uuid)
    },

    markNotificationsAsSeen() {
      Axios()
        .put('notifications', {
          notification_ids: this.getNotificationsIds(),
        })
        .then((_) => {
          this.notifications.forEach(
            (notification) => (notification.seen_at = new Date())
          )
          this.newNotifications = 0
        })
        .catch((e) => {
          console.error(e)
        })
    },
    onClickRedirect(data) {
      window.location = data.notification.mentionable.route_show
    },
  },
}
</script>

<template>
  <div>
    <a
      id="messageDropdown"
      class="nav-link dropdown-toggle d-flex justify-content-center align-items-center font-weight-medium"
      href="javascript:;"
      data-toggle="dropdown"
      @click.prevent="listNotifications"
    >
      <i
        style="font-size: 18px !important; color: #333; top: 1px; position: relative; margin-right: -5px;"
        class="fas fa-bell"
      >
      </i>
      <span
        :class="newNotifications ? 'badge-danger' : 'badge-secondary'"
        class="badge badge-pill"
        style="z-index:1; position:relative; top:-2px;"
      >
        {{ newNotifications }}
      </span>
    </a>
    <div
      class="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
      aria-labelledby="messageDropdown"
    >
      <ul class="nav nav-notification">
        <li v-if="notifications" class="nav-item show" style="width:260px;">
          <div class="py-3">
            <div
              v-for="(notification, index) in notifications"
              :key="index"
              class="media"
              @click="modal('task', notification.object)"
            >
              <div class="d-flex align-items-center">
                <img
                  :src="notification.user.photo"
                  :alt="notification.user.name"
                  class="avatar-36"
                />

                <div class="ml-3">
                  <p class="mb-0" v-text="notification.user.name"></p>
                  <p
                    class="mb-0 text-muted text-small"
                    v-text="notification.message"
                  ></p>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li v-else class="nav-item show wd-100p">
          <div class="alert" role="alert">
            <small>There are no notifications for you</small>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
-->