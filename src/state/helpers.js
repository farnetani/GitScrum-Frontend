import Axios from '@utils/axios'

import {
    mapState,
    mapGetters,
    mapActions
} from 'vuex'

export const authComputed = {
    ...mapState('auth', {
        currentUser: (state) => state.currentUser,
    }),
    ...mapGetters('auth', ['loggedIn']),
}

export const authMethods = mapActions('auth', ['logIn', 'logOut'])

/*
export const sidebar = {
    ...mapState('sidebar', {
        isOpenSidebar: (state) => state.isOpenSidebar,
    }),
    ...mapGetters('sidebar', ['isOpen']),
    ...mapActions('sidebar', ['changeState']),
}


*/

export const whiteLabel = {
    ...mapGetters('whiteLabel', ['getWhiteLabel']),
    ...mapActions('whiteLabel', ['setWhiteLabel']),
}

export const project = {
    ...mapGetters('project', ['getProject']),
    ...mapActions('project', ['setProject']),
}

export const tasksArchived = {
    ...mapGetters('tasksArchived', ['getIsArchived']),
    ...mapActions('tasksArchived', ['setIsArchived']),
}

export const projectSidebar = {
    ...mapGetters('projectSidebar', ['getSidebar']),
    ...mapActions('projectSidebar', ['setSidebar']),
}

export const modalManager = {
    ...mapGetters('modalManager', ['statusModal']),
    ...mapActions('modalManager', ['open']),
}

export const taskManager = {
    ...mapGetters('taskManager', ['statusTask']),
    ...mapActions('taskManager', ['actionTask']),
}

export const taskFilter = {
    ...mapGetters('taskFilter', ['statusFilter']),
    ...mapActions('taskFilter', ['setFilter']),
}

/*
export const projectMembers = {
    fetchProjectMembers: function(company, project, page) {
        let concat = company + '/-' + project
        let cookieName = 'project-members-' + concat
        let cookie = this.$cookies.get(cookieName)
        if (!cookie) {
            Axios()
                .get(
                    '/project-team-members/' +
                    '?company_slug=' +
                    company +
                    '&project_slug=' +
                    project
                )
                .then((response) => {
                    this.$cookies.set(cookieName, true, 100)
                    let data = JSON.stringify(response.data.data)
                    localStorage.setItem(cookieName, data)
                    return JSON.parse(data)
                })
                .catch((e) => {
                    console.error(e)
                })
        } else {
            return JSON.parse(localStorage.getItem(cookieName))
        }
    }
}

/*



export const boardTask = {
  ...mapState('listTasks', {
    listTasks: (state) => state.listTasks,
  }),
  ...mapGetters('boardTask', ['getTasks']),
  ...mapActions('boardTask', ['populate']),
}
*/