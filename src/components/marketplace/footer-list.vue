<script>
import BoxItem from './box-item'
import TitleLoading from '@components/utils/title-loading'

export default {
  components: {
    BoxItem,
    TitleLoading
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    otherTemplates: {
      type: Array,
      required: true,
    },
    feature: {
      type: String,
      required: true,
    },
  },
}
</script>

<template>
  <div class="mt-3 mb-30-px">

    <div class="d-flex justify-content-between align-items-center mb-10-px">
      <TitleLoading :title="title"></TitleLoading>
      <router-link
        :to="{
          name: 'marketplace.templates.index',
          params: { template: feature },
        }"
        class="txt-link txt-primary  mr-10-px">
        {{ $t('See more') }}
      </router-link>
    </div>    

    <div class="mt-1">
      <BoxItem
        :items="otherTemplates"
        :template="feature"
        name="Types"
      ></BoxItem>
    </div>
  </div>
</template>
