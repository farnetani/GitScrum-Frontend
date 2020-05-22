<script>
import hexToRgba from 'hex-to-rgba'

export default {
  props: {
    labels: {
      type: Array,
      required: false,
      default: null,
    },
    customClass: {
      type: String,
      required: false,
      default: null,
    },
    limit: {
      type: Number,
      default: 20,
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
  <div class="task-labels pd-t-0">
    <span
      v-for="label in labels"
      :key="label.slug"
      :class="customClass"
      :alt="label.title"
      :title="label.title"
      class="badge badge-text fw-600"
      :style="'color: ' + label.color + ';background:' + backgroundColor(label.color)"
    >
      <div v-if="limit">{{ label.title | truncate(limit) }}</div>
      <div v-if="!limit">{{ label.title }}</div>
      <span v-show="label.total">({{ label.total }})</span>
    </span>
  </div>
</template>

<style lang="scss" scope>
.labels span {
  margin-right: 3px;
}
</style>
