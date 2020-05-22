<script>
import ListUsers from '@components/utils/list-users'
import { isMobile } from 'mobile-device-detect';

export default {
  components: {
    ListUsers
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('CURRENT_USER')),
      userMenu: [
        {
          title: this.$t('Profile'),
          subtitle: this.$t('Always keep your profile up to date'),
          style: '',
          route: 'profile.show',
          checkAuth: false,
        },
        /*
        {
          title: this.$t('Subscription'),
          subtitle: this.$t('Make updates or view invoices'),
          style: '',
          route: '',
          checkAuth: true,
        },
        */
      ],
      companyMenu: [
        {
          title: this.$t('Company Details'),
          subtitle: this.$t('Keep your info up to date'),
          style: '',
          route: 'companies.information',
        },
        {
          title: this.$t('Team Members'),
          subtitle: this.$t("Manage your company's team"),
          style: '',
          route: 'companies.teams.index',
        },
        {
          title: this.$t('White Label'),
          subtitle: this.$t('Custom domain with your logo!'),
          style: '',
          route: 'companies.whitelabel.custom-domain',
        },
        {
          title: this.$t('Templates'),
          subtitle: this.$t('Manage templates for company'),
          style: '',
          route: 'companies.template.workflow',
        },
        {
          title: this.$t('Billing'),
          subtitle: this.$t('Manage your subscriptions'),
          style: '',
          route: 'companies.billing',
        },
        /*
        {
          title: this.$t('Subscription'),
          subtitle: this.$t(''),
          style: '',
          route: 'companies.subscriptions',
        },
        */
        
      ],
    }
  },
  created() {
    
    if (this.currentUser) {
      this.userAvatar = this.currentUser.avatar
      this.userName = this.currentUser.name
      if (!this.authorize('company', 'update')) {
        this.userMenu = this.userMenu.filter((u) => u.checkAuth === false)
      }
    }

    if (isMobile) {
      this.getMenuForMobile()
    }
  },
  methods: {
    gaClickDropdrownUser(){
      this.$ga.event('header_bar', 'dropdown_user')
    },
    getMenuForMobile(){
      this.companyMenu = [
        {
          title: this.$t('Company Details'),
          subtitle: this.$t('Keep your info up to date'),
          style: '',
          route: 'companies.information',
        },
        {
          title: this.$t('Team Members'),
          subtitle: this.$t("Manage your company's team"),
          style: '',
          route: 'companies.teams.index',
        },
        {
          title: this.$t('Billing'),
          subtitle: this.$t('Manage your subscriptions'),
          style: '',
          route: 'companies.billing',
        }
      ]
    }
  }
}
</script>

<template>
  <li class="header-user">
    <b-dropdown right @shown="gaClickDropdrownUser">
      <template v-slot:button-content>
        <ListUsers :user="currentUser" :link="false" size="24"></ListUsers>
      </template>
      <b-dropdown-item v-for="item in userMenu" :key="item.title" :to="{ name: item.route }">
        <p v-text="item.title"></p>
        <span v-text="item.subtitle"></span>
      </b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-group :header="$t('Company')">
       <b-dropdown-item v-for="item in companyMenu" :key="item.title" :to="{ name: item.route }">
          <p v-text="item.title"></p>
          <span v-text="item.subtitle"></span>
        </b-dropdown-item>
      </b-dropdown-group>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item  :to="{ name: 'auth.logout' }">
          <p>{{ $t('Sign out') }}</p>
        </b-dropdown-item>
    </b-dropdown>
  </li>
</template>
