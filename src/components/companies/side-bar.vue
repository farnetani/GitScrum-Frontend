<script>
export default {
  data() {
    return {
      data: [
        {
          title: this.$t('Company'),
        },
        {
          label: this.$t('Company Details'),
          route: 'companies.information',
        },
        {
          label: this.$t('Team Members'),
          route: 'companies.teams.index',
        },
        {
          label: this.$t('White Label Setup'),
          route: 'companies.whitelabel.custom-domain',
        },
        {
          label: this.$t('Billing'),
          route: 'companies.billing',
        },
        {
          space: true,
        },
        {
          title: this.$t('Templates'),
        },
        {
          label: this.$t('Workflows'),
          route: 'companies.template.workflow',
        },
        {
          label: this.$t('Task Types'),
          route: 'companies.template.type',
        },
        {
          label: this.$t('Task Efforts'),
          route: 'companies.template.effort',
        },
        {
          label: this.$t('Task Custom Fields'),
          route: 'companies.template.field',
        },
        {
          label: this.$t('Task Checklists'),
          route: 'companies.template.checklist',
        },
        {
          label: this.$t('User Story Priorities'),
          route: 'companies.template.priority',
        },
      ],
    }
  },
}
</script>

<template>
  <nav  v-not-visible="'tablet'" class="sidebar sidebar-offcanvas">
    <ul class="nav">
      <li class="nav-item">
        <ul class="nav submenu-wrapper">
          <li v-for="item in data" :key="item.route" class="nav-item">
            <div v-if="item.space" class="mt-2"> </div>
            <div v-if="item.title" class="sidebar-menu-title mb-0">
              <span>{{ item.title }}</span>
            </div>
            <router-link :to="{ name: item.route }" class="nav-link">
              <span class="menu-title">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
