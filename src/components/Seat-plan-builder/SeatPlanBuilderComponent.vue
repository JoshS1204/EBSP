<template>
  <div class="the-canvas flex flex-col h-screen" ref="container">
    <loader v-if='isloadingFinalSave' />
    <div class="mobile-responsive-only h-screen">
      <div class="mobile-header flex justify-center items-center">
        <kbutton @click="handleCancel" :fill-mode="'flat'" class="abs-back-arrow ms-3 px-2 py-1">
          <iconMobileBackArrow />
        </kbutton>
        <iconEBLogo />
      </div>
      <div class="height-calc-61 flex justify-center items-center flex-column w-332 mx-auto p-3">
        <iconMobileView />
        <h6 class="leading-5 text-center mt-4">Get the best experience!</h6>
        <p class="text-xs2 leading-5 text-kendo-input-text text-center">
          EventBookings seat builder is optimised for desktop use, please revisit this in desktop
          view to use the editor.
        </p>
      </div>
    </div>

    <header v-if="!isloading" class="hide-sm flex-none flex items-center header bg-white">
      <div class="flex-none">
        <kbutton v-if="seatPlanData.selectedStep != 0" @click="backButtonHandler" :shape="'square'"
          :class="'close cursor-pointer'" :fill-mode="'flat'" :rounded="'full'">
          <arrowBackLG />
        </kbutton>
      </div>
      <div class="grow flex flex-col">
        <div class="flex-none flex justify-center mb-2">
          <div class="flex">
            <span class="flex items-center font-medium text-xl leading-none me-1">
              {{ seatPlanData?.name ? seatPlanData?.name : 'Create Seating Plan' }}
            </span>

            <kbutton @click="onClick" ref="button" :shape="'square'" :size="'small'" :fill-mode="'flat'" :rounded="'full'"
              class="py-0">
              <arrowDown />
            </kbutton>
          </div>
          <Popup :anchor="'button'" :popup-align="'popupAlign'" :show="namePopupVisibility"
            :popup-class="'popup-content w-372'">
            <div v-click-outside="onCancelNameModal">
              <header class="popup-header flex justify-between pe-2 items-center">
                <h1 class="leading-6 font-medium m-0 text-base">Change Name</h1>
                <kbutton @click="onCancelNameModal" :icon="'close'" :fill-mode="'flat'" :class="'me-1'"></kbutton>
              </header>
              <div class="popup-body">
                <label for="pageTitle" class="form-label text-sm">Page Title</label>
                <KInput v-model="seatPlanData.nameForEdit" :maxlength="75" type="text" :size="'large'" id="pageTitle"
                  placeholder="Venue Name" />
              </div>
              <footer class="flex justify-between popup-footer">
                <kbutton @click="onCancelNameModal" :theme-color="'secondary'" :size="'large'" :fill-mode="'solid'"
                  :class="'w-50 grow me-1'">Cancel</kbutton>
                <kbutton @click="handleNameChange" :theme-color="'primary'" :size="'large'" :fill-mode="'solid'"
                  :class="'w-50 grow ms-1'">Confirm</kbutton>
              </footer>
            </div>
          </Popup>
        </div>
        <Stepper :value="seatPlanData.selectedStep" @change="handleStepperChange" :items="headerStepperItems"
          class="grow stepper-wrapper mx-auto" />
      </div>
    </header>
    <div v-if="!isloading" class="hide-sm grow flex relative" ref="observer_point">
      <component @continueButtonHandler="constinueToNextStep" @finalContinueHandler="finalContinueHandler"
        @backButtonHandler="backButtonHandler" :is="headerStepperItems[seatPlanData.selectedStep].component" />
    </div>
  </div>
</template>

<script>
import service from '@/services/service'
import axios from 'axios'
import config from '@/config'
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons'
import { Input } from '@progress/kendo-vue-inputs'
import { Stepper } from '@progress/kendo-vue-layout'
import { Popup } from '@progress/kendo-vue-popup'
import { computed } from 'vue'
import SeatMapBuilder from './components/builders/SeatMapBuilder.vue'
import SeatAssignTicketBuilder from './components/builders/SeatAssignTicketBuilder.vue'
import SeatAssignAttendeeBuilder from './components/builders/SeatAssignAttendeeBuilder.vue'
import iconMobileView from '@/assets/images/icon/svg-icons/icon-mobile-view.vue'
import iconEBLogo from '@/assets/images/icon/svg-icons/icon-eb-logo.vue'
import iconMobileBackArrow from '../../assets/images/icon/svg-icons/icon-mobile-back-arrow.vue'
// import iconClose from '../../assets/images/icon/svg-icons/iconClose.vue';
import iconClose from '@/assets/images/icon/svg-icons/iconClose.vue'
import arrowBackLG from '@/assets/images/icon/svg-icons/arrowBackLG.vue'
// import iconBack from '@/assets/images/icon/svg-icons/iconBack.vue'
import arrowDown from '@/assets/images/icon/svg-icons/arrowDown.vue'
import iconUndo from '@/assets/images/icon/svg-icons/iconUndo.vue'
import iconRedo from '@/assets/images/icon/svg-icons/iconRedo.vue'
import iconThreeDots from '@/assets/images/icon/svg-icons/iconThreeDots.vue'
import vClickOutside from 'click-outside-vue3'

import iconGlassMartini from '@/assets/images/icon/svg/icon-glass-martini.svg'
import iconSignOut from '@/assets/images/icon/svg/icon-sign-out.svg'
import iconKnife from '@/assets/images/icon/svg/icon-knife.svg'
import iconSmoking from '@/assets/images/icon/svg/icon-smoking.svg'
import iconWheelchair from '@/assets/images/icon/svg/icon-wheelchair.svg'
import iconMusic from '@/assets/images/icon/svg/icon-music.svg'
import iconPlusSquare from '@/assets/images/icon/svg/icon-plus-square.svg'
import iconInfoCircle from '@/assets/images/icon/svg/icon-info-circle.svg'
import iconMicrophone from '@/assets/images/icon/svg/icon-microphone.svg'
import iconSeat from '@/assets/images/icon/svg/icon-seat.svg'
import iconStanding from '@/assets/images/icon/svg/icon-standing.svg'
import { generateUniqueHexColors, throttle } from '@/helpers/utilityFunctions'
import loader from '@/components/common/Loader.vue'

export default {
  name: 'SeatPlanBuilderComponent',
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    kbutton: Button,
    KButtonGroup: ButtonGroup,
    iconMobileBackArrow,
    iconEBLogo,
    iconMobileView,
    SeatMapBuilder,
    SeatAssignTicketBuilder,
    SeatAssignAttendeeBuilder,
    Stepper,
    Popup: Popup,
    KInput: Input,
    iconClose,
    arrowBackLG,
    arrowDown,
    iconUndo,
    iconRedo,
    iconThreeDots,
    loader
  },
  data() {
    return {
      isloadingFinalSave: false,
      areaAvailability: {},
      availableSeatsUUid: [],
      autoSave: true,
      mtObserver: {},
      namePopupVisibility: false,
      updateCountOnceTriggered: false,
      updateTicketObjectTriggeredOnce: false,

      isSoldCheckedOnce: false,

      updateCountTriggeredOnceFromLayersArray: false,
      totalseats: 0,
      popupHorizontal: 'right',
      layersArray: [],
      icons: {
        iconGlassMartini: iconGlassMartini,
        iconSignOut: iconSignOut,
        iconKnife: iconKnife,
        iconSmoking: iconSmoking,
        iconWheelchair: iconWheelchair,
        iconMusic: iconMusic,
        iconPlusSquare: iconPlusSquare,
        iconInfoCircle: iconInfoCircle,
        iconMicrophone: iconMicrophone,
        iconSeat: iconSeat,
        iconStanding: iconStanding
      },
      name: '',
      seatPlanData: {
        activeData: {
          activePageX: 0,
          activePageY: 0
        },
        name: 'Seating plan',
        nameForEdit: 'Seating plan',
        selectedStep: 0,
        totalSeatCount: 0,
        assignedSeatCount: 0,
        assignedTicketCount: 0,
        isReserveSeatingOn: false,
        isHoldSeatOn: false,
        enabled: true,
        isAllStepsCompleted: false,
        layersArray: [],
        tickets: [],
        configKonva: {
          width: 500,
          height: 500,
          scaleX: 1,
          scaleY: 1
        }
      },
      headerStepperItems: [
        {
          label: 'Seating Map',
          component: SeatMapBuilder
        },
        {
          label: 'Assign Ticket',
          component: SeatAssignTicketBuilder
        },
        {
          label: 'Attendees',
          component: SeatAssignAttendeeBuilder
        }
      ],
      history: [],
      historyStep: 0,
      undoredoController: false,
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown)

    this.getSeatplanBuilderDetails()

    let payload = {
      params: {
        type: 'invitation_to_book'
      },
      search: ''
    }
    this.$store.dispatch('get_contacts_action', payload)

    let that = this
    this.mtObserver = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type == 'attributes' && that.autoSave && !this.isloadingFinalSave) {
          that.autoSave = false
          setTimeout(() => {
            // console.log(new Date().toLocaleTimeString() + ': observer hit');
            that.save_seat_plan()
          }, 20000)
        }
      })
    })

    this.mtObserver.observe(this.$refs.container, { attributes: true, subtree: true })
  },
  onUnmounted() {
    this.mtObserver.disconnect()
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  provide() {
    return {
      layersArray: computed(() => this.layersArray),
      seatPlanData: computed(() => this.seatPlanData),
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
      undoHandler: this.undoHandler,
      redoHandler: this.redoHandler,
      zoomLevel: computed(() => this.zoomLevel),

    }
  },
  computed: {
    zoomLevel() {
      if (this.seatPlanData?.configKonva?.scaleX) {
        return Math.floor(this.seatPlanData?.configKonva?.scaleX * 100)
      } else {
        return 100
      }
    },
    totalSeatCount() {
      return this.$store.getters.get_total_seat_count
    },
    totalTicketAssignedCount() {
      return this.$store.getters.get_total_ticket_assigned
    },
    popupAlign: function () {
      return {
        horizontal: this.popupHorizontal
      }
    },
    ticketCategories() {
      return this.$store.getters.get_assign_ticket_details
    },
    isloading() {
      return this.$store.state.loader.status
    }
  },
  watch: {
    layersArray: {
      handler: function (val, oldVal) {
        console.log(new Date().toLocaleTimeString() + ": layers watcher")
        clearTimeout(this.debounce)
        // this.debounce = setTimeout(() => {
        //   this.updateSeatCount()
        //   this.updateTicketObjectCallMethod()
        // }, 200)

        // clearTimeout(this.debounceController)
        // this.debounceController = setTimeout(() => {
        //   if (this.undoredoController) {
        //     this.undoredoController = false
        //   } else {
        //     this.historyManager(this.layersArray)
        //   }
        // }, 2000)
      }
      // deep: true
    },
    seatPlanData: {
      handler: function (val, oldVal) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          this.updateSeatCount()
        }, 200)
      },
      deep: true
    },

    ticketCategories: {
      handler: function (val, oldVal) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => {
          this.updateTicketObjectCallMethod()
        }, 200)
      },
      deep: true
    }
  },
  methods: {
    historyManager(data) {
      console.log(new Date().toLocaleTimeString() + ": history manager")
      let _history = JSON.parse(JSON.stringify(this.history))
      let t = this
      const _data = JSON.parse(JSON.stringify(data))
      _history.push(_data)
      if (_history.length > 3) {
        _history.splice(0, 1)
      }
      t.historyStep = _history.length - 1
      this.history = JSON.parse(JSON.stringify(_history))
    },
    undoHandler() {
      this.undoredoController = true
      if (this.historyStep === 0) {
        return
      }
      this.historyStep -= 1
      const previous = this.history[this.historyStep]
      this.modifyLayersArray(JSON.parse(JSON.stringify(previous)))
    },
    redoHandler() {
      this.undoredoController = true
      if (this.historyStep === this.history.length - 1) {
        return
      }
      this.historyStep += 1
      const next = this.history[this.historyStep]
      this.modifyLayersArray(JSON.parse(JSON.stringify(next)))
    },
    handleKeyDown(event) {
      if (event.ctrlKey && [0, 1].includes(this.seatPlanData.selectedStep) && (this.zoomLevel < 150 || this.zoomLevel >= 19)) {
        if (event.key === '+' || event.key === '=') {
          if (this.zoomLevel < 150) {
            this.zoomIn()
          }
        } else if (event.key === '-') {
          if (this.zoomLevel >= 19) {
            this.zoomOut()
          }
        }
        else if (event.key === 'z' || event.key === 'Z') {
          this.undoHandler()
        }
        else if (event.key === 'y' || event.key === 'Y') {
          this.redoHandler()
        }
      }
    },
    zoomIn() {
      this.seatPlanData.configKonva.scaleX += 0.05
      this.seatPlanData.configKonva.scaleY += 0.05
    },
    zoomOut() {
      this.seatPlanData.configKonva.scaleX -= 0.05
      this.seatPlanData.configKonva.scaleY -= 0.05
    },
    areaAvailableSeatsObjectParser(data) {
      let newObj = {}
      data.forEach((item) => {
        newObj = {
          ...newObj,
          [item.uuid]: item.capacity_available
        }
      })
      return newObj
    },
    getSeatplanBuilderDetails() {
      this.$store.dispatch('loader_action', true)
      const requests = [
        service.get_seat_plan(),
        service.get_event_details(),
        service.get_available_seats()
      ]
      axios
        .all(requests)
        .then(
          axios.spread(
            ({ data: seatplanAPI }, { data: eventDetailsAPI }, { data: availableSeats }) => {
              this.availableSeatsUUid = availableSeats?.result?.seats
              this.areaAvailability = this.areaAvailableSeatsObjectParser(
                availableSeats?.result?.areas
              )

              this.$store.commit(
                'SET_ASSIGN_TICKET_DETAILS',
                this.generateTickets(eventDetailsAPI?.result?.event?.tickets?.levels)
              )

              this.updateTicketObject()

              if (Object.keys(seatplanAPI?.result?.seatplan).length > 0) {
                this.seatPlanData = {
                  ...seatplanAPI?.result?.seatplan,
                  selectedStep: Number(seatplanAPI?.result?.seatplan?.selectedStep),
                  layersArray: []
                }

                try {
                  let fileContent = seatplanAPI?.result?.seatplan?.layersArray
                  for (const i in fileContent) {
                    if (fileContent.hasOwnProperty.call(fileContent, i)) {
                      let element = fileContent[i]
                      if (element.layerConfig.objectData?.type == 'Icon') {
                        const image = new window.Image()
                        image.src = this.icons[element.layerConfig.objectData.imageName]
                        image.onload = () => {
                          element.layerConfig.objectData.image = image
                          element.shapes[0].image = image
                        }
                      }
                    }
                  }
                  setTimeout(() => {
                    this.layersArray = fileContent
                    this.$store.dispatch('loader_action', false)
                    this.updateLayers()
                  }, 500)
                } catch (error) {
                  this.$store.dispatch('loader_action', false)
                }
              }
              this.$store.dispatch('loader_action', false)
            }
          )
        )
        .catch((error) => {
          this.$store.dispatch('loader_action', false)
        })
    },
    generateTickets(tickets) {
      let modifiedTickets = []
      let variation_relation_data = []
      let uniqueHexaColorCodes = generateUniqueHexColors(tickets?.length)
      for (let i in tickets) {
        if (tickets[i]?.pricing_details[0]?.uuid) {
          let variation_parent = {
            is_parent: true,
            name: tickets[i].name,
            uuid: tickets[i].uuid,
            quantity: 0,
            selectedCount: 0,
            color: uniqueHexaColorCodes[i],
            isAnySeatAssigned: false,
            child: []
          }
          let variation_uniqueHexaColorCodes = generateUniqueHexColors(tickets[i].pricing_details?.length)
          for (let j in tickets[i].pricing_details) {
            let element = {
              name: tickets[i].pricing_details[j].variation,
              uuid: tickets[i].pricing_details[j].uuid,
              quantity: tickets[i].quantity,
              selectedCount: 0,
              color: variation_uniqueHexaColorCodes[j],
              isAnySeatAssigned: false
            }
            // modifiedTickets.push(element)
            variation_parent.child.push(element)
          }
          modifiedTickets.push(variation_parent)
          variation_relation_data.push(variation_parent)
        } else {
          let element = {
            name: tickets[i].name,
            uuid: tickets[i].uuid,
            quantity: tickets[i].quantity,
            selectedCount: 0,
            color: uniqueHexaColorCodes[i]
          }
          modifiedTickets.push(element)
        }
      }
      modifiedTickets.unshift({
        name: 'Not Assigned',
        seatCount: 100,
        uuid: 0
      })

      this.$store.commit('SET_TICKET_VARIATION_RELATION', variation_relation_data)

      return modifiedTickets
    },
    updateTicketObjectCallMethod() {

      if (
        this.ticketCategories?.length > 0 &&
        this.seatPlanData?.tickets?.length > 0 &&
        !this.updateTicketObjectTriggeredOnce
      ) {
        this.updateTicketObject()
      }
    },
    updateTicketObject() {
      if (this.ticketCategories.length > 0 && this.seatPlanData?.tickets.length > 0) {

        let ticketUuids = {}
        let ticketUuidsVariation = {}

        this.seatPlanData?.tickets.forEach((ticket, index) => {
          if (ticket.is_parent) {
            let ticket_child = ticket.child
            ticket_child.forEach((ticket_child_element, ticket_child_index) => {
              if (ticket_child_element?.uuid) {
                ticketUuidsVariation = {
                  ...ticketUuidsVariation,
                  [ticket_child_element.uuid]: {
                    index: ticket_child_index,
                    parent_index: index
                  }
                }
              }
            });
          }
          else {
            if (ticket?.uuid) {
              ticketUuids = {
                ...ticketUuids,
                [ticket.uuid]: index
              }
            }
          }
        })


        this.ticketCategories?.forEach((ticket, index) => {
          if (ticket.is_parent) {
            ticket?.child?.forEach((tChild, childIndex) => {
              if (this.seatPlanData?.tickets?.[index]?.child?.[childIndex]?.color != undefined) {
                tChild.color = this.seatPlanData?.tickets[index]?.child[childIndex]?.color
              }
            })
          }
          else {
            if (this.seatPlanData?.tickets[ticketUuids[ticket?.uuid]]?.uuid) {
              ticket.color = this.seatPlanData?.tickets[ticketUuids[ticket?.uuid]]?.color
            }
          }
        })

        this.updateTicketObjectTriggeredOnce = true
      }
    },
    save_seat_plan(redirect = false, isFromFinalContinue = false) {
      // console.log(new Date().toLocaleTimeString() + ": save_seat_plan hit")
      this.seatPlanData = {
        ...this.seatPlanData,
        layersArray: JSON.parse(JSON.stringify(this.layersArray)),
        tickets: JSON.parse(JSON.stringify(this.ticketCategories))
      }

      if (isFromFinalContinue) {
        this.seatPlanData.isAllStepsCompleted = true
        this.seatPlanData.totalSeatCount = this.totalSeatCount
        this.seatPlanData.assignedSeatCount = this.totalTicketAssignedCount
      }

      let payload = {
        data: this.seatPlanData,
        redirect: redirect
      }
      this.$store.dispatch('save_seat_plan_action', payload)
      this.autoSave = true
    },
    handleNameChange(e) {
      if (this.seatPlanData.nameForEdit.length >= 75) {
        this.$store.dispatch('notification', {
          status: true,
          type: 'warning',
          message: 'Maximum character size is exceeded'
        })
        return
      }
      this.seatPlanData.name = this.seatPlanData.nameForEdit
      this.namePopupVisibility = false
    },
    onCancelNameModal() {
      this.namePopupVisibility = false
      this.seatPlanData.nameForEdit = this.seatPlanData.name
    },
    updateLayers() {
      let totalseats = 0
      let notAssignedCount = 0
      let isAnySeatAttendeeAssigned = false
      let isAnySeatTicketAssigned = false

      let holdSeatCount = 0
      let reserveSeatCount = 0
      let totalTicketAssigned = 0

      let holdSeatCardCount = 0
      let reserveSeatCardCount = 0

      let tickets = []
      let isTicketsArrived = false
      let ticketUuids = {}

      let soldSeatCount = 0

      if (this.ticketCategories.length > 0) {
        isTicketsArrived = true
        this.ticketCategories.forEach((ticket, index) => {
          tickets.push({
            ...ticket,
            selectedCount: 0
          })
          if (ticket?.uuid) {
            ticketUuids = {
              ...ticketUuids,
              [ticket.uuid]: index
            }
          }
        })
      }

      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          if (shape?.isSeat) {
            totalseats += 1

            if (shape?.seat_meta?.assigned_ticket?.uuid) {
              if (!this.availableSeatsUUid?.includes(shape?.uuid)) {
                shape.isSold = true
                soldSeatCount += 1
              } else {
                shape.isSold = false
              }
            }

            if (shape?.seat_meta?.attendee_details?.uuid && this.seatPlanData?.isReserveSeatingOn) {
              reserveSeatCount += 1
              reserveSeatCardCount += 1
              isAnySeatAttendeeAssigned = true
            }
            if (shape?.seat_meta?.assigned_ticket?.uuid) {
              totalTicketAssigned += 1
              isAnySeatTicketAssigned = true
              if (isTicketsArrived) {
                // check if selectedCount key exist and then add 1
                if (
                  tickets[ticketUuids[shape?.seat_meta?.assigned_ticket?.uuid]]?.hasOwnProperty(
                    'selectedCount'
                  )
                ) {
                  tickets[ticketUuids[shape?.seat_meta?.assigned_ticket?.uuid]].selectedCount += 1
                }
              }
            }
            if (shape?.isHold && this.seatPlanData?.isHoldSeatingOn) {
              holdSeatCardCount += 1
              holdSeatCount += 1
            }

            if (!shape?.seat_meta?.assigned_ticket?.uuid) {
              notAssignedCount += 1
            }
          } else {
            if (shape.isParent && ['waitingArea'].includes(layer?.layerConfig?.tableData?.type)) {
              if (this.areaAvailability.hasOwnProperty(shape?.uuid)) {
                const tableCapacity = layer?.layerConfig?.tableData?.capacity
                const tableAvailableCount = this.areaAvailability[shape?.uuid]
                layer.layerConfig.tableData.soldCount = tableCapacity - tableAvailableCount
                if (layer.layerConfig.tableData.soldCount > 0) {
                  soldSeatCount += layer.layerConfig.tableData.soldCount
                }
                if (
                  tableAvailableCount == 0 ||
                  tableCapacity == layer.layerConfig.tableData.soldCount
                ) {
                  layer.layerConfig.tableData.isAvailable = false
                } else {
                  layer.layerConfig.tableData.isAvailable = true
                }
              }

              const capacity = layer?.layerConfig?.tableData?.capacity
              totalseats += Number(capacity)
              if (layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                totalTicketAssigned += Number(capacity)
                isAnySeatTicketAssigned = true
                if (isTicketsArrived) {
                  if (isTicketsArrived) {
                    if (
                      tickets[
                        ticketUuids[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]
                      ]?.hasOwnProperty(
                        'selectedCount'
                      )
                    ) {
                      tickets[
                        ticketUuids[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]
                      ].selectedCount += Number(capacity)
                    }
                  }
                }
              }
              if (
                layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid &&
                this.seatPlanData?.isReserveSeatingOn
              ) {
                reserveSeatCount += Number(capacity)
                reserveSeatCardCount += 1
                isAnySeatAttendeeAssigned = true
              }
              if (layer?.layerConfig?.tableData?.isHold && this.seatPlanData?.isHoldSeatingOn) {
                holdSeatCardCount += 1
                holdSeatCount += Number(capacity)
              }

              if (!layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                notAssignedCount += Number(capacity)
              }
            }
          }
        })
      })

      if (isTicketsArrived) {
        this.$store.commit('UPDATE_ASSIGN_TICKET_DETAILS', tickets)
      }

      this.$store.commit('SET_ANY_SEAT_ATTENDEE_ASSIGNED', isAnySeatAttendeeAssigned)
      this.$store.commit('SET_ANY_SEAT_TICKET_ASSIGNED', isAnySeatTicketAssigned)
      this.$store.commit('SET_TOTAL_SEAT_COUNT', totalseats)
      this.$store.commit('SET_NOT_ASSIGNED_SEAT_COUNT', notAssignedCount)

      this.$store.commit('SET_HOLD_SEAT_COUNT', holdSeatCount)
      this.$store.commit('SET_RESERVE_SEAT_COUNT', reserveSeatCount)
      this.$store.commit('SET_TOTAL_TICKET_ASSIGNED', totalTicketAssigned)
      this.$store.commit('SET_HOLD_SEAT_CARD_COUNT', holdSeatCardCount)
      this.$store.commit('SET_RESERVE_SEAT_CARD_COUNT', reserveSeatCardCount)

      this.$store.commit('SET_SOLD_SEAT_COUNT', soldSeatCount)
    },
    updateSeatCount() {
      let totalseats = 0
      let notAssignedCount = 0
      let isAnySeatAttendeeAssigned = false
      let isAnySeatTicketAssigned = false

      let holdSeatCount = 0
      let reserveSeatCount = 0
      let totalTicketAssigned = 0

      let holdSeatCardCount = 0
      let reserveSeatCardCount = 0

      let tickets = []
      let isTicketsArrived = false
      let ticketUuids = {}
      let ticketUuidsVariation = {}

      if (this.ticketCategories.length > 0) {
        isTicketsArrived = true
        this.ticketCategories.forEach((ticket, index) => {
          if (ticket.is_parent) {
            let ticket_child = JSON.parse(JSON.stringify(ticket.child))
            ticket_child.forEach((ticket_child_element, ticket_child_index) => {
              if (ticket_child_element?.uuid) {
                ticketUuidsVariation = {
                  ...ticketUuidsVariation,
                  [ticket_child_element.uuid]: {
                    index: ticket_child_index,
                    parent_index: index
                  }
                }
                ticket_child_element.selectedCount = 0
              }
            });
            tickets.push({
              ...ticket,
              child: ticket_child
            })
          }
          else {
            tickets.push({
              ...ticket,
              selectedCount: 0
            })
            if (ticket?.uuid) {
              ticketUuids = {
                ...ticketUuids,
                [ticket.uuid]: index
              }
            }
          }
        })
      }
      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          if (shape?.isSeat) {
            totalseats += 1

            if (shape?.seat_meta?.attendee_details?.uuid && this.seatPlanData?.isReserveSeatingOn) {
              reserveSeatCount += 1
              reserveSeatCardCount += 1
              isAnySeatAttendeeAssigned = true
            }
            if (shape?.seat_meta?.assigned_ticket?.uuid) {
              totalTicketAssigned += 1
              isAnySeatTicketAssigned = true
              if (isTicketsArrived) {

                if (tickets[ticketUuidsVariation[shape?.seat_meta?.assigned_ticket?.uuid]?.parent_index]?.is_parent) {
                  if (tickets[ticketUuidsVariation[shape.seat_meta.assigned_ticket.uuid].parent_index].child[ticketUuidsVariation[shape.seat_meta.assigned_ticket.uuid].index]?.hasOwnProperty(
                    'selectedCount'
                  )) {
                    tickets[ticketUuidsVariation[shape.seat_meta.assigned_ticket.uuid].parent_index].child[ticketUuidsVariation[shape.seat_meta.assigned_ticket.uuid].index].selectedCount += 1;
                  }
                }
                else {
                  // check if selectedCount key exist and then add 1
                  if (
                    tickets[ticketUuids[shape?.seat_meta?.assigned_ticket?.uuid]]?.hasOwnProperty(
                      'selectedCount'
                    )
                  ) {
                    tickets[ticketUuids[shape?.seat_meta?.assigned_ticket?.uuid]].selectedCount += 1
                  }
                }
              }
            }
            if (shape?.isHold && this.seatPlanData?.isHoldSeatingOn) {
              holdSeatCardCount += 1
              holdSeatCount += 1
            }

            if (!shape?.seat_meta?.assigned_ticket?.uuid) {
              notAssignedCount += 1
            }
          } else {
            if (shape.isParent && ['waitingArea'].includes(layer?.layerConfig?.tableData?.type)) {
              const capacity = layer?.layerConfig?.tableData?.capacity
              totalseats += Number(capacity)
              if (layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                totalTicketAssigned += Number(capacity)
                isAnySeatTicketAssigned = true
                if (isTicketsArrived) {
                  if (isTicketsArrived) {
                    if (tickets[ticketUuidsVariation[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]?.parent_index]?.is_parent) {
                      if (tickets[ticketUuidsVariation[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid].parent_index].child[ticketUuidsVariation[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid].index]?.hasOwnProperty(
                        'selectedCount'
                      )) {
                        tickets[ticketUuidsVariation[layer.layerConfig.tableData.table_meta.assigned_ticket.uuid].parent_index].child[ticketUuidsVariation[layer.layerConfig.tableData.table_meta.assigned_ticket.uuid].index].selectedCount += Number(capacity);
                      }
                    } else {
                      if (
                        tickets[
                          ticketUuids[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]
                        ]?.hasOwnProperty(
                          'selectedCount'
                        )
                      ) {
                        tickets[
                          ticketUuids[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]
                        ].selectedCount += Number(capacity)
                      }
                    }
                  }
                }
              }
              if (
                layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid &&
                this.seatPlanData?.isReserveSeatingOn
              ) {
                reserveSeatCount += Number(capacity)
                reserveSeatCardCount += 1
                isAnySeatAttendeeAssigned = true
              }
              if (layer?.layerConfig?.tableData?.isHold && this.seatPlanData?.isHoldSeatingOn) {
                holdSeatCardCount += 1
                holdSeatCount += Number(capacity)
              }

              if (!layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                notAssignedCount += Number(capacity)
              }
            }
          }
        })
      })

      if (isTicketsArrived) {
        this.$store.commit('UPDATE_ASSIGN_TICKET_DETAILS', tickets)
      }

      this.$store.commit('SET_ANY_SEAT_ATTENDEE_ASSIGNED', isAnySeatAttendeeAssigned)
      this.$store.commit('SET_ANY_SEAT_TICKET_ASSIGNED', isAnySeatTicketAssigned)
      this.$store.commit('SET_TOTAL_SEAT_COUNT', totalseats)
      this.$store.commit('SET_NOT_ASSIGNED_SEAT_COUNT', notAssignedCount)

      this.$store.commit('SET_HOLD_SEAT_COUNT', holdSeatCount)
      this.$store.commit('SET_RESERVE_SEAT_COUNT', reserveSeatCount)
      this.$store.commit('SET_TOTAL_TICKET_ASSIGNED', totalTicketAssigned)
      this.$store.commit('SET_HOLD_SEAT_CARD_COUNT', holdSeatCardCount)
      this.$store.commit('SET_RESERVE_SEAT_CARD_COUNT', reserveSeatCardCount)
    },
    handleStepperChange(e) {
      return
      this.seatPlanData.selectedStep = e.value
    },
    finalContinueHandler(isFromFinalContinue = false) {
      this.isloadingFinalSave = true
      this.save_seat_plan(true, isFromFinalContinue)
    },
    constinueToNextStep() {
      if (this.seatPlanData.selectedStep == 1) {
        this.layersArray.forEach((layer) => {
          layer.shapes.forEach((shape) => {
            if (shape?.isSeat) {
              shape.isSelected = false
            }
          })
        })
      }
      this.seatPlanData.selectedStep += 1
      this.save_seat_plan()
    },
    backToPreviousStep() {
      this.seatPlanData.selectedStep -= 1
      this.save_seat_plan()
    },
    handleCancel() {
      let url = config.redirectUri + `${sessionStorage.getItem('event-id')}`
      window.location.href = url
    },
    handleCaptionChange() {
      if (this.seatPlanData.nameForEdit.length >= 75) {
        this.$store.dispatch('notification', {
          status: true,
          type: 'warning',
          message: 'Maximum character size is exceeded'
        })
      }
    },
    onClick() {
      this.namePopupVisibility = !this.namePopupVisibility
    },
    modifyLayersArray(data) {
      try {
        let fileContent = data
        for (const i in fileContent) {
          if (fileContent.hasOwnProperty.call(fileContent, i)) {
            let element = fileContent[i]
            if (element.layerConfig.objectData?.type === 'Icon') {
              const image = new window.Image()
              image.src = this.icons[element.layerConfig.objectData.imageName]
              image.onload = () => {
                // set image only when it is loaded
                element.layerConfig.objectData.image = image
                element.shapes[0].image = image
              }
            }
          }
        }
        setTimeout(() => {
          this.layersArray.length = 0
          this.layersArray.push(...fileContent)
        }, 1000)
      } catch (error) { }
    },
    backButtonHandler() {
      if (this.seatPlanData.selectedStep == 0) {
      } else {
        this.backToPreviousStep()
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
