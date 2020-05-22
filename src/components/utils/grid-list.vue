<script>
export default {
  props: {
    collumns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<template>
  <div class="divTable">
    <!-- Colunas da grid -->
    <div class="divTableHead">
      <div class="divTableRow">
        <div v-for="(col, index) in collumns" :key="index" class="divTableCell text-center" :style="col.style">
          <div v-html="col.value"></div>
        </div>
      </div>
    </div>

    <div class="divTableBody">
      <div v-for="(userStory, index) in userStories" :key="index" class="divTableRow">
        <div class="divTableCell text-center">
          <div class="container-img-profile">
            <ListUsers :user="userStory.user" :link="true"></ListUsers>
          </div>
        </div>
        <div class="divTableCell">
          <div>
            <router-link
              :to="{
                name: 'projects.user-stories.show',
                params: {
                  companySlug: userStory.company.slug,
                  projectSlug: userStory.project.slug,
                  userStorySlug: userStory.slug,
                },
              }"
              class="tx-inverse tx-bold"
            >
              {{ userStory.code }} - {{ userStory.title | subStr(35) }}
            </router-link>
            <p class="mb-0">
              <span>Tasks: {{ userStory.stats.tasks }}</span>
              /
              <span> Story Points: {{ userStory.stats.story_points }} </span>
              /
              <span> Worked hours: {{ userStory.stats.worked_hours }} </span>
            </p>
          </div>
        </div>
        <div class="divTableCell">
          <span
            v-if="userStory.priority"
            class="badge badge-primary priority"
            :style="'color: ' + invertColor(userStory.priority.color, true) + ';background:' + userStory.priority.color"
          >
            {{ userStory.priority.title }}
          </span>
        </div>
        <div class="divTableCell">
          <span>{{ parseFloat(userStory.stats.completed) | percent(0) }}</span>
        </div>
        <div class="divTableCell d-flex align-items-center justify-content-center">
          <ProjectUsers></ProjectUsers>
        </div>
        <div class="divTableCell">
          <span>
            <i class="far fa-check-circle"></i>
            {{ getAssignTasks(userStory.id, userStory.user.username) }}
            Assign Tasks
          </span>
        </div>
      </div>
    </div>
  </div>
  <!-- DivTable -->
</template>
