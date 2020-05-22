export const state = {
    filters: Math.random()
}

export const getters = {
    statusFilter(state) {
        return state.filters
    }
}

export const mutations = {
    SET_FILTER(state, filter) {
        state.filters = {
            filter
        }, {
            '1': Math.random()
        }
    },
}

export const actions = {
    setFilter({
        commit,
        state,
        rootState
    }, filter) {
        commit('SET_FILTER', filter)
    },
}