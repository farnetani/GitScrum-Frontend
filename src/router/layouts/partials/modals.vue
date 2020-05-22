<script>
import ProjectModal from '@components/projects/modal/project'
import UserStoryModal from '@components/projects/modal/user-story'
import SprintModal from '@components/projects/modal/sprint'
import TaskModal from '@components/projects/modal/task'

export default {
  components: {
    ProjectModal,
    UserStoryModal,
    SprintModal,
    TaskModal,
  },
}
</script>

<template>
  <div>
    <ProjectModal></ProjectModal>
    <UserStoryModal></UserStoryModal>
    <SprintModal></SprintModal>
    <TaskModal></TaskModal>
  </div>
</template>
