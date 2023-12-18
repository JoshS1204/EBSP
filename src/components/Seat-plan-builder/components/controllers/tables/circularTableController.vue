<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Table Name</label>
                <KInput @input="validationHandler" v-model="tableData.name" type="text" :size="'large'" :class="''"
                    id="exampleFormControlInput1" placeholder="" />
                <inputErrorHandler :visibility="errorHandlerObject?.name?.visibility"
                    :message="errorHandlerObject?.name?.message"></inputErrorHandler>
            </div>
            <div class="mb-4">
                <label for="exampleFormControlInput2" class="form-label text-sm">Number of seats</label>
                <KInput @input="validationHandler" min='1' max='100' v-model="tableData.seatCount" type="number"
                    :size="'large'" :class="''" id="exampleFormControlInput2" placeholder="" />
                <inputErrorHandler :visibility="errorHandlerObject?.numberOfSeats?.visibility"
                    :message="errorHandlerObject?.numberOfSeats?.message"></inputErrorHandler>
            </div>

            <div class="flex mb-4">
                <div class="flex flex-col pe-1-5">
                    <label for="exampleFormControlInput3" class="form-label text-sm">Table prefix</label>
                    <KInput @input="validationHandler" v-model="tableData.tablePrefix" type="text" :size="'large'"
                        :class="''" id="exampleFormControlInput2" placeholder="" />
                    <inputErrorHandler :visibility="errorHandlerObject?.tablePrefix?.visibility"
                        :message="errorHandlerObject?.tablePrefix?.message"></inputErrorHandler>
                </div>
                <div class="flex flex-col ps-1-5">
                    <label for="exampleFormControlInput3" class="form-label text-sm">Seat prefix</label>
                    <KInput @input="validationHandler" v-model="tableData.seatPrefix" type="text" :size="'large'"
                        :class="''" id="exampleFormControlInput2" placeholder="" />
                    <inputErrorHandler :visibility="errorHandlerObject?.seatPrefix?.visibility"
                        :message="errorHandlerObject?.seatPrefix?.message"></inputErrorHandler>
                </div>
            </div>

            <div class="mb-4">
                <div class="flex dropdown-input-row">
                    <div class="grow flex flex-col">
                        <label for="exampleFormControlInput4" class="form-label text-sm">Seat labels</label>
                        <dropdownlist :class="'k-dropdown w-100 bg-transparent rounded-r-none'" :size="'large'"
                            :data-items="seatLabelsType" :text-field="'text'" :data-item-key="'id'"
                            @change="handleSeatLabelChange" :value="selectedSeatLabel">
                        </dropdownlist>
                    </div>
                    <div class="flex-none flex flex-col">
                        <label for="exampleFormControlInput4" class="form-label text-sm">Start with</label>
                        <KInput v-if="selectedSeatLabel?.id == 1" @input="validationHandler"
                            v-model="tableData.seatLabelStartWith" type="number" min="0" max="100" :size="'large'"
                            :style="{ width: '90px' }" :class="'rounded-s-none'" id="exampleFormControlInput4"
                            placeholder="">
                        </KInput>
                        <KInput v-if="selectedSeatLabel?.id == 2" @input="validationHandler"
                            v-model="tableData.seatLabelStartWith" type="text" :size="'large'" :style="{ width: '90px' }"
                            :class="'rounded-s-none'" id="exampleFormControlInput4" placeholder=""></KInput>
                    </div>
                </div>
                <inputErrorHandler :visibility="errorHandlerObject?.seatLabelStartWith?.visibility"
                    :message="errorHandlerObject?.seatLabelStartWith?.message"></inputErrorHandler>
            </div>

            <div class="mb-4">
                <label class="block form-label text-sm">Label Direction</label>
                <buttongroup class="label-direction-group">
                    <kbutton @click="labelDirectionHandler('left')" :togglable="true"
                        :theme-color="tableData?.labelDirection == 'left' ? 'primary' : ''" :size="'large'"
                        :class="'font-medium border-primary'">
                        Left
                    </kbutton>
                    <kbutton @click="labelDirectionHandler('right')"
                        :theme-color="tableData?.labelDirection == 'right' ? 'primary' : ''" :togglable="true"
                        :size="'large'" :class="'font-medium border-primary'">
                        Right
                    </kbutton>
                </buttongroup>
            </div>
        </div>
        <div class="data-change-notice bg-warning p-3 flex items-start justify-between" v-if="seatMetaAvailabilityCheck"
            mode="in-out">
            <div class="grow pe-3 leading-5 text-base text-white">Updating seats will reset all configurations. After the
                update please review other settings.</div>
        </div>
        <controllerFooter :isDisabled="applyButtonVisibility" @applyChanges="applyChangesHandler" />
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { createCircularTableHandler } from '@/helpers/tableCalculations';
import { DropDownList } from "@progress/kendo-vue-dropdowns";
import { ButtonGroup, Button } from '@progress/kendo-vue-buttons';
// import { Checkbox, Slider, Input } from "@progress/kendo-vue-inputs";
import { Input } from "@progress/kendo-vue-inputs";
import inputErrorHandler from '@/components/common/inputErrorHandler.vue';

export default {
    name: 'circularTableController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        dropdownlist: DropDownList,
        buttongroup: ButtonGroup,
        kbutton: Button,
        KInput: Input,
        inputErrorHandler,
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
            errorHandlerObject: {
                name: {
                    visibility: false,
                    message: "Table name is required",
                },
                numberOfSeats: {
                    visibility: false,
                    message: "Number of seats is required",
                },
                tablePrefix: {
                    visibility: false,
                    message: "Table prefix is required",
                },
                seatPrefix: {
                    visibility: false,
                    message: "Seat prefix is required",
                },
                seatLabelStartWith: {
                    visibility: false,
                    message: "Seat label start with is required",
                },
            },
            tableData: {},
            selectedSeatLabel: { id: 1, text: "Numbers", value: "numbers" },
            seatLabelsType: [
                { id: 1, text: "Numbers", value: "numbers" },
                { id: 2, text: "Alphabets", value: "alphabets" },
            ],
        }
    },
    mounted() {
        this.tableData = JSON.parse(JSON.stringify(this.selectedShape?.layerConfig?.tableData));

        if (this.tableData.seatLabelType === 'numbers') {
            this.selectedSeatLabel = { id: 1, text: "Numbers", value: "numbers" };
        } else {
            this.selectedSeatLabel = { id: 2, text: "Alphabets", value: "alphabets" };
        }
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
        validationHandler() {

            if (this.tableData.name == '') {
                this.errorHandlerObject.name.visibility = true;
                this.errorHandlerObject.name.message = "Required";
            } else if (this.tableData.name?.length > 15) {
                this.errorHandlerObject.name.visibility = true;
                this.errorHandlerObject.name.message = "Max 15 character limit reached";
            } else {
                this.errorHandlerObject.name.visibility = false;
            }

            if (!this.tableData?.tablePrefix) {
                this.errorHandlerObject.tablePrefix.visibility = true;
                this.errorHandlerObject.tablePrefix.message = "Table prefix is required";
            } else if (this.tableData?.tablePrefix) {
                if (this.tableData?.tablePrefix?.length > 15) {
                    this.errorHandlerObject.tablePrefix.visibility = true;
                    this.errorHandlerObject.tablePrefix.message = "Max 15 character limit reached";
                } else {
                    this.errorHandlerObject.tablePrefix.visibility = false;
                }
            }

            if (!this.tableData?.seatPrefix) {
                this.errorHandlerObject.seatPrefix.visibility = true;
                this.errorHandlerObject.seatPrefix.message = "Seat prefix is required";
            } else if (this.tableData?.seatPrefix) {
                if (this.tableData?.seatPrefix?.length > 15) {
                    this.errorHandlerObject.seatPrefix.visibility = true;
                    this.errorHandlerObject.seatPrefix.message = "Max 15 character limit reached";
                } else {
                    this.errorHandlerObject.seatPrefix.visibility = false;
                }
            }

            if (this.tableData.seatCount == '') {
                this.errorHandlerObject.numberOfSeats.visibility = true;
                this.errorHandlerObject.numberOfSeats.message = "Required";
            } else if (this.tableData.seatCount < 1 || this.tableData.seatCount > 100) {
                this.errorHandlerObject.numberOfSeats.visibility = true;
                this.errorHandlerObject.numberOfSeats.message = "Number of seats should be between 1 to 100";
            } else {
                this.errorHandlerObject.numberOfSeats.visibility = false;
            }


            if (this.selectedSeatLabel?.id == 1) {
                if (this.tableData.seatLabelStartWith == '') {
                    this.errorHandlerObject.seatLabelStartWith.visibility = true;
                    this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with is required";
                }
                else if (this.tableData.seatLabelStartWith < 0 || this.tableData.seatLabelStartWith >= 100) {
                    this.errorHandlerObject.seatLabelStartWith.visibility = true;
                    this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with should be between 0 and 100";
                } else {
                    this.errorHandlerObject.seatLabelStartWith.visibility = false;
                }
            } else if (this.selectedSeatLabel?.id == 2) {
                if (this.tableData.seatLabelStartWith == '') {
                    this.errorHandlerObject.seatLabelStartWith.visibility = true;
                    this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with is required";
                } else if (this.tableData.seatLabelStartWith.length > 1) {
                    this.errorHandlerObject.seatLabelStartWith.visibility = true;
                    this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with should be single character";
                } else if (!/^[a-zA-Z]+$/.test(this.tableData.seatLabelStartWith)) {
                    this.errorHandlerObject.seatLabelStartWith.visibility = true;
                    this.errorHandlerObject.seatLabelStartWith.message = "Seat label start with should be alphabets only";
                } else {
                    this.errorHandlerObject.seatLabelStartWith.visibility = false;
                }
            } else {
                this.errorHandlerObject.seatLabelStartWith.visibility = false;
            }


        },
        labelDirectionHandler(direction) {
            this.tableData.labelDirection = direction;
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
                const newShape = createCircularTableHandler(modifiedConfig);
                this.$emit('resetTransformerHandler');
                this.layersArray[this.selectedShapeIndex] = newShape;
                this.$emit('close')
            }
        },
        handleSeatLabelChange(e) {
            this.selectedSeatLabel = e.value
            this.tableData.seatLabelType = e.value.value;
            if (e.value.value === 'numbers') {
                this.tableData.seatLabelStartWith = 1;
            } else {
                this.tableData.seatLabelStartWith = 'A';
            }
            this.validationHandler();
        },
    }
}

</script>
