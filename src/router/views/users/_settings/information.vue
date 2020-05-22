<script>
import Layout from '@layouts/tpl-main'
import TitleLoading from '@components/utils/title-loading'

export default {
  page: {
    title: 'Dashboard',
    meta: [{ name: 'description', content: 'ProjectsList' }],
  },
  components: {
    Layout,
    TitleLoading,
  },
  data() {
    return {
      loading: true,
    }
  },
  mounted() {},
  methods: {},
}
</script>

<template>
  <Layout>
    <span slot="title">
      <TitleLoading title="My Settings" :loading="loading"></TitleLoading>
    </span>

    <div slot="content">
      <div class="row">
        <div class="col-lg">
          <label class="form-label">
            Company Logo
            <span class="tx-danger">*</span>
          </label>
          <vue-dropzone id="dropzone" ref="myVueDropzone" :options="dropzoneOptions"></vue-dropzone>
        </div>
      </div>
      <div class="row mg-t-20">
        <div class="col-lg">
          <label class="form-label">
            Fullname
            <span class="tx-danger">*</span>
          </label>
          <input class="form-control" type="text" />
        </div>
        <div class="col-lg">
          <label class="form-label">
            Username
            <span class="tx-danger">*</span>
          </label>
          <input class="form-control" type="text" />
        </div>
      </div>

      <div class="row mg-t-20">
        <div class="col-lg">
          <label class="form-label">Profile summary</label>

          <b-form-textarea
            id="textarea"
            v-model="text"
            placeholder="Enter your education, skills, career experiences, and goals..."
            rows="4"
            max-rows="6"
          ></b-form-textarea>
        </div>
      </div>

      <div class="row mg-t-20">
        <div class="col-lg">
          <label class="form-label">
            Headline
          </label>
          <input class="form-control" type="text" />
        </div>
        <div class="col-lg">
          <label class="form-label">
            Location
          </label>
          <input class="form-control" type="text" />
        </div>
      </div>

      <div class="row mg-t-20">
        <div class="col-lg">
          <label class="form-label">
            Timezone
          </label>
          <input class="form-control" type="text" />
        </div>
      </div>
    </div>
  </Layout>
</template>
