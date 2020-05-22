export const state = {
    data: null
}

export const getters = {
    getWhiteLabel(state) {
        return state.data
    }
}

export const mutations = {
    SET(state, item) {
        state.data = item
    }
}

export const actions = {
    setWhiteLabel({
        commit,
        state,
        rootState
    }, item) {
        commit('SET', item)
    },
}