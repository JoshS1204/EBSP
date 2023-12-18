const seatMapBuilderStore = {
  state: () => ({
    totalSeatCount: 0,
    notAssignedSeatCount: 0,
    isAnySeatAttendeeAssigned: false,
    isAnySeatTicketAssigned: false,

    holdSeatCount: 0,
    reserveSeatCount: 0,
    totalTicketAssigned: 0,

    holdSeatCardCount: 0,
    reserveSeatCardCount: 0,

    soldSeatCount: 0
  }),

  actions: {
    setTotalSeatCount({ commit, state }, payload) {
      commit('SET_TOTAL_SEAT_COUNT', payload)
    },
    setNotAssignedSeatCount({ commit, state }, payload) {
      commit('SET_NOT_ASSIGNED_SEAT_COUNT', payload)
    },
    setAnySeatAttendeeAssigned({ commit, state }, payload) {
      commit('SET_ANY_SEAT_ATTENDEE_ASSIGNED', payload)
    },
    setAnySeatTicketAssigned({ commit, state }, payload) {
      commit('SET_ANY_SEAT_TICKET_ASSIGNED', payload)
    },
    setHoldSeatCount({ commit, state }, payload) {
      commit('SET_HOLD_SEAT_COUNT', payload)
    },
    setReserveSeatCount({ commit, state }, payload) {
      commit('SET_RESERVE_SEAT_COUNT', payload)
    },
    setTotalTicketAssigned({ commit, state }, payload) {
      commit('SET_TOTAL_TICKET_ASSIGNED', payload)
    },
    setHoldSeatCardCount({ commit, state }, payload) {
      commit('SET_HOLD_SEAT_CARD_COUNT', payload)
    },
    setReserveSeatCardCount({ commit, state }, payload) {
      commit('SET_RESERVE_SEAT_CARD_COUNT', payload)
    }
  },

  mutations: {
    SET_TOTAL_SEAT_COUNT(state, data) {
      state.totalSeatCount = data
    },
    SET_NOT_ASSIGNED_SEAT_COUNT(state, data) {
      state.notAssignedSeatCount = data
    },
    SET_ANY_SEAT_ATTENDEE_ASSIGNED(state, data) {
      state.isAnySeatAttendeeAssigned = data
    },
    SET_ANY_SEAT_TICKET_ASSIGNED(state, data) {
      state.isAnySeatTicketAssigned = data
    },
    SET_HOLD_SEAT_COUNT(state, data) {
      state.holdSeatCount = data
    },
    SET_RESERVE_SEAT_COUNT(state, data) {
      state.reserveSeatCount = data
    },
    SET_TOTAL_TICKET_ASSIGNED(state, data) {
      state.totalTicketAssigned = data
    },
    SET_HOLD_SEAT_CARD_COUNT(state, data) {
      state.holdSeatCardCount = data
    },
    SET_RESERVE_SEAT_CARD_COUNT(state, data) {
      state.reserveSeatCardCount = data
    },
    SET_SOLD_SEAT_COUNT(state, data) {
      state.soldSeatCount = data
    }
  },

  getters: {
    get_total_seat_count(state) {
      return state.totalSeatCount
    },
    get_sold_seat_count(state) {
      return state.soldSeatCount
    },
    get_not_assigned_seat_count(state) {
      return state.notAssignedSeatCount
    },
    get_any_seat_attendee_assigned(state) {
      return state.isAnySeatAttendeeAssigned
    },
    get_any_seat_ticket_assigned(state) {
      return state.isAnySeatTicketAssigned
    },
    get_hold_seat_count(state) {
      return state.holdSeatCount
    },
    get_reserve_seat_count(state) {
      return state.reserveSeatCount
    },
    get_total_ticket_assigned(state) {
      return state.totalTicketAssigned
    },
    get_hold_seat_card_count(state) {
      return state.holdSeatCardCount
    },
    get_reserve_seat_card_count(state) {
      return state.reserveSeatCardCount
    }
  }
}

export default seatMapBuilderStore
