<template>
    <div class="grow flex flex-col canvas-wrap">
        <div ref="mainContainer" class="grow canvas-content scroll-y">
            <v-stage :config="seatPlanData?.configKonva" ref="stage" :draggable="true" @mousedown="handleStageMouseDown">
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
                                    stroke: shape?.isSeat || shape?.isParent ? this.unAvailableColor : shape?.stroke
                                }" v-if="shape?.type == 'Circle'">
                            </v-circle>
                            <v-rect @touchstart="seatClickHandler(shape, shapeIndex, layerIndex)"
                                @click="seatClickHandler(shape, shapeIndex, layerIndex)" v-if="shape?.type == 'Rect'"
                                :config="{
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
                <kbutton :disabled="zoomLevel <= 19" @click="zoomOut" :size="'large'" :fill-mode="'flat'"
                    :rounded="'small'">
                    <iconMinus></iconMinus>
                </kbutton>
            </div>
        </div>
        <footer class="flex-none flex canvas-footer bg-white">
            <kbutton @click="backButtonHandler" :theme-color="'secondary'" :size="'large'" :class="''" :rounded="'small'">
                Back</kbutton>
            <div class="grow"></div>
            <div class="flex items-center">
                <!-- <kbutton :size="'large'" :class="'px-3 me-3'" :rounded="'small'">Preview</kbutton> -->
                <!--                <span :class="'px-3 me-3'" v-if="auto_save_button_text">{{ auto_save_button_text }}</span>-->
                <div :class="auto_save_button_text === 'Saved' ? 'me-3 auto-saving-wrap saved' : 'me-3 auto-saving-wrap'"
                    v-if="auto_save_button_text">{{ auto_save_button_text }}</div>
                <kbutton :disabled="!isAnySeatTicketAssigned" @click="continueButtonHandler" :theme-color="'primary'"
                    :size="'large'" :class="'px-3'" :rounded="'small'">Continue
                </kbutton>
            </div>
        </footer>
    </div>
    <div class="flex-none sidebar relative">
        <div class="flex flex-col h-100">
            <div class="grow sidebar-content-scroll scroll-y set-assign-ticket-sidebar">
                <h5 class="text-base leading-5 font-medium mt-0 mb-6">Assign Tickets</h5>

                <div v-if="ticketCategories?.length > 0" class="dropdown-input-row mb-4">
                    <label class="form-label text-sm">Assign Tickets</label>
                    <dropdownlist :class="'k-dropdown w-100 bg-transparent rounded-r-none'" :size="'large'"
                        :data-items="ticketCategoriesForDropdown" :text-field="'name'" :data-item-key="'uuid'"
                        :value="selectedTicketCategory" :default-item="{
                            name: 'Select Ticket',
                            uuid: -1
                        }" @change="assignTicketHandler">
                    </dropdownlist>
                </div>
                <div class="mb-4">
                    <label class="form-label text-sm mb-3">Not Assigned : <b>{{ this.notAssignedSeatCount }}</b></label>
                    <div v-for="(item, index) in ticketCategories" :key="item?.id">
                        <div v-if="item?.is_parent" class="variation-parent">
                            <h6 class="text-sm">{{ item.name }}</h6>
                            <div v-for="(child, child_index) in item?.child" :key="child?.uuid">
                                <div v-if="child?.color" class="flex items-start total-seat-color-box p-2 mb-2">
                                    <div class="grow flex flex-col pe-2">
                                        <span class="font-13 leading-5 font-normal title">{{ child?.name }}</span>
                                        <span class="text-xs value">Assigned : {{ child?.selectedCount }}</span>
                                        <span class="text-xs value">Tickets : {{ child?.quantity == -1 ? 'Unlimited' :
                                            child?.quantity
                                        }}</span>
                                    </div>
                                    <ColorPicker class="flex-none color-picker-h-28 default-icon" :value="child?.color"
                                        @change="handleCategoryColorChange($event, index, child_index, item?.is_parent)"
                                        :size="'small'" :fill-mode="'outline'" />
                                </div>
                            </div>
                        </div>

                        <div v-if="!item?.is_parent && item?.color" class="flex items-start total-seat-color-box p-2 mb-2">
                            <div class="grow flex flex-col pe-2">
                                <span class="font-13 leading-5 font-normal title">{{ item?.name }}</span>
                                <span class="text-xs value">Assigned : {{ item?.selectedCount }}</span>
                                <span class="text-xs value">Tickets : {{ item?.quantity == -1 ? 'Unlimited' : item?.quantity
                                }}</span>
                            </div>
                            <ColorPicker class="flex-none color-picker-h-28 default-icon" :value="item?.color"
                                @change="handleCategoryColorChange($event, index, 0, false)" :size="'small'"
                                :fill-mode="'outline'" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div v-if="isInfoMessageVisible"
            class="data-change-notice set-assign-ticket-change-notice bg-warning p-3 flex items-start justify-between">
            <div class="grow pe-3 leading-5 text-base text-white">
                Updating seats will reset all configurations. After the
                update please review other settings.</div>
        </div>
    </div>
</template>

<script>
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons'
import { Input, ColorPicker } from '@progress/kendo-vue-inputs'
import { DropDownList } from '@progress/kendo-vue-dropdowns'
import { throttle } from '@/helpers/utilityFunctions'
import iconPlus from '@/assets/images/icon/svg-icons/iconPlus.vue'
import iconMinus from '@/assets/images/icon/svg-icons/iconMinus.vue'

export default {
    inject: ['layersArray', 'seatPlanData', 'zoomLevel', 'zoomIn', 'zoomOut'],
    emits: ["continueButtonHandler", "backButtonHandler", "modifyLayersArray", "finalContinueHandler"],
    components: {
        kbutton: Button,
        buttongroup: ButtonGroup,
        KInput: Input,
        dropdownlist: DropDownList,
        ColorPicker,
        iconPlus,
        iconMinus
    },
    data() {
        return {
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
                name: 'Select Ticket',
                uuid: -1
            },
            unAvailableColor: '#BEC9C8',
            selectedColor: '#0999',
        }
    },
    mounted() {
        this.observer = new ResizeObserver(throttle(this.handleResize, 0))
        this.observer.observe(this.$refs.mainContainer)
        window.addEventListener('resize', throttle(this.handleResize, 0))
        if (this.ticketCategories?.length > 0) {
            this.ticketCategories[0].quantity = this.totalSeatCount
        }
    },
    onUnmounted() {
        this.observer.disconnect()
        window.removeEventListener('resize', this.handleResize)
    },
    watch: {
        ticketCategories: {
            handler: function (val, oldVal) {
                this.ticketCategories = val
                if (this.ticketCategories[0].quantity != 0)
                    this.ticketCategories[0].quantity = this.totalSeatCount
            },
            deep: false
        }
    },
    computed: {
        isInfoMessageVisible() {
            return this.$store.getters.get_hold_seat_count > 0 || this.$store.getters.get_reserve_seat_count > 0 ? true : false
        },
        auto_save_button_text() {
            return this.$store.getters.get_auto_save_button_text
        },
        notAssignedColor() {
            return this.ticketCategories[0]?.color
        },
        totalSeatCount() {
            return this.$store.getters.get_total_seat_count;
        },
        notAssignedSeatCount() {
            return this.$store.getters.get_not_assigned_seat_count;
        },
        ticketCategories() {
            return this.$store.getters.get_assign_ticket_details;
        },
        ticketCategoriesForDropdown() {
            let original_categories = this.$store.getters.get_assign_ticket_details;
            let modified_categories = [];
            original_categories.forEach((element, index) => {
                if (element?.is_parent) {
                    modified_categories.push(...element?.child)
                }
                else {
                    modified_categories.push(element)
                }
            });

            return modified_categories;
        },
        isAnySeatTicketAssigned() {
            return this.$store.getters.get_any_seat_ticket_assigned;
        },
    },
    methods: {
        continueButtonHandler() {
            this.$emit('continueButtonHandler')
        },
        backButtonHandler() {
            this.$emit('backButtonHandler')
        },
        rectStrokeColorGenerator(shape, layer) {
            if (shape?.isParent && !['seatingArea'].includes(layer?.layerConfig?.tableData?.type)) {
                if (['waitingArea'].includes(layer?.layerConfig?.tableData?.type) && !layer?.layerConfig?.tableData?.isSelected) {
                    if (layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                        return layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.color
                    } else {
                        return this.unAvailableColor
                    }
                } else if (['waitingArea'].includes(layer?.layerConfig?.tableData?.type) && layer?.layerConfig?.tableData?.isSelected) {
                    return this.selectedColor
                } else {
                    return this.unAvailableColor
                }
            } else {
                return shape?.stroke
            }
        },
        seatColorGenerator(shape) {
            if (shape?.isSeat) {
                if (shape?.isSold) {
                    return this.unAvailableColor
                }
                else if (shape?.isTicketAssigned) {
                    return shape?.isSelected ? this.selectedColor : shape?.seat_meta?.assigned_ticket?.color
                } else {
                    return shape?.isSelected ? this.selectedColor : this.unAvailableColor
                }
            } else {
                return shape?.fill
            }
        },

        updateSelectedSeatColor(ticket) {
            this.layersArray.forEach((layer) => {
                layer.shapes.forEach((shape) => {
                    if (shape.isSelected && !shape?.isParent && shape?.type == 'Circle') {
                        shape.isSelected = false
                        shape.isTicketAssigned = ticket?.uuid ? true : false
                        if (!shape?.seat_meta?.assigned_ticket?.uuid) {
                            this.ticketCategories.forEach((item) => {
                                if (item?.uuid == 0) {
                                    item.quantity -= 1
                                }
                            })
                        }
                        shape.seat_meta = {
                            assigned_ticket: ticket
                        }
                    } else {
                        if (shape?.isParent && layer?.layerConfig?.tableData?.isSelected && layer?.layerConfig?.tableData?.type == 'waitingArea') {

                            const capacity = Number(layer?.layerConfig?.tableData?.capacity)
                            layer.layerConfig.tableData.isSelected = false

                            if (!layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid) {
                                this.ticketCategories.forEach((item) => {
                                    if (item?.uuid == 0) {
                                        item.quantity -= capacity
                                    }
                                })
                            }

                            layer.layerConfig.tableData.table_meta = {
                                ...layer?.layerConfig?.tableData?.table_meta,
                                assigned_ticket: {
                                    ...ticket,
                                    quantity: capacity,
                                }
                            }
                        }
                    }
                })
            })
        },
        handleCategoryColorChange(event, index, child, variation) {

            if (variation) {
                this.ticketCategories[index].child[child].color = event.value
                const ticket = this.ticketCategories[index].child[child]
                this.updateSeatsUponColorChange(ticket)
            }
            else {
                this.ticketCategories[index].color = event.value
                const ticket = this.ticketCategories[index]
                this.updateSeatsUponColorChange(ticket)
            }
        },
        updateSeatsUponColorChange(ticket) {
            this.layersArray.forEach((layer) => {
                layer.shapes.forEach((shape) => {
                    if (shape?.isTicketAssigned && shape?.seat_meta?.assigned_ticket?.uuid == ticket?.uuid) {
                        shape.seat_meta.assigned_ticket.color = ticket?.color
                    } else {
                        if (shape.isParent && ['waitingArea'].includes(layer?.layerConfig?.tableData?.type) && layer?.layerConfig?.tableData?.table_meta?.assigned_ticket?.uuid == ticket?.uuid) {
                            layer.layerConfig.tableData.table_meta.assigned_ticket.color = ticket?.color
                        }
                    }
                })
            })
        },
        assignTicketHandler(e) {
            this.selectedTicketCategory = e.value
            if (e.value.uuid == 0) {
                this.updateSelectedSeatColor({
                    uuid: null
                })
                return
            } else if (e.value.uuid == -1) {
                return
            } else {
                this.updateSelectedSeatColor(this.selectedTicketCategory)
            }
        },
        seatClickHandler(seatDeatils, seatIndex, seatParentIndex) {
            if (this.selectedTicketCategory.uuid != -1) {
                this.selectedTicketCategory = {
                    name: 'Select Ticket',
                    uuid: -1
                }
            }

            if (seatDeatils?.isParent) {
                this.seatGroupSelectHandler(seatParentIndex)
            } else {
                if (!this.layersArray[seatParentIndex].shapes[seatIndex]?.isSold) {
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
            this.selectedTicketCategory = {
                name: 'Select Ticket',
                uuid: -1
            }
        },
        seatGroupSelectHandler(seatGroupIndex) {
            if (["waitingArea"].includes(this.layersArray[seatGroupIndex]?.layerConfig?.tableData?.type)) {
                const soldCount = this.layersArray[seatGroupIndex]?.layerConfig?.tableData?.soldCount
                if (soldCount > 0) {
                    return
                }
                this.layersArray[seatGroupIndex].layerConfig.tableData.isSelected = true
            } else {
                this.layersArray[seatGroupIndex].shapes.forEach((seat) => {
                    if (seat?.isSeat && !seat?.isSold) {
                        seat.isSelected = true
                    }
                })
            }
        },
        handleStageMouseDown(e) {
            // clicked on stage - clear selection
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
        handleDragEnd(objType) {
            this[objType]()
        },
        handleDragOver(event) {
            const stage = this.$refs.stage.getStage()
            this.activePageX = event.pageX / stage.scaleX()
            this.activePageY = event.pageY / stage.scaleY()
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
