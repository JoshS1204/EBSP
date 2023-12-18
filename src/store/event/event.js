import service from '@/services/service'
import config from '@/config'
import loader from '@/store/loader/loader'
import notification from '@/store/notification/notification'
import { generateUniqueHexColors } from '@/helpers/utilityFunctions'

const event = {
  state: () => ({
    event_details: {},
    assign_ticket_details: {},
    ticket_variation_relation: {},
    auto_save_button_text: ''
  }),

  actions: {
    save_seat_plan_action({ commit, state, dispatch }, payload) {
      commit('SET_AUTO_SAVE_BUTTON_TEXT', 'Saving...')
      service
        .save_seat_plan(payload.data)
        .then((response) => {
          if (payload.redirect) {
            let url = config.redirectUri + `${sessionStorage.getItem('event-id')}`
            window.location.href = url
          }
        })
        .catch((err) => {
          dispatch('notification', {
            status: true,
            type: 'error',
            message: err.response?.data?.message
          })
        })
        .finally(() => {
          commit('SET_AUTO_SAVE_BUTTON_TEXT', 'Saved')
          setTimeout(() => {
            commit('SET_AUTO_SAVE_BUTTON_TEXT', '')
          }, 2000)
        })
    },
    event_details_action({ commit, state, dispatch }, payload) {
      service
        .get_event_details()
        .then((response) => {
          commit('SET_EVENT_DETAILS', response.data.result.event)
          // dispatch('generate_assign_ticket_details', response.data.result.event.tickets)
        })
        .catch((err) => {
          dispatch('notification', {
            status: true,
            type: 'error',
            message: err.response?.data?.message
          })
        })
        .finally(() => {})
    },
    generate_assign_ticket_details({ commit, state }, payload) {
      let modified_event_data = []
      let variation_relation_data = []
      let tickets = payload.levels
      let uniqueHexaColorCodes = generateUniqueHexColors(tickets?.length)
      for (let i in tickets) {
        if (tickets[i]?.category != 'donation') {
          if (tickets[i]?.pricing_details[0]?.uuid) {
            let variation_parent = []
            for (let j in tickets[i].pricing_details) {
              let element = {
                name: tickets[i].pricing_details[j].variation,
                uuid: tickets[i].pricing_details[j].uuid,
                quantity: tickets[i].pricing_details[j].quantity_included,
                selectedCount: 0,
                color: uniqueHexaColorCodes[i]
              }
              variation_parent[tickets[i].uuid] = element;
            }
            variation_relation_data.push(variation_parent)
          } else {
            let element = {
              name: tickets[i].name,
              uuid: tickets[i].uuid,
              quantity: tickets[i].quantity,
              selectedCount: 0,
              color: uniqueHexaColorCodes[i]
            }
            modified_event_data.push(element)
          }
        }
      }
      modified_event_data.unshift({
        name: 'Not Assigned',
        seatCount: 100,
        uuid: 0
      })
      commit('SET_ASSIGN_TICKET_DETAILS', modified_event_data)
      commit('SET_TICKET_VARIATION_RELATION', variation_relation_data) // ticket_variation_relation
    }
  },

  mutations: {
    SET_EVENT_DETAILS(state, data) {
      state.event_details = data
    },
    SET_AUTO_SAVE_BUTTON_TEXT(state, data) {
      state.auto_save_button_text = data
    },
    SET_ASSIGN_TICKET_DETAILS(state, data) {
      state.assign_ticket_details = data
    },
    SET_TICKET_VARIATION_RELATION(state, data) {
      state.ticket_variation_relation = data
    },
    UPDATE_ASSIGN_TICKET_DETAILS(state, data) {
      state.assign_ticket_details = data
    }
  },

  getters: {
    get_event_details(state) {
      return state.event_details
    },
    get_auto_save_button_text(state) {
      return state.auto_save_button_text
    },
    get_assign_ticket_details(state) {
      return state.assign_ticket_details
    },
    get_ticket_variation_relation(state) {
      return state.ticket_variation_relation
    }
  }
}

export default event
