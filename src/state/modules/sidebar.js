export const state = {
    isOpenSidebar: true
}

export const getters = {
    isOpen(state) {
        return state.isOpenSidebar
    }
}

export const mutations = {
    CHANGE_STATE(state) {
        if (state.isOpenSidebar) {
            state.isOpenSidebar = false
            document.body.classList.add('az-sidebar-hide')
        } else {
            state.isOpenSidebar = true
            document.body.classList.remove('az-sidebar-hide')
        }
    }
}

export const actions = {
    changeState({
        commit,
        state,
        rootState
    }) {
        commit('CHANGE_STATE')
    },
}