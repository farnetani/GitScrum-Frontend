<script>
export default {
  props: {
    items: {
      type: Array,
      required: false,
      default: function() {
        return []
      },
    },
    template: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    listClass: {
      type: String,
      required: false,
      default: '',
    },
  },
  methods: {
    redirect(template, item) {
      this.$router.push({
        name: 'marketplace.templates.show',
        params: { template: template, slug: item.slug },
      })
    },
  },
}
</script>
<template>
  <div class="d-flex flex-wrap">
    <div v-for="item in items" :key="item.id" class="card-marketplace" :class="listClass">
      <div class="card cursor-pointer" @click="redirect(template, item)">
        <div class="text-center">
          <img :src="item.company.logo" class="rounded-circle" />
        </div>
        <div class="text-center">
          <h6 class="txt-primary-title">{{ item.name | truncate(50) }}</h6>
          <span class="tx-12-px txt-secondary" v-text="item.company.name"></span>
        </div>
        <div class="mt-10px d-flex justify-content-center align-items-end" style="height:100%">
          <!-- <span class="badge badge-light">{{ $t(name, item.items.length, { count: item.items.length }) }}</span> -->
          <span v-if="item.copiers >= 30" class="badge badge-light"> {{ $t('+XXX copiers', { total: item.copiers }) }} </span>
          <span v-if="item.copiers <= 10" class="badge badge-light"> {{ $t('+XXX copiers', { total: 30 }) }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
