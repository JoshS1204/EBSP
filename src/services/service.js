import axios from 'axios'
import config from '../config'
import { auth } from '@/services/auth-service'

export const service = axios.create({
  baseURL: config.apiUrl + '/v2',
  timeout: 1000 * 60 * 10,
  headers: getApiClientHeader()
})

let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let uuid = urlParams.get('uuid')
// let tempOrderId = urlParams.get('tmp_order_reference_token')
let redirectUrl = urlParams.get('redirect_url')
let selectionBuilderBackNavigation = urlParams.get('event_url')
let callBackCode = urlParams.get('code')
let currentPath = window.location.href
let first = urlParams.get('first')

if (callBackCode == null) {
  if (currentPath) {
    // localStorage.setItem('current-path', currentPath)
    sessionStorage.setItem('current-path', currentPath)
  }
}

if (uuid) {
  sessionStorage.setItem('event-id', uuid)
}

if(first) {
  auth.login()
}

// if (tempOrderId) {
//   localStorage.setItem('temp-order-id', tempOrderId)
// }

if (redirectUrl) {
  // localStorage.setItem('redirect-url', redirectUrl)
  sessionStorage.setItem('redirect-url', redirectUrl)
}

if (selectionBuilderBackNavigation) {
  // localStorage.setItem('selection-builder-back-navigation', selectionBuilderBackNavigation)
  sessionStorage.setItem('selection-builder-back-navigation', selectionBuilderBackNavigation)
}

service.interceptors.request.use(
  async (config) => {
    let token
    token = await auth.getAccessToken()

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    } else {
      // auth.login()
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  async (res) => {
    if (res.status == 401) {
      await auth.login()
      return
    }
    if (res.status == 403) {
      window.location.href = '/'
    }
    return res
  },
  async (err) => {
    if (err.response.data.statusCode == 401) {
      await auth.login()
      return
    }
    if (err.response.data.statusCode == 403) {
      if( err.response.data.message === 'You are not Owner or the Member of this organisation') {
          window.location.href = config.forbiddenUrl;
      }
      else {
        await auth.login()
        return
      }
    }
    return Promise.reject(err)
  }
)

function getApiClientHeader() {
  let header = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
  return header
}

export default {
  async get_seat_plan() {
    let event = sessionStorage.getItem('event-id')
    return service.get(`/events/${event}/seatplan`)
  },
  async save_seat_plan(payload) {
    let body = {
      seatplan: JSON.stringify(payload)
    }
    let event = sessionStorage.getItem('event-id')
    return service.post(`/events/${event}/seatplan`, body)
  },
  async get_reserved_seats() {
    let event = sessionStorage.getItem('event-id')
    return service.get(`/events/${event}/reserved_seats`)
  },
  async get_available_seats() {
    let event = sessionStorage.getItem('event-id')
    let tempOrderId = urlParams.get('tmp_order_reference_token')

    if (tempOrderId) {
      return service.get(`/events/${event}/available_seats?order_id=${tempOrderId}`)
    } else {
      return service.get(`/events/${event}/available_seats`)
    }
  },
  async get_temp_order() {
    let tempOrderId = urlParams.get('tmp_order_reference_token')
    return service.get(`/orders/${tempOrderId}/ticket_type`)
  },
  async update_temp_order(payload) {
    let tempOrderId = urlParams.get('tmp_order_reference_token')
    return service.post(`/orders/${tempOrderId}/seatplan`, payload)
  },
  async get_event_details() {
    let event = sessionStorage.getItem('event-id')
    return service.get(`/events/${event}?show_all_tickets=1`)
  },
  async get_invited_contacts(payload) {
    let event = sessionStorage.getItem('event-id')
    return service.get(`/events/${event}/invitations?rows=999`, { params: payload.params })
  }
}
