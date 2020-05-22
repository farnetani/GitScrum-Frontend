<script>
import ProjectDetails from '@components/projects/modal/settings/project-details'
import ProjectTaskTypes from '@components/projects/modal/settings/project-task-types'
import ProjectTaskEfforts from '@components/projects/modal/settings/project-task-efforts'
import ProjectUserStoryPriorities from '@components/projects/modal/settings/project-user-story-priorities'
import ProjectTaskCustomFields from '@components/projects/modal/settings/project-task-custom-fields'
import ProjectTaskChecklists from '@components/projects/modal/settings/project-task-checklists'
import { modalManager } from '@state/helpers'

export default {
  components: {
    ProjectDetails,
    ProjectTaskTypes,
    ProjectTaskEfforts,
    ProjectUserStoryPriorities,
    ProjectTaskCustomFields,
    ProjectTaskChecklists,
  },
  data() {
    return {}
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },
  },
}
</script>

<template>
  <div class="dropdown-style no-shadow">
    <b-dropdown dropup>
      <template v-slot:button-content>
        <span class="icon-size mr-8-px"><font-awesome-icon :icon="['far', 'sliders-v-square']"/></span>
        <span>{{ $t('Project Settings') }}</span>
      </template>
      <b-dropdown-item :to="{
                  name: 'project.settings.details',
                  params: {
                    companySlug: this.$route.params.companySlug,
                    projectSlug: this.$route.params.projectSlug,
                  },
                }">
        <span>{{ $t('Project Details') }}</span>
      </b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item @click="modal('projectTaskTypes')">
        <span>{{ $t('Task Types') }}</span>
      </b-dropdown-item>
      <b-dropdown-item @click="modal('projectTaskEfforts')">
        <span>{{ $t('Task Efforts') }}</span>
      </b-dropdown-item>
      <b-dropdown-item @click="modal('projectTaskCustomFields')">
        <span>{{ $t('Task Custom Fields') }}</span>
      </b-dropdown-item>
      <b-dropdown-item @click="modal('projectTaskChecklists')">
        <span>{{ $t('Task Checklists') }}</span>
      </b-dropdown-item>
      <b-dropdown-item @click="modal('projectUserStoryPriorities')">
        <span>{{ $t('User Story Priorities') }}</span>
      </b-dropdown-item>
    </b-dropdown>

    <ProjectDetails></ProjectDetails>
    <ProjectTaskTypes></ProjectTaskTypes>
    <ProjectTaskEfforts></ProjectTaskEfforts>
    <ProjectUserStoryPriorities></ProjectUserStoryPriorities>
    <ProjectTaskCustomFields></ProjectTaskCustomFields>
    <ProjectTaskChecklists></ProjectTaskChecklists>
  </div>
</template>
