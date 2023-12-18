<template>
    <footer class="flex drawer-footer bg-white">
        <kbutton :disabled="isDisabled" @click="applyChangesHandler" :togglable="true" :size="'large'"
            :theme-color="'primary'" :rounded="'small'" :class="'w-100 px-3'">
            Apply Changes
        </kbutton>
    </footer>
</template>

<script>

import { Button } from '@progress/kendo-vue-buttons';

export default {
    name: 'controllerFooter',
    components: {
        kbutton: Button
    },
    props: {
        isDisabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() { },
    mounted() { },
    methods: {
        applyChangesHandler() {
            this.$emit('applyChanges');
        }
    }
};
</script>