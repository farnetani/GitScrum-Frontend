<script>
import Layout from '@layouts/empty'
import Axios from '@utils/axios'


export default {
  page: {
    title: 'Projects',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
  },
  data() {
    return {
      loading: true,
      
    }
  },
  mounted() {
    
  },
  methods: {

  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="welcome d-flex justify-content-center align-items-center">
      <div class="welcome-box">
        <img class="rabbit" src="https://gitscrum-static.s3.amazonaws.com/onboarding/rabbit.png" />
        <h1>Welcome to GitScrum, <span>Username</span></h1>
        <h2>In order to help you the most, please share with us your current tools?</h2>
        <div class="welcome-box-logo d-flex flex-wrap justify-content-start">
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/trello.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/asana.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/jira.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/googledocs.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/wrike.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/evernote.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/airtable.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/gitlab.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/dropbox.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/slack.png" />
          </div>
          <div>
            <img src="https://gitscrum-static.s3.amazonaws.com/onboarding/basecamp.png" />
          </div>
        </div>
         <div class="welcome-footer">ds dsad asdas ds</div>
      </div>
     
    </div>
  </Layout>
</template>
