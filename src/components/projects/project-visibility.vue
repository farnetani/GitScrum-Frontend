<script>
export default {
  props: {
    visibility: {
      required: false,
      default: function() {
        return []
      },
    },
  },
}
</script>

<template>
  <span v-show="visibility.title" v-b-popover.hover.right=" visibility.title + ' ' + $tc('Project', 1)">
    <font-awesome-icon v-if="!visibility.is_private" :icon="['fa', 'lock-open-alt']" style="font-size: 12px;" />
    <font-awesome-icon v-if="visibility.is_private" :icon="['fa', 'lock-alt']" style="font-size: 12px;" />
  </span>
</template>
