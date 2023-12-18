<template>
    <AppDrawer
        :title="selectedShape?.layerConfig?.tableData?.name || selectedShape?.layerConfig?.objectData?.name || 'This is a Drawer Title'"
        :visible="visible">
        <template v-slot:content>
            <component
                :is="selectedShape?.layerConfig?.tableData?.componentName || selectedShape?.layerConfig?.objectData?.componentName"
                @close="close" :selectedShapeIndex="selectedShapeIndex" @resetTransformerHandler="resetTransformerHandler"
                :selectedShape="selectedShape" :refStage="refStage" />
        </template>
    </AppDrawer>
</template>

<script>
import AppDrawer from '../../common/AppDrawer.vue';
import circularTableController from './controllers/tables/circularTableController.vue';
import rectangleTableController from './controllers/tables/rectangleTableController.vue';
import seatingAreaTableController from './controllers/tables/seatingAreaTableController.vue';
import waitingAreaTableController from './controllers/tables/waitingAreaTableController.vue';
import circleObjectController from './controllers/objects/circleObjectController.vue';
import lineObjectController from './controllers/objects/lineObjectController.vue'; ``
import iconObjectController from './controllers/objects/iconObjectController.vue';
import textObjectController from './controllers/objects/textObjectController.vue';
import squareObjectController from './controllers/objects/squareObjectController.vue';

export default {
    name: 'OptionsDrawer',
    inject: ["layersArray"],
    components: {
        AppDrawer,
        circularTableController,
        rectangleTableController,
        seatingAreaTableController,
        waitingAreaTableController,
        circleObjectController,
        lineObjectController,
        iconObjectController,
        textObjectController,
        squareObjectController,
    },
    data() {
        return {
        }
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
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
        resetTransformerHandler: {
            type: Function,
            required: true,
        },
    },
    mounted() { },
    methods: {
        close() {
            this.$emit('close')
        },
    }
}
</script>