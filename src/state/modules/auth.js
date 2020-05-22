import axios from 'axios'
import appConfig from '@src/app.config'
import router from '@router'

export const state = {
    currentToken: getSavedState('ACCESS_TOKEN'),
}

export const mutations = {
    SET_CURRENT_USER(state, newValue) {
        state.currentToken = newValue
        saveState('ACCESS_TOKEN', newValue)
        setDefaultAuthHeaders(state)
    }
}

export const getters = {
    // Whether the user is currently logged in.
    loggedIn(state) {
        return !!state.currentUser
    },
}

export const actions = {
    // This is automatically run in `src/state/store.js` when the app
    // starts, along with any other actions named `init` in other modules.
    init({
        state,
        dispatch
    }) {
        setDefaultAuthHeaders(state)
        dispatch('validate')
    },

    // Logs in the current user.
    logIn({
        commit,
        dispatch,
        getters
    }, {
        username,
        password
    } = {}) {
        if (getters.loggedIn) return dispatch('validate')

        return axios
            .post('/api/session', {
                username,
                password
            })
            .then((response) => {
                const user = response.data
                commit('SET_CURRENT_USER', user)
                return user
            })
    },

    // Logs out the current user.
    logOut({
        commit
    }) {
        commit('SET_CURRENT_USER', null)
    },

    // Validates the current user's token and refreshes it
    // with new data from the API.
    validate({
        commit,
        state
    }) {
        /*
        if (!localStorage.getItem('ACCESS_TOKEN')) return Promise.resolve(null)
        return axios
          .post('/auth/refresh', null,{
              baseURL: appConfig.APIBaseURL,
            })
          .then((response) => {
            const token = `${response.data.data.token_type} ${response.data.data.access_token}`
            commit('SET_CURRENT_USER', token)
            return response
          })
          .catch((error) => {
            return error
          })
          */
    },
}

// ===
// Private helpers
// ===

function getSavedState(key) {
    return JSON.parse(window.localStorage.getItem(key))
}

function saveState(key, state) {
    window.localStorage.setItem(key, JSON.stringify(state))
}

function setDefaultAuthHeaders(state) {
    axios.defaults.headers.common.Authorization = state.currentToken ?
        state.currentToken :
        ''
}