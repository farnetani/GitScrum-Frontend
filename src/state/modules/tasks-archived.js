export const state = {
    data: false
}

export const getters = {
    getIsArchived(state) {
        return state.data
    }
}

export const mutations = {
    SET(state, item) {
        state.data = item
    }
}

export const actions = {
    setIsArchived({
        commit,
        state,
        rootState
    }, item) {
        commit('SET', item)
    },
}