<script>
export default {
  props: {
    titlePage: {
      type: String,
      default: '',
    },
    placeholderSearch: {
      type: String,
      default: '$t(Search in)',
    },
    loading: {
      type: Boolean,
      required: true,
    },
    filter: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
  <div class="row header-projects-container">
    <div class="col-sm-9 d-flex">
      <span>{{ titlePage }}</span>
      <div style="position:relative;top:-4px;margin:0 20px">
        <slot name="button"></slot>
      </div>
      <div class="space-loading">
        <b-spinner v-show="loading" :label="$t('Loading')" variant="secondary" small class="title-loading"></b-spinner>
      </div>
    </div>
    <div class="col-sm-3 d-flex justify-content-end header-search">
      <b-form-input v-model="filter" :placeholder="[[placeholderSearch]]"></b-form-input>
    </div>
  </div>
</template>

<style lang="scss">
.header-search input {
  max-width: 220px;
  max-height: 30px;
  font-family: 'Poppins';
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  &::placeholder {
    font-size: 11px !important;
  }
}
</style>
