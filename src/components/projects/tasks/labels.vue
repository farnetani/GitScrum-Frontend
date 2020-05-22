<script>
import Axios from '@utils/axios'
import hexToRgba from 'hex-to-rgba'

export default {
  components: {},
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  methods: {
    backgroundColor(hexColor) {
      return hexToRgba(hexColor, 0.2)
    },
  },
}
</script>

<template>
  <div v-if="task.labels.length">
    <span
      v-for="label in task.labels"
      :key="label.slug"
      :alt="label.title"
      :title="label.title"
      class="badge badge-labels mg-r-5 mg-b-5"
      :style="'color: ' + label.color + ';background:' + backgroundColor(label.color)"
    >
      <span v-text="label.title"></span>
    </span>
  </div>
</template>
