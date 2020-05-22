<script>
export default {
  props: {
    templateName: {
      type: String,
      required: true,
    },
  },
  methods: {},
}
</script>
<template>
  <b-jumbotron v-not-visible="'tablet'" class="hero-banner-large img-external hero-up-20">

    <div class="d-flex align-items-center">
        <div>
            <h3>{{ $t('Standardize your work with our customizable XXX Templates', { template: templateName }) }}</h3>
            <h5>{{ $t('Get it done quickly over and over and over. Stop wasting time starting the same process over and over again') }}</h5>
            <b-button variant="success" :to="{
                name: 'companies.template.' + $route.params.template }">
                {{ $t('Create your own XXX Template', { template: templateName }) }}</b-button>
        </div>
        <b-img src="https://gitscrum-static.s3.amazonaws.com/img/Banner-MarketplaceTemplate.png" width="550" fluid></b-img>
    </div>
    
    </b-jumbotron>
</template>
