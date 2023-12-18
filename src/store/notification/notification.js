const notification = {
  state: () => ({
    notifications: []
  }),

  actions: {
    notification({ commit, state }, payload) {
      commit('SET_NOTIFICATION', payload)

      setTimeout(() => {
        commit('CLEAR_NOTIFICATION', payload)
      }, 4000)
    }
  },

  mutations: {
    SET_NOTIFICATION(state, data) {
      state.notifications.push(data)
      if (state.notifications.length > 3) state.notifications.splice(0, 1)
    },
    CLEAR_NOTIFICATION(state, data) {
      const index = state.notifications.findIndex(
        (notification) => notification.message === data.message
      )
      state.notifications.splice(index, 1)
    }
  },

  getters: {
    get_notification(state) {
      return state.notifications
    }
  }
}

export default notification
