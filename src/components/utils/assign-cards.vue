<script>
import { modalManager } from '@state/helpers'

export default {
  components: {},
  props: {
    items: {
      type: Array,
      default: null,
      required: true,
    },
    assigneds: {
      type: Array,
      default: null,
      required: true,
    },
    data: {
      type: Object,
      default: null,
      required: true,
    },
    guest: {
      type: String,
      default: '',
      required: true,
    },
    featureTitle: {
      type: String,
      default: '',
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      currentItem: null
    }
  },
  methods: {
    ...modalManager,

    modal(value, task) {
      this.open({ name: value, object: task })
    },

    sendAssign(item, index) {
      this.currentItem = index

      if (this.isAssigned(item.id)) {
        if (this.isGuest(item)) {

          return this.$emit('assign', {
            item,
            id: this.data.id,
            index,
          })

        } else {
          return this.$emit('assign', {
            item,
            id: null,
            index,
          })
        }
      } else {
        return this.$emit('assign', {
          item,
          id: this.data.id,
          index,
        })
      }
    },

    isAssigned(id) {
      return this.assigneds.findIndex((val) => val.id === id) !== -1
    },
    isGuest(item) {

      return this.data.slug !== item[this.guest].slug
    },
  },
}
</script>

<template>
  <div class="masonry">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="task-assigned-card"
      :style="`background-color:${item.workflow.color}`"
    >
      <div
        class="task-assigned"
        :style="isAssigned(item.id) && !isGuest(item) ? `border:1px solid ${item.workflow.color}` : ''"
      >
        <div class="task-title" @click="modal('task', item)">{{ item.code }} - {{ item.title }}</div>
        <div v-show="isAssigned(item.id)" class="task-description">
          {{ item[guest].title }}
        </div>
        <div class="d-flex align-tems-center justify-content-between">
          <div class="status-bg">
            <span
              class="task-status"
              :style="`background-color:${item.workflow.color}20; color:${item.workflow.color}`"
            >
              {{ item.workflow.title }}
              <font-awesome-icon
                :icon="workflowState(item.workflow.state)"
                style="font-size: 13px; margin-left: 5px;"
              />
            </span>
          </div>

          <div class="task-check" :style="'color:${item.workflow.color}; font-size:22px;'">
            <b-spinner
              v-show="loading && currentItem === index"
              :label="$t('Loading')"
              small
              class="btn-large-loading btn-loading-dark"
              style="right: 8px;margin-top: -2px;"
            ></b-spinner>
            <div v-show="!loading || currentItem !== index">
              <div v-show="isAssigned(item.id) && !isGuest(item)">
                <font-awesome-icon :icon="['fas', 'check-square']" @click="sendAssign(item, index)" />
              </div>
              <div v-show="!isAssigned(item.id) || (isAssigned(item.id) && isGuest(item))">
                <font-awesome-icon :icon="['fal', 'stop']" @click="sendAssign(item, index)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.masonry {
  /* Masonry container */
  column-count: 4;
  column-gap: 30px;
}
.task-assigned-card {
  width: 100%;
  border-radius: 5px;
  margin: 0 0 30px;
  display: inline-flex;
  justify-content: flex-end;
}
.task-assigned {
  position: relative;
  width: 101%;
  left: 2px;
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(108, 114, 147, 0.15);
  border-radius: 5px;
  padding: 10px;
}
.task-assigned .task-title {
  color: #3d4f9f;
}

.task-assigned .task-status {
  text-transform: uppercase;
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  color: #ff9900;
  padding: 2px 5px;
  background-color: #ff990020;
  border-radius: 4px;
}
.task-check svg {
  position: absolute;
  right: 10px;
}
.task-assigned .task-check:hover {
  cursor: pointer;
}
.task-assigned .task-description {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;
  color: #a7afb7;
  margin-bottom: 10px;
}
</style>
