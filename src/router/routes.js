// import store from '@state/store'
import Axios from '@utils/axios'

export default [{
        path: '/',
        meta: {
            authRequired: false,
            beforeResolve(routeTo, routeFrom, next) {
                if (window.location.hostname === 'gitscrum.com') {
                    location.href = 'https://site.gitscrum.com'
                } else {
                    location.href = '/login'
                }
            },
        },
        component: () => lazyLoadView(
            import ('@views/dashboard/show')),
    },
    {
        path: '/login/:provider/callback',
        component: {
            template: '<div class="auth-component"></div>',
        },
    },
    {
        path: '/login',
        name: 'auth.login',
        component: () => lazyLoadView(
            import ('@views/auth/login')),
    },
    {
        path: '/create-account',
        name: 'auth.create-account',
        component: () => lazyLoadView(
            import ('@views/auth/create-account')),
    },
    {
        path: '/forgot-password',
        name: 'auth.forgot-password',
        component: () => lazyLoadView(
            import ('@views/auth/forgot-password')),
    },
    {
        path: '/reset-password/:token',
        name: 'auth.reset-password',
        component: () => lazyLoadView(
            import ('@views/auth/reset-password')),
    },
    {
        path: '/confirm-email/:token',
        name: 'auth.confirm-email',
        component: () => lazyLoadView(
            import ('@views/auth/confirm-email')),
    },
    {
        path: '/logout',
        name: 'auth.logout',
        meta: {
            authRequired: true,
            beforeResolve(routeTo, routeFrom, next) {
                Axios().post('auth/logout')

                localStorage.removeItem('ACCESS_TOKEN')
                localStorage.removeItem('CURRENT_USER')
                localStorage.removeItem('COMPANIES_USER')
                localStorage.removeItem('CURRENT_COMPANY')
                localStorage.removeItem('REMEMBER')

                next({
                    name: 'auth.login',
                })
            },
        },
    },

    {
        path: '/welcome',
        name: 'welcome.show',
        meta: {
            authRequired: false,
        },
        component: () => lazyLoadView(
            import ('@views/welcome/show')),
    },
    {
        path: '/dashboard',
        name: 'dashboard.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/dashboard/show')),
    },
    {
        path: '/projects',
        name: 'workspaces.projects',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/workspaces/projects')),
    },
    {
        path: '/team',
        name: 'companies.teams.index',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/team/index')),
    },
    {
        path: '/teams/log',
        name: 'companies.teams.log',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/team/log')),
    },

    {
        path: '/company/information',
        name: 'companies.information',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/settings/information')),
    },
    {
        path: '/company/billing',
        name: 'companies.billing',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/billing/index')),
    },

    {
        path: '/company/whitelabel/custom-domain',
        name: 'companies.whitelabel.custom-domain',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/whitelabel/custom-domain')),
    },
    {
        path: '/marketplace/templates',
        name: 'marketplace.templates',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/marketplace/templates/list')),
    },
    {
        path: '/marketplace/templates/:template',
        name: 'marketplace.templates.index',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/marketplace/templates/index')),
    },
    {
        path: '/marketplace/templates/:template/:slug',
        name: 'marketplace.templates.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/marketplace/templates/show')),
    },
    {
        path: '/profile',
        name: 'profile.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/users/profile/show')),
    },

    {
        path: '/profile/mysettings',
        name: 'profile.mysettings',
        meta: {
            authRequired: true,
        },
        props: {
            selectedTab: 'mysettings',
        },
        component: () => lazyLoadView(
            import ('@views/users/profile/show')),
    },

    {
        path: '/in/:username',
        name: 'profile.user',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/users/profile/show')),
    },

    /*
     *
     * COMPANY TEMPLATES
     *
     */

    {
        path: '/company/templates/workflow',
        name: 'companies.template.workflow',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/workflow')),
    },
    {
        path: '/company/templates/task-type',
        name: 'companies.template.type',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/task-type')),
    },
    {
        path: '/company/templates/task-effort',
        name: 'companies.template.effort',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/task-effort')),
    },
    {
        path: '/company/templates/user-story-priority',
        name: 'companies.template.priority',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/user-story-priority')),
    },
    {
        path: '/company/templates/task-checklist',
        name: 'companies.template.checklist',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/task-checklist')),
    },
    {
        path: '/company/templates/task-custom-field',
        name: 'companies.template.field',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/templates/task-custom-field')),
    },


    // Company Profile
    {
        path: '/:companySlug',
        name: 'company.profile',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/companies/profile/show')),
    },

    /*
     *
     * PROJECTS
     *
     */
    {
        path: '/bp/:token',
        name: 'projects.board-shared',
        meta: {
            authRequired: false,
        },
        component: () => lazyLoadView(
            import ('@views/projects/board-shared')),
    },
    {
        path: '/task-form/:token',
        name: 'projects.addons.task-form.public',
        meta: {
            authRequired: false,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/task-form/public')),
    },
    {
        path: '/:companySlug/:projectSlug',
        name: 'projects.board',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/board')),
    },

    {
        path: '/:companySlug/:projectSlug/task/:taskSlug',
        name: 'projects.board.task-details',
        meta: {
            authRequired: false,
        },
        component: () => lazyLoadView(
            import ('@views/projects/task')),
    },

    // User Stories
    {
        path: '/:companySlug/:projectSlug/user-stories',
        name: 'projects.user-stories',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/user-stories/list-user-stories')),
    },
    {
        path: '/:companySlug/:projectSlug/user-stories/:userStorySlug',
        name: 'projects.user-stories.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/user-stories/show')),
    },
    {
        path: '/:companySlug/:projectSlug/user-stories/:userStorySlug/assign-tasks',
        name: 'projects.user-stories.assign-tasks',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/user-stories/assign-tasks')),
    },
    {
        path: '/:companySlug/:projectSlug/user-stories/:userStorySlug/edit',
        name: 'projects.user-stories.edit',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/user-stories/edit')),
    },
    // Sprints
    {
        path: '/:companySlug/:projectSlug/sprints',
        name: 'projects.sprints',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/sprints/list-sprints')),
    },
    {
        path: '/:companySlug/:projectSlug/sprints/:sprintSlug',
        name: 'projects.sprints.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/sprints/show')),
    },
    {
        path: '/:companySlug/:projectSlug/sprints/:sprintSlug/assign-tasks',
        name: 'projects.sprints.assign-tasks',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/sprints/assign-tasks')),
    },

    // Discussions
    {
        path: '/:companySlug/:projectSlug/discussions',
        name: 'projects.discussions',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/discussions/list-discussions')),
    },
    {
        path: '/:companySlug/:projectSlug/discussions/:discussionId',
        name: 'projects.discussions.show',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/discussions/show')),
    },
    // Documents
    {
        path: '/:companySlug/:projectSlug/documents',
        name: 'projects.documents',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/documents/list-documents')),
    },
    // Addons - Form
    {
        path: '/:companySlug/:projectSlug/addons/task-form',
        name: 'projects.addons.task-form',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/task-form')),
    },
    {
        path: '/:companySlug/:projectSlug/addons/task-form/settings',
        name: 'projects.addons.task-form.settings',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/task-form/settings')),
    },
    // Addons - Calendar
    {
        path: '/:companySlug/:projectSlug/addons/calendar',
        name: 'projects.addons.calendar',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/calendar')),
    },
    // Addons - Time Tracking
    {
        path: '/:companySlug/:projectSlug/addons/time-tracking',
        name: 'projects.addons.time-tracking',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/time-tracking')),
    },
    // Addons - Rockstar team
    {
        path: '/:companySlug/:projectSlug/addons/rockstar-team',
        name: 'projects.addons.rockstar-team',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/rockstar-team')),
    },
    // Addons - Changelog
    {
        path: '/:companySlug/:projectSlug/addons/changelog',
        name: 'projects.addons.changelog',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/changelog')),
    },
    // Addons - Gantt
    {
        path: '/:companySlug/:projectSlug/addons/gantt',
        name: 'projects.addons.gantt',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/gantt')),
    },

    // Project Team Members
    {
        path: '/:companySlug/:projectSlug/team-members',
        name: 'project.team-members.index',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/team-members')),
    },

    // Project Settings
    {
        path: '/:companySlug/:projectSlug/settings',
        name: 'project.settings.details',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/settings/details')),
    },

    // Project Mind Mapping
    {
        path: '/:companySlug/:projectSlug/addons/mind-mapping',
        name: 'project.addons.mind-mapping',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/addons/mind-mapping/show')),
    },

    // Project API Management
    {
        path: '/:companySlug/:projectSlug/api-management',
        name: 'project.settings.api-management',
        meta: {
            authRequired: true,
        },
        component: () => lazyLoadView(
            import ('@views/projects/settings/api')),
    },
    {
        path: '/ooops',
        name: 'ooops',
        component: require('@views/_ooops').default,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    // Redirect any unmatched routes to the 404 page. This may
    // require some server configuration to work in production:
    // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
    {
        path: '*',
        redirect: 'ooops',
    },
]

// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@views/my-view')
//
function lazyLoadView(AsyncView) {
    const AsyncHandler = () => ({
        component: AsyncView,
        // A component to use while the component is loading.
        loading: require('@views/_loading').default,
        // Delay before showing the loading component.
        // Default: 200 (milliseconds).
        delay: 400,
        // A fallback component in case the timeout is exceeded
        // when loading the component.
        error: require('@views/_timeout').default,
        // Time before giving up trying to load the component.
        // Default: Infinity (milliseconds).
        timeout: 10000,
    })

    return Promise.resolve({
        functional: true,
        render(h, {
            data,
            children
        }) {
            // Transparently pass any props or children
            // to the view component.
            return h(AsyncHandler, data, children)
        },
    })
}