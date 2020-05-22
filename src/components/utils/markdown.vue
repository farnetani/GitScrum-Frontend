<script>
import VueMarkdownIt from 'vue-markdown-it'

export default {
  components: { VueMarkdownIt },
  props: {
    content: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      options: {
        markdownIt: {
          linkify: true,
          breaks: true,
          typographer: true,
        },
        linkAttributes: {
          target: '_blank',
          rel: 'noopener',
        },
      },
    }
  },
}
</script>

<template>
  <div>
    <VueMarkdownIt id="" :source="content" class="" />
  </div>
</template>
