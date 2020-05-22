<script>
import { isMobile } from 'mobile-device-detect';

export default {
  props: {
    type: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      subtext: ''
    }
  },
  created() {
    this.subtext = this.$t('Boost productivity and make complex projects stress-free')

    if (isMobile) {
      this.subtext = this.$t('Boost productivity')
    }
  },
}
</script>

<template>
  <div>
    <div v-if="type === 'large'" class="gitscrum-upgrade-large mt-20-px mb-20-px">
      <div class="d-flex justify-content-start">
        <div class="span-cicle-dark"><font-awesome-icon :icon="['fa', 'star']"/></div>
        <div class="gitscrum-upgrade-content d-flex justify-content-between align-items-center">
          <div>
            <a href="https://site.gitscrum.com/pricing" class="tx-16-px txt-FFFFFF fw-600 d-block">{{ $t('Upgrade your Account') }}</a>
            <a href="https://site.gitscrum.com/pricing" class="tx-12-px txt-FFFFFF mb-15-px d-block" v-text="subtext"></a>
          </div>
          <a v-not-visible="'tablet'" href="https://site.gitscrum.com/pricing" class="btn btn-light">{{ $t('SEE HOW TO UPGRADE') }}</a>
        </div>
      </div>
    </div>

    <div v-if="type === 'square'" class="project-card gitscrum-upgrade">
      <div class="span-cicle-dark"><font-awesome-icon :icon="['fa', 'star']"/></div>
      <div class="gitscrum-upgrade-content">
        <a href="https://site.gitscrum.com/pricing" class="tx-16-px txt-FFFFFF fw-600 d-block">{{ $t('Upgrade your Account') }}</a>
        <a href="https://site.gitscrum.com/pricing" class="tx-12-px txt-FFFFFF mb-15-px d-block">{{ $t('Boost productivity and make complex projects stress-free') }}</a>
        <a v-not-visible="'tablet'" href="https://site.gitscrum.com/pricing" class="btn btn-light">{{ $t('SEE HOW TO UPGRADE') }}</a>
      </div>
    </div>
  </div>
</template>
