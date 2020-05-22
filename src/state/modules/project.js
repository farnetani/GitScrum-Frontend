export const state = {
    project: null
}

export const getters = {
    getProject(state) {
        return state.project
    }
}

export const mutations = {
    SET(state, item) {
        state.project = item
    }
}

export const actions = {
    setProject({
        commit,
        state,
        rootState
    }, item) {
        commit('SET', item)
    },
}