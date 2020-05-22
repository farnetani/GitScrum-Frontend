<script>
import MasterHeader from '@layouts/partials/header'
import MasterHeaderMenuProject from '@layouts/partials/header-menu-project'

export default {
  components: {
    MasterHeader,
    MasterHeaderMenuProject
  },

  data() {
    return {}
  },
  created() {},
  methods: {},
}
</script>

<template>
  <div class="">
      <MasterHeader>
        <MasterHeaderMenuProject
          v-if="$route.params.projectSlug"
          :background="false"
          slot="submenu"
        ></MasterHeaderMenuProject>
      </MasterHeader>

      <div id="page-content" class="container-fluid page-body-wrapper">
        <div class="container">
          <slot name="content"></slot>
        </div>
      </div>
      
  </div>
</template>
