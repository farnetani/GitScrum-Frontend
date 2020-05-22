export const state = {
    task: Math.random()
}

export const getters = {
    statusTask(state) {
        return state.task
    }
}

export const mutations = {
    SET_OPEN(state, item) {
        state.task = {
            item
        }, {
            '1': Math.random()
        }
    },
}

export const actions = {
    actionTask({
        commit,
        state,
        rootState
    }, item) {
        commit('SET_OPEN', item)
    },
}