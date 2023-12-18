<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Seating area name</label>
                <KInput @input="validationHandler" v-model="tableData.name" type="text" :size="'large'"
                    id="exampleFormControlInput1" placeholder="" />
                <inputErrorHandler :visibility="errorHandlerObject?.name?.visibility"
                    :message="errorHandlerObject?.name?.message"></inputErrorHandler>
            </div>

            <div class="flex mb-4">
                <div class="flex-1 flex flex-col pe-1-5">
                    <label for="exampleFormControlInput2" class="form-label text-sm">Number of rows</label>
                    <KInput @input="validationHandler" v-model="tableData.numberOfRows" type="number" :size="'large'"
                        min="1" max="20" id="exampleFormControlInput2" placeholder="" />
                    <inputErrorHandler :visibility="errorHandlerObject?.numberOfRows?.visibility"
                        :message="errorHandlerObject?.numberOfRows?.message" />
                </div>
                <div class="flex-1 flex flex-col ps-1-5">
                    <label for="exampleFormControlInput2" class="form-label text-sm">Seats per row</label>
                    <KInput @input="validationHandler" v-model="tableData.seatsPerRow" type="number" :size="'large'" min="1"
                        max="50" id="exampleFormControlInput2" placeholder="" />
                    <inputErrorHandler :visibility="errorHandlerObject?.seatsPerRow?.visibility"
                        :message="errorHandlerObject?.seatsPerRow?.message" />
                </div>
            </div>

            <!-- <div class="mb-4">
                <label class="form-label text-sm">Alignment</label>
                <buttongroup class="flex">
                    <kbutton :icon="'align-left'" :title="'Align Left'" :togglable="true" :size="'large'"
                        :fill-mode="'outline'" :class="'flex-1 font-medium'" />
                    <kbutton :icon="'align-center'" :title="'Align Center'" :togglable="true" :size="'large'"
                        :fill-mode="'outline'" :class="'flex-1 font-medium'" />
                    <kbutton :icon="'align-right'" :title="'Align Right'" :togglable="true" :size="'large'"
                        :fill-mode="'outline'" :class="'flex-1 font-medium'" />
                </buttongroup>
            </div> -->

            <div class="dropdown-input-row mb-4">
                <label for="exampleFormControlInput4" class="form-label text-sm">Row label</label>
                <dropdownlist :class="'k-dropdown w-100 bg-transparent rounded-r-none'" :size="'large'"
                    @change="handleRowLabelChange" :value="tableData.selectedRowLabel" :data-items="rowLebels"
                    placeholder="Selected Value">
                </dropdownlist>
            </div>

            <div class="mb-4">
                <div class="flex">
                    <div class="flex flex-col pe-1-5">
                        <label for="exampleFormControlInput2" class="form-label text-sm">Rows starts with</label>
                        <KInput @input="validationHandler" v-model="tableData.rowLabelStartWith" type="text" :size="'large'"
                            placeholder="" />
                    </div>
                    <div class="flex ps-1-5">
                        <div class="mb-0">
                            <label class="block form-label text-sm">Row level order</label>
                            <buttongroup class="label-order-group">
                                <kbutton @click="handleRowLabelTypeChange('down')" :togglable="true" :size="'large'"
                                    :class="'w-72 font-normal'"
                                    :theme-color="tableData?.rowLabelType == 'down' ? 'primary' : ''">
                                    Down
                                </kbutton>
                                <kbutton @click="handleRowLabelTypeChange('up')"
                                    :theme-color="tableData?.rowLabelType == 'up' ? 'primary' : ''" :togglable="true"
                                    :size="'large'" :class="'w-72 font-normal'">
                                    Up
                                </kbutton>
                            </buttongroup>
                        </div>
                    </div>
                </div>
                <inputErrorHandler :visibility="errorHandlerObject?.rowLabelStartWith?.visibility"
                    :message="errorHandlerObject?.rowLabelStartWith?.message" />
            </div>

            <div class="mb-4">
                <div class="flex">
                    <div class="flex flex-col pe-1-5">
                        <label for="exampleFormControlInput2" class="form-label text-sm">Seats starts with</label>
                        <KInput @input="validationHandler" min="0" max="100" v-model="tableData.seatLabelStartWith"
                            type="number" :size="'large'" placeholder="" />
                    </div>
                    <div class="flex flex-col ps-1-5">
                        <label class="block form-label text-sm">Seat level order</label>
                        <buttongroup class="label-order-group">
                            <kbutton @click="handleSeatLabelTypeChange('left')"
                                :theme-color="tableData?.seatLabelType == 'left' ? 'primary' : ''" :size="'large'"
                                :class="'w-72 font-normal'">
                                Left
                            </kbutton>
                            <kbutton @click="handleSeatLabelTypeChange('right')"
                                :theme-color="tableData?.seatLabelType == 'right' ? 'primary' : ''" :togglable="true"
                                :size="'large'" :class="'w-72 font-normal'">
                                Right
                            </kbutton>
                        </buttongroup>
                    </div>
                </div>
                <inputErrorHandler :visibility="errorHandlerObject?.seatLabelStartWith?.visibility"
                    :message="errorHandlerObject?.seatLabelStartWith?.message" />
            </div>
            <!-- <div class="flex justify-between items-center">
                <h5 class="text-13 leading-5 mb-0">Configure individual rows</h5>
                <kbutton @click="onOpenRowConfigModal" :theme-color="'primary'" :size="'large'" :class="'font-medium'"
                    :fill-mode="'flat'">Manage
                </kbutton>
            </div> -->
        </div>
        <div class="data-change-notice bg-warning p-3 flex items-start justify-between" v-if="seatMetaAvailabilityCheck">
            <div class="grow pe-3 leading-5 text-base text-white">Updating seats will reset all configurations. After the
                update please review other settings.</div>
        </div>
        <controllerFooter :isDisabled="applyButtonVisibility" @applyChanges="applyChangesHandler" />
        <configIndividualRows :selectedShapeIndex="selectedShapeIndex" :selectedShape="selectedShape"
            v-if="configureIndividualRowsComponentVisibility" :visible="configureIndividualRowsModalVisibility"
            @close="onCloseRowConfigModal" />
    </div>
</template>
<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { createSeatingAreaTableHandler } from '@/helpers/tableCalculations';
import { Input } from "@progress/kendo-vue-inputs";
import { DropDownList } from "@progress/kendo-vue-dropdowns";
import { ButtonGroup, Button } from '@progress/kendo-vue-buttons';
import inputErrorHandler from '@/components/common/inputErrorHandler.vue';
import configIndividualRows from '../configTable/configIndividualRows.vue';


export default {
    name: 'seatingAreaTableController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        KInput: Input,
        dropdownlist: DropDownList,
        buttongroup: ButtonGroup,
        kbutton: Button,
        inputErrorHandler,
        configIndividualRows,
    },
    props: {
        selectedShapeIndex: {
            type: Number,
            required: true,
        },
        selectedShape: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            configureIndividualRowsComponentVisibility: false,
            configureIndividualRowsModalVisibility: false,
            errorHandlerObject: {
                name: {
                    visibility: false,
                    message: "",
                },
                numberOfRows: {
                    visibility: false,
                    message: "",
                },
                seatsPerRow: {
                    visibility: false,
                    message: "",
                },
                rowLabelStartWith: {
                    visibility: false,
                    message: "",
                },
                seatLabelStartWith: {
                    visibility: false,
                    message: "",
                },
            },
            rowLebels: ["Show All", "Left Side", "Right Side", "No Label"],
            selectedRowLabel: "Show All",
            tableData: {},
        }
    },
    mounted() {
        this.tableData = JSON.parse(JSON.stringify(this.selectedShape?.layerConfig?.tableData));
    },
    computed: {
        applyButtonVisibility() {
            let visibility = false
            for (const key in this.errorHandlerObject) {
                if (this.errorHandlerObject.hasOwnProperty(key)) {
                    const element = this.errorHandlerObject[key];
                    if (element.visibility) {
                        visibility = element.visibility;
                    }
                }
            }
            return visibility
        },
        seatMetaAvailabilityCheck() {
            let seatData = this.layersArray[this.selectedShapeIndex].shapes;
            for (let i in seatData) {
                if (seatData[i]?.seat_meta?.assigned_ticket?.uuid) {
                    return true;
                }
            }
            return false;
        }
    },
    methods: {
        onCloseRowConfigModal() {
            console.log('called');
            this.configureIndividualRowsModalVisibility = false
            const timeId = setTimeout(() => {
                this.configureIndividualRowsComponentVisibility = false
                clearTimeout(timeId)
            }, 200)
        },
        onOpenRowConfigModal() {
            this.configureIndividualRowsComponentVisibility = true
            const timeId = setTimeout(() => {
                this.configureIndividualRowsModalVisibility = true
                clearTimeout(timeId)
            }, 50)
        },
        validationHandler() {
            if (this.tableData.name == '') {
                this.errorHandlerObject.name.visibility = true;
                this.errorHandlerObject.name.message = "Name is required";
            } else if (this.tableData.name?.length > 15) {
                this.errorHandlerObject.name.visibility = true;
                this.errorHandlerObject.name.message = "Max 15 character limit reached";
            } else {
                this.errorHandlerObject.name.visibility = false;
            }


            if (this.tableData.numberOfRows == '') {
                this.errorHandlerObject.numberOfRows.visibility = true;
                this.errorHandlerObject.numberOfRows.message = "Number of rows is required";
            } else if (this.tableData.numberOfRows < 1 || this.tableData.numberOfRows > 20) {
                this.errorHandlerObject.numberOfRows.visibility = true;
                this.errorHandlerObject.numberOfRows.message = "Number of rows should be between 1 to 20";
            } else {
                this.errorHandlerObject.numberOfRows.visibility = false;
            }


            if (this.tableData.seatsPerRow == '') {
                this.errorHandlerObject.seatsPerRow.visibility = true;
                this.errorHandlerObject.seatsPerRow.message = "Seats per row is required";
            } else if (this.tableData.seatsPerRow < 1 || this.tableData.seatsPerRow > 50) {
                this.errorHandlerObject.seatsPerRow.visibility = true;
                this.errorHandlerObject.seatsPerRow.message = "Seats per row should be between 1 to 50";
            } else {
                this.errorHandlerObject.seatsPerRow.visibility = false;
            }

            if (this.tableData.seatLabelStartWith == '') {
                this.errorHandlerObject.seatLabelStartWith.visibility = true;
                this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with is required";
            } else if (this.tableData.seatLabelStartWith < 0 || this.tableData.seatLabelStartWith > 100) {
                this.errorHandlerObject.seatLabelStartWith.visibility = true;
                this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with should be between 0 to 100";
            } else {
                this.errorHandlerObject.seatLabelStartWith.visibility = false;
            }

            if (this.tableData.rowLabelStartWith == '') {
                this.errorHandlerObject.rowLabelStartWith.visibility = true;
                this.errorHandlerObject.rowLabelStartWith.message = "Row label start with is required";
            } else if (this.tableData?.rowLabelStartWith && !/^[a-zA-Z]+$/.test(this.tableData?.rowLabelStartWith)) {
                this.errorHandlerObject.rowLabelStartWith.visibility = true;
                this.errorHandlerObject.rowLabelStartWith.message = "Row label start with should be alphabets only";
            } else if (this.tableData?.rowLabelStartWith?.length > 1) {
                this.errorHandlerObject.rowLabelStartWith.visibility = true;
                this.errorHandlerObject.rowLabelStartWith.message = "Row label start with should be single alphabet only";

            } else {
                this.errorHandlerObject.rowLabelStartWith.visibility = false;
            }

        },
        handleSeatLabelTypeChange(type) {
            this.tableData.seatLabelType = type;
        },
        handleRowLabelTypeChange(type) {
            this.tableData.rowLabelType = type;
        },
        handleRowLabelChange(e) {
            this.tableData.selectedRowLabel = e.value;
        },
        applyChangesHandler() {

            let anySeatSold = false;

            this.layersArray[this.selectedShapeIndex].shapes.forEach((shape) => {
                if (shape?.isSeat && shape?.isSold) {
                    anySeatSold = true;
                    return
                }
            })

            if (anySeatSold) {
                this.$store.dispatch('notification', {
                    status: true,
                    type: 'warning',
                    message: 'Contains sold seats. can not apply changes.'
                })
                return;
            } else {
                const modifiedConfig = {
                    ...this.layersArray[this.selectedShapeIndex].layerConfig,
                    tableData: this.tableData
                }
                const newShapeData = createSeatingAreaTableHandler(modifiedConfig);
                this.$emit('resetTransformerHandler');
                this.layersArray[this.selectedShapeIndex] = newShapeData;
                this.$emit('close')
            }

        },
    }
};

</script>