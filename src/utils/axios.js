import axios from 'axios'
import appConfig from '@src/app.config'
//import store from '@state/store'

export default () => {

    let companySlug = ''

    /*
    let subscribers = []

    function addSubscriber(callback) {
        subscribers.push(callback)
    }

    function onAccessTokenFetched(token) {
        subscribers = subscribers.filter(callback => callback(token))
    }
    */

    if (localStorage.getItem('CURRENT_COMPANY')) {
        companySlug = JSON.parse(localStorage.getItem('CURRENT_COMPANY')).slug
    }

    var requestAxios = axios.create({
        baseURL: appConfig.APIBaseURL,
        headers: {
            'X-Custom-Header': 'GitScrum 2.0',
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('ACCESS_TOKEN'),
            params: {
                company_slug: companySlug
            },
        },
    })

    requestAxios.interceptors.response.use(function(response) {
        return response
    }, function(error) {

        const { response: { status } } = error

        if (parseInt(status) === 401) {
            return resetCredentials()
        }

        return Promise.reject(error)
    })

    return requestAxios
}

function resetCredentials() {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('CURRENT_USER')
    localStorage.removeItem('COMPANIES_USER')
    localStorage.removeItem('CURRENT_COMPANY')
    localStorage.removeItem('REMEMBER')
    location.href = '/login'
}