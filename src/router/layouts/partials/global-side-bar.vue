<script>
import Axios from '@utils/axios'
import ProjectMenuSettings from '@layouts/partials/project-menu-settings'
import ProjectVisibility from '@components/projects/project-visibility'
import ListUsers from '@components/utils/list-users'
import ProjectBoardFilters from '@layouts/partials/header-board-filters'
import ShareableBoard from '@layouts/partials/shareable-board'
import ProjectIntegrations from '@components/projects/modal/integrations/index'
import { modalManager } from '@state/helpers'
import { SidebarMenu } from 'vue-sidebar-menu'

export default {
  components: {
    ProjectMenuSettings,
    ProjectVisibility,
    ShareableBoard,
    ListUsers,
    ProjectBoardFilters,
    ProjectIntegrations,
    SidebarMenu,
  },
  props: {
    background: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      project: [],
      menu: [
          {
            header: true,
            title: 'Project Options',
            hiddenOnCollapse: true
          },
          {
            href: { 
              name: 'projects.board',
              params: {
                companySlug: this.$route.params.companySlug,
                projectSlug: this.$route.params.projectSlug,
              }
            },
            title: this.$t('Board'),
            icon: {
              element: 'font-awesome-icon', 
              attributes: 
              {
                icon: ['fa', 'columns']
              }
            }
          },
          {
            href: { 
              name: 'projects.addons.gantt',
              params: {
                companySlug: this.$route.params.companySlug,
                projectSlug: this.$route.params.projectSlug,
              }
            },
            title: this.$t('Gantt'),
            icon: {
              element: 'font-awesome-icon', 
              attributes: 
              {
                icon: ['far', 'sliders-h']
              }
            }
          },
          this.autorizeSprints(),
          this.autorizeUserStories(),
          this.autorizeDiscussions(),
          this.autorizeDocuments(),
          this.autorizeProjectApps(),
          this.autorizeTeamMembers()
      ]
    }
  },
  mounted(){
    let state = this.getMenuProjectState()
    this.onToggleCollapse(state)
  },
  created() {},
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },

    menuJSON(menuName, menuTitle, menuIcon){
      return {
        href: { 
          name: menuName,
          params: {
            companySlug: this.$route.params.companySlug,
            projectSlug: this.$route.params.projectSlug,
          }
        },
        title: menuTitle,
        icon: {
          element: 'font-awesome-icon', 
          attributes: 
          {
            icon: menuIcon
          }
        }
      }
    },

    autorizeSprints(){
      if ( this.authorize('sprints', 'read') ){
        return this.menuJSON('projects.sprints', this.$t('Sprints'), ['far', 'shipping-fast'])
      }
    },
    autorizeUserStories(){
      if ( this.authorize('userStories', 'read') ){
        return this.menuJSON('projects.user-stories', this.$t('User Stories'), ['far', 'box-full'])
      }
    },
    autorizeDiscussions(){
      if ( this.authorize('discussions', 'read') ){
        return this.menuJSON('projects.discussions', this.$t('Discussions'), ['far', 'comments-alt'])
      }
    },
    autorizeDocuments(){
      if ( this.authorize('documents', 'read') ){
        return this.menuJSON('projects.documents', this.$t('Documents'), ['far', 'folder-open'])
      }
    },
    autorizeProjectApps(){
      if ( this.authorize('projectApps', 'read') ){
        return {
          title: this.$t('Project Apps'),
          icon: {
            element: 'font-awesome-icon', 
            attributes: 
            {
              icon: ['far', 'rocket-launch']
            }
          },
          child: [
              {
              href: { 
                name: 'projects.addons.calendar',
                params: {
                  companySlug: this.$route.params.companySlug,
                  projectSlug: this.$route.params.projectSlug,
                }
              },
              title: this.$t('Calendar'),
              icon: {
                element: 'font-awesome-icon', 
                attributes: 
                {
                  icon: ['far', 'calendar-alt']
                }
              }
            },
            {
              href: { 
                name: 'projects.addons.time-tracking',
                params: {
                  companySlug: this.$route.params.companySlug,
                  projectSlug: this.$route.params.projectSlug,
                }
              },
              title: this.$t('Time Tracking'),
              icon: {
                element: 'font-awesome-icon', 
                attributes: 
                {
                  icon: ['far', 'stopwatch']
                }
              }
            },
            {
              href: { 
                name: 'projects.addons.rockstar-team',
                params: {
                  companySlug: this.$route.params.companySlug,
                  projectSlug: this.$route.params.projectSlug,
                }
              },
              title: this.$t('Rockstar Team'),
              icon: {
                element: 'font-awesome-icon', 
                attributes: 
                {
                  icon: ['far', 'comet']
                }
              }
            },
            {
              href: { 
                name: 'projects.addons.changelog',
                params: {
                  companySlug: this.$route.params.companySlug,
                  projectSlug: this.$route.params.projectSlug,
                }
              },
              title: this.$t('Changelog'),
              icon: {
                element: 'font-awesome-icon', 
                attributes: 
                {
                  icon: ['far', 'boxes']
                }
              }
            },
          ]
        }
      }
    },
    autorizeTeamMembers(){
      if ( this.authorize('teamMembers', 'read') ){
        return this.menuJSON('project.team-members.index', this.$t('Team Members'), ['fas', 'users'])
      }
    },
    
    getMenuProjectState(){
      let state = Boolean(localStorage.getItem('MENU_PROJECT_COLLAPSED'))
      return state
    }
  }
}
</script>

<template>
  <div class="global-side-bar">
    
    <SidebarMenu :menu="menu" :rtl="true" :collapsed="getMenuProjectState()"></SidebarMenu>

  </div>
</template>
