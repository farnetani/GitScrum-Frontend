<script>

export default {
  page: {
    title: 'Ooops',
    meta: [{ name: 'description', content: '' }],
  },
  components: {},
  props: {
    resource: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
    <div class="mt-60-px mb-60-px text-center">
      <img src="https://gitscrum-static.s3.amazonaws.com/img/gitscrum-ooops.svg" style="max-width: 850px;" />
      <div class="mt-20-px">
        <a href="https://site.gitscrum.com" class="btn btn-dark fw-600">
          {{ $t('I’ll not leave you here. I’ve got to save you!') }}
        </a>
      </div>
    </div>
</template>
