<template>
  <div class="the-canvas flex flex-col h-screen">
    <header class="flex-none flex items-center header small bg-white">
      <kbutton @click="backToEBPage" :shape="'square'" :class="'close cursor-pointer me-2'" :fill-mode="'flat'"
        :rounded="'full'">
        <arrowBackLG />
      </kbutton>
      <iconEbLogoLg />
    </header>

    <div class="grow flex relative seatplan-checkout-flow-wrap">
      <div
        :class="viewDetails ? 'grow flex flex-col canvas-wrap mobile-show-100 active' : 'grow flex flex-col canvas-wrap mobile-show-100'">
        <div ref="mainContainer" class="grow canvas-content scroll-y">
          <v-stage :config="seatplanData.configKonva" ref="stage" :draggable="stageDrag"
            @mousedown="handleStageMouseDown">
            <v-layer>
              <v-group :config="{
                ...layer?.layerConfig,
                draggable: false
              }" v-for="(layer, layerIndex) in layersArray" :key="layerIndex">
                <template v-for="(shape, shapeIndex) in layer.shapes" :key="shapeIndex">
                  <v-circle @touchstart="seatClickHandler(shape, shapeIndex, layerIndex)"
                    @click="seatClickHandler(shape, shapeIndex, layerIndex)" :config="{
                      ...shape,
                      fill: seatColorGenerator(shape),
                      stroke:
                        shape?.isSeat || shape?.isParent ? this.unAvailableColor : shape?.stroke
                    }" v-if="shape?.type == 'Circle'">
                  </v-circle>
                  <v-rect @touchstart="seatClickHandler(shape, shapeIndex, layerIndex)"
                    @click="seatClickHandler(shape, shapeIndex, layerIndex)" v-if="shape?.type == 'Rect'" :config="{
                      ...shape,
                      ...(shape?.stroke && { stroke: rectStrokeColorGenerator(shape, layer) })
                    }"></v-rect>
                  <v-line v-if="shape?.type == 'Line'" :config="shape"></v-line>
                  <v-text v-if="shape?.type == 'Text'" :config="shape"></v-text>
                  <v-image v-if="shape?.type == 'Icon'" :config="shape"></v-image>
                  <v-text v-if="shape?.type == 'Circle' && shape?.isSeat"
                    @touchstart="seatClickHandler(shape, shapeIndex, layerIndex)"
                    @click="seatClickHandler(shape, shapeIndex, layerIndex)" :config="{
                      x: shape?.x - (charXPositionByLength[calculateCharsCount(shape?.text)] || 4),
                      y: shape?.y - 4,
                      text: shape?.text,
                      fontSize: 13,
                      fontFamily: 'Poppins',
                      fontStyle: 'bold',
                      fill: '#fff',
                      align: 'center',
                      verticalAlign: 'middle'
                    }"></v-text>
                </template>
              </v-group>
              <v-transformer ref="transformer" :enabledAnchors="transformerAnchors" :rotateEnabled="true" />
            </v-layer>
          </v-stage>

          <div class="book-hold-status-wrap flex items-center">
            <div class="flex items-center">
              <div class="color-ring small" :style="{
                backgroundColor: this.unAvailableColor
              }"></div>
              <div class="text-xs2 leading-5 font-normal me-2">Unavailable</div>
            </div>
            <div class="flex items-center">
              <div class="color-ring small" :style="{
                backgroundColor: this.holdSeatColor
              }"></div>
              <div class="text-xs2 leading-5 font-normal me-2">Hold</div>
            </div>
            <div class="flex items-center">
              <div class="color-ring small" :style="{
                backgroundColor: this.selectedColor
              }"></div>
              <div class="text-xs2 leading-5 font-normal">Selected</div>
            </div>
          </div>

          <div class="flex items-center zoom-container">
            <kbutton title="Fit to Screen" @click="fitToContent" :class="'mb-0'" :size="'large'" :fill-mode="'flat'"
              :rounded="'small'">
              <fitScreen></fitScreen>
            </kbutton>

            <kbutton title="Zoom In" :disabled="zoomLevel >= 150" @click="zoomIn" :class="'mb-0'" :size="'large'"
              :fill-mode="'flat'" :rounded="'small'">
              <iconPlus></iconPlus>
            </kbutton>
            <div class="flex-none zoom-text text-xs text-center mx-1">{{ zoomLevel }}%</div>
            <kbutton title="Zoom Out" :disabled="zoomLevel <= 5" @click="zoomOut" :size="'large'" :fill-mode="'flat'"
              :rounded="'small'">
              <iconMinus></iconMinus>
            </kbutton>
          </div>
        </div>
        <footer class="flex-none flex canvas-footer bg-white"></footer>
      </div>

      <div
        :class="viewDetails ? 'flex-none sidebar small relative mobile-fixed-bottom active' : 'flex-none sidebar small relative mobile-fixed-bottom'">

        <div @click="onViewDetails" class="bottom-sidebar-expander flex items-center justify-center">
          <div>
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0.75026L8 4.75026L7.06667 5.68359L4 2.61693L0.933333 5.68359L8.15946e-08 4.75026L4 0.75026Z"
                fill="#22B0AF" />
            </svg>
            <span class="color-primary text-xs ms-2">View details</span>
          </div>
        </div>

        <div class="flex flex-col h-100 ticket-content-wrap">
          <div class="grow sidebar-content-scroll scroll-y">
            <h5 class="text-base leading-5 font-medium mt-0 mb-3 color-primary20">Select Seats</h5>
            <div class="custom-accordion-content d-flex align-items-center flex-column">
              <template v-for="(ticket, ticketIndex) in purchasedTickets" :key="ticket?.uuid">
                <div v-if="ticket?.isAnySeatAssigned" class="attendee-seats-item-wrap">
                  <div class="attendee-seats-item">
                    <div class="d-flex items-center justify-between mb-1">
                      <div class="d-flex items-center">
                        <div class="color-ring small" :style="{
                          backgroundColor: ticket?.color
                        }"></div>
                        <div class="item-name text-sm font-medium leading-5">{{ ticket?.name }}</div>
                      </div>
                      <div v-if="ticket?.selectedCount > 0" class="text-xs font-normal color-neutral50 leading-4 pe-1">
                        Seats {{ ticket?.selectedCount }} of {{ ticket?.quantity }}
                      </div>
                    </div>
                    <div v-if="ticket?.selectedCount == 0" class="text-xs2 font-normal color-neutral50 leading-5">
                      Select {{ ticket?.quantity == 1 ? 'a Seat' : `${ticket?.quantity} Seats` }}
                    </div>

                    <div v-if="ticket?.selectedCount > 0 && ticket?.seats?.length > 0"
                      class="color-box-cheep flex flex-wrap">
                      <div v-for="(seat, seatindex) in ticket.seats" :key="seat?.uuid"
                        class="text-xs font-normal color-neutral50 leading-4 text-white radius-0 radius-40 bg bg-green-dark">
                        {{ seat?.seatName }}
                        <span @click="deleteSelectedSeat(seat, seatindex, ticketIndex)"
                          class="k-icon k-i-close k-icon-xs"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <footer class="flex justify-center sidebar-footer bg-white">
            <kbutton v-if="!checkoutButtonVisibility" @click="skipButtonHandler" :theme-color="'success'" :size="'large'"
              :class="'w-100'" :rounded="'null'">Auto select & Continue
            </kbutton>
            <kbutton v-if="checkoutButtonVisibility" @click="continueButtonHandler" :theme-color="'success'"
              :size="'large'" :class="'px-5'" :rounded="'small'">Reserve & Checkout
            </kbutton>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons'
import { Input, ColorPicker } from '@progress/kendo-vue-inputs'
import { DropDownList } from '@progress/kendo-vue-dropdowns'
import { generateUniqueHexColors, throttle } from '@/helpers/utilityFunctions'
import iconPlus from '@/assets/images/icon/svg-icons/iconPlus.vue'
import fitScreen from '@/assets/images/icon/svg-icons/fit-screen.vue'
import iconMinus from '@/assets/images/icon/svg-icons/iconMinus.vue'
import iconDeleteBlack from '@/assets/images/icon/svg-icons/iconDeleteBlack.vue'
import iconEBLogo from '@/assets/images/icon/svg-icons/icon-eb-logo.vue'
import iconEbLogoLg from '@/assets/images/icon/svg-icons/iconEbLogoLg.vue'
import arrowBackLG from '@/assets/images/icon/svg-icons/arrowBackLG.vue'
import iconMobileBackArrow from '@/assets/images/icon/svg-icons/icon-mobile-back-arrow.vue'
import { Switch } from '@progress/kendo-vue-inputs'
import seatHoldList from '../seatHoldList.vue'
import reservedSeatsList from '../reservedSeatsList.vue'
import { MultiSelect } from '@progress/kendo-vue-dropdowns'
import axios from 'axios'
import service from '@/services/service'

import iconGlassMartini from '@/assets/images/icon/svg/icon-glass-martini.svg'
import iconSignOut from '@/assets/images/icon/svg/icon-sign-out.svg'
import iconKnife from '@/assets/images/icon/svg/icon-knife.svg'
import iconSmoking from '@/assets/images/icon/svg/icon-smoking.svg'
import iconWheelchair from '@/assets/images/icon/svg/icon-wheelchair.svg'
import iconMusic from '@/assets/images/icon/svg/icon-music.svg'
import iconPlusSquare from '@/assets/images/icon/svg/icon-plus-square.svg'
import iconInfoCircle from '@/assets/images/icon/svg/icon-info-circle.svg'
import iconMicrophone from '@/assets/images/icon/svg/icon-microphone.svg'
import iconSeat from '@/assets/images/icon/svg/icon-seat.svg';
import iconStanding from '@/assets/images/icon/svg/icon-standing.svg';
import iconMobileView from '@/assets/images/icon/svg-icons/icon-mobile-view.vue'

export default {
  name: 'seatSelectionBuilder',
  components: {
    iconEbLogoLg,
    iconMobileView,
    iconMobileBackArrow,
    arrowBackLG,
    iconEBLogo,
    kbutton: Button,
    buttongroup: ButtonGroup,
    KInput: Input,
    dropdownlist: DropDownList,
    ColorPicker,
    iconDeleteBlack,
    iconPlus,
    iconMinus,
    fitScreen,
    'k-switch': Switch,
    reservedSeatsList,
    seatHoldList,
    multiselect: MultiSelect
  },
  data() {
    return {
      stageDrag: true,
      viewDetails: false,
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

      soldSeatsUUid: [],
      availableSeatsUUid: [],
      reservedSeatsUUid: [],


      holdSeatColor: '#DE3730',
      unAvailableColor: '#BEC9C8',
      bookedColor: '#6C757D',
      reservedColor: '#E89B00',
      selectedColor: '#0999',

      selectedTicketUuids: [],

      observer: null,
      charXPositionByLength: {
        1: 4,
        2: 7,
        3: 9
      },
      transformerAnchors: [],
      dragging: false,
      numValue: 9,

      seatplanData: {},
      layersArray: {},
      ticketCategories: [],
      ticketCategoriesColor: {},
      purchasedTickets: [],
      purchaseTicketUuidWithIndex: {},

      areaAvailability: {},

      lastDistance: null
    }
  },
  mounted() {
    this.observer = new ResizeObserver(throttle(this.handleResize, 0))
    this.observer.observe(this.$refs.mainContainer)
    window.addEventListener('resize', throttle(this.handleResize, 0))
    this.getBuilderDetails()
    this.stageGesture();
  },
  onUnmounted() {
    this.observer.disconnect()
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    zoomLevel() {
      if (this.seatplanData?.configKonva?.scaleX) {
        return Math.floor(this.seatplanData?.configKonva?.scaleX * 100)
      } else {
        return 100
      }
    },
    checkoutButtonVisibility() {
      let visibility = false
      for (let i in this.purchasedTickets) {
        if (this.purchasedTickets[i].selectedCount > 0) {
          visibility = true
          break
        }
      }
      return visibility
    },
    isloading() {
      return this.$store.state.loader.status
    },

    totalSelectedCount() {
      return this.purchasedTickets.reduce((acc, ticket) => {
        return acc + ticket.selectedCount
      }, 0)
    },


    totalTicketQty() {
      return this.purchasedTickets.reduce((acc, ticket) => {
        return acc + ticket.quantity
      }, 0)
    }
  },
  watch: {},
  methods: {
    stageGesture() {
      let that = this;
      var lastCenter = null;
      var lastDist = 0;
      const stage = this.$refs?.stage?.getStage()
      stage.on('touchmove', function (e) {
        e.evt.preventDefault();

        var touch1 = e.evt.touches[0];
        var touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
          that.stageDrag = false;
          // if the stage was under Konva's drag&drop
          // we need to stop it, and implement our own pan logic with two pointers
          if (stage.isDragging()) {
            stage.stopDrag();
          }

          var p1 = {
            x: touch1.clientX,
            y: touch1.clientY,
          };
          var p2 = {
            x: touch2.clientX,
            y: touch2.clientY,
          };

          if (!lastCenter) {
            lastCenter = that.getCenter(p1, p2);
            return;
          }
          var newCenter = that.getCenter(p1, p2);

          var dist = that.getDistance(p1, p2);

          if (!lastDist) {
            lastDist = dist;
          }

          // local coordinates of center point
          var pointTo = {
            x: (newCenter.x - stage.x()) / stage.scaleX(),
            y: (newCenter.y - stage.y()) / stage.scaleX(),
          };

          var scale = stage.scaleX() * (dist / lastDist);
          that.seatplanData.configKonva.scaleX = scale;
          that.seatplanData.configKonva.scaleY = scale;

          // calculate new position of the stage
          var dx = newCenter.x - lastCenter.x;
          var dy = newCenter.y - lastCenter.y;

          var newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
          };

          stage.position(newPos);
          // stage.draw()
          that.stageDrag = true;
          lastDist = dist;
          lastCenter = newCenter;
        }
      });

      stage.on('touchend', function () {
        lastDist = 0;
        lastCenter = null;
      });
    },
    getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    },

    getCenter(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    },
    fitToContent() {
      const stage = this.$refs?.stage?.getStage()
      const layer = stage?.children[0] // Assuming the layer is the first child

      if (!stage || !layer) {
        console.warn('Stage or Layer not defined.')
        return
      }

      const shapes = layer.children

      if (shapes.length === 0) {
        console.warn('No shapes to zoom to.')
        return
      }

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      shapes.forEach((shape) => {
        const shapeRect = shape.getClientRect({ relativeTo: stage }) // Get position relative to the stage
        minX = Math.min(minX, shapeRect.x)
        minY = Math.min(minY, shapeRect.y)
        maxX = Math.max(maxX, shapeRect.x + shapeRect.width)
        maxY = Math.max(maxY, shapeRect.y + shapeRect.height)
      })

      const contentWidth = maxX - minX
      const contentHeight = maxY - minY

      const scaleX = stage.width() / contentWidth
      const scaleY = stage.height() / contentHeight
      const scale = Math.min(scaleX, scaleY) // Use the smaller scale to ensure all content fits

      const offsetX = (stage.width() - contentWidth * scale) / 2 - minX * scale
      const offsetY = (stage.height() - contentHeight * scale) / 2 - minY * scale

      stage.scale({ x: scale, y: scale })
      stage.position({ x: offsetX, y: offsetY })
      stage.draw() // Redraw the stage with the new scale and position

      const finalStage = this.$refs?.stage?.getStage()
      const scaleValue = finalStage?.scaleX()
      this.seatplanData.configKonva.scaleX = scaleValue
      this.seatplanData.configKonva.scaleY = scaleValue
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
    onViewDetails() {
      this.viewDetails = !this.viewDetails;
    },
    backToEBPage() {
      window.location.href = sessionStorage.getItem('selection-builder-back-navigation');
    },
    reloadPurchaseTicketUuidWithIndex() {
      this.purchaseTicketUuidWithIndex = {}
      this.purchasedTickets.forEach((ticket, index) => {
        this.purchaseTicketUuidWithIndex = {
          ...this.purchaseTicketUuidWithIndex,
          [ticket.uuid]: index
        }
      })
    },
    automaticSeatSelectionGenerator() {
      let seats = []
      this.layersArray.forEach((layer, layerIndex) => {
        layer.shapes.forEach((shape, shapeIndex) => {
          if (shape?.isParent && ['waitingArea'].includes(layer?.layerConfig?.tableData?.type)) {
            if (layer?.layerConfig?.tableData?.isAvailable) {
              this.updatePurchaseTicketForWaitingArea(shape, layerIndex, shapeIndex)
            }
          } else if (
            shape?.isSeat &&
            shape?.seat_meta?.assigned_ticket?.uuid &&
            shape?.isAvailable
          ) {
            if (this.seatplanData.isHoldSeatingOn && shape?.isHold) {
              return
            }
            if (this.selectedTicketUuids?.includes(shape?.seat_meta?.assigned_ticket?.uuid)) {
              if (
                this.purchasedTickets[
                  this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
                ].selectedCount >=
                this.purchasedTickets[
                  this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
                ].quantity
              ) {
                return
              }

              shape.isSold = true
              shape.isSelected = true

              this.purchasedTickets[
                this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
              ].selectedCount += 1

              this.purchasedTickets[
                this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
              ].seats.push({
                uuid: shape?.uuid,
                seatName: this.seatNameGenerator(
                  layer?.layerConfig?.tableData,
                  shape
                ),
                seatIndex: shapeIndex,
                seatParentIndex: layerIndex,
                tableName: layer?.layerConfig?.tableData?.name,
                seatNumber: shape?.text,
                tablePrefix: layer?.layerConfig?.tableData?.tablePrefix,
                seatPrefix: layer?.layerConfig?.tableData?.seatPrefix,
                tableType: layer?.layerConfig?.tableData?.type,
                ...(shape?.rowName && {
                  rowLabelStartWith: shape?.rowName
                }),
                ...(shape?.seat_meta?.attendee_details?.uuid && {
                  inviteEmail: shape?.seat_meta?.attendee_details?.email
                })

              })
            }
          }
        })
      })

      let isAnyWarningAvailable = false
      for (let i in this.purchasedTickets) {
        if (this.purchasedTickets[i].selectedCount < this.purchasedTickets[i].quantity && this.purchasedTickets[i]?.isAnySeatAssigned) {
          this.$store.dispatch('notification', {
            status: true,
            type: 'warning',
            message: `Please select ${this.purchasedTickets[i].quantity - this.purchasedTickets[i].selectedCount
              } more seats for ${this.purchasedTickets[i].name}.`
          })
          isAnyWarningAvailable = true
          return
        }
      }

      if (!isAnyWarningAvailable) {
        this.seatplanOrderHandler(
          {
            seatplan: this.generateTempOrderObject(),
          }
        )
      }

    },
    updateTicketObject(tickets, seatplanTickets) {
      const EBTickets = tickets
      if (EBTickets.length > 0 && seatplanTickets.length > 0) {
        let ticketUuids = {}

        seatplanTickets.forEach((ticket, index) => {
          if (ticket?.uuid) {
            ticketUuids = {
              ...ticketUuids,
              [ticket.uuid]: index
            }
          }
        })
        EBTickets.forEach((ticket, index) => {
          if (seatplanTickets[ticketUuids[ticket?.uuid]]?.uuid) {
            this.ticketCategoriesColor = {
              ...this.ticketCategoriesColor,
              [ticket.uuid]: seatplanTickets[ticketUuids[ticket?.uuid]]?.color
            }
            ticket.color = seatplanTickets[ticketUuids[ticket?.uuid]]?.color
          }
        })
      }
      return EBTickets
    },
    generateTickets(tickets) {
      let modifiedTickets = []
      let uniqueHexaColorCodes = generateUniqueHexColors(tickets?.length)
      for (let i in tickets) {
        if (tickets[i]?.pricing_details[0]?.uuid) {
          for (let j in tickets[i].pricing_details) {
            let element = {
              name: tickets[i].pricing_details[j].variation,
              uuid: tickets[i].pricing_details[j].uuid,
              quantity: tickets[i].pricing_details[j].quantity_included,
              selectedCount: 0,
              color: uniqueHexaColorCodes[i],
              isAnySeatAssigned: false
            }
            modifiedTickets.push(element)
          }
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
      return this.updateTicketObject(modifiedTickets, this.generateTicket(this.seatplanData?.tickets))
    },
    generateTicket(tickets) {
      let modTickets = []
      tickets?.forEach((ticket, index) => {
        if (ticket?.is_parent) {
          ticket?.child?.forEach((childTicket, childIndex) => {
            modTickets.push(childTicket)
          })
        } else {
          modTickets.push(ticket)
        }
      })
      return modTickets
    },
    getBuilderDetails() {
      this.$store.dispatch('loader_action', true)
      const requests = [
        service.get_seat_plan(),
        service.get_event_details(),
        service.get_temp_order(),
        service.get_available_seats()
      ]

      axios
        .all(requests)
        .then(
          axios.spread(({ data: seatplanAPI }, { data: eventDetailsAPI }, { data: tempOrder }, { data: availableSeats }) => {
            this.availableSeatsUUid = availableSeats?.result?.seats
            this.areaAvailability = this.areaAvailableSeatsObjectParser(availableSeats?.result?.areas)
            this.seatplanData = {
              ...seatplanAPI?.result?.seatplan,
              configKonva: {
                ...seatplanAPI?.result?.seatplan?.configKonva,
                width: this.$refs.mainContainer?.offsetWidth,
                height: this.$refs.mainContainer?.offsetHeight
              }
            }
            try {
              let fileContent = this.seatplanData?.layersArray
              for (const i in fileContent) {
                if (fileContent.hasOwnProperty.call(fileContent, i)) {
                  let element = fileContent[i]
                  if (element.layerConfig.objectData?.type == 'Icon') {
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
                this.layersArray = fileContent
                this.ticketCategories = this.generateTickets(
                  eventDetailsAPI?.result?.event?.tickets?.levels
                )

                this.purchasedTickets = tempOrder?.result?.ticket_type
                this.selectedTicketUuids = []

                this.purchasedTickets = this.purchasedTickets.map((ticket) => {
                  this.selectedTicketUuids.push(ticket?.uuid)
                  return {
                    ...ticket,
                    selectedCount: 0,
                    seats: [],
                    isAnySeatAssigned: false,
                    color: this.ticketCategoriesColor[ticket?.uuid]
                  }
                })

                this.$store.dispatch('loader_action', false)
                this.reloadPurchaseTicketUuidWithIndex()
                this.updateLayers()
              }, 1000)
            } catch (error) {
              this.$store.dispatch('loader_action', false)
            }
          })
        )
        .catch((error) => {
          this.$store.dispatch('loader_action', false)
        })
    },
    getQueryParams(code) {
      let queryFinder = null;
      let queryString = window.location.search
      let urlParams = new URLSearchParams(queryString)
      queryFinder = urlParams.get(code)
      return queryFinder;
    },
    updateLayers() {
      this.layersArray.forEach((layer, layerIndex) => {
        layer.shapes.forEach((shape) => {
          if (shape?.isSeat) {
            if (shape?.seat_meta?.assigned_ticket?.uuid) {
              if (!this.availableSeatsUUid?.includes(shape?.uuid)) {
                shape.isSold = true
              } else {
                shape.isSold = false
              }
            }
            if (this.selectedTicketUuids?.includes(shape?.seat_meta?.assigned_ticket?.uuid)) {
              this.purchasedTickets[
                this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
              ].isAnySeatAssigned = true
            }
            if (shape?.seat_meta?.assigned_ticket?.uuid && !shape?.isSold) {
              if (this.selectedTicketUuids?.includes(shape?.seat_meta?.assigned_ticket?.uuid)) {
                shape.isAvailable = true
              }
            }
            if (shape?.isSold) {
              shape.isAvailable = false
            }
            if (!shape?.seat_meta?.assigned_ticket?.uuid) {
              shape.isAvailable = false
            }
            // === Reservation validation by sakib === //
            if (this.seatplanData?.isReserveSeatingOn) {
              let invitation_uuid = this.getQueryParams('invitation_uuid');
              if (invitation_uuid) {
                if (this.purchasedTickets[
                  this.purchaseTicketUuidWithIndex[shape?.seat_meta?.assigned_ticket?.uuid]
                ]?.isAnySeatAssigned) {
                  if (shape?.seat_meta?.attendee_details?.uuid) { // seat is reserved or not
                    if (shape?.seat_meta?.attendee_details?.uuid === invitation_uuid) {
                      shape.isAvailable = true
                      // let reservation_date = this.getQueryParams('date'); // check for recurring date reservation by sakib
                      // if(reservation_date) {
                      //   let total_occurence = shape?.seat_meta?.attendee_details?.occurence;
                      //   total_occurence.forEach((element, index) => {
                      //     if(element.status === true && element.date === reservation_date) {
                      //       shape.isAvailable = true
                      //     }
                      //   });
                      // }
                      // else {
                      //   shape.isAvailable = true
                      // }
                    }
                    else {
                      shape.isAvailable = false
                    }
                  }
                  else {
                    shape.isAvailable = true
                  }
                }
              }
              else {
                if (shape?.seat_meta?.attendee_details?.uuid) {
                  shape.isAvailable = false
                  // let reservation_date = this.getQueryParams('date'); // check for recurring date reservation by sakib
                  //   if(reservation_date) {
                  //     let total_occurence = shape?.seat_meta?.attendee_details?.occurence;
                  //     total_occurence.forEach((element, index) => {
                  //       if(element.status === false && element.date === reservation_date) {
                  //         shape.isAvailable = true
                  //       }
                  //     });
                  //   }                  
                }
              }
            }
            // === End reservation validation by sakib === //
          } else {
            if (shape.isParent && ['waitingArea'].includes(layer?.layerConfig?.tableData?.type)) {

              if (this.areaAvailability.hasOwnProperty(shape?.uuid)) {
                if (this.purchaseTicketUuidWithIndex?.hasOwnProperty(layer.layerConfig.tableData?.table_meta?.assigned_ticket?.uuid)) {
                  const tableCapacity = layer?.layerConfig?.tableData?.capacity
                  const tableAvailableCount = this.areaAvailability[shape?.uuid]
                  layer.layerConfig.tableData.soldCount = tableCapacity - tableAvailableCount

                  if (tableAvailableCount == 0 || tableCapacity == layer.layerConfig.tableData.soldCount) {
                    layer.layerConfig.tableData.isAvailable = false
                  } else {
                    layer.layerConfig.tableData.isAvailable = true
                  }
                }
                else {
                  layer.layerConfig.tableData.isAvailable = false
                }
              }

              if (layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                if (
                  this.selectedTicketUuids?.includes(
                    layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid
                  )
                ) {
                  const capacity = layer?.layerConfig?.tableData?.capacity
                  const soldCount = layer?.layerConfig?.tableData?.soldCount

                  if (capacity == soldCount || soldCount > capacity) {
                    layer.layerConfig.tableData.isAvailable = false
                  } else {
                    layer.layerConfig.tableData.isAvailable = true
                  }
                  this.purchasedTickets[
                    this.purchaseTicketUuidWithIndex[layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid]
                  ].isAnySeatAssigned = true
                }
              }
              if (!layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                layer.layerConfig.tableData.isAvailable = false
              }
              // === Reservation validation of waiting area by sakib === //
              if (this.seatplanData?.isReserveSeatingOn) {
                let invitation_uuid = this.getQueryParams('invitation_uuid');
                if (invitation_uuid) {
                  if (layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid) {
                    if (layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid === invitation_uuid) {
                      layer.layerConfig.tableData.isAvailable = true;
                    }
                    else {
                      layer.layerConfig.tableData.isAvailable = false;
                    }
                  }
                }
                else {
                  if (layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid) {
                    layer.layerConfig.tableData.isAvailable = false;
                  }
                }
              }
              // === End Reservation validation of waiting area by sakib === //
            }
          }
        })
      })
      setTimeout(() => {
        this.fitToContent()
      }, 10)
    },
    skipButtonHandler() {
      this.automaticSeatSelectionGenerator()
    },
    continueButtonHandler() {
      let isAnyWarningAvailable = false
      for (let i in this.purchasedTickets) {
        if (this.purchasedTickets[i].selectedCount < this.purchasedTickets[i].quantity && this.purchasedTickets[i]?.isAnySeatAssigned) {
          this.$store.dispatch('notification', {
            status: true,
            type: 'warning',
            message: `Please select ${this.purchasedTickets[i].quantity - this.purchasedTickets[i].selectedCount
              } more seats for ${this.purchasedTickets[i].name}.`
          })
          isAnyWarningAvailable = true
          return
        }
      }

      if (!isAnyWarningAvailable) {
        this.seatplanOrderHandler({
          seatplan: this.generateTempOrderObject()
        })
      }
    },
    seatplanOrderHandler(payload) {
      this.$store.dispatch('loader_action', true)
      service
        .update_temp_order(payload)
        .then(({ data }) => {
          setTimeout(() => {
            this.$store.dispatch('loader_action', false)
          }, 2000)

          let url = `${sessionStorage.getItem('redirect-url')}&from_seat_plan=true`
          sessionStorage.removeItem('temp-order-id')
          window.location.href = url
        })
        .catch((error) => {
          this.$store.dispatch('loader_action', false)
          this.$store.dispatch('notification', {
            status: true,
            type: 'error',
            message: 'Something went wrong. Please try again.'
          })
        })
    },
    saveseatplanData() {
      service
        .save_seat_plan({
          ...this.seatplanData,
          layersArray: this.resetAllSelection()
        })
        .then(({ data }) => {

          setTimeout(() => {
            this.$store.dispatch('loader_action', false)
          }, 2000)

          let url = `${sessionStorage.getItem('redirect-url')}&from_seat_plan=true`
          window.location.href = url
        })
        .catch((error) => {
          this.$store.dispatch('loader_action', false)
          this.$store.dispatch('notification', {
            status: true,
            type: 'error',
            message: 'Something went wrong. Please try again.'
          })
        })
    },
    generateTempOrderObject() {
      let tickets = []

      for (let i in this.purchasedTickets) {
        if (this.purchasedTickets[i].seats?.length > 0) {
          for (let j in this.purchasedTickets[i].seats) {
            if (this.purchasedTickets[i].seats[j]?.tableType == "waitingArea") {
              const quantity = this.purchasedTickets[i].seats[j]?.quantity
              for (let k = 0; k < quantity; k++) {
                let element = {
                  ticket_uuid: this.purchasedTickets[i].uuid,
                  seat: this.convertObjectIntoNameValuePair({
                    uuid: this.purchasedTickets[i].seats[j].uuid,
                    seat_name: this.purchasedTickets[i].seats[j].seatName,
                    table_name: this.purchasedTickets[i].seats[j].tableName,
                    seat_number: this.purchasedTickets[i].seats[j].seatNumber,
                    table_prefix: this.purchasedTickets[i].seats[j].tablePrefix,
                    seat_prefix: this.purchasedTickets[i].seats[j].seatPrefix,
                    table_type: this.purchasedTickets[i].seats[j].tableType,
                    ...(this.purchasedTickets[i].seats[j]?.inviteEmail && {
                      invite_email: this.purchasedTickets[i].seats[j]?.inviteEmail
                    }),
                    ...(this.purchasedTickets[i].seats[j]?.rowLabelStartWith && {
                      row_label_start_with: this.purchasedTickets[i].seats[j]?.rowLabelStartWith
                    })
                  })
                }
                tickets.push(element)
              }

            } else {
              let element = {
                ticket_uuid: this.purchasedTickets[i].uuid,
                seat: this.convertObjectIntoNameValuePair({
                  uuid: this.purchasedTickets[i].seats[j].uuid,
                  seat_name: this.purchasedTickets[i].seats[j].seatName,
                  table_name: this.purchasedTickets[i].seats[j].tableName,
                  seat_number: this.purchasedTickets[i].seats[j].seatNumber,
                  table_prefix: this.purchasedTickets[i].seats[j].tablePrefix,
                  seat_prefix: this.purchasedTickets[i].seats[j].seatPrefix,
                  table_type: this.purchasedTickets[i].seats[j].tableType,
                  ...(this.purchasedTickets[i].seats[j]?.rowLabelStartWith && {
                    row_label_start_with: this.purchasedTickets[i].seats[j]?.rowLabelStartWith
                  }),
                  ...(this.purchasedTickets[i].seats[j]?.inviteEmail && {
                    invite_email: this.purchasedTickets[i].seats[j]?.inviteEmail
                  }),
                })
              }
              tickets.push(element)
            }
          }
        }
      }
      return tickets
    },
    convertObjectIntoNameValuePair(inputObject) {
      const nameValueArray = []
      for (const key in inputObject) {
        if (inputObject.hasOwnProperty(key)) {
          nameValueArray.push({
            name: key,
            value: inputObject[key] ? inputObject[key].toString() : inputObject[key] == 0 ? '0' : ''
          })
        }
      }
      return nameValueArray
    },
    backButtonHandler() {
      this.$emit('backButtonHandler')
    },
    seatNameGenerator(tableData, shapeData) {

      let tableName;
      let seatName;
      let totalName;

      if (tableData?.type == "seatingArea") {
        return `${tableData?.name} Row ${shapeData?.rowName} - Seat ${shapeData?.text}`
      } else {

        if (tableData?.tablePrefix) {
          tableName = `${tableData?.tablePrefix} ${tableData?.name}`
        } else {
          tableName = tableData?.name
        }

        if (tableData?.seatPrefix) {
          seatName = `${tableData?.seatPrefix} ${shapeData?.text}`
        } else if (shapeData?.text) {
          seatName = shapeData?.text
        }

        return `${tableName} - ${seatName}`
      }
    },
    rectStrokeColorGenerator(shape, layer) {
      if (shape?.isParent && !['seatingArea'].includes(layer?.layerConfig?.tableData?.type)) {
        if (
          ['waitingArea'].includes(layer?.layerConfig?.tableData?.type) &&
          !layer?.layerConfig?.tableData?.isSelected
        ) {
          if (
            layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid &&
            layer?.layerConfig?.tableData?.isAvailable
          ) {
            if (layer?.layerConfig?.tableData?.isHold && this.seatplanData.isHoldSeatingOn) {
              // let reservation_date = this.getQueryParams('date'); // check for recurring date hold by sakib
              // if(reservation_date) {
              //   let total_occurence = layer?.layerConfig?.tableData?.hold_occurence;
              //   let holdChecker = false;
              //   total_occurence.forEach((element, index) => {

              //     if(element.status === true && element.date === reservation_date) {
              //       holdChecker = true
              //     }
              //   });
              //   return holdChecker? this.holdSeatColor : layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
              // }
              return this.holdSeatColor
            } else {
              return layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
            }
          } else {
            return this.unAvailableColor
          }
        } else if (
          ['waitingArea'].includes(layer?.layerConfig?.tableData?.type) &&
          layer?.layerConfig?.tableData?.isSelected
        ) {
          if (layer?.layerConfig?.tableData?.isSelected) {
            return this.selectedColor
          } else if (layer?.layerConfig?.tableData?.isHold && this.seatplanData.isHoldSeatingOn) {
            return this.holdSeatColor
          } else {
            return layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
          }
        } else {
          return this.unAvailableColor
        }
      } else {
        return shape?.stroke
      }
    },
    seatColorGenerator(shape) {
      if (shape?.isSeat) {
        if (shape?.isTicketAssigned && shape?.isAvailable) {
          if (shape.isSelected) {
            return this.selectedColor
          } else if (shape?.isSold) {
            return this.unAvailableColor
          } else if (shape?.isHold && this.seatplanData?.isHoldSeatingOn) {
            return this.holdSeatColor
            // let reservation_date = this.getQueryParams('date'); // check for recurring date hold by sakib
            //   if(reservation_date) {
            //     let total_occurence = shape?.hold_occurence;
            //     let holdChecker = false;
            //     total_occurence.forEach((element, index) => {

            //       if(element.status === true && element.date === reservation_date) {
            //         holdChecker = true
            //       }
            //     });
            //     return holdChecker? this.holdSeatColor : shape?.isSelected ? this.selectedColor : shape?.seat_meta?.assigned_ticket?.color
            //   }
            //   else {
            //     return this.holdSeatColor
            //   }
          } else
            return shape?.isSelected ? this.selectedColor : shape?.seat_meta?.assigned_ticket?.color
        } else {
          return this.unAvailableColor
        }
      } else {
        return shape?.fill
      }
    },
    seatClickHandler(seatDeatils, seatIndex, seatParentIndex) {

      if (seatDeatils?.isParent) {
        if (this.layersArray[seatParentIndex]?.layerConfig?.tableData?.type == 'waitingArea') {
          if (this.layersArray[seatParentIndex]?.layerConfig?.tableData?.isAvailable) {

            // === Reservation validation on seat click waiting area by sakib === //
            if (this.seatplanData?.isReserveSeatingOn) {
              let invitation_uuid = this.getQueryParams('invitation_uuid');
              if (invitation_uuid && this.layersArray[seatParentIndex]?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid) {
                if (this.layersArray[seatParentIndex]?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid != invitation_uuid) {
                  return
                }
                // Click restrict for recurring date reservation
                // let reservation_date = this.getQueryParams('date'); // check for recurring date seat click section
                // if(reservation_date) {
                //   let total_occurence = shape?.seat_meta?.attendee_details?.occurence;

                //   total_occurence.forEach((element, index) => {
                //     if(element.status === true && element.date !== reservation_date) {
                //       return;
                //     }
                //   });
                // }
                // Click restrict for recurring date reservation
              }
            }
            // === End Reservation validation on seat click waiting area by sakib === //
            this.updatePurchaseTicketForWaitingArea(seatDeatils, seatParentIndex, seatIndex)
          }
        }
        return
      } else {
        // === Reservation validation by sakib for seat click === //
        if (this.seatplanData?.isReserveSeatingOn) {
          let invitation_uuid = this.getQueryParams('invitation_uuid');
          if (invitation_uuid) {
            if (this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta?.attendee_details?.uuid) {
              if (this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta?.attendee_details?.uuid !== invitation_uuid) {
                return
              }
            }
          }
        }
        // === End Reservation validation by sakib for seat click === //
        if (
          seatDeatils?.isSeat &&
          this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta?.assigned_ticket?.uuid &&
          seatDeatils?.isAvailable
        ) {
          if (seatDeatils?.isHold && this.seatplanData?.isHoldSeatingOn) {
            // let reservation_date = this.getQueryParams('date'); // check for recurring date reservation click by sakib
            // if(reservation_date) {
            //   let total_occurence = seatDeatils?.hold_occurence;
            //   let holdChecker = false;
            //   total_occurence.forEach((element, index) => {

            //     if(element.status === true && element.date === reservation_date) {
            //       holdChecker = true
            //     }
            //   });

            //   if(holdChecker) {
            //     return
            //   }
            //   else {
            //     this.updatePurchaseTicket(seatDeatils, seatParentIndex, seatIndex)
            //   }
            // }
            // else {
            //   return
            // }

            return

          } else if (seatDeatils?.isHold && !this.seatplanData?.isHoldSeatingOn) {
            this.updatePurchaseTicket(seatDeatils, seatParentIndex, seatIndex)
          } else if (seatDeatils?.isSold) {
            return
          } else {
            this.updatePurchaseTicket(seatDeatils, seatParentIndex, seatIndex)
          }
        }
      }
    },
    updatePurchaseTicketForWaitingArea(seatDeatils, seatParentIndex, seatIndex) {
      const ticketUuid = this.layersArray[seatParentIndex].layerConfig.tableData.table_meta?.assigned_ticket?.uuid
      if (this.purchaseTicketUuidWithIndex.hasOwnProperty(ticketUuid)) {

        if (this.seatplanData.isHoldSeatingOn && this.layersArray[seatParentIndex].layerConfig?.tableData?.isHold) {

          // let reservation_date = this.getQueryParams('date'); // check for recurring date seat click section
          // let holdChecker = false
          // if(reservation_date) {
          //   let total_occurence = this.layersArray[seatParentIndex].layerConfig?.tableData?.hold_occurence;
          //   total_occurence.forEach((element, index) => {
          //     if(element.status === true && element.date === reservation_date) {
          //       holdChecker = true
          //     }
          //   });
          //   if(holdChecker) {
          //     return
          //   }
          // }
          // else {
          //   return
          // }

          return

        }

        let quantity = this.layersArray[seatParentIndex].layerConfig?.tableData?.capacity

        let soldCount = this.layersArray[seatParentIndex].layerConfig?.tableData?.soldCount

        let SelectedQuantity = this.purchasedTickets[
          this.purchaseTicketUuidWithIndex[ticketUuid]
        ]?.quantity

        let remainingCount = (SelectedQuantity - this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]]?.selectedCount) <= quantity ? (SelectedQuantity - this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]]?.selectedCount) : quantity - soldCount

        if (
          ticketUuid &&
          this.layersArray[seatParentIndex].layerConfig.tableData.isAvailable
        ) {

          if (this.layersArray[seatParentIndex].layerConfig.tableData.isSelected) {
            this.$store.dispatch('notification', {
              status: true,
              type: 'warning',
              message: 'You have already selected these seats.'
            })
            return
          }

          if (this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]].selectedCount == SelectedQuantity || this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]].selectedCount > quantity) {
            return
          }

          this.layersArray[seatParentIndex].layerConfig.tableData.isSelected = true
          this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]].selectedCount += remainingCount
          this.layersArray[seatParentIndex].layerConfig.tableData.soldCount += remainingCount

          this.purchasedTickets[this.purchaseTicketUuidWithIndex[ticketUuid]].seats.push({
            uuid: seatDeatils?.uuid,
            seatName: `${this.layersArray[seatParentIndex].layerConfig?.tableData?.name} - ${remainingCount} ${remainingCount > 1 ? 'seats' : 'seat'}`,
            seatIndex: seatIndex,
            seatParentIndex: seatParentIndex,
            quantity: remainingCount,
            tableName: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.name,
            ...(this.layersArray[seatParentIndex]?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid && {
              inviteEmail: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.table_meta?.attendee_details?.email
            }),
            seatNumber: null,
            tablePrefix: null,
            seatPrefix: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.seatPrefix,
            tableType: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.type,
            rowLabelStartWith: null
          })
        }
      }

    },
    updatePurchaseTicket(seatDeatils, seatParentIndex, seatIndex) {
      this.purchasedTickets.forEach((ticket) => {
        if (
          ticket?.uuid ==
          this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta?.assigned_ticket?.uuid
        ) {
          if (ticket?.quantity == ticket?.selectedCount) {
            this.$store.dispatch('notification', {
              status: true,
              type: 'warning',
              message: 'You have already selected the maximum number of seats.'
            })
            return
          } else {
            if (this.layersArray[seatParentIndex].shapes[seatIndex].isSelected) {
              this.$store.dispatch('notification', {
                status: true,
                type: 'warning',
                message: 'You have already selected this seat.'
              })
              return
            }

            ticket.selectedCount += 1
            ticket.seats.push({
              uuid: seatDeatils?.uuid,
              seatName: this.seatNameGenerator(
                this.layersArray[seatParentIndex]?.layerConfig?.tableData,
                seatDeatils
              ),
              seatIndex: seatIndex,
              seatParentIndex: seatParentIndex,
              uuid: seatDeatils?.uuid,
              tableName: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.name,
              seatNumber: seatDeatils?.text,
              tablePrefix: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.tablePrefix,
              seatPrefix: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.seatPrefix,
              tableType: this.layersArray[seatParentIndex]?.layerConfig?.tableData?.type,
              ...(seatDeatils?.rowName && {
                rowLabelStartWith: seatDeatils?.rowName
              }),
              ...(seatDeatils?.seat_meta?.attendee_details?.uuid && {
                inviteEmail: seatDeatils?.seat_meta?.attendee_details?.email
              })
            })
            this.layersArray[seatParentIndex].shapes[seatIndex].isSelected = true
            this.layersArray[seatParentIndex].shapes[seatIndex].isSold = true
          }
        }
      })
    },
    deleteSelectedSeat(seat, seatindex, ticketIndex) {

      if (this.layersArray[seat?.seatParentIndex]?.layerConfig?.tableData?.type == 'waitingArea') {
        this.layersArray[seat?.seatParentIndex].layerConfig.tableData.isSelected = false
        this.purchasedTickets[ticketIndex].seats.splice(seatindex, 1)
        this.purchasedTickets[ticketIndex].selectedCount -= seat?.quantity
        this.layersArray[seat?.seatParentIndex].layerConfig.tableData.soldCount -= seat?.quantity
      } else {
        this.purchasedTickets[ticketIndex].selectedCount -= 1
        this.purchasedTickets[ticketIndex].seats.splice(seatindex, 1)
        this.layersArray[seat?.seatParentIndex].shapes[seat?.seatIndex].isSelected = false
        this.layersArray[seat?.seatParentIndex].shapes[seat?.seatIndex].isSold = false
      }
    },
    resetAllSelection() {
      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          shape.isSelected = false
          if (['waitingArea'].includes(layer?.layerConfig?.tableData?.type)) {
            layer.layerConfig.tableData.isSelected = false
          }
        })
      })
      return this.layersArray
    },
    seatGroupSelectHandler(seatGroupIndex) {
      if (
        ['waitingArea'].includes(this.layersArray[seatGroupIndex]?.layerConfig?.tableData?.type)
      ) {
        if (
          this.layersArray[seatGroupIndex].layerConfig.tableData.table_meta?.assigned_ticket
            ?.uuid &&
          this.layersArray[seatGroupIndex].layerConfig.tableData.isAvailable
        ) {
          this.layersArray[seatGroupIndex].layerConfig.tableData.isSelected = true
        }
      } else {
        this.layersArray[seatGroupIndex].shapes.forEach((seat) => {
          if (seat?.seat_meta?.assigned_ticket?.uuid) {
            seat.isSelected = true
          }
        })
      }
    },
    handleStageMouseDown(e) {
      if (e.target === e.target.getStage()) {
        // this.resetSelection()
        return
      }
    },
    handleResize() {
      if (this.$refs.mainContainer) {
        const width = this.$refs.mainContainer.clientWidth
        const height = this.$refs.mainContainer.clientHeight
        this.seatplanData.configKonva = {
          ...this.seatplanData.configKonva,
          width,
          height,
        }
      }
    },
    calculateCharsCount(str) {
      return str?.toString().length
    },
    zoomIn() {
      this.seatplanData.configKonva.scaleX += 0.05
      this.seatplanData.configKonva.scaleY += 0.05
    },
    zoomOut() {
      this.seatplanData.configKonva.scaleX -= 0.05
      this.seatplanData.configKonva.scaleY -= 0.05
    },
  }
}
</script>

<style lang="scss" scoped>
.choose-button-group {
  max-width: 112px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
  background-color: #003736;
  box-shadow: 0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31);
  border-radius: 2px;

  .k-button {
    flex: 1;
    width: 25px;

    &.bring-to-front {
      svg {
        display: block;
      }
    }
  }
}
</style>
