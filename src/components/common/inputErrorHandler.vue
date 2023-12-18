<template>
    <span v-if="visibility" class="error-message">
        {{ message }}
    </span>
</template>

<script>
export default {
    name: 'inputErrorHandler',
    props: {
        visibility: {
            type: Boolean,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
};

</script>