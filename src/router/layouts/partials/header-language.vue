<script>
export default {
  components: {},
  data() {
    return {
      currentLanguage: null,
      currentFlag: '',
    }
  },
  created() {
    this.getCurrentLanguage()
  },
  methods: {
    getCurrentLanguage() {
      let language = JSON.parse(localStorage.getItem('CURRENT_LANGUAGE'))
      if (!language) {
        this.currentFlag = 'https://gitscrum-static.s3.amazonaws.com/flags/en-US.png'
        this.$root.$i18n.locale = 'en'
        return
      }
      this.$root.$i18n.locale = language.ALPHA2
      this.currentFlag = 'https://gitscrum-static.s3.amazonaws.com/flags/' + language.CODE + '.png'
    },
    getFlagByCode(code) {
      return 'https://gitscrum-static.s3.amazonaws.com/flags/' + code + '.png'
    },
    changeLanguage(language) {
      this.$ga.event('header_bar', 'change_language', language.NAME, 1)
      this.$root.$i18n.locale = language.ALPHA2
      localStorage.setItem('CURRENT_LANGUAGE', JSON.stringify(language))
      this.getCurrentLanguage()
    },
    gaClickDropdrownLanguage(){
      this.$ga.event('header_bar', 'dropdown_language')
    }
  },
}
</script>

<template>
  <li class="header-language">

    <b-dropdown left @shown="gaClickDropdrownLanguage">
      <template v-slot:button-content>
        <img :src="currentFlag" class="lang-flag" />
      </template>
      <b-dropdown-group :header="$t('Choose language') ">
        <b-dropdown-item v-for="language in $t('LANGUAGE')" :key="language.ALPHA2" @click="changeLanguage(language)">
          <img :src="getFlagByCode(language.CODE)" class="mr-2 lang-flag" /> 
          {{ language.NAME }} 
          <small v-show="language.BETA" class="beta">BETA</small>
        </b-dropdown-item>
      </b-dropdown-group>
    </b-dropdown>

  </li>
</template>
