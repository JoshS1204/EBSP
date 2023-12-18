<template>
  <div class="flex flex-col h-100">
    <div class="grow h-100 drawer-content-scroll scroll-y">
      <!-- <div class="mb-4">
        <label for="exampleFormControlInput3" class="form-label text-sm">Caption</label>
        <KInput type="text" :size="'large'" :class="''" id="exampleFormControlInput2" placeholder="shape 1" />
      </div> -->
      <div class="mb-4">
        <span class="form-label text-sm">Circle Size</span>
        <Slider :buttons="true" :step="1" :min="10" :max="1000" :class="'w-100 slider-wrapper'"
          :value="selectedShape.shapes[0].radius" @change="updateCircleObjectHandler"></Slider>
      </div>
      <!-- <div class="mb-4">
        <label class="block form-label text-sm">Style</label>
        <buttongroup>
          <kbutton :togglable="true" :icon="'bold'" :size="'large'" :fill-mode="'outline'" :class="'w-72 font-normal'"></kbutton>
          <kbutton :togglable="true" :icon="'italic'" :size="'large'" :fill-mode="'outline'" :class="'w-72 font-normal'"></kbutton>
        </buttongroup>
      </div> -->
      <div class="mb-4">
        <span class="block form-label text-sm">Circle color</span>
        <ColorPicker :view="'palette'" v-model="selectedShape.shapes[0].fill" :size="'large'"></ColorPicker>
      </div>
    </div>
  </div>
</template>

<script>
import controllerFooter from '@/components/common/controllerFooter.vue'
import { Slider, ColorPicker } from '@progress/kendo-vue-inputs'
import { Input } from "@progress/kendo-vue-inputs";
import { ButtonGroup, Button } from '@progress/kendo-vue-buttons';
import { debounce } from '@/helpers/utilityFunctions'

export default {
  name: 'circleObjectController',
  inject: ['layersArray'],
  components: {
    controllerFooter,
    Slider,
    KInput: Input,
    ColorPicker,
    buttongroup: ButtonGroup,
    kbutton: Button,
  },
  props: {
    selectedShapeIndex: {
      type: Number,
      required: true
    },
    selectedShape: {
      type: Object,
      required: true
    }
  },
  methods: {
    updateCircleObjectHandler(e) {
      this.layersArray[this.selectedShapeIndex].layerConfig.objectData.circleRadius = e.value
      this.layersArray[this.selectedShapeIndex].shapes[0].radius = e.value
      this.$emit('resetTransformerHandler')
    }
  }
}
</script>
