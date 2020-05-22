<script>
import MasterHeader from '@layouts/partials/header'

export default {
  components: {
    MasterHeader,
  },
}
</script>

<template>
  <div>
    <MasterHeader :hidden="true" :sharing="true"></MasterHeader>

    <div id="page-content" class="container-fluid page-body-wrapper" style="margin-top: 40px;">
      <div
        
        style="max-width: 100%; overflow-x: auto; overflow-y:hidden; padding: 20px 20px 0px; min-height: calc(100vh - 40px);"
      >
        <div class="row">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
