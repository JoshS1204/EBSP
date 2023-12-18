<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Square Width</span>
                </div>
                <div class="flex">
                    <Slider :buttons="true" :step="1" :min="20" :max="1000" :class="'w-100 slider-wrapper'"
                        :value="selectedShape.shapes[0].width" @change="updateSquareObjectHandlerWidth"></Slider>
                </div>
            </div>
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Square Height</span>
                </div>
                <div class="flex">
                    <Slider :buttons="true" :step="1" :min="20" :max="300" :class="'w-100 slider-wrapper'"
                        :value="selectedShape.shapes[0].height" @change="updateSquareObjectHandlerHeight"></Slider>
                </div>
            </div>
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Square color</span>
                </div>
                <ColorPicker v-model="selectedShape.shapes[0].fill" :view="'palette'"></ColorPicker>
            </div>
        </div>
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { Slider, ColorPicker } from "@progress/kendo-vue-inputs";
import { debounce } from '@/helpers/utilityFunctions'


export default {
    name: 'squareObjectController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        Slider,
        ColorPicker,
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
    methods: {
        updateSquareObjectHandler(e) {
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.height = e.value;
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.width = e.value;
            this.layersArray[this.selectedShapeIndex].shapes[0].height = e.value;
            this.layersArray[this.selectedShapeIndex].shapes[0].width = e.value;
            this.$emit('resetTransformerHandler');
        },
        updateSquareObjectHandlerWidth(e) {
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.width = e.value;
            this.layersArray[this.selectedShapeIndex].shapes[0].width = e.value;
            this.$emit('resetTransformerHandler');
        },
        updateSquareObjectHandlerHeight(e) {
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.height = e.value;
            this.layersArray[this.selectedShapeIndex].shapes[0].height = e.value;
            this.$emit('resetTransformerHandler');
        }
    }
};

</script>