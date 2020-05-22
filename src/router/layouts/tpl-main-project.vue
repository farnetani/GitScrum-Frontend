<script>
import MasterHeader from '@layouts/partials/header'
import MasterHeaderMenuProject from '@layouts/partials/header-menu-project'
import Invite from '@components/projects/team-members/invite'

export default {
  components: {
    MasterHeader,
    MasterHeaderMenuProject,
    Invite
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
  <div id="page-padding-left" class="tlp-main-project">
    <MasterHeader >
      <MasterHeaderMenuProject v-if="$route.params.projectSlug" slot="submenu" :background="false"></MasterHeaderMenuProject>
    </MasterHeader>

    <div id="header-project-area" class="d-flex justify-content-between align-items-center tpl-main-project-area subheader">
      <div>
        <slot name="header-left"></slot>
      </div>
      <div>
        <slot name="header-right"></slot>
        <Invite></Invite>
      </div>
    </div>
    
    <slot name="content"></slot>
  </div>
</template>
