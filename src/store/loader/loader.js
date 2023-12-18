const loader = {
    state: () => ({
        status: false
    }),

    actions: {
        loader_action({ commit, state }, payload) {
            commit('SET_LOADER', payload);
        },
    },

    mutations: {
        SET_LOADER(state, data) {
            state.status = data;
        },
    },

    getters: {
        get_loader(state) {
            return state.status;
        },
    }
}

export default loader;