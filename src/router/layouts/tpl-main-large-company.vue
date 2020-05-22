<script>
import MasterHeader from '@layouts/partials/header'

export default {
  components: {
    MasterHeader,
  },

  data() {
    return {}
  },
  created() {},
  methods: {},
}
</script>

<template>
  <div>
      <MasterHeader></MasterHeader>
      <slot name="content"></slot>
  </div>
</template>
