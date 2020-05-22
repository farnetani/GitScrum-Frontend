export const state = {
    modal: Math.random()
}

export const getters = {
    statusModal(state) {
        return state.modal
    }
}

export const mutations = {
    SET_OPEN(state, item) {
        state.modal = {
            item
        }, {
            '1': Math.random()
        }
    },
}

export const actions = {
    open({
        commit,
        state,
        rootState
    }, item) {
        //$('html').addClass('modal-open')
        commit('SET_OPEN', item)
    },
}