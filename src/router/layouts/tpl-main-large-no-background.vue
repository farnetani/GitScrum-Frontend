<script>
import MasterHeader from '@layouts/partials/header'
import MasterHeaderMenuProject from '@layouts/partials/header-menu-project'

export default {
  components: {
    MasterHeader,
    MasterHeaderMenuProject,
  },
  data() {
    return {
      user: [],
    }
  },
  methods: {},
}
</script>

<template>
      <div id="page-padding-left">
        <MasterHeader >
          <MasterHeaderMenuProject v-if="$route.params.projectSlug" slot="submenu" :background="false"></MasterHeaderMenuProject>
        </MasterHeader>

        <div id="page-content" class="container-fluid page-body-wrapper">
          <div style="max-width: 100%; overflow: auto auto; padding: 20px 20px 0px; height: calc(100vh - 82px);">
            <div class="row">
              <slot name="content"></slot>
            </div>
          </div>
        </div>
      </div>
</template>
