<template>
  <div class="grow flex flex-col canvas-wrap">
    <div @dragover="handleDragOver" ref="mainContainer" class="grow canvas-content scroll-y">
      <v-stage :draggable="true" :config="seatPlanData?.configKonva" ref="stage" @dragmove="updateKonvaConfig"
        @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
        <v-layer>
          <v-group :draggable="true" @dragmove="updateShapeHoverButtonPosition" @dragend="updateHistory"
            @mousedown="optionSidebarhandler(layerIndex, layer)" @touchstart="optionSidebarhandler(layerIndex, layer)" :config="layer?.layerConfig"
            v-for="(layer, layerIndex) in layersArray" :key="layerIndex">
            <template v-for="(shape, shapeIndex) in layer.shapes" :key="shapeIndex">
              <v-circle :config="{
                ...shape,
                fill: seatColorGenerator(shape)
              }" v-if="shape?.type == 'Circle'">
              </v-circle>
              <v-rect v-if="shape?.type == 'Rect'" :config="shape"></v-rect>
              <v-line v-if="shape?.type == 'Line'" :config="shape"></v-line>
              <v-text v-if="shape?.type == 'Text'" :config="shape"></v-text>
              <v-image v-if="shape?.type == 'Icon'" :config="shape"></v-image>
              <v-text v-if="shape?.type == 'Circle' && shape?.isSeat" :config="{
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

      <div class="empty-state-wrap" v-if="layersArray.length === 0">
        <iconEmptyState />
        <h6 class="text-kendo-input-text mt-3 pt-1 leading-5 text-center">
          Drag and drop elements from the right sidebar
        </h6>
      </div>

      <div v-if="isTransforming" class="choose-button-group flex justify-center py-1 px-2"
        :style="{ left: deleteButtonPosition?.x + 'px', top: deleteButtonPosition?.y + 'px' }"
        @click="handleDeleteButtonClick">
        <kbutton @click="bringToFrontHandler" :class="'bring-to-front p-0'" :size="'small'" :fill-mode="'flat'"
          :rounded="'small'" title="Bring To Front">
          <iconDoubleUp></iconDoubleUp>
        </kbutton>
        <kbutton @click="duplicateShapeHandler" :size="'small'" :fill-mode="'flat'" :class="'p-0'" :rounded="'small'"
          title="Duplicate">
          <iconDuplicate></iconDuplicate>
        </kbutton>
        <kbutton @click="deleteShapeHandler" :class="'p-0'" :size="'small'" :fill-mode="'flat'" :rounded="'small'"
          title="Delete">
          <iconDelete></iconDelete>
        </kbutton>
      </div>

      <div class="flex items-center justify-between total-seat-container bg-white">
        <span class="text-sm">Total seats: </span>
        <span class="text-sm">{{ this.totalSeatCount }}</span>
      </div>

      <div class="flex items-center zoom-container">
        <kbutton @click="undoHandler" :class="'mb-0'" :size="'large'" :fill-mode="'flat'" title="Undo" :rounded="'small'">
          <iconUndo />
        </kbutton>
        <kbutton @click="redoHandler" :class="'mb-0'" :size="'large'" :fill-mode="'flat'" title="Redo" :rounded="'small'">
          <iconRedo />
        </kbutton>
        <kbutton @click="resetCanvas" :class="'mb-0'" :size="'large'" :fill-mode="'flat'" title="Clear"
          :rounded="'small'">
          <span class="k-icon k-i-clear-css"></span>
        </kbutton>
        <kbutton :disabled="zoomLevel >= 150" @click="zoomIn" :class="'mb-0'" :size="'large'" title="Zoom In"
          :fill-mode="'flat'" :rounded="'small'">
          <iconPlus></iconPlus>
        </kbutton>
        <div class="flex-none zoom-text text-xs text-center mx-1">{{ zoomLevel }}%</div>
        <kbutton :disabled="zoomLevel <= 19" @click="zoomOut" :size="'large'" title="Zoom Out" :fill-mode="'flat'"
          :rounded="'small'">
          <iconMinus></iconMinus>
        </kbutton>
      </div>
    </div>
    <footer class="flex-none flex canvas-footer bg-white">
      <kbutton @click="handleCancel" :theme-color="'secondary'" :size="'large'" :class="''" :rounded="'small'">Cancel
      </kbutton>
      <div class="grow"></div>
      <div class="flex items-center">
        <div :class="auto_save_button_text === 'Saved'
          ? 'me-3 auto-saving-wrap saved'
          : 'me-3 auto-saving-wrap'
          " v-if="auto_save_button_text">
          {{ auto_save_button_text }}
        </div>
        <kbutton :disabled="totalSeatCount == 0" @click="continueButtonHandler" :theme-color="'primary'" :size="'large'"
          :class="'px-3'" :rounded="'small'">Continue
        </kbutton>
      </div>
    </footer>
  </div>
  <div class="flex-none sidebar relative">
    <div class="flex flex-col h-100">
      <div class="grow sidebar-content-scroll scroll-y sb-153">
        <h5 class="text-base leading-5 font-medium mt-0 mb-6">Add Elements</h5>
        <h6 class="text-base leading-5 font-normal mt-0 mb-3">Add Seats</h6>
        <div class="flex blockbuilder-content-tools mb-3">
          <template v-for="(seatType, seatTypeIndex) in seatTypes" :key="seatTypeIndex">
            <div :draggable="true" @dragend="handleDragEnd(seatType?.createFunction)" @touchmove="handleTouchMove()" @touchend="handleTouchEnd(seatType?.createFunction)"
              class="row-tool blockbuilder-content-tool">
              <div class="blockbuilder-content-tool-icon">
                <component :is="seatType.icon"></component>
              </div>
              <div class="blockbuilder-content-tool-name">
                {{ seatType.name }}
              </div>
            </div>
          </template>
        </div>

        <h6 class="text-base leading-5 font-normal mt-0 mb-3">Add Object</h6>
        <div class="flex blockbuilder-content-tools">
          <template v-for="(obj, objIndex) in seatObjects" :key="objIndex">
            <div v-if="obj?.createFunction !== 'addIcon'"> <!--Conditional block execution by Nabeeb - if it is icon, we do not want the option to drag by touch-->
              <div :draggable="obj?.createFunction !== 'addIcon' && true" @dragend="handleDragEnd(obj?.createFunction)"
                @click="objCreateHandler(obj?.createFunction)" @touchmove="handleTouchMove()" @touchend="handleTouchEnd(obj?.createFunction)" class="row-tool blockbuilder-content-tool">
                <div class="blockbuilder-content-tool-icon">
                  <component :is="obj.icon"></component>
                </div>
                <div class="blockbuilder-content-tool-name">
                  {{ obj.name }}
                </div>
              </div>
            </div>
            <div v-else>
              <div :draggable="obj?.createFunction !== 'addIcon' && true" @dragend="handleDragEnd(obj?.createFunction)"
                @click="objCreateHandler(obj?.createFunction)" class="row-tool blockbuilder-content-tool">
                <div class="blockbuilder-content-tool-icon">
                  <component :is="obj.icon"></component>
                </div>
                <div class="blockbuilder-content-tool-name">
                  {{ obj.name }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <footer class="flex justify-center sidebar-footer bg-white">
        <kbutton @click="importJsonHandler" :disabled="soldSeatCount > 0 ? true : false" :theme-color="'secondary'"
          :size="'large'" :class="'px-5 me-3'" :rounded="'small'">Import</kbutton>
        <kbutton @click="exportData" :theme-color="'secondary'" :size="'large'" :class="'px-5'" :rounded="'small'">
          Export</kbutton>
      </footer>
    </div>
  </div>
  <optionsDrawer v-if="optionsDrawerComponentVisibility" :refStage="this.$refs.stage" :selectedShape="selectedShape"
    :selectedShapeIndex="selectedShapeIndex" :visible="optionSidebarVisibility"
    :resetTransformerHandler="resetTransformer" @close="closeOptionSidebar" />
  <importJsonModalVue :show="importJsonModalVisibility" @hideModal="closeImportJsonModal" />
</template>

<script>
import config from '@/config'
import { Button, ButtonGroup } from '@progress/kendo-vue-buttons'
// import iconArea from '@components/icons/IconArea.vue';
import iconArea from '@/assets/images/icon/svg-icons/iconArea.vue'
import iconCircle from '@/assets/images/icon/svg-icons/iconCircle.vue'
import iconLine from '@/assets/images/icon/svg-icons/iconLine.vue'
import iconMic from '@/assets/images/icon/svg-icons/iconMic.vue'
import iconDoubleUp from '@/assets/images/icon/svg-icons/iconDoubleUp.vue'
import iconDuplicate from '@/assets/images/icon/svg-icons/iconDuplicate.vue'
import iconDelete from '@/assets/images/icon/svg-icons/iconDelete.vue'
import iconSquare from '@/assets/images/icon/svg-icons/iconSquare.vue'
import iconRectangle from '@/assets/images/icon/svg-icons/iconRectangle.vue'
import iconRounded from '@/assets/images/icon/svg-icons/iconRounded.vue'
import iconSeating from '@/assets/images/icon/svg-icons/iconSeating.vue'
import iconText from '@/assets/images/icon/svg-icons/iconText.vue'
import iconPlus from '@/assets/images/icon/svg-icons/iconPlus.vue'
import iconMinus from '@/assets/images/icon/svg-icons/iconMinus.vue'
import iconUndo from '@/assets/images/icon/svg-icons/iconUndo.vue'
import iconRedo from '@/assets/images/icon/svg-icons/iconRedo.vue'
import iconEmptyState from '@/assets/images/icon/svg-icons/icon-empty-state-icon.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppDrawer from '@/components/common/AppDrawer.vue'
import optionsDrawer from '../optionsDrawer.vue'
import importJsonModalVue from '../importJsonModal.vue'
import {
  createCircularTableHandler,
  createRectangleTableHandler,
  createSeatingAreaTableHandler,
  createWaitingAreaTableHandler
} from '@/helpers/tableCalculations'

import {
  addCircleObjectHandler,
  addSquareObjectHandler,
  addLineObjectHandler,
  addTextObjectHandler,
  addIconObjectHandler
} from '@/helpers/objectCalculations'
import { throttle } from '@/helpers/utilityFunctions'

export default {
  inject: [
    'layersArray',
    'seatPlanData',
    'zoomLevel',
    'zoomIn',
    'zoomOut',
    'undoHandler',
    'redoHandler'
  ],
  emits: [
    'continueButtonHandler',
    'modifyLayersArray',
    'finalContinueHandler',
    'backButtonHandler'
  ],
  components: {
    kbutton: Button,
    buttongroup: ButtonGroup,
    iconEmptyState,
    iconArea,
    iconCircle,
    iconRectangle,
    iconLine,
    iconMic,
    iconDoubleUp,
    iconDuplicate,
    iconDelete,
    iconSquare,
    iconRounded,
    iconSeating,
    iconText,
    iconPlus,
    iconMinus,
    iconUndo,
    iconRedo,
    AppModal,
    AppDrawer,
    optionsDrawer,
    importJsonModalVue
  },
  data() {
    return {
      resetter: true,
      pantool: false,
      observer: null,
      shapeHoverButtonPosition: {},
      isTransforming: false,
      charXPositionByLength: {
        1: 4,
        2: 7,
        3: 9
      },
      deleteButtonPosition: {},
      dragStarted: false,
      activePageX: 400,
      activePageY: 200,
      modalVisibility: false,
      optionSidebarVisibility: false,
      optionsDrawerComponentVisibility: false,
      transformerAnchors: [],
      // transformerAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'rotating'],

      importJsonModalVisibility: false,

      dragging: false,
      numValue: 9,
      shapeTypesArray: [
        'circularTable',
        'seatingArea',
        'waitingArea',
        'rectangleTable',
        'Circle',
        'Rect',
        'Line',
        'Text',
        'Icons',
        'Icon'
      ],
      seatTypes: [
        {
          name: 'Rounded',
          icon: 'iconRounded',
          createFunction: 'circularTableCreate'
        },
        {
          name: 'Rectangle',
          icon: 'iconRectangle',
          createFunction: 'rectangularTableCreate'
        },
        {
          name: 'Seating',
          icon: 'iconSeating',
          createFunction: 'seatingArea'
        },
        {
          name: 'Area',
          icon: 'iconArea',
          createFunction: 'waitingArea'
        }
      ],
      seatObjects: [
        {
          name: 'Circle',
          icon: 'iconCircle',
          createFunction: 'addCircle'
        },
        {
          name: 'Square',
          icon: 'iconSquare',
          createFunction: 'addSquare'
        },
        {
          name: 'Line',
          icon: 'iconLine',
          createFunction: 'addLine'
        },
        {
          name: 'Icon',
          icon: 'iconMic',
          createFunction: 'addIcon'
        },
        {
          name: 'Text',
          icon: 'iconText',
          createFunction: 'addText'
        }
      ],
      selectedShapeName: '',
      selectedShape: {},
      selectedShapeIndex: null,
      unAvailableColor: '#BEC9C8',
      selectedColor: '#0999',
      isTouching: false, // variable declared as touch is active by nabeeb
    }
  },
  watch: {
    layersArray: {
      handler: function (val, oldVal) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(() => { }, 2000)
      },
      deep: true
    }
  },
  mounted() {
    this.observer = new ResizeObserver(throttle(this.handleResize, 0))
    this.observer.observe(this.$refs.mainContainer)
    window.addEventListener('resize', throttle(this.handleResize, 0))

    //=== Event listener for touch device by Nabeeb ===//
    const stage = this.$refs.stage.getStage()
    window.addEventListener('touchmove', (e) => {
      stage.setPointersPositions(e)
    })
    //=== Event listener for touch device by Nabeeb end ===//
  },
  onUnmounted() {
    this.observer.disconnect()
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    zoomLevel() {
      if (this.seatPlanData?.configKonva?.scaleX) {
        return Math.floor(this.seatPlanData?.configKonva?.scaleX * 100)
      } else {
        return 100
      }
    },
    totalSeatCount() {
      return this.$store.getters.get_total_seat_count
    },
    soldSeatCount() {
      return this.$store.getters.get_sold_seat_count
    },
    auto_save_button_text() {
      return this.$store.getters.get_auto_save_button_text
    }
  },
  methods: {
    updateHistory(){
      console.log("drag end, new data below")
      console.log(this.layersArray)
      this.$parent.historyManager(this.layersArray);
    },
    handleTouchMove() { //=== Handle touch move by Nabeeb ===//
      this.isTouching = true
    },
    handleTouchEnd(seatType) { //=== Handle touch end by Nabeeb ===//
      if (this.isTouching) {
        const stage = this.$refs.stage.getStage()
        this.activePageX = (stage.getPointerPosition().x - stage.x()) / stage.scaleX()
        this.activePageY = (stage.getPointerPosition().y - stage.y()) / stage.scaleY()
        this.isTouching = false
        this[seatType]()
      }
    },
    seatColorGenerator(shape) {
      if (shape?.isSeat) {
        if (shape?.isSold) {
          return this.unAvailableColor
        } else {
          return shape?.fill
        }
      } else {
        return shape?.fill
      }
    },
    updateKonvaConfig(event) {
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.seatPlanData.configKonva = {
          ...this.seatPlanData.configKonva,
          x: event?.target?.attrs?.x,
          y: event?.target?.attrs?.y
        }
      }, 200)
    },
    handleCancel() {
      let url = config.redirectUri + `${sessionStorage.getItem('event-id')}`
      window.location.href = url
    },
    continueButtonHandler() {
      this.$emit('continueButtonHandler')
    },
    handleResize() {
      if (this.$refs.mainContainer) {
        const width = this.$refs.mainContainer.clientWidth
        const height = this.$refs.mainContainer.clientHeight
        this.seatPlanData.configKonva = {
          ...this.seatPlanData.configKonva,
          width,
          height
        }
      }
    },
    calculateCharsCount(str) {
      return str?.toString().length
    },
    bringToFrontHandler() {
      const prevData = this.layersArray[this.selectedShapeIndex]
      const newIndex = this.layersArray.length - 1
      this.layersArray.splice(this.selectedShapeIndex, 1)
      this.layersArray.push(prevData)
      this.selectedShapeIndex = newIndex
      const selectedShapeName = this.layersArray[this.selectedShapeIndex].layerConfig.name
      this.selectedShapeName = selectedShapeName
      setTimeout(() => {
        this.updateTransformer()
      }, 10)
    },
    deleteShapeHandler() {
      //check if any seat is sold and don't delete if sold
      let anySeatSold = false

      if (
        this.layersArray[this.selectedShapeIndex]?.layerConfig?.tableData?.type == 'waitingArea'
      ) {
        if (this.layersArray[this.selectedShapeIndex]?.layerConfig?.tableData?.soldCount > 0) {
          anySeatSold = true
        }
      } else {
        this.layersArray[this.selectedShapeIndex].shapes.forEach((shape) => {
          if (shape?.isSeat && shape?.isSold) {
            anySeatSold = true
            return
          }
        })
      }

      if (anySeatSold) {
        this.$store.dispatch('notification', {
          status: true,
          type: 'warning',
          message: 'Cannot delete a table with sold seats.'
        })
        return
      } else {
        const transformer = this.$refs.transformer.getNode()
        transformer.detach()
        this.layersArray.splice(this.selectedShapeIndex, 1)
        this.selectedShape = {}
        this.selectedShapeIndex = ''
        this.optionSidebarVisibility = false
        this.isTransforming = false
      }
    },
    duplicateShapeHandler() {
      const tableData = this.layersArray[this.selectedShapeIndex].layerConfig.tableData
        ? { ...this.layersArray[this.selectedShapeIndex].layerConfig.tableData }
        : {
          ...this.layersArray[this.selectedShapeIndex].layerConfig.objectData
        }
      let modifiedLayerConfig = {
        ...this.layersArray[this.selectedShapeIndex].layerConfig,
        x: Number(this.selectedShape?.layerConfig?.x) + 50,
        y: Number(this.selectedShape?.layerConfig?.y) + 50
      }
      let newShapeData
      let newName
      if (tableData?.createFunction === 'createCircularTableHandler') {
        ; (newName = `circularTable${new Date().getMilliseconds()}`),
          (newShapeData = createCircularTableHandler(modifiedLayerConfig, newName))
      }
      if (tableData?.createFunction === 'createRectangleTableHandler') {
        ; (newName = `rectangleTable${new Date().getMilliseconds()}`),
          (newShapeData = createRectangleTableHandler(modifiedLayerConfig, newName))
      }
      if (tableData?.createFunction === 'createSeatingAreaTableHandler') {
        newName = `seating${new Date().getMilliseconds()}`
        newShapeData = createSeatingAreaTableHandler(modifiedLayerConfig, newName)
      }
      if (tableData?.createFunction === 'createWaitingAreaTableHandler') {
        newName = `waiting${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          tableData: {
            ...modifiedLayerConfig.tableData,
            height: this.selectedShape?.shapes?.[0]?.height,
            width: this.selectedShape?.shapes?.[0]?.width
          }
        }
        newShapeData = createWaitingAreaTableHandler(modifiedLayerConfig, newName)
      }
      if (tableData?.createFunction === 'addCircleObjectHandler') {
        newName = `CircleObject${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          objectData: {
            ...modifiedLayerConfig.objectData,
            circleRadius: this.selectedShape?.shapes?.[0]?.radius,
            circleColor: this.selectedShape?.shapes?.[0]?.fill
          }
        }
        newShapeData = addCircleObjectHandler(modifiedLayerConfig, newName)
      }

      if (tableData?.createFunction === 'addSquareObjectHandler') {
        newName = `SquareObject${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          objectData: {
            ...modifiedLayerConfig.objectData,
            fill: this.selectedShape?.shapes?.[0]?.fill
          }
        }
        newShapeData = addSquareObjectHandler(modifiedLayerConfig, newName)
      }

      if (tableData?.createFunction === 'addTextObjectHandler') {
        newName = `TextObject${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          objectData: {
            ...modifiedLayerConfig.objectData,
            fill: this.selectedShape?.shapes?.[0]?.fill,
            fontSize: this.selectedShape?.shapes?.[0]?.fontSize,
            text: this.selectedShape?.shapes?.[0]?.text,
            fontStyle: this.selectedShape?.shapes?.[0]?.fontStyle
          }
        }
        newShapeData = addTextObjectHandler(modifiedLayerConfig, newName)
      }

      if (tableData?.createFunction === 'addIconObjectHandler') {
        newName = `IconObject${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          objectData: {
            ...modifiedLayerConfig.objectData
          }
        }
        newShapeData = addIconObjectHandler(modifiedLayerConfig, newName)
      }

      if (tableData?.createFunction === 'addLineObjectHandler') {
        newName = `LineObject${new Date().getMilliseconds()}`
        modifiedLayerConfig = {
          ...modifiedLayerConfig,
          objectData: {
            ...modifiedLayerConfig.objectData,
            points: this.selectedShape?.shapes?.[0]?.points,
            // stroke: this.selectedShape?.shapes?.[0]?.stroke,
            strokeWidth: this.selectedShape?.shapes?.[0]?.strokeWidth
          }
        }
        newShapeData = addLineObjectHandler(modifiedLayerConfig, newName)
      }
      this.layersArray.push(newShapeData)
    },
    handleDragEnd(objType) {
      this[objType]()
      // this.historyManager(this.layersArray)
    },
    handleDragOver(event) {
      const stage = this.$refs.stage.getStage()
      this.activePageX = (event.pageX - stage.x()) / stage.scaleX()
      this.activePageY = (event.pageY - stage.y()) / stage.scaleY()
      this.seatPlanData.activeData.activePageX = (event.pageX - stage.x()) / stage.scaleX()
      this.seatPlanData.activeData.activePageY = (event.pageY - stage.y()) / stage.scaleY()
    },
    resetCanvas() {
      if (this.soldSeatCount > 0) {
        this.$store.dispatch('notification', {
          status: true,
          type: 'warning',
          message: 'Cannot clear canvas with sold seats.'
        })
        return
      }

      this.layersArray.length = 0
      this.isTransforming = false
      const timerId = setTimeout(() => {
        this.optionSidebarVisibility = false
        clearTimeout(timerId)
      }, 20)
      const timerId1 = setTimeout(() => {
        this.optionsDrawerComponentVisibility = false
        clearTimeout(timerId1)
      }, 50)
    },
    importJsonHandler() {
      this.importJsonModalVisibility = true
    },
    closeImportJsonModal() {
      this.importJsonModalVisibility = false
    },
    optionSidebarhandler(index, shape) {
      if (
        this.shapeTypesArray.includes(shape?.layerConfig?.tableData?.type) ||
        this.shapeTypesArray.includes(shape?.layerConfig?.objectData?.type)
      ) {
        if (this.selectedShapeIndex === index && this.optionSidebarVisibility) {
          return
        }
        this.selectedShapeIndex = index
        this.selectedShape = shape
        if (this.optionSidebarVisibility == true) {
          const timerId = setTimeout(() => {
            this.optionSidebarVisibility = false
            clearTimeout(timerId)
          }, 20)
          const timerId1 = setTimeout(() => {
            this.optionsDrawerComponentVisibility = false
            clearTimeout(timerId1)
          }, 50)
        }

        const timeId = setTimeout(() => {
          this.optionsDrawerComponentVisibility = true
          clearTimeout(timeId)
        }, 80)
        const timeId1 = setTimeout(() => {
          this.optionSidebarVisibility = true
          clearTimeout(timeId1)
        }, 110)
      }
    },
    closeOptionSidebar() {
      this.optionSidebarVisibility = false
      const timeId = setTimeout(() => {
        this.optionsDrawerComponentVisibility = false
        clearTimeout(timeId)
      }, 150)
    },
    showModal() {
      this.modalVisibility = true
    },
    hideModal() {
      this.modalVisibility = false
    },
    objCreateHandler(objType) {
      if (objType == 'addIcon') {
        this.selectedShape = {
          layerConfig: {
            objectData: {
              name: 'Icons',
              componentName: 'iconObjectController'
            }
          }
        }
        const timeId = setTimeout(() => {
          this.optionsDrawerComponentVisibility = true
          clearTimeout(timeId)
        }, 80)
        const timeId1 = setTimeout(() => {
          this.optionSidebarVisibility = true
          clearTimeout(timeId1)
        }, 110)
      }
    },
    circularTableCreate() {
      //create and add data to layersArray
      const layerConfig = {
        tableData: {
          name: 'Rounded',
          type: 'circularTable',
          componentName: 'circularTableController',
          createFunction: 'createCircularTableHandler',
          seatCount: 8,
          seatRadius: 20,
          perSeatTableRadius: 10.5,
          centerX: this.activePageX,
          centerY: this.activePageY,
          seatPrefix: 'Seat',
          tablePrefix: 'Table',

          seatLabelType: 'numbers',
          seatLabelStartWith: 1,
          labelDirection: 'right'
        },
        name: `circularTable${new Date().getMilliseconds()}`,
        x: 0,
        y: 0
      }

      const shapeData = createCircularTableHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    // Rectangle Table with seats
    rectangularTableCreate() {
      const layerConfig = {
        tableData: {
          name: 'Rectangle Table',
          type: 'rectangleTable',
          componentName: 'rectangleTableController',
          createFunction: 'createRectangleTableHandler',
          seatCountX: 6,
          seatCountY: 6,
          seatRadius: 20,
          centerX: this.activePageX,
          centerY: this.activePageY,
          seatPrefix: 'Seat',
          tablePrefix: 'Table',

          seatLabels: '',
          seatLabelType: 'numbers',
          seatLabelStartWith: 1,
          labelDirection: 'right'
        },
        x: 0,
        y: 0,
        name: `rectangleTable${new Date().getMilliseconds()}`
      }
      const shapeData = createRectangleTableHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    // Seating area
    seatingArea() {
      const layerConfig = {
        tableData: {
          name: 'Seating Area',
          type: 'seatingArea',
          componentName: 'seatingAreaTableController',
          createFunction: 'createSeatingAreaTableHandler',
          seatRadius: 20,
          centerX: this.activePageX,
          centerY: this.activePageY,
          seatPrefix: 'Seat',
          tablePrefix: 'Table',

          numberOfRows: 2,
          seatsPerRow: 4,
          selectedRowLabel: 'Show All',

          rowLabelStartWith: 'A',
          rowLabelType: 'down',

          seatLabelStartWith: 1,
          seatLabelType: 'right'
        },
        x: 0,
        y: 0,
        name: `seating${new Date().getMilliseconds()}`
      }
      const shapeData = createSeatingAreaTableHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    // Waiting area
    waitingArea() {
      const layerConfig = {
        tableData: {
          name: 'Area',
          type: 'waitingArea',
          componentName: 'waitingAreaTableController',
          createFunction: 'createWaitingAreaTableHandler',
          centerX: this.activePageX,
          centerY: this.activePageY,
          areaType: 'standing',
          capacity: 50,
          soldCount: 0,
          width: 100,
          height: 100,
          table_meta: {},
          isHold: false,
          isSelected: false
        },
        x: 0,
        y: 0,
        name: `seating${new Date().getMilliseconds()}`
      }
      const shapeData = createWaitingAreaTableHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    exportData() {
      const layersArray = JSON.parse(JSON.stringify(this.layersArray))
      // remove seat_meta and table meta from layersArray
      layersArray.forEach((layer) => {
        if (layer?.layerConfig?.tableData?.table_meta) {
          layer.layerConfig.tableData.table_meta = {}
          layer.layerConfig.tableData.isHold = false
          layer.layerConfig.tableData.isSelected = false
          layer.layerConfig.tableData.soldCount = 0
        }
        layer.shapes.forEach((shape) => {
          if (shape?.seat_meta) {
            shape.isSelected = false
            shape.isHold = false
            shape.isSold = false
            shape.isTicketAssigned = false
            shape.seat_meta = {}
          }
        })
      })
      this.downloadObjectAsJson(layersArray, `data ${new Date()?.getTime()}.json`)
    },
    downloadObjectAsJson(obj, fileName) {
      const json = JSON.stringify(obj, null, 2)
      const blob = new Blob([json], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()

      URL.revokeObjectURL(link.href)
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = ''
        this.updateTransformer()
        return
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer = e.target.getParent().className === 'Transformer'
      if (clickedOnTransformer) {
        return
      }

      // find clicked rect by its name
      const name = e.target.parent.name() || e.target.name()
      // const rect = this.rectangles.find((r) => r.name === name)
      if (name) {
        this.selectedShapeName = name
      } else {
        this.selectedShapeName = ''
      }
      this.updateTransformer()
    },
    resetTransformer() {
      const timeId = setTimeout(() => {
        const transformer = this.$refs.transformer.getNode()
        transformer.forceUpdate()
        this.updateShapeHoverButtonPosition()
        clearTimeout(timeId)
      }, 10)
    },
    updateShapeHoverButtonPosition() {
      const stage = this.$refs.stage.getStage()
      const selectedNode = stage.findOne('.' + this.selectedShapeName)
      if (selectedNode) {
        const { x, y, width, height } = selectedNode?.getClientRect()
        this.layersArray[this.selectedShapeIndex].layerConfig = {
          ...selectedNode?.attrs
        }
        const deleteButtonX = x + width + 10
        const deleteButtonY = y - 30
        this.deleteButtonPosition = { x: deleteButtonX, y: deleteButtonY }
      }
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode()
      const stage = transformerNode.getStage()
      const { selectedShapeName } = this

      const selectedNode = stage.findOne('.' + selectedShapeName)

      // do nothing if selected node is already attached
      if (!selectedNode && !transformerNode.node()) {
        this.closeOptionSidebar()
        this.isTransforming = false
        transformerNode.nodes([])
        return
      }
      if (selectedNode?._id === transformerNode.node()?._id) {
        // this.closeOptionSidebar()
        // this.isTransforming = false
        return
      }
      if (selectedNode) {
        this.isTransforming = true
        this.updateShapeHoverButtonPosition()
        //attach transformer to selected node
        transformerNode.nodes([selectedNode])
        transformerNode.on('transform', this.updateShapeHoverButtonPosition)
      } else {
        // remove transformer
        this.closeOptionSidebar()
        this.isTransforming = false
        transformerNode.nodes([])
      }
    },
    addCircle() {
      const layerConfig = {
        objectData: {
          name: 'Circle',
          type: 'Circle',
          componentName: 'circleObjectController',
          createFunction: 'addCircleObjectHandler',
          centerX: this.activePageX,
          centerY: this.activePageY,
          circleRadius: 50,
          circleColor: '#fff'
        },
        x: 0,
        y: 0,
        name: `CircleObject${new Date().getMilliseconds()}`
      }
      const shapeData = addCircleObjectHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    addSquare() {
      const layerConfig = {
        objectData: {
          name: 'Square',
          type: 'Rect',
          componentName: 'squareObjectController',
          createFunction: 'addSquareObjectHandler',
          centerX: this.activePageX,
          centerY: this.activePageY,
          fill: '#fff',
          width: 70,
          height: 70
        },
        x: 0,
        y: 0,
        name: `squareObject${new Date().getMilliseconds()}`
      }
      const shapeData = addSquareObjectHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    addLine() {
      const layerConfig = {
        objectData: {
          name: 'Line',
          type: 'Line',
          componentName: 'lineObjectController',
          createFunction: 'addLineObjectHandler',
          centerX: this.activePageX,
          centerY: this.activePageY,
          strokeWidth: 5
        },
        x: 0,
        y: 0,
        name: `LineObject${new Date().getMilliseconds()}`
      }
      const shapeData = addLineObjectHandler(layerConfig)
      this.layersArray.push(shapeData)
    },
    addText() {
      const layerConfig = {
        objectData: {
          name: 'Text',
          type: 'Text',
          componentName: 'textObjectController',
          createFunction: 'addTextObjectHandler',
          centerX: this.activePageX,
          centerY: this.activePageY,
          fill: '#fff',
          fontSize: 25,
          text: 'Enter Text',
          fill: 'black',
          fontFamily: 'Poppins',
          fontStyle: 'normal'
        },
        x: 0,
        y: 0,
        name: `TextObject${new Date().getMilliseconds()}`
      }
      const shapeData = addTextObjectHandler(layerConfig)
      this.layersArray.push(shapeData)
    }
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
