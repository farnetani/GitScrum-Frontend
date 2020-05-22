<script>
  export default {
    data(){
      return{
        status: true
      }
    },
    methods: {
      toggleStatus(){
        this.status = !this.status
      }
    }
  }
</script>

<template>
  <div class="mb-4 text-left">
    <b-form-checkbox
      id="checkbox-1"
      v-model="status"
      name="checkbox-1"
      @change="toggleStatus"
    >
      Remember me
    </b-form-checkbox>
  </div>
</template>