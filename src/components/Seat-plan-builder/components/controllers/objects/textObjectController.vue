<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">

            <div class="mb-4">
                <label for="exampleFormControlInput2" class="form-label text-sm">Caption</label>
                <input :maxlength="75" @input="handleCaptionChange" v-model="selectedShape.shapes[0].text" type="text"
                    class="form-control">
            </div>
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Text Size</span>
                </div>
                <div class="flex">
                    <Slider @change="updateTransformer" :buttons="true" :step="1" :min="10" :max="70"
                        :class="'w-100 slider-wrapper'" v-model="selectedShape.shapes[0].fontSize"></Slider>
                </div>
            </div>
            <div class="mb-4">
                <div class="mb-3">
                    <span class="font-normal text-sm form-label mb-0">Style</span>
                </div>
                <div>
                    <buttongroup>
                        <kbutton :aria-pressed="true" :icon="'bold'" :size="'large'" :fill-mode="'outline'"
                            :class="fontButtons[0].status ? 'w-72 font-normal k-selected' : 'w-72 font-normal'"
                            @click="handleFontStyle('bold')"></kbutton>
                        <kbutton :icon="'italic'" :size="'large'" :fill-mode="'outline'"
                            :class="fontButtons[1].status ? 'w-72 font-normal k-selected' : 'w-72 font-normal'"
                            @click="handleFontStyle('italic')"></kbutton>
                    </buttongroup>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { Slider, ColorPicker } from "@progress/kendo-vue-inputs";
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons';

export default {
    name: 'textObjectController',
    inject: ["layersArray"],
    components: {
        controllerFooter,
        Slider,
        ColorPicker,
        'kbutton': Button,
        'buttongroup': ButtonGroup
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
            fontButtons: [{ name: 'Bold', type: 'bold', status: false }, { name: 'Italic', type: 'italic', status: false }],
        }
    },
    mounted() {
        let fontStyleChecker = this.layersArray[this.selectedShapeIndex].shapes[0].fontStyle;

        if (fontStyleChecker.includes('bold')) {
            this.fontButtons[0].status = true;
        }

        if (fontStyleChecker.includes('italic')) {
            this.fontButtons[1].status = true;
        }
    },
    methods: {
        handleCaptionChange() {
            if (this.selectedShape.shapes[0].text.length >= 75) {
                this.$store.dispatch('notification', {
                    status: true,
                    type: 'warning',
                    message: "Maximum character size is exceeded",
                });
            }
            this.updateTransformer();
        },
        updateTransformer() {
            this.$emit('resetTransformerHandler');
        },
        handleFontStyle(type) {
            if (type === 'bold') {
                this.fontButtons[0].status = !this.fontButtons[0].status;
            }
            if (type === 'italic') {
                this.fontButtons[1].status = !this.fontButtons[1].status;
            }

            this.layersArray[this.selectedShapeIndex].shapes[0].fontStyle = this.updateFontStyle();
            this.updateTransformer()
        },
        updateFontStyle() {
            let modifier = '';
            this.fontButtons.forEach(element => {
                if (element.status === true) {
                    modifier += " " + element.type;
                }
                else {
                    if (element.type === 'bold') {
                        modifier += " " + "normal";
                    }
                }
            });
            return modifier;
        }
    }
};

</script>