<template>
    <div class="base-input" :class="{ 'mobile': isMobile }">
        <input :type="type" :value="value" :placeholder="isMobile ? label : placeholder"
            @input="$emit('input', $event.target.value)" v-bind="$attrs" />
    </div>
</template>

<script>
export default {
    name: 'BaseInput',
    props: {
        label: String,
        value: [String, Number],
        type: {
            type: String,
            default: 'text'
        },
        placeholder: String,
        showLabel: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            id: `input-${Math.random().toString(36).substr(2, 9)}`,
            isMobile: window.innerWidth <= 768
        }
    },
    created() {
        window.addEventListener('resize', this.checkMobile)
    },
    destroyed() {
        window.removeEventListener('resize', this.checkMobile)
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768
        }
    }
}
</script>

<style lang="less" scoped>
.base-input {
    box-sizing: border-box;
    width: 100%;

    input {
        box-sizing: border-box;
        width: 100%;
        height: 32px;
        padding: 4px 12px;
        font-size: 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        transition: all 0.2s;
        background: #fff;
        color: #333;

        &:focus {
            border-color: #409EFF;
            outline: none;
        }
    }

    &.mobile input {
        height: 40px;
    }
}
</style>
