<template>
  <div class="grow flex flex-col canvas-wrap">
    <div ref="mainContainer" class="grow canvas-content scroll-y">
      <v-stage :config="seatPlanData.configKonva" ref="stage" :draggable="true" @mousedown="handleStageMouseDown">
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
                  stroke: shape?.isSeat || shape?.isParent ? '#BEC9C8' : shape?.stroke
                }" v-if="shape?.type == 'Circle'">
              </v-circle>
              <v-rect @touchstart="seatClickHandler(shape, shapeIndex, layerIndex)"
                @click="seatClickHandler(shape, shapeIndex, layerIndex)" v-if="shape?.type == 'Rect'" :config="{
                  ...shape,
                  ...(shape?.stroke && { stroke: rectStrokeColorGenerator(shape, layer) }),
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
      <div class="flex items-center zoom-container">
        <kbutton :disabled="zoomLevel >= 150" @click="zoomIn" :class="'mb-0'" :size="'large'" :fill-mode="'flat'"
          :rounded="'small'">
          <iconPlus></iconPlus>
        </kbutton>
        <div class="flex-none zoom-text text-xs text-center mx-1">{{ zoomLevel }}%</div>
        <kbutton :disabled="zoomLevel <= 19" @click="zoomOut" :size="'large'" :fill-mode="'flat'" :rounded="'small'">
          <iconMinus></iconMinus>
        </kbutton>
      </div>
    </div>
    <footer class="flex-none flex canvas-footer bg-white">
      <kbutton @click="backButtonHandler" :theme-color="'secondary'" :size="'large'" :class="''" :rounded="'small'">Back
      </kbutton>
      <div class="grow"></div>
      <div class="flex items-center">
        <div :class="auto_save_button_text === 'Saved' ? 'me-3 auto-saving-wrap saved' : 'me-3 auto-saving-wrap'"
          v-if="auto_save_button_text">{{ auto_save_button_text }}</div>
        <kbutton @click="continueButtonHandler" :theme-color="'primary'" :size="'large'" :class="'px-3'"
          :rounded="'small'">Save
        </kbutton>
      </div>
    </footer>
  </div>
  <div class="flex-none sidebar relative">
    <div class="flex flex-col h-100">
      <div class="grow sidebar-content-scroll sb--88 scroll-y">
        <h5 class="text-base leading-5 font-medium mt-0 mb-6 color-primary20">Manage Attendees</h5>
        <p class="text-xs2 mb-2 color-secondary20">
          Total Seats: <span class="font-semibold">{{ totalSeatCount }}</span>
        </p>
        <p class="text-xs2 mb-2 color-secondary20">
          Reserved Seats: <span class="font-semibold">{{ reserveSeatCount }}</span>
        </p>

        <div class="attendee-total-seats-wrap">
          <div v-for="item in ticketCategories" :key="item?.uuid">
            <template v-if="item?.is_parent">
              <template v-for="(child) in item?.child" :key="child?.uuid">
                <div v-if="child?.color" class="attendee-seats-item d-flex justify-between align-items-center">
                  <div class="d-flex align-items-center">
                    <div class="color-ring" :style="{
                      backgroundColor: child?.color
                    }"></div>
                    <div class="item-name text-xs2 font-normal color-secondary20 leading-5">
                      {{ child?.name }}
                    </div>
                  </div>
                  <span class="text-xs font-normal color-secondary20 leading-4">{{
                    child?.selectedCount
                  }}</span>
                </div>
              </template>
            </template>
            <div v-if="!item?.is_parent && item?.color"
              class="attendee-seats-item d-flex justify-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="color-ring" :style="{
                  backgroundColor: item?.color
                }"></div>
                <div class="item-name text-xs2 font-normal color-secondary20 leading-5">
                  {{ item?.name }}
                </div>
              </div>
              <span class="text-xs font-normal color-secondary20 leading-4">{{
                item?.selectedCount
              }}</span>
            </div>
          </div>
          <div class="attendee-seats-item d-flex justify-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="color-ring" :style="{
                backgroundColor: holdSeatColor
              }"></div>
              <div class="item-name text-xs2 font-normal color-secondary20 leading-5">
                On Hold
              </div>
            </div>
            <span class="text-xs font-normal color-secondary20 leading-4">{{ holdSeatCount }}</span>
          </div>
        </div>

        <div class="custom-accordion-wrap">
          <div class="custom-accordion-btn bg-neutral98 rounded-sm2 d-flex justify-between align-items-center">
            <span class="text-sm font-medium leading-4 color-secondary20">Reserved Seating</span>
            <div class="btn-switch-small">
              <k-switch @change="toogleReserveSeating" :checked="seatPlanData.isReserveSeatingOn" :size="'small'"
                :on-label="''" :off-label="''" />
            </div>
          </div>

          <div v-if="seatPlanData.isReserveSeatingOn">
            <div v-if="true" class="custom-accordion-content d-flex align-items-center flex-column">
              <div class="w-100 mb-3">
                <dropdownlist :filterable="true" @filterchange="filterChange" :data-items="contactsList"
                  :text-field="'email'" :fill-mode="'outline'" :data-item-key="'uuid'" @change="handleAttendeeSelection"
                  :value="selectedAttendee">
                </dropdownlist>
              </div>
              <div v-if="reserveSeatCardCount == 0" class="d-flex align-items-center flex-column mt-2">
                <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M30.4997 16.9268V13.333C30.4997 10.5726 28.2601 8.33301 25.4997 8.33301H15.4997C12.7393 8.33301 10.4997 10.5726 10.4997 13.333V16.9268C8.67676 17.4997 7.32259 19.0101 7.16634 20.8851C7.06217 22.3955 7.63509 23.8538 8.83301 24.7913V29.583C8.83301 30.7809 9.71842 31.6663 10.9163 31.6663H15.4997C15.708 31.6663 17.0622 31.6663 17.1143 29.9997H23.833C23.8851 31.6143 25.2913 31.6663 25.4997 31.6663H30.083C31.2288 31.6663 32.1663 30.7809 32.1663 29.583V24.7913C33.3122 23.8538 33.9372 22.4476 33.7809 20.8851C33.6247 19.0101 32.2705 17.4997 30.4997 16.9268ZM14.6663 29.1663H11.333V23.4372L10.708 23.0726C9.97884 22.6559 9.61426 21.8747 9.66634 21.0934C9.71842 20.0518 10.7601 19.1663 11.958 19.1663H12.583C13.7288 19.1663 14.6663 20.1038 14.6663 21.2497V29.1663ZM23.833 22.4997V27.4997H17.1663V22.4997H23.833ZM23.9893 19.9997H16.958C16.4372 18.2288 14.8747 16.9268 12.9997 16.7184V13.333C12.9997 11.9788 14.0934 10.833 15.4997 10.833H25.4997C26.8538 10.833 27.9997 11.9788 27.9997 13.333V16.7184C26.0726 16.9268 24.5101 18.2288 23.9893 19.9997ZM30.2393 23.0726L29.6663 23.4372V29.1663H26.333V21.2497C26.333 20.1038 27.2184 19.1663 28.4163 19.1663H29.0413C30.1872 19.1663 31.2288 20.0518 31.2809 21.0934C31.3851 21.9268 30.9684 22.6559 30.2393 23.0726Z"
                    fill="#627C7B" />
                </svg>
                <p class="color-neutral50 text-xs leading-5 text-center mb-2">
                  Reserve seats for your guests. The invited guests' list will appear here for reservations. <a
                    target="_blank"
                    href="https://support.eventbookings.com/send-invitations-to-guests-or-event-attendees/">Learn how
                    invitation works</a>
                </p>
              </div>
              <template v-if="reserveSeatCardCount != 0">
                <template v-for="(item, index) in getThreeReservedSeats " :key="index">
                  <div
                    v-if="item?.shape?.seat_meta?.attendee_details?.uuid || item.layerConfig.tableData.table_meta.attendee_details.uuid"
                    class="attendee-seats-item-wrap">
                    <div class="attendee-seats-item d-flex justify-between align-items-start active">
                      <div class="d-flex align-items-start text-ellipsis-wrap">
                        <div class="color-ring ring-a-seats mr-2" :style="{
                          backgroundColor: item?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color ? item?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color : item?.shape?.seat_meta?.assigned_ticket?.color
                        }"></div>
                        <div class="lg-content-ellp">
                          <div
                            class="item-name text-xs font-normal color-secondary20 leading-3 text-ellipsis overflow-hidden">
                            {{
                              item?.shape?.seat_meta?.attendee_details?.email ||
                              item?.layerConfig?.tableData?.table_meta?.attendee_details?.email }}
                          </div>
                          <span v-if="item?.shape?.seat_meta?.attendee_details?.uuid"
                            class="text-xs font-normal color-secondary20 leading-3">
                            <span>{{ seatNameGenerator(item?.layerConfig?.tableData, item?.shape) }}</span>
                          </span>
                          <span v-if="item?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid"
                            class="text-xs font-normal color-secondary20 leading-3">
                            <span>{{ item?.layerConfig?.tableData.name }}</span>
                          </span>
                        </div>
                      </div>

                      <!-- <kbutton v-if="item?.shape?.seat_meta?.attendee_details?.occurence?.length > 0" :fill-mode="'clear'" :class="'pb-1 pt-0 px-1'">
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M4.625 9C4.8125 9 5 8.84375 5 8.625V7.375C5 7.1875 4.8125 7 4.625 7H3.375C3.15625 7 3 7.1875 3 7.375V8.625C3 8.84375 3.15625 9 3.375 9H4.625ZM8 8.625V7.375C8 7.1875 7.8125 7 7.625 7H6.375C6.15625 7 6 7.1875 6 7.375V8.625C6 8.84375 6.15625 9 6.375 9H7.625C7.8125 9 8 8.84375 8 8.625ZM11 8.625V7.375C11 7.1875 10.8125 7 10.625 7H9.375C9.15625 7 9 7.1875 9 7.375V8.625C9 8.84375 9.15625 9 9.375 9H10.625C10.8125 9 11 8.84375 11 8.625ZM8 11.625V10.375C8 10.1875 7.8125 10 7.625 10H6.375C6.15625 10 6 10.1875 6 10.375V11.625C6 11.8438 6.15625 12 6.375 12H7.625C7.8125 12 8 11.8438 8 11.625ZM5 11.625V10.375C5 10.1875 4.8125 10 4.625 10H3.375C3.15625 10 3 10.1875 3 10.375V11.625C3 11.8438 3.15625 12 3.375 12H4.625C4.8125 12 5 11.8438 5 11.625ZM11 11.625V10.375C11 10.1875 10.8125 10 10.625 10H9.375C9.15625 10 9 10.1875 9 10.375V11.625C9 11.8438 9.15625 12 9.375 12H10.625C10.8125 12 11 11.8438 11 11.625ZM14 3.5C14 2.6875 13.3125 2 12.5 2H11V0.375C11 0.1875 10.8125 0 10.625 0H9.375C9.15625 0 9 0.1875 9 0.375V2H5V0.375C5 0.1875 4.8125 0 4.625 0H3.375C3.15625 0 3 0.1875 3 0.375V2H1.5C0.65625 2 0 2.6875 0 3.5V14.5C0 15.3438 0.65625 16 1.5 16H12.5C13.3125 16 14 15.3438 14 14.5V3.5ZM12.5 14.3125C12.5 14.4375 12.4062 14.5 12.3125 14.5H1.6875C1.5625 14.5 1.5 14.4375 1.5 14.3125V5H12.5V14.3125Z"
                            fill="#003736"></path>
                        </svg>
                      </kbutton> -->

                      <kbutton @click="removeAttendeeAssignee(item?.layerIndex, item?.shapeIndex, item?.layer)"
                        :fill-mode="'clear'" :class="'pb-1 pt-0 px-1'">
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M13.5 2.5H10.9062L9.84375 0.75C9.59375 0.3125 9.09375 0 8.5625 0H5.40625C4.875 0 4.375 0.3125 4.125 0.75L3.0625 2.5H0.5C0.21875 2.5 0 2.75 0 3V3.5C0 3.78125 0.21875 4 0.5 4H1L1.65625 14.5938C1.6875 15.4062 2.34375 16 3.15625 16H10.8125C11.625 16 12.2812 15.4062 12.3125 14.5938L13 4H13.5C13.75 4 14 3.78125 14 3.5V3C14 2.75 13.75 2.5 13.5 2.5ZM5.40625 1.5H8.5625L9.15625 2.5H4.8125L5.40625 1.5ZM10.8125 14.5H3.15625L2.5 4H11.4688L10.8125 14.5Z"
                            fill="#003736" />
                        </svg>
                      </kbutton>
                    </div>
                    <!-- <div class="attendee-occurence scroll-wrap scroll-y" v-if="item?.shape?.seat_meta?.attendee_details?.occurence?.length > 0">
                      <div class="dates-loop" v-for="(event_dates, event_dates_index) in item?.shape?.seat_meta?.attendee_details?.occurence " :key="event_dates_index">
                        <checkbox
                            v-model="event_dates.status"
                            :label="getHumanDate(event_dates.date)"
                        />
                      </div>
                    </div> -->
                  </div>
                </template>
              </template>

              <div v-if="reserveSeatCardCount >= 4" class="d-flex justify-center mt-1">
                <a @click="onOpenContactsList" href="#" class="text-primary text-xs2 leading-5 text-decoration-hover">View
                  All <i class="k-icon k-i-arrow-chevron-right"></i></a>
              </div>
            </div>

          </div>
        </div>

        <div class="custom-accordion-wrap mb-0">
          <div class="custom-accordion-btn bg-neutral98 rounded-sm2 d-flex justify-between align-items-center">
            <span class="text-sm font-medium leading-4 color-secondary20">Hold Seats</span>
            <div class="btn-switch-small">
              <k-switch @change="toogleHoldSeating" :checked="this.seatPlanData.isHoldSeatingOn" :size="'small'"
                :on-label="''" :off-label="''" />
            </div>
          </div>
          <div v-if="this.seatPlanData.isHoldSeatingOn">
            <div class="custom-accordion-content d-flex align-items-center flex-column">
              <kbutton @click="addSelectedSeatToTheHoldList" :fill-mode="'outline'" :theme-color="'primary'"
                :class="'w-100 btn-border mb-3'">Add selected Seat To Hold List</kbutton>

              <div v-if="holdSeatCardCount == 0" class="d-flex align-items-center flex-column mt-1">
                <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M30.4997 16.9268V13.333C30.4997 10.5726 28.2601 8.33301 25.4997 8.33301H15.4997C12.7393 8.33301 10.4997 10.5726 10.4997 13.333V16.9268C8.67676 17.4997 7.32259 19.0101 7.16634 20.8851C7.06217 22.3955 7.63509 23.8538 8.83301 24.7913V29.583C8.83301 30.7809 9.71842 31.6663 10.9163 31.6663H15.4997C15.708 31.6663 17.0622 31.6663 17.1143 29.9997H23.833C23.8851 31.6143 25.2913 31.6663 25.4997 31.6663H30.083C31.2288 31.6663 32.1663 30.7809 32.1663 29.583V24.7913C33.3122 23.8538 33.9372 22.4476 33.7809 20.8851C33.6247 19.0101 32.2705 17.4997 30.4997 16.9268ZM14.6663 29.1663H11.333V23.4372L10.708 23.0726C9.97884 22.6559 9.61426 21.8747 9.66634 21.0934C9.71842 20.0518 10.7601 19.1663 11.958 19.1663H12.583C13.7288 19.1663 14.6663 20.1038 14.6663 21.2497V29.1663ZM23.833 22.4997V27.4997H17.1663V22.4997H23.833ZM23.9893 19.9997H16.958C16.4372 18.2288 14.8747 16.9268 12.9997 16.7184V13.333C12.9997 11.9788 14.0934 10.833 15.4997 10.833H25.4997C26.8538 10.833 27.9997 11.9788 27.9997 13.333V16.7184C26.0726 16.9268 24.5101 18.2288 23.9893 19.9997ZM30.2393 23.0726L29.6663 23.4372V29.1663H26.333V21.2497C26.333 20.1038 27.2184 19.1663 28.4163 19.1663H29.0413C30.1872 19.1663 31.2288 20.0518 31.2809 21.0934C31.3851 21.9268 30.9684 22.6559 30.2393 23.0726Z"
                    fill="#627C7B" />
                </svg>
                <p class="color-neutral50 text-xs leading-5 text-center mb-2">
                  Create hold list and add seats to hold ticket sales.
                </p>
              </div>

              <div v-if="holdSeatCardCount != 0" class="w-100">
                <template v-for="(item, index) in getThreeHoldSeat" :key="index">
                  <div v-if="item?.shape?.isHold || item?.layerConfig?.tableData?.isHold"
                    class="attendee-seats-item-wrap">
                    <div class="attendee-seats-item d-flex justify-between align-items-start active">
                      <div class="d-flex align-items-center text-ellipsis-wrap">
                        <div class="color-ring ring-a-seats mr-2" :style="{
                          backgroundColor: item?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color ? item?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color : item?.shape?.seat_meta?.assigned_ticket?.color
                        }"></div>
                        <div class="lg-content-ellp">
                          <div v-if="item?.shape?.isHold" class="text-xs font-normal color-secondary20 leading--3">
                            {{ seatNameGenerator(item?.layerConfig?.tableData, item?.shape) }}
                          </div>
                          <div v-if="item?.layerConfig?.tableData?.isHold"
                            class="text-xs font-normal color-secondary20 leading--3">{{
                              item?.layerConfig?.tableData?.name }}</div>
                        </div>
                      </div>

                      <!-- <kbutton v-if="item?.shape?.hold_occurence?.length > 0" :fill-mode="'clear'" :class="'py-1 px-1'">
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M4.625 9C4.8125 9 5 8.84375 5 8.625V7.375C5 7.1875 4.8125 7 4.625 7H3.375C3.15625 7 3 7.1875 3 7.375V8.625C3 8.84375 3.15625 9 3.375 9H4.625ZM8 8.625V7.375C8 7.1875 7.8125 7 7.625 7H6.375C6.15625 7 6 7.1875 6 7.375V8.625C6 8.84375 6.15625 9 6.375 9H7.625C7.8125 9 8 8.84375 8 8.625ZM11 8.625V7.375C11 7.1875 10.8125 7 10.625 7H9.375C9.15625 7 9 7.1875 9 7.375V8.625C9 8.84375 9.15625 9 9.375 9H10.625C10.8125 9 11 8.84375 11 8.625ZM8 11.625V10.375C8 10.1875 7.8125 10 7.625 10H6.375C6.15625 10 6 10.1875 6 10.375V11.625C6 11.8438 6.15625 12 6.375 12H7.625C7.8125 12 8 11.8438 8 11.625ZM5 11.625V10.375C5 10.1875 4.8125 10 4.625 10H3.375C3.15625 10 3 10.1875 3 10.375V11.625C3 11.8438 3.15625 12 3.375 12H4.625C4.8125 12 5 11.8438 5 11.625ZM11 11.625V10.375C11 10.1875 10.8125 10 10.625 10H9.375C9.15625 10 9 10.1875 9 10.375V11.625C9 11.8438 9.15625 12 9.375 12H10.625C10.8125 12 11 11.8438 11 11.625ZM14 3.5C14 2.6875 13.3125 2 12.5 2H11V0.375C11 0.1875 10.8125 0 10.625 0H9.375C9.15625 0 9 0.1875 9 0.375V2H5V0.375C5 0.1875 4.8125 0 4.625 0H3.375C3.15625 0 3 0.1875 3 0.375V2H1.5C0.65625 2 0 2.6875 0 3.5V14.5C0 15.3438 0.65625 16 1.5 16H12.5C13.3125 16 14 15.3438 14 14.5V3.5ZM12.5 14.3125C12.5 14.4375 12.4062 14.5 12.3125 14.5H1.6875C1.5625 14.5 1.5 14.4375 1.5 14.3125V5H12.5V14.3125Z"
                            fill="#003736"></path>
                        </svg>
                      </kbutton> -->
                      <kbutton @click="removeSeatFromTheHoldList(item?.layerIndex, item?.shapeIndex, item?.layer)"
                        :fill-mode="'flat'" :class="'py-1 px-1'">
                        <iconDeleteBlack />
                      </kbutton>
                    </div>


                    <!-- <div class="hold-occurence scroll-wrap scroll-y" v-if="item?.shape?.hold_occurence?.length > 0">
                      <div class="dates-loop" v-for="(event_dates, event_dates_index) in item?.shape?.hold_occurence" :key="event_dates_index">
                        <checkbox
                            v-model="event_dates.status"
                            :label="getHumanDate(event_dates.date)"
                        />
                      </div>
                    </div>

                    <div class="hold-occurence scroll-wrap scroll-y" v-if="item?.layerConfig?.tableData?.hold_occurence?.length > 0">
                      <div class="dates-loop" v-for="(event_dates, event_dates_index) in item?.layerConfig?.tableData?.hold_occurence" :key="event_dates_index">
                        <checkbox
                            v-model="event_dates.status"
                            :label="getHumanDate(event_dates.date)"
                        />
                      </div>
                    </div> -->
                  </div>
                </template>

                <div v-if="holdSeatCardCount >= 4" class="d-flex justify-center">
                  <a @click="onOpenSeatHoldList" href="#"
                    class="text-primary text-xs2 leading-5 text-decoration-hover">View All <i
                      class="k-icon k-i-arrow-chevron-right"></i></a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  <reservedSeatsList v-if="reservedSeatsListComponentVisibility" :visible="reservedSeatsListVisibility"
    @close="onCloseReservedSeatsList" />

  <seatHoldList v-if="seatHoldListComponentVisibility" :visible="seatHoldListVisibility" @close="onCloseSeatHoldList" />
</template>

<script>
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons'
import { Input, ColorPicker } from '@progress/kendo-vue-inputs'
import { DropDownList } from '@progress/kendo-vue-dropdowns'
import { throttle } from '@/helpers/utilityFunctions'
import iconPlus from '@/assets/images/icon/svg-icons/iconPlus.vue'
import iconMinus from '@/assets/images/icon/svg-icons/iconMinus.vue'
import iconDeleteBlack from '@/assets/images/icon/svg-icons/iconDeleteBlack.vue'
import { Switch } from '@progress/kendo-vue-inputs'
import seatHoldList from '../seatHoldList.vue'
import reservedSeatsList from '../reservedSeatsList.vue'
import { MultiSelect } from "@progress/kendo-vue-dropdowns";
import { Checkbox } from "@progress/kendo-vue-inputs";
import moment from 'moment';


export default {
  inject: ['layersArray', 'seatPlanData'],
  name: 'SeatAssignAttendeeBuilder',
  emits: ["finalContinueHandler", "backButtonHandler", "modifyLayersArray"],
  components: {
    kbutton: Button,
    buttongroup: ButtonGroup,
    KInput: Input,
    dropdownlist: DropDownList,
    ColorPicker,
    iconDeleteBlack,
    iconPlus,
    iconMinus,
    'k-switch': Switch,
    reservedSeatsList,
    seatHoldList,
    multiselect: MultiSelect,
    checkbox: Checkbox,
  },
  data() {
    return {
      reservedSeatsListComponentVisibility: false,
      reservedSeatsListVisibility: false,

      seatHoldListComponentVisibility: false,
      seatHoldListVisibility: false,

      isAnySeatAssigned: false,
      isAnySeatHold: false,

      rCount: [],

      holdSeatColor: '#DE3730',
      unAvailableColor: '#BEC9C8',
      bookedColor: '#6C757D',
      reservedColor: '#E89B00',
      selectedColor: '#0999',

      selectedAttendee: {
        uuid: 0,
        name: '',
        email: 'Not Selected'
      },

      observer: null,
      charXPositionByLength: {
        1: 4,
        2: 7,
        3: 9
      },
      transformerAnchors: [],
      dragging: false,
      numValue: 9,
      selectedTicketCategory: {
        name: 'Not Assigned',
        uuid: 0
      },
      configKonva: {
        width: 500,
        height: 500,
        scaleX: 1,
        scaleY: 1
      }
    }
  },
  mounted() {
    this.observer = new ResizeObserver(throttle(this.handleResize, 0))
    this.observer.observe(this.$refs.mainContainer)
    window.addEventListener('resize', throttle(this.handleResize, 0))
    if (this.ticketCategories?.length > 0) {
      this.ticketCategories[0].quantity = this.totalSeatCount
    }
    this.$store.dispatch('event_details_action');
  },
  onUnmounted() {
    this.observer.disconnect()
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    auto_save_button_text() {
      return this.$store.getters.get_auto_save_button_text
    },
    zoomLevel() {
      if (this.seatPlanData?.configKonva?.scaleX) {
        return Math.floor(this.seatPlanData?.configKonva?.scaleX * 100)
      } else {
        return 100
      }
    },
    getThreeReservedSeats() {
      const reservedSeats = []
      this.layersArray.forEach((layer, layerIndex) => {
        layer.shapes.forEach((shape, shapeIndex) => {
          if (shape?.seat_meta?.attendee_details?.uuid) {
            // break this loop if reservedSeats length is 3
            if (reservedSeats.length == 3) {
              return
            }
            reservedSeats.push({
              layerIndex: layerIndex,
              layerConfig: layer.layerConfig,
              shapeIndex: shapeIndex,
              shape: shape,
              layer: layer
            })
          }
        })
        if (layer?.layerConfig?.tableData?.type == 'waitingArea' && layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid) {

          reservedSeats.push({
            layerIndex: layerIndex,
            layerConfig: layer.layerConfig,
            shapeIndex: null,
            shape: null,
            layer: layer
          })
        }
      })
      return reservedSeats
    },

    getThreeHoldSeat() {
      const holdSeats = []
      this.layersArray.forEach((layer, layerIndex) => {
        layer.shapes.forEach((shape, shapeIndex) => {
          if (shape?.isSeat && shape?.isHold) {
            // break this loop if reservedSeats length is 3
            if (holdSeats.length == 3) {
              return
            }
            holdSeats.push({
              layerIndex: layerIndex,
              layerConfig: layer.layerConfig,
              shapeIndex: shapeIndex,
              shape: shape,
              layer: layer
            })
          }
        })
        if (layer?.layerConfig?.tableData?.type == 'waitingArea' && layer?.layerConfig?.tableData?.isHold) {
          if (holdSeats.length == 3) {
            return
          }
          holdSeats.push({
            layerIndex: layerIndex,
            layerConfig: layer.layerConfig,
            shapeIndex: null,
            shape: null,
            layer: layer
          })
        }
      })
      return holdSeats
    },

    totalSeatCount() {
      return this.$store.getters.get_total_seat_count
    },
    holdSeatCount() {
      return this.$store.getters.get_hold_seat_count
    },
    holdSeatCardCount() {
      return this.$store.getters.get_hold_seat_card_count
    },
    reserveSeatCount() {
      return this.$store.getters.get_reserve_seat_count
    },
    reserveSeatCardCount() {
      return this.$store.getters.get_reserve_seat_card_count
    },
    ticketCategories() {
      return this.$store.getters.get_assign_ticket_details.length > 0
        ? this.$store.getters.get_assign_ticket_details
        : this.ticketCategories
    },
    contactsList() {
      return this.$store.state.invitation.contacts
    },
    eventOccurence() {
      return this.$store.getters.get_event_details.event_occurrence
    },
  },

  watch: {
    // watch layersarray change
    ticketCategories: {
      handler: function (val, oldVal) {
        this.ticketCategories = val
        if (this.ticketCategories[0].quantity != 0)
          this.ticketCategories[0].quantity = this.totalSeatCount
      },
      deep: false
    }
  },
  methods: {
    getHumanDate: function (date) {
      return moment(date).format('ddd, MMM DD, YYYY h:mm A');
    },
    filterChange(event) {
      let searchParam = {
        response: this.$store.state.invitation.original_contacts,
        search: event.filter.value
      }
      this.$store.dispatch("filter_contacts_action", searchParam)
    },
    continueButtonHandler() {
      if (!this.seatPlanData?.name) {
        this.$store.dispatch('notification', {
          status: true,
          type: 'warning',
          message: 'Please enter seat plan name'
        })
      } else {
        this.layersArray.forEach((layer) => {
          layer.shapes.forEach((shape) => {
            shape.isSelected = false
            if (["waitingArea"].includes(layer?.layerConfig?.tableData?.type)) {
              layer.layerConfig.tableData.isSelected = false
            }
          })
        })
        this.$emit('finalContinueHandler', true)
      }
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
    handleAttendeeSelection(e) {
      this.selectedAttendee = e.value

      // if(this.eventOccurence.length > 0) {
      //   let dataOccurence = this.appnedOccurenceDate();
      //   this.selectedAttendee.occurence = JSON.parse(JSON.stringify(dataOccurence));
      // }

      this.addAttendeeToselectedSeats(this.selectedAttendee)
    },
    appnedOccurenceDate() {
      let eventOccurence = [];
      let originalEventOccurence = this.eventOccurence;
      originalEventOccurence.forEach((element, index) => {
        let occurenceElement = {
          status: true,
          date: element.start_on.local
        };
        eventOccurence.push(occurenceElement);
      });

      return eventOccurence;
    },
    addSelectedSeatToTheHoldList() {
      let dataOccurence = this.appnedOccurenceDate();
      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          if (shape.isSelected && !shape?.isParent && shape?.type == 'Circle') {
            shape.isSelected = false
            shape.isHold = true
            // shape.hold_occurence = JSON.parse(JSON.stringify(dataOccurence))
          } else {
            if (
              shape?.isParent &&
              layer?.layerConfig?.tableData?.isSelected &&
              layer?.layerConfig?.tableData?.type == 'waitingArea'
            ) {
              layer.layerConfig.tableData.isSelected = false
              layer.layerConfig.tableData.isHold = true
              // layer.layerConfig.tableData.hold_occurence = JSON.parse(JSON.stringify(dataOccurence)) // hold occurence by sakib 
            }
          }
        })
      })
    },
    removeSeatFromTheHoldList(seatParentIndex, seatIndex, layer) {
      if (layer?.layerConfig?.tableData?.type == 'waitingArea') {
        this.layersArray[seatParentIndex].layerConfig.tableData.isHold = false
      } else {
        this.layersArray[seatParentIndex].shapes[seatIndex].isHold = false
      }
    },
    removeAttendeeAssignee(seatParentIndex, seatIndex, layer) {
      if (layer?.layerConfig?.tableData?.type == 'waitingArea') {
        this.layersArray[seatParentIndex].layerConfig.tableData.table_meta = {
          ...this.layersArray[seatParentIndex].layerConfig.tableData.table_meta,
          attendee_details: null
        }
      } else {
        this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta = {
          ...this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta,
          attendee_details: null
        }
      }
    },
    addAttendeeToselectedSeats(attendeeDetails) {
      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          if (shape.isSelected && !shape?.isParent && shape?.type == 'Circle') {
            shape.isSelected = false
            shape.seat_meta = {
              ...shape?.seat_meta,
              attendee_details: JSON.parse(JSON.stringify(attendeeDetails))
            }
          } else {
            if (
              shape?.isParent &&
              layer?.layerConfig?.tableData?.isSelected &&
              layer?.layerConfig?.tableData?.type == 'waitingArea'
            ) {
              this.$store.dispatch('notification', {
                status: true,
                type: 'warning',
                message: 'Area Seats cannot be reserved to attendees'
              })
            }
          }
        })
      })
    },
    toogleReserveSeating() {
      this.seatPlanData.isReserveSeatingOn = !this.seatPlanData.isReserveSeatingOn
    },
    toogleHoldSeating() {
      this.seatPlanData.isHoldSeatingOn = !this.seatPlanData.isHoldSeatingOn
    },
    onOpenContactsList() {
      this.reservedSeatsListComponentVisibility = true
      const timeId = setTimeout(() => {
        this.reservedSeatsListVisibility = true
        clearTimeout(timeId)
      }, 50)
    },
    onCloseReservedSeatsList() {
      this.reservedSeatsListVisibility = false
      const timeId = setTimeout(() => {
        this.reservedSeatsListComponentVisibility = false
        clearTimeout(timeId)
      }, 200)
    },
    onOpenSeatHoldList() {
      this.seatHoldListComponentVisibility = true
      const timeId = setTimeout(() => {
        this.seatHoldListVisibility = true
        clearTimeout(timeId)
      }, 50)
    },
    onCloseSeatHoldList() {
      this.seatHoldListVisibility = false
      const timeId = setTimeout(() => {
        this.seatHoldListComponentVisibility = false
        clearTimeout(timeId)
      }, 200)
    },
    rectStrokeColorGenerator(shape, layer) {
      if (shape?.isParent && !['seatingArea'].includes(layer?.layerConfig?.tableData?.type)) {
        if (['waitingArea'].includes(layer?.layerConfig?.tableData?.type) && !layer?.layerConfig?.tableData?.isSelected) {
          if (layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
            if (layer?.layerConfig?.tableData?.isHold && this.seatPlanData.isHoldSeatingOn) {
              return this.holdSeatColor
            } else {
              return layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
            }
          } else {
            return '#BEC9C8'
          }
        } else if (
          ['waitingArea'].includes(layer?.layerConfig?.tableData?.type) &&
          layer?.layerConfig?.tableData?.isSelected
        ) {
          if (layer?.layerConfig?.tableData?.isSelected) {
            return this.selectedColor
          } else if (layer?.layerConfig?.tableData?.isHold && this.seatPlanData.isHoldSeatingOn) {
            return this.holdSeatColor
          } else {
            return layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
          }
        } else {
          return '#BEC9C8'
        }
      } else {
        return shape?.stroke
      }
    },
    seatColorGenerator(shape) {
      if (shape?.isSeat) {
        if (shape?.isTicketAssigned) {
          if (shape?.isSold) {
            return this.unAvailableColor
          } else if (shape.isSelected) {
            return this.selectedColor
          } else if (shape?.isHold && this.seatPlanData.isHoldSeatingOn) {
            return this.holdSeatColor
          } else
            return shape?.isSelected ? this.selectedColor : shape?.seat_meta?.assigned_ticket?.color
        } else {
          return shape?.isSelected ? this.selectedColor : '#BEC9C8'
        }
      } else {
        return shape?.fill
      }
    },
    seatClickHandler(seatDeatils, seatIndex, seatParentIndex) {
      if (seatDeatils?.isParent) {
        this.seatGroupSelectHandler(seatParentIndex)
      } else {
        if (this.layersArray[seatParentIndex].shapes[seatIndex].seat_meta?.assigned_ticket?.uuid && !this.layersArray[seatParentIndex].shapes[seatIndex]?.isSold) {
          this.layersArray[seatParentIndex].shapes[seatIndex].isSelected = true
        } else {
          this.layersArray[seatParentIndex].shapes[seatIndex].isSelected = false
        }
      }
    },
    resetSelection() {
      this.layersArray.forEach((layer) => {
        layer.shapes.forEach((shape) => {
          shape.isSelected = false
          if (["waitingArea"].includes(layer?.layerConfig?.tableData?.type)) {
            layer.layerConfig.tableData.isSelected = false
          }
        })
      })
      this.selectedAttendee = {
        uuid: 0,
        name: '',
        email: 'Not Selected'
      }
    },
    seatGroupSelectHandler(seatGroupIndex) {
      if (["waitingArea"].includes(this.layersArray[seatGroupIndex]?.layerConfig?.tableData?.type)) {
        if (this.layersArray[seatGroupIndex].layerConfig.tableData.table_meta?.assigned_ticket?.uuid) {
          const soldCount = this.layersArray[seatGroupIndex]?.layerConfig?.tableData?.soldCount
          if (soldCount > 0) {
            return
          }
          this.layersArray[seatGroupIndex].layerConfig.tableData.isSelected = true
        }
      } else {
        this.layersArray[seatGroupIndex].shapes.forEach((seat) => {
          if (seat?.seat_meta?.assigned_ticket?.uuid && !seat?.isSold) {
            seat.isSelected = true
          }
        })
      }
    },
    handleStageMouseDown(e) {
      if (e.target === e.target.getStage()) {
        this.resetSelection()
        return
      }
    },
    handleResize() {
      if (this.$refs.mainContainer) {
        const width = this.$refs.mainContainer.clientWidth
        const height = this.$refs.mainContainer.clientHeight
        this.seatPlanData.configKonva = {
          ...this.seatPlanData.configKonva,
          width,
          height,
        }
      }
    },
    calculateCharsCount(str) {
      return str?.toString().length
    },
    zoomIn() {
      this.seatPlanData.configKonva.scaleX += 0.05
      this.seatPlanData.configKonva.scaleY += 0.05
    },
    zoomOut() {
      this.seatPlanData.configKonva.scaleX -= 0.05
      this.seatPlanData.configKonva.scaleY -= 0.05
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
