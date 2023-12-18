<template>
    <div class="flex flex-col h-100">
        <div class="grow h-100 drawer-content-scroll scroll-y">

            <div v-if="!selectedShape.shapes">
                <span class="font-normal text-sm form-label mb-0">Selectable Icons</span>
                <div class="icon-list flex flex-wrap items-start">
                    <div :draggable="true" v-for="icon in icons" :key="icon?.name"
                    @dragend="handleDragEnd(icon?.svg, $event, icon.name)" @click="onIconClick(icon?.svg, icon.name)" @touchmove="handleTouchMove()" @touchend="handleTouchEnd(icon?.svg, $event, icon.name)"
                        class="icon flex items-center">
                        <Button :size="'small'" :fill-mode="'flat'" :rounded="'small'">
                            <component :is="icon.icon"></component>
                        </Button>
                    </div>
                </div>
            </div>

            <div v-if="selectedShape?.shapes">
                <div class="mb-4">
                    <div class="mb-3">
                        <span class="font-normal text-sm form-label mb-0">Icon Size</span>
                    </div>
                    <div class="flex">
                        <Slider :buttons="true" :step="1" :min="20" :max="100" :value="selectedShape.shapes[0].width"
                            :class="'w-100 slider-wrapper'" @change="updateIconObjectHandler"></Slider>
                    </div>
                </div>
                <!-- <div class="mb-4">
                    <div class="mb-3">
                        <span class="font-normal text-sm form-label mb-0">Icon color</span>
                    </div>
                    <ColorPicker :view="'palette'" :default-value="'rgba(237, 126, 50, 1)'"></ColorPicker>
                </div> -->
            </div>

        </div>
    </div>
</template>

<script>

import controllerFooter from '@/components/common/controllerFooter.vue';
import { Slider, ColorPicker } from "@progress/kendo-vue-inputs";
import { Button } from '@progress/kendo-vue-buttons';

import iconGlassMartini from '../../../../../assets/images/icon/svg-icons/iconGlassMartini.vue';
import iconSignOut from '../../../../../assets/images/icon/svg-icons/iconSignOut.vue';
import iconKnife from '../../../../../assets/images/icon/svg-icons/iconKnife.vue';
import iconSmoking from '../../../../../assets/images/icon/svg-icons/iconSmoking.vue';
import iconWheelchair from '../../../../../assets/images/icon/svg-icons/iconWheelchair.vue';
import iconMusic from '../../../../../assets/images/icon/svg-icons/iconMusic.vue';
import iconPlusSquare from '../../../../../assets/images/icon/svg-icons/iconPlusSquare.vue';
import iconInfoCircle from '../../../../../assets/images/icon/svg-icons/iconInfoCircle.vue';
import iconMicrophone from '../../../../../assets/images/icon/svg-icons/iconMicrophone.vue';

import iconSeat from '@/assets/images/icon/svg-icons/iconSeat.vue';
import iconStanding from '@/assets/images/icon/svg-icons/iconStanding.vue';

import iconGlassMartiniSvg from '../../../../../assets/images/icon/svg/icon-glass-martini.svg'
import iconSignOutSvg from '../../../../../assets/images/icon/svg/icon-sign-out.svg'
import iconKnifeSvg from '../../../../../assets/images/icon/svg/icon-knife.svg'
import iconSmokingSvg from '../../../../../assets/images/icon/svg/icon-smoking.svg'
import iconWheelchairSvg from '../../../../../assets/images/icon/svg/icon-wheelchair.svg'
import iconMusicSvg from '../../../../../assets/images/icon/svg/icon-music.svg'
import iconPlusSquareSvg from '../../../../../assets/images/icon/svg/icon-plus-square.svg'
import iconInfoCircleSvg from '../../../../../assets/images/icon/svg/icon-info-circle.svg'
import iconMicrophoneSvg from '../../../../../assets/images/icon/svg/icon-microphone.svg'

import iconSeatSvg from '@/assets/images/icon/svg/icon-seat.svg';
import iconStandingSvg from '@/assets/images/icon/svg/icon-standing.svg';

import { addIconObjectHandler } from '@/helpers/objectCalculations'

export default {
    name: 'iconObjectController',
    inject: ["layersArray", 'seatPlanData'],
    components: {
        controllerFooter,
        Slider,
        ColorPicker,
        Button,
        iconGlassMartini,
        iconSignOut,
        iconKnife,
        iconSmoking,
        iconWheelchair,
        iconMusic,
        iconPlusSquare,
        iconInfoCircle,
        iconMicrophone,
        iconSeat,
        iconStanding
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
        refStage: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            objectData: {},
            activePageX: 400,
            activePageY: 200,
            iconSize: 40,
            icons: [
                {
                    name: "iconGlassMartini",
                    icon: iconGlassMartini,
                    svg: iconGlassMartiniSvg
                },
                {
                    name: "iconSignOut",
                    icon: iconSignOut,
                    svg: iconSignOutSvg
                },
                {
                    name: "iconKnife",
                    icon: iconKnife,
                    svg: iconKnifeSvg
                },
                {
                    name: "iconSmoking",
                    icon: iconSmoking,
                    svg: iconSmokingSvg
                },
                {
                    name: "iconWheelchair",
                    icon: iconWheelchair,
                    svg: iconWheelchairSvg
                },
                {
                    name: "iconMusic",
                    icon: iconMusic,
                    svg: iconMusicSvg
                },
                {
                    name: "iconPlusSquare",
                    icon: iconPlusSquare,
                    svg: iconPlusSquareSvg
                },
                {
                    name: "iconInfoCircle",
                    icon: iconInfoCircle,
                    svg: iconInfoCircleSvg
                },
                {
                    name: "iconMicrophone",
                    icon: iconMicrophone,
                    svg: iconMicrophoneSvg
                },
                {
                    name: "iconSeat",
                    icon: iconSeat,
                    svg: iconSeatSvg
                },
                {
                    name: "iconStanding",
                    icon: iconStanding,
                    svg: iconStandingSvg
                },
            ],
            isTouching: false, // variable declared as touch is active by nabeeb
        }
    },
    mounted() {
        this.objectData = JSON.parse(JSON.stringify(this.selectedShape?.layerConfig?.objectData));
    },
    methods: {
        handleTouchMove() { //=== Handle Touch Move by Nabeeb ===//
            this.isTouching = true
        },
        handleTouchEnd(currIcon, event, name) { //=== Handle Touch End by Nabeeb ===//
            if (this.isTouching) {
                const stage = this.refStage.getStage()
                setTimeout(() => {
                    this.activePageX = (stage.getPointerPosition().x - stage.x()) / stage.scaleX()
                    this.activePageY = (stage.getPointerPosition().y - stage.y()) / stage.scaleY()
                    this.iconHandler(currIcon, name)
                }, 200)
                this.isTouching = false
            }
        },
        iconHandler(currentIcon, name) {
            const icon = new Image();
            icon.onload = () => {
                const layerConfig = {
                    objectData: {
                        name: 'Icon',
                        type: 'Icon',
                        componentName: 'iconObjectController',
                        createFunction: 'addIconObjectHandler',
                        imageName: name,
                        image: icon,
                        width: this.iconSize,
                        height: this.iconSize,
                        centerX: this.activePageX,
                        centerY: this.activePageY,
                        draggable: true,
                        strokeWidth: 5
                    },
                    x: 0,
                    y: 0,
                    name: `IconObject${new Date().getMilliseconds()}`
                }
                const shapeData = addIconObjectHandler(layerConfig)
                this.layersArray.push(shapeData)
            }
            icon.src = currentIcon
        },
        handleDragEnd(currIcon, event, name) {
            setTimeout(() => {
                this.activePageX = this.seatPlanData.activeData.activePageX
                this.activePageY = this.seatPlanData.activeData.activePageY
                this.iconHandler(currIcon, name)
            }, 200);

        },
        onIconClick(currIcon, name) {
            // const stage = this.refStage.getStage()
            // this.activePageX = (stage.attrs.width / 2) / stage.scaleX()
            // this.activePageY = (stage.attrs.height / 2) / stage.scaleY()
            // this.iconHandler(currIcon, name)
        },
        updateIconObjectHandler(event) {
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.height = event.value;
            this.layersArray[this.selectedShapeIndex].layerConfig.objectData.width = event.value;

            this.layersArray[this.selectedShapeIndex].shapes[0].height = event.value;
            this.layersArray[this.selectedShapeIndex].shapes[0].width = event.value;
            this.$emit('resetTransformerHandler');
        },
    }
};

</script>