<script>
import TimeAgo from 'vue2-timeago'


export default {
  components: {
    TimeAgo,
  },
  data() {
    return {
      gifts: [
        {
          title: 'Advanced Filters for Tasks',
          content: 'Use advanced filters to find your tasks within the project board.',
          when: '2020-05-09 09:00:00',
        },
        {
          title: 'Task Permanent Link',
          content: 'Share your tasks with people outside your company.',
          when: '2020-05-06 09:00:00',
        },
        {
          title: 'Task Improvements',
          content: 'Improvements in features within the task modal.',
          when: '2020-04-28 09:00:00',
        },
        {
          title: 'Export Tasks',
          content: 'All tasks on the board can be exported to excel.',
          when: '2020-04-24 00:00:00',
        },
        {
          title: 'Mobile Responsive ',
          content: 'Use GitScrum on your mobile device. We\'ve made great improvements.',
          when: '2020-04-20 00:00:00',
        },
        {
          title: 'Task Archived',
          content: 'Archive old tasks and continue to save history within the project',
          when: '2020-04-17 00:00:00',
        },
        {
          title: 'Form2Task',
          content: "Create public forms and convert responses to tasks",
          when: '2020-04-16 00:00:00',
        },
        {
          title: 'HTTPS for own domains',
          content: "All domains that use our White Label feature can be accessed over HTTPS",
          when: '2020-04-15 00:00:00',
        },
      ],
    }
  },
  methods: {
    gaClickDropdrownGift(){
      this.$ga.event('header_bar', 'dropdown_gift')
    }
  }
}
</script>

<template>
  <li class="header-gift">

    <b-dropdown right @shown="gaClickDropdrownGift">
      <template v-slot:button-content>
        <font-awesome-icon :icon="['far', 'gift']" />
      </template>
      <b-dropdown-group :header="$t('GitScrum Updates') " style="height:300px; overflow-y:auto; overflow-x: hidden;">
        <b-dropdown-text v-for="(gift, index) in gifts" :key="index" tag="div">
          <strong v-text="gift.title"></strong>
          <span v-text="gift.content"></span>
          <TimeAgo :datetime="gift.when" long></TimeAgo> 
        </b-dropdown-text>
      </b-dropdown-group>
    </b-dropdown>

  </li>
</template>
