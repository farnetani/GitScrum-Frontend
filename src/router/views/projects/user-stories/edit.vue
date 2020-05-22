<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import ProjectNavBar from '@components/projects/nav-bar'
import TitleLoading from '@components/utils/title-loading'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Mentions from '@components/utils/mentions'

export default {
  page: {
    title: 'User Story Edit',
    meta: [{ name: '', content: '' }],
  },
  components: { Layout, vSelect, Mentions },
  data() {
    return {
      loading: true,
      btnLoading: false,
      userStory: [],
      userStoryPriorities: null,
    }
  },
  mounted() {
    this.getUserStory()
  },
  methods: {
    getUserStory() {
      Axios()
        .get('user-stories/' + this.$route.params.userStorySlug)
        .then((response) => {
          this.data = response.data.data
          this.getUserStoryPriorities(this.data.priority)
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getUserStoryPriorities(priority) {
      Axios()
        .get(
          'user-story-priorities/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          let data = response.data.data
          var arr = []

          for (let i = 0; i < data.length; i++) {
            arr.push({
              label: data[i].title,
              code: data[i].id,
            })
          }
          this.userStoryPriorities = arr
          this.userStoryPriority = { label: priority.title, code: priority.id }
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    update() {
      this.btnLoading = true
      Axios()
        .put('user-stories/' + this.$route.params.userStorySlug, {
          title: this.data.title,
          user_story_priority_id: this.userStoryPriority.code,
          additional_information: this.data.additional_information,
          acceptance_criteria: this.data.acceptance_criteria,
        })
        .then((response) => {
          this.getUserStory()
          this.btnLoading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },

    updateAdditionalInformationText(text) {
      this.data.additional_information = text
    },

    updateTitleText(text) {
      this.data.title = text
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content" class="col-sm-12">
      <div class="row">
        <div class="col-md-6">
          <h5>What is a User Story?</h5>

          User stories are short, simple descriptions of a feature told from the perspective of the person who desires
          the new capability, usually a user or customer of the system. They typically follow a simple template:
          <br />
          <br />
          <strong>
            As a < type of user >,
            <br />
            I want < some goal >,
            <br />so that < some reason >.
          </strong>
          <br /><br />
          A user story is a tool used in Agile software development to capture a description of a software feature from
          an end-user perspective. The user story describes the type of user, what they want and why. A user story helps
          to create a simplified description of a requirement.
        </div>
        <div class="col-md-6">
          <div class="form-row pd-b-15">
            <div class="form-group col-md-12">
              <label>User Story Priority</label>
              <v-select v-model="userStoryPriority" :options="userStoryPriorities"> </v-select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-md-12">
              <label>User story</label>
              <Mentions
                ref="mentions1"
                element-type="textarea"
                :mention-users="true"
                :content-text="data.title"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                :element-rows="4"
                @update-text="updateTitleText"
              ></Mentions>
            </div>
          </div>

          <div class="form-row pd-b-15">
            <div class="form-group col-md-12">
              <label>Acceptance criteria</label>
              <b-form-textarea v-model="data.acceptance_criteria" rows="3" max-rows="6"></b-form-textarea>
            </div>
          </div>

          <div class="form-row pd-b-15">
            <div class="form-group col-md-12">
              <label>
                Additional information
              </label>
              <Mentions
                ref="mentions2"
                element-type="textarea"
                :mention-users="true"
                :content-text="data.additional_information"
                :company-slug="$route.params.companySlug"
                :project-slug="$route.params.projectSlug"
                :element-rows="5"
                @update-text="updateAdditionalInformationText"
              ></Mentions>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <div>
              <b-button v-if="btnLoading" variant="primary" class="btn btn-primary font-weight-bold">
                <b-spinner small type="grow"></b-spinner>
                Updating User Story...
              </b-button>

              <button v-if="!btnLoading" class="btn btn-primary font-weight-bold" type="submit" @click="update">
                Update User Story
              </button>
            </div>
            <div>
              <router-link
                :to="{
                  name: 'projects.user-stories.show',
                  params: {
                    companySlug: this.$route.params.companySlug,
                    projectSlug: this.$route.params.projectSlug,
                  },
                  query: { userStorySlug: data.slug },
                }"
                class=""
              >
                Go to User Story
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
