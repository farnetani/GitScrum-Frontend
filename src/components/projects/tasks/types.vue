<script>
import { taskManager } from '@state/helpers'

export default {
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      type: []
    }
  },
  computed: {
    ...taskManager
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'type.change' && this.task.uuid === data.item.uuid ){
        this.type = data.item.object
      }
    },
  },
  created(){
    this.setType()
  },
  methods: {
    setType(){
      this.type = this.task.type
    }
  }
}
</script>

<template>
  <span
    v-if="type !== null"
    class="badge extra-selected mg-r-5"
    :style="'color: ' + invertColor(type.color, true) + ';background:' + type.color">
   {{type.title}}
  </span>
</template>
