<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import TitleLoading from '@components/utils/title-loading'
import MindMapping from '@components/utils/mindMapping'


export default {
  page: {
    title: 'Mind Mapping',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, TitleLoading, MindMapping},
  data() {
    return {
      dates: '',
      loading: true,
      btnLoading: false,
      nameMindMapping: '',
      /*
      mindMappingSelected: [],
      mindMappings: [],
      */
      mindMapping : [],
      jsonData : null,
      width    : 1000,
      height   : 800,
    }
  },
  watch: {
    jsonData() {
      Axios()
        .put(
          'mind-mappings/' + this.mindMapping.uuid + 
          '/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug,{
            json: this.jsonData
          }
        )
        .then((response) => {
          
        })
    }
  },
  created() {
    this.getMindMappings()
  },
  methods: {

    addMindMapping(){

    },
    getMindMappings(){
      Axios()
        .get(
          'mind-mappings/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
        )
        .then((response) => {
          let data = response.data
          this.mindMapping = data
          this.jsonData = data.json.toString(16)
          this.loading = false
        })
    },
    setMindMappings(){

    }
  },
}
</script>

<template class="teste">
  <Layout>

    <template slot="header-left">
      <TitleLoading 
        :title="$t('Mind mapping')" 
        :subtitle="$t('The most effective and visual way to help with project specifications')" 
        :loading="loading"></TitleLoading>
    </template>
    
    <div slot="content" class="mind-mapping pt-60px">
      <div v-if="jsonData" >
        <div style="padding:0 50px">
          <MindMapping 
            v-model="jsonData"
            :spacing='80'
            top-color="#2A3B9C"
            :font-size='14'
            :font-length='22'
            :only-color='true'
          ></MindMapping>
        </div>
      </div>

    </div>
  </Layout>
</template>
