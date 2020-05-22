<script>
import Axios from '@utils/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: { vSelect },
  data() {
    return {
      convertTasks: [],
      convertTask: [],
    }
  },
}
</script>

<template>
  <b-dropdown
    v-b-popover.hover.top="Convert to Subtask"
    size="lg"
    variant="link"
    toggle-class="text-decoration-none "
    class="modal-box-dropdown"
    right
  >
    <template slot="button-content">
      <i class="fas fa-sync"></i>
    </template>
    <b-dropdown-form>
      <div>
        <h5>Convert to Subtask</h5>
        <small>
          Copy the URL of the <strong>YouTube video</strong> you want to add the
          task
        </small>
        <v-select
          v-model="convertTask"
          :options="convertTasks"
          label="name"
        ></v-select>

        <b-button variant=" btn btn-primary">Ok</b-button>
      </div>
    </b-dropdown-form>
  </b-dropdown>
</template>

<style lang="scss" module>
@import '@design';
</style>
