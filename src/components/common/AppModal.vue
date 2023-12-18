<template>
    <Dialog :class="cssClass" v-if="visible" :title="title" @close="closeModal">
        <div class="flex items-center modal-container">
            <slot name="content"></slot>
        </div>
    </Dialog>
</template>
  
<script>
import { Dialog } from '@progress/kendo-vue-dialogs';

export default {
    name: 'AppModal',
    components: {
        Dialog
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        cssClass: {
            type: String,
            default: 'modal-md',
        },
        // close: {
        //     type: Function,
        //     required: true,
        //     default: () => {}
        // }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        }
    }
};
</script>
  