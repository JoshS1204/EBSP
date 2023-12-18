<template>
    <div class="form-group">
        <label :for="id" class="form-label text-sm">{{ label }}</label>
        <input id="text" :type="type" :placeholder="placeholder" :disabled="disabled" :required="required"
            :readonly="readonly" :autofocus="autofocus" :autocomplete="autocomplete" :maxlength="maxlength"
            :minlength="minlength" :value="inputValue" @input="inputHandler" class="form-control" />
    </div>
</template>

<script>
export default {
    name: 'inputTypeText',
    props: {
        value: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: false,
        },
        label: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        disabled: {
            type: Boolean,
            required: false,
        },
        readonly: {
            type: Boolean,
            required: false,
        },
        autofocus: {
            type: Boolean,
            required: false,
        },
        autocomplete: {
            type: String,
            required: false,
        },
        maxlength: {
            type: Number,
            required: false,
        },
        minlength: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            inputValue: this.value,
        }
    },
    watch: {
        value() {
            this.inputValue = this.value;
        }
    },
    methods: {
        inputHandler(event) {
            this.$emit('input', event.target.value);
        },
        dataValidation() { }
    },

}
</script>