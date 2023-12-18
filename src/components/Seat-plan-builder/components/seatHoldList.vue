<template>
  <AppDrawer :title="'Seat Hold List'" :visible="visible" @close="closeDrawer">
    <template v-slot:content>
      <div class="flex flex-col h-100">

        <div class="grow h-100 drawer-content-scroll-small scroll-y sb--149">
          <div class="d-flex justify-between item-center pb-3">
            <span class="text-sm font-medium">Remove all from hold</span>
            <kbutton @click="removeAllFromHoldList" :fill-mode="'flat'" :class="'p-0'">
              <iconDeleteBlack />
            </kbutton>
          </div>

          <template v-for="(layer, layerIndex) in layersArray" :key="layerIndex">
            <template v-for="(shape, shapeIndex) in layer.shapes" :key="shapeIndex">
              <div v-if="shape?.isHold || layer?.layerConfig?.tableData?.isHold" class="attendee-seats-item-wrap">
                <div class="attendee-seats-item d-flex justify-between align-items-start active">
                  <div class="d-flex align-items-center text-ellipsis-wrap">
                    <div class="color-ring ring-a-seats mr-2" :style="{
                      backgroundColor: layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color ? layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color : shape?.seat_meta?.assigned_ticket?.color
                    }">
                    </div>
                    <div class="lg-content-ellp">
                      <div v-if="shape?.isHold" class="text-xs font-normal color-secondary20 leading-3">{{
                        seatNameGenerator(layer?.layerConfig?.tableData, shape) }}</div>
                      <div v-if="layer?.layerConfig?.tableData?.isHold"
                        class="text-xs font-normal color-secondary20 leading-3">{{
                          layer?.layerConfig?.tableData?.name }}</div>
                    </div>
                  </div>
                  <!-- <kbutton v-if="shape?.hold_occurence?.length > 0 || layer?.layerConfig?.tableData?.hold_occurence?.length > 0" :fill-mode="'clear'" :class="'py-1 px-1'">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.625 9C4.8125 9 5 8.84375 5 8.625V7.375C5 7.1875 4.8125 7 4.625 7H3.375C3.15625 7 3 7.1875 3 7.375V8.625C3 8.84375 3.15625 9 3.375 9H4.625ZM8 8.625V7.375C8 7.1875 7.8125 7 7.625 7H6.375C6.15625 7 6 7.1875 6 7.375V8.625C6 8.84375 6.15625 9 6.375 9H7.625C7.8125 9 8 8.84375 8 8.625ZM11 8.625V7.375C11 7.1875 10.8125 7 10.625 7H9.375C9.15625 7 9 7.1875 9 7.375V8.625C9 8.84375 9.15625 9 9.375 9H10.625C10.8125 9 11 8.84375 11 8.625ZM8 11.625V10.375C8 10.1875 7.8125 10 7.625 10H6.375C6.15625 10 6 10.1875 6 10.375V11.625C6 11.8438 6.15625 12 6.375 12H7.625C7.8125 12 8 11.8438 8 11.625ZM5 11.625V10.375C5 10.1875 4.8125 10 4.625 10H3.375C3.15625 10 3 10.1875 3 10.375V11.625C3 11.8438 3.15625 12 3.375 12H4.625C4.8125 12 5 11.8438 5 11.625ZM11 11.625V10.375C11 10.1875 10.8125 10 10.625 10H9.375C9.15625 10 9 10.1875 9 10.375V11.625C9 11.8438 9.15625 12 9.375 12H10.625C10.8125 12 11 11.8438 11 11.625ZM14 3.5C14 2.6875 13.3125 2 12.5 2H11V0.375C11 0.1875 10.8125 0 10.625 0H9.375C9.15625 0 9 0.1875 9 0.375V2H5V0.375C5 0.1875 4.8125 0 4.625 0H3.375C3.15625 0 3 0.1875 3 0.375V2H1.5C0.65625 2 0 2.6875 0 3.5V14.5C0 15.3438 0.65625 16 1.5 16H12.5C13.3125 16 14 15.3438 14 14.5V3.5ZM12.5 14.3125C12.5 14.4375 12.4062 14.5 12.3125 14.5H1.6875C1.5625 14.5 1.5 14.4375 1.5 14.3125V5H12.5V14.3125Z" fill="#003736"></path>
                    </svg>
                  </kbutton> -->
                  <kbutton @click="removeSeatFromTheHoldList(layerIndex, shapeIndex, layer)" :fill-mode="'flat'"
                    :class="'py-1 px-1'">
                    <iconDeleteBlack />
                  </kbutton>
                </div>

                <!-- <div class="hold-occurence scroll-wrap scroll-y" v-if="shape?.isHold && shape?.hold_occurence?.length > 0">
                  <div class="dates-loop" v-for="(event_dates, event_dates_index) in shape?.hold_occurence" :key="event_dates_index">
                    <checkbox
                        v-model="event_dates.status"
                        :label="getHumanDate(event_dates.date)"
                    />
                  </div>
                </div>

                <div class="hold-occurence scroll-wrap scroll-y" v-if="layer?.layerConfig?.tableData?.isHold && layer?.layerConfig?.tableData?.hold_occurence?.length > 0">
                  <div class="dates-loop" v-for="(event_dates, event_dates_index) in layer?.layerConfig?.tableData?.hold_occurence" :key="event_dates_index">
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
import AppDrawer from '../../common/AppDrawer.vue';
import { Button } from "@progress/kendo-vue-buttons";
import { Checkbox, Input } from "@progress/kendo-vue-inputs";
import iconDeleteBlack from '@/assets/images/icon/svg-icons/iconDeleteBlack.vue'
import moment from 'moment';

export default {
  name: 'seatHoldList',
  inject: ["layersArray"],
  components: {
    AppDrawer,
    iconDeleteBlack,
    kbutton: Button,
    KInput: Input,
    checkbox: Checkbox,
  },
  data() {
    return {
    }
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  mounted() { },
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
    removeSeatFromTheHoldList(seatParentIndex, seatIndex, layer) {
      if (layer?.layerConfig?.tableData?.type == 'waitingArea') {
        this.layersArray[seatParentIndex].layerConfig.tableData.isHold = false
      } else {
        this.layersArray[seatParentIndex].shapes[seatIndex].isHold = false
      }
    },
    removeAllFromHoldList() {
      this.layersArray.forEach(layer => {
        if (layer?.layerConfig?.tableData?.type == 'waitingArea') {
          layer.layerConfig.tableData.isHold = false
        } else {
          layer.shapes.forEach(shape => {
            if (shape?.isSeat) {
              shape.isHold = false
            }
          })
        }
      });
    }
  }
}
</script>