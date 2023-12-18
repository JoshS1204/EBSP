import service from '@/services/service'

const invitation = {
  state: () => ({
    contacts: [],
    original_contacts: []
  }),

  actions: {
    get_contacts_action({ commit, state, dispatch }, payload) {
      service
        .get_invited_contacts(payload)
        .then((response) => {
          let pass = {
            response: response.data.result.invitations,
            search: payload.search
          }
          dispatch('modify_contacts_action', pass)
        })
        .catch((err) => {
          // dispatch('notification', {
          //   status: true,
          //   type: 'error',
          //   message: err.response?.data?.message
          // })
        })
        .finally(() => {})
    },
    modify_contacts_action({ commit, state, dispatch }, payload) {
      let active_contacts_data = payload.response
      let modified_contacts = []
      for (let i in active_contacts_data) {
        let inner_contents = {
          uuid: active_contacts_data[i].uuid
        }

        for (let j in active_contacts_data[i].data) {
          inner_contents[active_contacts_data[i].data[j]['name']] =
            active_contacts_data[i].data[j]['value']
        }

        const name = `${inner_contents.first_name} ${inner_contents.last_name}`
        const initials = inner_contents.first_name?.[0] + inner_contents.last_name?.[0]

        inner_contents = {
          ...inner_contents,
          name: name == ' ' ? 'No Name' : name,
          initials: initials ? initials : 'NN',
          isChecked: false
        }

        modified_contacts.push(inner_contents)
      }
      modified_contacts.unshift({
        uuid: 0,
        name: '',
        email: 'Not Selected'
      })

      commit('SET_CONTACTS', modified_contacts)
      commit('SET_CONTACTS_ORIGINAL', modified_contacts)
    },
    filter_contacts_action({ commit, state, dispatch }, payload) {
      let contacts = payload.response
      let modified_contacts = []
      for (let i in contacts) {
        let toSearch = contacts[i].email.toLowerCase()
        if (toSearch.includes(payload.search.toLowerCase())) {
          modified_contacts.push(contacts[i])
        }
      }
      commit('SET_CONTACTS', modified_contacts)
    }
  },

  mutations: {
    SET_CONTACTS(state, data) {
      state.contacts = data
    },
    SET_CONTACTS_ORIGINAL(state, data) {
      state.original_contacts = data
    }
  },

  getters: {
    get_contacts(state) {
      return state.contacts
    }
  }
}

export default invitation
