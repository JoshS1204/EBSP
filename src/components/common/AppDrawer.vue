<template>
    <div :class="visible ? 'show' : ''" class="flex flex-col z-10 bg-white app-drawer">
        <header class="flex-none drawer-header relative">
            <kbutton :class="'close cursor-pointer absolute'" :fill-mode="'flat'" :rounded="'full'" @click="closeDrawer">
                <span class="k-icon k-i-arrow-chevron-left"></span>
            </kbutton>
          <h5 class="text-base leading-5 font-medium my-0 ms-4">{{ title }}</h5>
        </header>
        <div class="grow drawer-container">
            <slot name="content"></slot>
        </div>
    </div>
</template>
  
<script>
import { Button } from '@progress/kendo-vue-buttons';
import iconClose from '../../assets/images/icon/svg-icons/iconClose.vue';

export default {
    name: 'AppDrawer',
    components: {
        kbutton: Button,
        iconClose
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
    },
    methods: {
        closeDrawer() {
            this.$emit('close');
        }
    }
};
</script>
  