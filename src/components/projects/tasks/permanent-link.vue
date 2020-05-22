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
      taskUrl: '',
      copySuccess: ''
    }
  },
  computed: {
    ...taskManager
  },
  watch: {
    statusTask(data){
      if ( data.item.name === 'type.change' ){
        this.type = data.item.object
      }
    },
  },
  created(){
    this.formatLink()
  },
  methods: {
    formatLink(){
      let url = this.$router.resolve({
          name: 'projects.board.task-details',
          params: {
            companySlug: this.task.company.slug,
            projectSlug: this.task.project.slug,
            taskSlug: this.task.uuid,
          },
        }).href

        this.taskUrl = this.getDomain( url.substr(1)) 
    },
    onCopy(){
      this.$copyText(this.taskUrl)
      this.copySuccess = 'Copied'
    }
  }
}
</script>

<template>
  <div class="task-permanent-link mb-15-px">
    <label>{{ $t('Permanent Link') }} <small class="text-success" v-text="copySuccess"></small></label>
    
    <b-input-group>
      <b-input v-model="taskUrl" 
        :readonly="true" 
        autocomplete="off"></b-input>
      <b-input-group-append>
        <b-button 
        v-clipboard:copy="taskUrl"
        v-clipboard:success="onCopy"
        variant="outline-secondary" >
          <font-awesome-icon :icon="['far', 'copy']" />
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>