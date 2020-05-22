export const state = {
    sidebarItems: null
}

export const getters = {
    getSidebar(state) {
        return state.sidebarItems
    }
}

export const mutations = {
    SET(state, item) {
        state.sidebarItems = item
    }
}

export const actions = {
    setSidebar({
        commit,
        state,
        rootState
    }, item) {
        commit('SET', item)
    },
}