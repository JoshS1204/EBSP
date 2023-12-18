<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Height</span>
                </div>
                <div class="flex">
                    <Slider @change="updateTransformer" :buttons="true" :step="1" :min="5" :max="10"
                        :class="'w-100 slider-wrapper'" v-model="layersArray[selectedShapeIndex].shapes[0].strokeWidth">
                    </Slider>
                </div>
            </div>
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Width</span>
                </div>
                <div class="flex">
                    <Slider @change="updateTransformer" :buttons="true" :step="1" :min="50" :max="1000"
                        :class="'w-100 slider-wrapper'" v-model="layersArray[selectedShapeIndex].shapes[0].points[2]">
                    </Slider>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { Slider } from "@progress/kendo-vue-inputs";

export default {
    name: 'lineObjectController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        Slider
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
        updateTransformer(e) {
            this.$emit('resetTransformerHandler');
        }
    }
};

</script>