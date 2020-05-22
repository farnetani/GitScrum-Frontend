<script>
export default {
  props: {
    message: {
      type: String,
      required: false,
      default: null,
    },
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {}
  },
  watch: {
    status: function(newVal) {
      if (newVal) {
        setTimeout(this.hideAlert, 50000)
      }
    },
  },
  methods: {
    hideAlert() {
      this.status = false
    },
  },
}
</script>

<template>
  <div>
    <b-alert :show="status" variant="success" class="mg-b-15">
      <strong>{{ message }}</strong>
    </b-alert>
  </div>
</template>
