import Vue from 'vue'
import App from './app'
import router from '@router'
import store from '@state/store'
import '@components/_globals'
import BootstrapVue from 'bootstrap-vue'
import TimeAgo from 'vue2-timeago'
import VueApexCharts from 'vue-apexcharts'
import VueSilentbox from 'vue-silentbox'
import moment from 'moment'
import $ from 'jquery' // Global event bus
import VueRx from 'vue-rx'
import VueI18n from 'vue-i18n'
import VueAxios from 'vue-axios'
import VueSocialauth from 'vue-social-auth'
import axios from 'axios'
import VueCookies from 'vue-cookies'
import Axios from '@utils/axios'
import vueNotVisible from 'vue-not-visible'
import VueAnalytics from 'vue-analytics';
import appConfig from '@src/app.config'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fal } from '@fortawesome/pro-light-svg-icons'
import { far } from '@fortawesome/pro-regular-svg-icons'
import { fas } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


Vue.use(VueCookies)
Vue.use(vueNotVisible)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import svgJs from "./svg.js"
Vue.use(svgJs);


var infiniteScroll = require('vue-infinite-scroll');
Vue.use(infiniteScroll)

Vue.use(require('vue-shortkey'))

Vue.use(VueAnalytics, {
    id: 'UA-162930772-1',
    router
});

import VueSidebarMenu from 'vue-sidebar-menu'
Vue.use(VueSidebarMenu)

import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
    preLoad: 1.1,
    attempt: 2
})

import VueClipboard from 'vue-clipboard2'
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)



import {
    languages,
    defaultLocale
} from './i18n/index.js'

library.add(fal, far, fas)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(VueI18n)
const messages = Object.assign(languages)

import Vue2Filters from 'vue2-filters'
Vue.use(Vue2Filters)

var i18n = new VueI18n({
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages,
})

Vue.use(VueAxios, axios)
Vue.use(VueSocialauth, {
    providers: {
        github: {
            clientId: appConfig.github.clientId,
            redirectUri: 'https://gitscrum.com/login',
        },
        facebook: {
            clientId: appConfig.facebook.clientId,
            redirectUri: 'https://gitscrum.com/login',
        },
        google: {
            clientId: appConfig.google.clientId,
            redirectUri: 'https://gitscrum.com/login',
        },
    },
})

Vue.prototype.$eventBus = new Vue()

Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
Vue.use(VueSilentbox)
Vue.use(BootstrapVue)
Vue.use(TimeAgo)
Vue.use(VueRx)
window.jQuery = $
window.$ = $

// Don't warn about using the dev version of Vue in development.
Vue.config.productionTip = process.env.NODE_ENV === 'production'
    // Call JWT and Axios
    // Vue.prototype.$http = axios;
    // const accessToken = localStorage.getItem('acess_token')
    // if (accessToken) {
    //     Vue.prototype.$http.defaults.headers.common['Authorization'] = accessToken
    // }
    // If running inside Cypress...
if (process.env.VUE_APP_TEST === 'e2e') {
    // Ensure tests fail when Vue emits an error.
    Vue.config.errorHandler = window.Cypress.cy.onUncaughtException
}

Vue.mixin({
    methods: {
        getDomain(sufix) {
            return window.location.origin + '/' + sufix + '/'
        },
        fetchProject(company, project) {
            Axios()
                .get('projects/' + project + '/?company_slug=' + company)
                .then((response) => {

                    this.$store.dispatch('projectSidebar/setSidebar', null)
                    this.$store.dispatch('project/setProject', response.data.data)

                })
                .catch((e) => {
                    console.error(e)
                })
        },

        getProjectRole(isMine) {

            let currentUser = JSON.parse(localStorage.getItem('CURRENT_USER'))
            let currentCompany = JSON.parse(localStorage.getItem('CURRENT_COMPANY'))

            if (!currentUser) {
                return 'restricted'
            }

            if (isMine || currentUser.username === currentCompany.owner.username) {
                return 'admin'
            }

            let project = this.$store.getters['project/getProject']

            if (project !== null &&
                project.slug === this.$route.params.projectSlug &&
                project.company.slug === this.$route.params.companySlug) {

                return project.logged_user_role.name

            }

            this.fetchProject(this.$route.params.companySlug, this.$route.params.projectSlug)

            let projects = this.$store.getters['project/getProject']
            return projects.logged_user_role.name
        },

        getCompanyRole() {
            let role = null
            let currentUser = JSON.parse(localStorage.getItem('CURRENT_USER'))
            let currentCompany = JSON.parse(localStorage.getItem('CURRENT_COMPANY'))

            if (currentUser.username === currentCompany.owner.username) {
                role = 'admin'
            }

            return role
        },

        getCompanyCreateProjectRule() {
            let currentCompany = JSON.parse(localStorage.getItem('CURRENT_COMPANY'))

            if (currentCompany && currentCompany.settings && currentCompany.settings.can_create_projects) {
                return currentCompany.settings.can_create_projects
            }
            return false
        },

        authorize(feature, action, isMine = false) {
            let role = null
            if (feature === 'company') {
                role = this.getCompanyRole()
                if (role === null && action === 'create') {
                    return this.getCompanyCreateProjectRule()
                }
            } else {
                role = this.getProjectRole(isMine)
            }

            if (role === null) {
                return false
            }

            const permission = {
                header: {
                    admin: {
                        users: true,
                        filters: true,
                        share: true,
                    },
                    member: {
                        users: true,
                        filters: true,
                        share: true,
                    },
                    restricted: {
                        users: true,
                        filters: true,
                        share: false,
                    },
                    guest: {
                        users: false,
                        filters: true,
                        share: false,
                    },
                },
                settings: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                sprints: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                userStories: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                discussions: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    restricted: {
                        create: true,
                        read: false,
                        update: true,
                        delete: true,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                documents: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                projectApps: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                teamMembers: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: false,
                        read: true,
                        update: false,
                        delete: false,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                },
                tasks: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: true,
                        delete: false,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: false,
                        read: true,
                        update: false,
                        delete: false,
                    },
                },
                comments: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    member: {
                        create: true,
                        read: true,
                        update: false,
                        delete: false,
                    },
                    restricted: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                    },
                    guest: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                },
                company: {
                    admin: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                },
            }

            return permission[feature][role][action]
        },
        authentication(response, remember = false) {

            let token = JSON.stringify('Bearer ' + response.data.data.access_token)

            if (remember) {
                localStorage.setItem('REMEMBER', true)
            } else {
                if (localStorage.getItem('REMEMBER')) {
                    localStorage.removeItem('REMEMBER')
                }
            }

            this.$cookies.set('username', response.data.data.user.username, (60 * 60 * 24 * 30))
            this.$cookies.set('company', response.data.data.companies[0].name, (60 * 60 * 24 * 30))

            localStorage.setItem('ACCESS_TOKEN', token)
            localStorage.setItem('CURRENT_USER', JSON.stringify(response.data.data.user))
            localStorage.setItem('COMPANIES_USER', JSON.stringify(response.data.data.companies))
            localStorage.setItem('CURRENT_COMPANY', JSON.stringify(response.data.data.companies[0]))

            this.$router.push({
                name: 'workspaces.projects',
            })
        },

        padZero(input) {
            let str = '' + input
            let pad = '000'
            return pad.substring(0, pad.length - str.length) + str
        },
        invertColor(hex, bw) {
            if (hex !== undefined) {
                if (hex.indexOf('#') === 0) {
                    hex = hex.slice(1)
                }
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
                }
                if (hex.length !== 6) {
                    throw new Error('Invalid HEX color.')
                }
                var r = parseInt(hex.slice(0, 2), 16)
                var g = parseInt(hex.slice(2, 4), 16)
                var b = parseInt(hex.slice(4, 6), 16)
                if (bw) {
                    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF'
                }

                r = (255 - r).toString(16)
                g = (255 - g).toString(16)
                b = (255 - b).toString(16)

                return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b)
            }
        },
        workflowState(state) {
            if (state === 1) {
                return ['far', 'check-double']
            } else if (state === 2) {
                return ['fas', 'rabbit-fast']
            }
            return ['fas', 'rabbit']
        },
        momentLocale(timestamp) {
            var locale = window.navigator.userLanguage || window.navigator.language
            let newTimestamp = timestamp * 1000
            return moment(newTimestamp)
                .locale(locale)
                .format('L LT')
        },
        closeModal(ref) {
            ref.hide()
        },
        msgBoxConfirmConfig() {
            return {
                size: 'sm',
                buttonSize: 'sm',
                okVariant: 'danger',
                okTitle: this.$t('YES'),
                cancelTitle: this.$t('NO'),
                footerClass: 'p-2',
                hideHeader: true,
                centered: true,
                modalClass: 'modal-confirm'
            }
        },
        gotoScrollTop() {
            document.getElementById('app').scrollIntoView();
        }
    },
})

router.beforeEach((to, from, next) => {

    if (to.params.projectSlug && to.params.companySlug) {

        let project = store.getters['project/getProject']

        if (project !== null &&
            project.slug === to.params.projectSlug &&
            project.company.slug === to.params.companySlug) {

            next()

        } else {

            if (to.meta.authRequired) {
                Axios()
                    .get('projects/' + to.params.projectSlug + '/?company_slug=' + to.params.companySlug)
                    .then((response) => {

                        store.dispatch('projectSidebar/setSidebar', null)
                        store.dispatch('project/setProject', response.data.data)
                        next()

                    })
                    .catch((e) => {
                        console.error(e)
                    })
            } else {
                next()
            }

        }
    } else {
        next()
    }

})


const app = new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App),
}).$mount('#app')

// If running e2e tests...
if (process.env.VUE_APP_TEST === 'e2e') {
    // Attach the app to the window, which can be useful
    // for manually setting state in Cypress commands
    // such as `cy.logIn()`.
    window.__app__ = app
}