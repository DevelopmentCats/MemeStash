import { createStore } from 'vuex'

export default createStore({
  state: {
    memes: [],
    isLoading: false,
    error: null
  },
  getters: {
    getMemes: state => state.memes,
    isLoading: state => state.isLoading,
    hasError: state => state.error !== null,
    getError: state => state.error
  },
  mutations: {
    SET_MEMES(state, memes) {
      state.memes = memes
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchMemes({ commit }) {
      commit('SET_LOADING', true)
      try {
        // In a real app, this would be an API call
        const response = await fetch('/api/memes')
        const data = await response.json()
        commit('SET_MEMES', data)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_MEMES', [])
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  modules: {
    // For larger applications, you can split the store into modules
  }
})