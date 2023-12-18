<template>
  <AppDrawer :title="'Reserved List'" :visible="visible" @close="closeDrawer">
    <template v-slot:content>
      <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll-small scroll-y sb--149">
          <template v-for="(layer, layerIndex) in layersArray" :key="layerIndex">
            <template v-for="(shape, shapeIndex) in layer.shapes" :key="shapeIndex">
              <div v-if="shape?.seat_meta?.attendee_details?.uuid || layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid" class="attendee-seats-item-wrap">
                <div class="attendee-seats-item d-flex justify-between align-items-start active">
                  <div class="d-flex align-items-start text-ellipsis-wrap">
                    <div class="color-ring ring-a-seats mr-2" :style="{
                      backgroundColor: layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color ? layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color : shape?.seat_meta?.assigned_ticket?.color
                    }"></div>
                    <div class="lg-content-ellp">
                      <div class="item-name text-xs font-normal color-secondary20 leading-3 text-ellipsis overflow-hidden"> {{
                        shape?.seat_meta?.attendee_details?.email ||
                        layer?.layerConfig?.tableData?.table_meta?.attendee_details?.email }}
                      </div>
                      <span v-if="shape?.seat_meta?.attendee_details?.uuid"
                        class="text-xs font-normal color-secondary20 leading-3">{{
                          seatNameGenerator(layer?.layerConfig?.tableData, shape) }}</span>
                      <span v-if="layer?.layerConfig?.tableData?.table_meta?.attendee_details?.uuid"
                        class="text-xs font-normal color-secondary20 leading-3">
                        {{ layer?.layerConfig?.tableData.name }}
                      </span>
                    </div>
                  </div>

                  <!-- <kbutton v-if="shape?.seat_meta?.attendee_details?.occurence?.length > 0" :fill-mode="'clear'" :class="'pb-1 pt-0 px-1'">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.625 9C4.8125 9 5 8.84375 5 8.625V7.375C5 7.1875 4.8125 7 4.625 7H3.375C3.15625 7 3 7.1875 3 7.375V8.625C3 8.84375 3.15625 9 3.375 9H4.625ZM8 8.625V7.375C8 7.1875 7.8125 7 7.625 7H6.375C6.15625 7 6 7.1875 6 7.375V8.625C6 8.84375 6.15625 9 6.375 9H7.625C7.8125 9 8 8.84375 8 8.625ZM11 8.625V7.375C11 7.1875 10.8125 7 10.625 7H9.375C9.15625 7 9 7.1875 9 7.375V8.625C9 8.84375 9.15625 9 9.375 9H10.625C10.8125 9 11 8.84375 11 8.625ZM8 11.625V10.375C8 10.1875 7.8125 10 7.625 10H6.375C6.15625 10 6 10.1875 6 10.375V11.625C6 11.8438 6.15625 12 6.375 12H7.625C7.8125 12 8 11.8438 8 11.625ZM5 11.625V10.375C5 10.1875 4.8125 10 4.625 10H3.375C3.15625 10 3 10.1875 3 10.375V11.625C3 11.8438 3.15625 12 3.375 12H4.625C4.8125 12 5 11.8438 5 11.625ZM11 11.625V10.375C11 10.1875 10.8125 10 10.625 10H9.375C9.15625 10 9 10.1875 9 10.375V11.625C9 11.8438 9.15625 12 9.375 12H10.625C10.8125 12 11 11.8438 11 11.625ZM14 3.5C14 2.6875 13.3125 2 12.5 2H11V0.375C11 0.1875 10.8125 0 10.625 0H9.375C9.15625 0 9 0.1875 9 0.375V2H5V0.375C5 0.1875 4.8125 0 4.625 0H3.375C3.15625 0 3 0.1875 3 0.375V2H1.5C0.65625 2 0 2.6875 0 3.5V14.5C0 15.3438 0.65625 16 1.5 16H12.5C13.3125 16 14 15.3438 14 14.5V3.5ZM12.5 14.3125C12.5 14.4375 12.4062 14.5 12.3125 14.5H1.6875C1.5625 14.5 1.5 14.4375 1.5 14.3125V5H12.5V14.3125Z" fill="#003736"></path>
                    </svg>
                  </kbutton> -->
                  <kbutton @click="removeAttendeeAssignee(layerIndex, shapeIndex, layer)" :fill-mode="'clear'"
                    :class="'pb-1 pt-0 px-1'">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M13.5 2.5H10.9062L9.84375 0.75C9.59375 0.3125 9.09375 0 8.5625 0H5.40625C4.875 0 4.375 0.3125 4.125 0.75L3.0625 2.5H0.5C0.21875 2.5 0 2.75 0 3V3.5C0 3.78125 0.21875 4 0.5 4H1L1.65625 14.5938C1.6875 15.4062 2.34375 16 3.15625 16H10.8125C11.625 16 12.2812 15.4062 12.3125 14.5938L13 4H13.5C13.75 4 14 3.78125 14 3.5V3C14 2.75 13.75 2.5 13.5 2.5ZM5.40625 1.5H8.5625L9.15625 2.5H4.8125L5.40625 1.5ZM10.8125 14.5H3.15625L2.5 4H11.4688L10.8125 14.5Z"
                        fill="#003736" />
                    </svg>
                  </kbutton>
                </div>

                <!-- <div class="attendee-occurence scroll-wrap scroll-y" v-if="shape?.seat_meta?.attendee_details?.occurence?.length > 0">
                  <div class="dates-loop" v-for="(event_dates, event_dates_index) in shape?.seat_meta?.attendee_details?.occurence " :key="event_dates_index">
                    <checkbox
                        v-model="event_dates.status"
                        :label="getHumanDate(event_dates.date)"
                    />
                  </div>
                </div> -->
              </div>
            </template>
          </template>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script>
import AppDrawer from '../../common/AppDrawer.vue'
import { Button } from '@progress/kendo-vue-buttons'
import { Input } from '@progress/kendo-vue-inputs'
import { Checkbox } from '@progress/kendo-vue-inputs'
import moment from 'moment';

export default {
  name: 'reservedSeatsList',
  inject: ['layersArray'],
  components: {
    AppDrawer,
    kbutton: Button,
    KInput: Input,
    checkbox: Checkbox
  },
  data() {
    return {}
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
  },
  methods: {
    getHumanDate : function (date) {
        return moment(date).format('ddd, MMM DD, YYYY h:mm A');
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
  }
}
</script>
