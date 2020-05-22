<script>
import ShareableBoard from '@layouts/partials/shareable-board'

export default {
  components: { ShareableBoard },
  props: {
    filterUsers: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>

<template>
  <div class="nav-bar-project">
    <div class="az-navbar">
      <div class="container-fluid d-flex justify-content-between">
        <div class="wd-100p">
          <div class="float-left">
            <div class="d-flex">
              <button class="btn-header pd-r-15">
                <i class="fas fa-lock"></i>
                <strong class="mg-l-8 tx-15"></strong>
              </button>
              <!--
              <button class="mg-l-8 tx-18 pd-r-10">
                <i class="fas fa-columns"></i>
              </button>
              <button class="mg-l-8 tx-18 pd-r-10">
                <i class="fas fa-th-list"> </i>
              </button>
              -->
              <ShareableBoard></ShareableBoard>
              <slot name="filters"></slot>
            </div>
          </div>
          <div v-show="filterUsers" class="float-right" style="height:32px">
            <!--<BoardUsers></BoardUsers>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
