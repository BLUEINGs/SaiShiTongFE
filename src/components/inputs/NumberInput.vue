<template>
    <div class="number-input">
        <button type="button" class="btn minus" @click.prevent="decrease" :disabled="value <= min">
            <i class="el-icon-minus"></i>
        </button>
        <div class="input-wrap">
            <input type="number" :value="value" @input="handleInput" @blur="handleBlur">
        </div>
        <button type="button" class="btn plus" @click.prevent="increase" :disabled="value >= max">
            <i class="el-icon-plus"></i>
        </button>
    </div>
</template>

<script>
export default {
    name: 'NumberInput',
    props: {
        value: {
            type: Number,
            required: true
        },
        min: {
            type: Number,
            default: 1
        },
        max: {
            type: Number,
            default: 99
        },
        step: {
            type: Number,
            default: 1
        }
    },
    methods: {
        decrease() {
            const newValue = Math.max(this.value - this.step, this.min)
            this.$emit('input', newValue)
        },
        increase() {
            const newValue = Math.min(this.value + this.step, this.max)
            this.$emit('input', newValue)
        },
        handleInput(e) {
            let value = parseInt(e.target.value)
            if (!isNaN(value)) {
                value = Math.min(Math.max(value, this.min), this.max)
                this.$emit('input', value)
            }
        },
        handleBlur(e) {
            const value = parseInt(e.target.value)
            if (isNaN(value)) {
                this.$emit('input', this.min)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.number-input {
    display: flex;
    align-items: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    width: 160px;
    height: 32px;
    overflow: hidden;

    &:hover {
        border-color: #c0c4cc;
    }

    &:focus-within {
        border-color: #409eff;
    }

    .btn {
        width: 32px;
        height: 100%;
        border: none;
        background: #f5f7fa;
        color: #606266;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.3s;

        &:hover:not(:disabled) {
            background: #e4e7ed;
            color: #409eff;
        }

        &:disabled {
            cursor: not-allowed;
            color: #c0c4cc;
        }
    }

    .input-wrap {
        flex: 1;
        height: 100%;

        input {
            width: 100%;
            height: 100%;
            border: none;
            text-align: center;
            outline: none;
            padding: 0 4px;
            color: #606266;
            font-size: 14px;
            background: transparent;

            &::-webkit-inner-spin-button,
            &::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
}
</style>
