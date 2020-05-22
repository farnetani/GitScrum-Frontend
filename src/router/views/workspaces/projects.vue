<script>
import Layout from '@layouts/tpl-main-large-company'
import Axios from '@utils/axios'
import ListProjects from '@components/utils/list-projects'
import TitleLoading from '@components/utils/title-loading'
import hexToRgba from 'hex-to-rgba'
import { isMobile } from 'mobile-device-detect';
import { modalManager } from '@state/helpers'
import Alert from '@components/utils/alert'

export default {
  page: {
    title: 'Projects',
    meta: [{ name: '', content: '' }],
  },
  components: {
    Layout,
    ListProjects,
    TitleLoading,
    Alert,
  },
  data() {
    return {
      loading: true,
      canDragProjects: isMobile,
      
      projects: [],
      projectsFiltered: [],
      seachByProjectName: '',
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      userCompanies: JSON.parse(window.localStorage.getItem('COMPANIES_USER')),
      canCreateProjects: false,
      projectsStatuses: [
        {
          value: null,
          text: 'All Projects',
        },
      ],
      projectsStatusSelect: null,
      projectsLabels: [],
      projectsLabelSelected: [],
      projectsLabelProps: { blank: true, width: 15, height: 15, class: 'm1' },
      projectAccess: this.$route.query.project_access,
      projectAccessMessage: this.$t(
        'Unfortunately, you do not have access to project. Please, contact the company owner or the project leader'
      ),
      projectAccessStatus: this.$route.query.project_access && this.$route.query.project_access.length ? true : false,
      labelsLoading: false,
    }
  },
  watch: {
    seachByProjectName() {
      this.searchTitle()
    },
  },
  mounted() {
    
    this.checkCompanySettings()
    this.getProjects()
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    checkCompanySettings() {
      let company = this.userCompanies.find((company) => company.slug === this.currentCompany.slug)
      this.canCreateProjects = company.settings.can_create_projects
    },

    backgroundColor(hexColor) {
      return hexToRgba(hexColor, '0.7')
    },
    getProjects() {
      Axios()
        .get('projects/?company_slug=' + this.currentCompany.slug)
        .then((response) => {
          this.projects = response.data.data
          this.projectsFiltered = this.projects
          this.loading = false
          this.createStatuses()
        })
        .catch((e) => {
          console.error(e)
        })
    },
    getLabels() {

      this.labelsLoading = true

      let elements = document.getElementsByClassName('task-labels')
      let element = null;
      let arr = [];
      this.projectsLabels = []
      
      //if ( !this.projectsLabels[0] ){

        for (let i = 0; i < elements.length; i++) {
          element = elements[i].getElementsByClassName('badge')

          if ( element.length ){


            for (let y = 0; y < element.length; y++) {

              if ( !arr.includes(element[y].title) ){

                this.projectsLabels.push({
                  color: element[y].style.color,
                  background: element[y].style.background,
                  title: element[y].title
                });

              }
              arr.push(element[y].title)
            }
            
          }
        }  
      //}
      this.labelsLoading = false
    },

    searchLabelsInProjects(project, searchLabels) {
      return project.labels.filter((label) => {
        for (let i = 0; i < searchLabels.length; i++) {
          if (label.title === searchLabels[i].title) {
            return true
          }
        }
      })
    },

    createStatuses() {
      for (let i = 0; i < this.projects.length; i++) {
        if (!this.projectsStatuses.some((entry) => entry.code === this.projects[i].status.code)) {
          this.projectsStatuses.push({ value: this.projects[i].status.code, text: this.projects[i].status.title })
        }
      }
    },

    filterByStatus() {
      
      this.projectsFiltered = this.projects
      if (this.projectsStatusSelect !== null) {
        this.projectsFiltered = this.projects.filter((project) => {
          return project.status.code === this.projectsStatusSelect
        })
      }
    },

    createProject() {
      this.openCreateProject()
    },

    searchTitle() {
      let titleStr = this.seachByProjectName.toUpperCase()
      this.projectsFiltered = this.projects.filter((project) => {
        return project.name.toUpperCase().includes(titleStr)
      })
    },

    filterLabels() {
      this.projectsFiltered = this.projects
      if (this.projectsLabelSelected.length) {
        this.projectsFiltered = this.projects.filter((project) => {
          if (project.labels.length && this.searchLabelsInProjects(project, this.projectsLabelSelected).length) {
            return project
          }
        })
      }
    },

    handleFilterByLabel(label) {
      if (label.selected) {
        this.removefilterByLabel(label)
      } else {
        this.filterByLabel(label)
      }
    },

    filterByLabel(label) {
      if (this.projectsLabelSelected.indexOf(label) !== 0) {
        label.selected = true
        this.projectsLabelSelected.push(label)
        this.filterLabels()
      }
    },

    removefilterByLabel(label) {
      label.selected = false
      this.projectsLabelSelected.splice(this.projectsLabelSelected.indexOf(label), 1)
      this.filterLabels()
    },
  },
}
</script>

<template>
  <Layout>
    <div slot="content">
      <b-overlay :show="loading" no-wrap></b-overlay>
      <b-container fluid>
        <b-row v-if="projects.length" align-v="center" class="subheader">
          <b-col>
            <TitleLoading
              v-if="projects.length || loading"
              :title="$tc('Project', 2)"
              :subtitle="$t('Perfect project overview for modern teams')"
              :loading="loading"></TitleLoading>
          </b-col>
          <b-col class="d-flex justify-content-end" >

            <b-form-input
              v-model="seachByProjectName"
              autocomplete="off"
              type="search"
              size="sm"
              :placeholder="$t('Search by project name')"
            ></b-form-input>

            <b-form-select v-if="!isMobile" v-model="projectsStatusSelect" :options="projectsStatuses" size="sm" @change="filterByStatus"></b-form-select>

            <b-button v-if="!isMobile" v-b-toggle.collapse-1 variant="light" size="sm" @click="getLabels">
              <font-awesome-icon :icon="['fa', 'tags']" />
              Labels
            </b-button>

          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-collapse id="collapse-1">
              <div class="d-flex flex-wrap pt-2 pb-1 p-2">
                <div
                  v-for="(label, index) in projectsLabels"
                  :key="index"
                  class="badge badge-labels mg-b-5 cursor-pointer"
                  :style=" 
                    'border:1px solid ' + label.color  + ';color: ' + label.color + ';background:' + label.background
                  "
                  @click="handleFilterByLabel(label)"
                >
                  <div class="d-flex justify-content-end">
                    <span v-text="label.title"></span>
                    <span v-show="label.selected">
                      <font-awesome-icon :icon="['fa', 'times']" class="ml-5-px" />
                    </span>
                  </div>
                </div>
              </div>
            </b-collapse>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="p-2">
            <Alert v-if="projectAccess" :message="projectAccessMessage" :status="projectAccessStatus"></Alert>
            <div v-if="projects.length && !loading" style="margin-bottom: 180px">
              <ListProjects :disabled="canDragProjects" :data="projectsFiltered"></ListProjects>
            </div>
          </b-col>
        </b-row>
      </b-container>

      <div v-if="projects.length === 0 && !loading && canCreateProjects" class="projects-empty">
        <div class="projects-empty-modal">
          <div class="project-empty-content">
            <h3 class="tx-22-px fw-600">{{ $t('Create your first Project') }}</h3>
            <p class="tx-12-px txt-6C7293 mb-20-px">
              {{
                $t(
                  'Get a snapshot of daily progression, view reporting by team, individual and project within the tool or export to excel the time tracking'
                )
              }}
            </p>
            <button class="btn fw-500 tx-20-px btn-dark" @click="modal('projectCreate')">
              {{ $t('Create a Project') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="projects.length === 0 && !loading && !canCreateProjects" class="projects-empty">
        <div class="projects-welcome-modal">
          <div class="project-empty-content">
            <h3 class="tx-22-px fw-600">{{ $t('Welcome to ') }} {{ currentCompany.name }}</h3>
            <p class="tx-12-px txt-6C7293 mb-20-px">
              {{
                $t(
                  'The invitation was successfully accepted. There are no projects available for you.'
                )
              }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </Layout>
</template>
