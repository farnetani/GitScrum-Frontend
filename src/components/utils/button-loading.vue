<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
    titleLoading: {
      type: String,
      required: false,
      default: '',
    },
    addclass: {
      type: String,
      required: false,
      default: '',
    },
    type: {
      type: String,
      required: false,
      default: 'btn-lg',
    },
    loading: {
      type: Boolean,
      required: true,
    },
    faIcon: {
      type: String,
      required: false,
      default: 'fa',
    },
    icon: {
      type: String,
      required: false,
      default: '',
    },
    mode: {
      type: String,
      required: false,
      default: 'submit',
    },
  },
}
</script>

<template>
  <div :class="addclass">
    <button
      v-if="type === 'btn-lg'"
      class="btn btn-large btn-primary btn-block font-weight-bold"
      :type="mode"
      @click="$emit('action', true)"
      @keyup.enter="submit"
    >
      <span v-show="!loading" v-text="title"></span>
      <span v-show="loading" v-text="titleLoading"></span>
      <b-spinner v-show="loading" :label="$t('Loading')" small class="btn-large-loading"></b-spinner>
    </button>

    <button
      v-if="type === 'btn-md'"
      class="btn btn-medium btn-primary font-weight-bold"
      :type="mode"
      @click="$emit('action', true)"
      @keyup.enter="submit"
    >
      <span v-show="!loading" v-text="title"></span>
      <span v-show="loading" v-text="titleLoading"></span>
      <b-spinner v-show="loading" :label="$t('Loading')" small class="btn-medium-loading"></b-spinner>
    </button>

    <button
      v-if="type === 'btn-sm'"
      class="btn btn-small btn-primary font-weight-bold text-center"
      style="width:46px"
      :type="mode"
      @click="$emit('action', true)"
      @keyup.enter="submit"
    >
      <font-awesome-icon
        v-if="icon === ''"
        v-show="!loading"
        :icon="['fa', 'check']"
        style="font-size:18px"
        class="txt-ffffff"
      />
      <font-awesome-icon
        v-if="icon !== ''"
        v-show="!loading"
        :icon="[faIcon, icon]"
        style="font-size:18px"
        class="txt-ffffff"
      />
      <b-spinner v-show="loading" :label="$t('Loading')" small class="btn-small-loading"></b-spinner>
    </button>
  </div>
</template>
