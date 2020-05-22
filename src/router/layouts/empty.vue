<script>
export default {
  components: { },

  data() {
    return {}
  },
  created() {},
  methods: {},
}
</script>

<template>
  <div style="height:100%">
    <slot name="content" />
  </div>
</template>

<style lang="scss" module>
html, body, #app{
  height:100%;
}
</style>
