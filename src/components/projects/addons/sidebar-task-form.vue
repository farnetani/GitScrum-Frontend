<script>
export default {
  data() {
    return {
      data: [
        {
          label: this.$t('Form Answers'),
          route: 'projects.addons.task-form',
        },
        {
          label: this.$t('Settings'),
          route: 'projects.addons.task-form.settings',
        },
      ],
    }
  },
}
</script>

<template>
  <nav class="sidebar sidebar-offcanvas">
    <ul class="nav">
      <li class="nav-item">
        <div class="sidebar-menu-title">
          <span>{{ $t('Form2Task') }}</span>
        </div>
        <ul class="nav submenu-wrapper">
          <li v-for="item in data" :key="item.route" class="nav-item">
            <router-link :to="{ name: item.route }" class="nav-link">
              <span class="menu-title">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
