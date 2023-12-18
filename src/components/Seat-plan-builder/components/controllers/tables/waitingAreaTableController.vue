<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">
            <!-- <h6 class="font-13 font-semibold mt-6">Area</h6> -->
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Area name</label>
                <KInput @input="validationHandler" v-model="this.tableData.name" type="text" :size="'large'"
                    placeholder="" />
                <inputErrorHandler :visibility="errorHandlerObject?.name?.visibility"
                    :message="errorHandlerObject?.name?.message"></inputErrorHandler>
            </div>
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Width</label>
                <Slider :buttons="true" :step="1" :min="10" :max="1000" :class="'w-100 slider-wrapper'"
                    @change="resetTransformer" :value="tableData.width" v-model="tableData.width"></Slider>
            </div>
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Height</label>
                <Slider :buttons="true" :step="1" :min="10" :max="300" :class="'w-100 slider-wrapper'"
                    @change="resetTransformer" :value="tableData.height" v-model="tableData.height"></Slider>
            </div>

            <label for="exampleFormControlInput1" class="form-label text-sm mb-3">Type</label>
            <div class="row mb-4">
                <div class="col-lg-6">
                    <div @change="handleAreaType('seating')"
                        class="flex items-center absolute relative custom-radio-wrapper">
                        <iconSeat class="absolute" @click="handleAreaType('seating')" />
                        <radiobutton :name="'area_type'" :value="'seating'" :checked="this.tableData.areaType === 'seating'"
                            :label="'Seating'" :class="'custom-radio'" />
                    </div>
                </div>
                <div class="col-lg-6">
                    <div @change="handleAreaType('standing')"
                        class="flex items-center absolute relative custom-radio-wrapper">
                        <iconStanding @click="handleAreaType('standing')" class="absolute" />
                        <radiobutton :name="'area_type'" :value="'standing'"
                            :checked="this.tableData.areaType === 'standing'" :label="'Standing'" :class="'custom-radio'" />
                    </div>
                </div>
            </div>
            <div class="mb-4">
                <label for="exampleFormControlInput1" class="form-label text-sm">Capacity</label>
                <KInput @input="validationHandler" v-model="this.tableData.capacity" type="number" :min="1" :max="1000"
                    :size="'large'" placeholder="" />
                <inputErrorHandler :visibility="errorHandlerObject?.capacity?.visibility"
                    :message="errorHandlerObject?.capacity?.message"></inputErrorHandler>
            </div>
        </div>
        <div v-if="seatMetaAvailabilityCheck" class="data-change-notice bg-warning p-3 flex items-start justify-between">
            <div class="grow pe-3 leading-5 text-base text-white">Updating seats will reset all configurations. After the
                update please review other settings.</div>
        </div>
        <controllerFooter :isDisabled="applyButtonVisibility" @applyChanges="applyChangesHandler" />
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { createWaitingAreaTableHandler } from '@/helpers/tableCalculations';
import { Slider, RadioButton, Input } from "@progress/kendo-vue-inputs";
import iconSeat from '../../../../../assets/images/icon/svg-icons/iconSeat.vue';
import iconStanding from '../../../../../assets/images/icon/svg-icons/iconStanding.vue';
import inputErrorHandler from '@/components/common/inputErrorHandler.vue';



export default {
    name: 'waitingAreaTableController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        Slider,
        radiobutton: RadioButton,
        KInput: Input,
        iconSeat,
        iconStanding,
        inputErrorHandler
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
                    message: "",
                },
                capacity: {
                    visibility: false,
                    message: "",
                },
            },
            tableData: {},
        }
    },
    mounted() {
        this.tableData = JSON.parse(JSON.stringify(this.selectedShape?.layerConfig?.tableData));
        this.tableData = {
            ...this.tableData,
            width: Number(this.tableData.width),
            height: Number(this.tableData.height),
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
            const tableData = this.layersArray[this.selectedShapeIndex]?.layerConfig?.tableData;
            if (tableData.soldCount > 0) {
                return tableData.soldCount > 0 ? true : false;
            } else if (Object.keys(tableData?.table_meta).length > 0) {
                return true;
            }
        }
    },
    methods: {
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

            if (this.tableData.capacity == '') {
                this.errorHandlerObject.capacity.visibility = true;
                this.errorHandlerObject.capacity.message = "Capacity is required";
            } else if (this.tableData.capacity < 1 || this.tableData.capacity > 1000) {
                this.errorHandlerObject.capacity.visibility = true;
                this.errorHandlerObject.capacity.message = "Capacity should be between 1 and 1000";
            } else {
                this.errorHandlerObject.capacity.visibility = false;
            }
        },
        applyChangesHandler() {

            let anySeatSold = false;

            if (this.layersArray[this.selectedShapeIndex]?.layerConfig?.tableData?.soldCount > 0) {
                anySeatSold = true;
            }

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
                const newShapeData = createWaitingAreaTableHandler(modifiedConfig);
                this.$emit('resetTransformerHandler');
                this.layersArray[this.selectedShapeIndex] = newShapeData;
                this.$emit('close')
            }


        },
        handleAreaType(value) {
            this.layersArray[this.selectedShapeIndex].layerConfig.tableData.areaType = value;
            this.tableData.areaType = value;
        },
        resetTransformer() {
            this.$emit('resetTransformerHandler');
        }
    }
};

</script>