<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    informations: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <div>
    <h3 class="header-title">
      {{ title }}
    </h3>
    <div class="mb-2">
      <template v-for="information in informations">
        <div :key="information.topic" class="mb-2">
          <div class="tx-11-px fw-600 txt-26DC8E">{{ information.topic }}</div>
          <router-link :to="{ name: 'dashboard.show' }" class="tx-12-px cursor-pointer txt-primary-title">
            {{ information.title }}
          </router-link>
          <div class="tx-11-px txt-68748F">{{ information.type }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
