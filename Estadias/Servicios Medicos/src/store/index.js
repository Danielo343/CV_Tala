import { createStore } from 'vuex'
import AuthService from '@/services/auth'

// Verificar si hay usuario en localStorage
const user = JSON.parse(localStorage.getItem('user'))

export default createStore({
  state: {
    status: { loggedIn: !!user },
    user: user || null
  },
  mutations: {
    loginSuccess(state, user) {
      state.status.loggedIn = true
      state.user = user
    },
    loginFailure(state) {
      state.status.loggedIn = false
      state.user = null
    },
    logout(state) {
      state.status.loggedIn = false
      state.user = null
    }
  },
  actions: {
    login({ commit }, user) {
      return AuthService.login(user).then(
        user => {
          commit('loginSuccess', user)
          return Promise.resolve(user)
        },
        error => {
          commit('loginFailure')
          return Promise.reject(error)
        }
      )
    },
    logout({ commit }) {
      AuthService.logout()
      commit('logout')
    }
  },
  getters: {
    isLoggedIn: state => state.status.loggedIn,
    currentUser: state => state.user
  }
})
