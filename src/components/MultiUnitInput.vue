<template>
    <div class="multi-unit-input">
        <div class="input-container">
            <div v-for="(unit, index) in units" :key="`unit-${unit}-${index}`" class="input-group">
                <div class="input-wrapper">
                    <span class="unit-label" v-show="localValue[index]">{{ unit }}</span>
                    <input type="number" :value="localValue[index]" :placeholder="unit"
                        @input="handleInputChange($event, index)" @keyup.enter="handleEnter" @blur="handleBlur"
                        @focus="handleFocus(index)" :class="{ 'is-focused': focusedIndex === index }">
                </div>
                <div v-if="index < units.length - 1" class="separator">:</div>
            </div>
        </div>
        <div class="error-tip" v-if="duplicateError">
            {{ duplicateError }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'MultiUnitInput',
    props: {
        value: {
            type: Array,
            default: () => []
        },
        units: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            localValue: [],
            focusedIndex: -1,
            duplicateError: '',
            blurredInputs: new Set(),
            submitDebounceTimer: null
        }
    },
    watch: {
        units: {
            immediate: true,
            handler(units) {
                // 检查单位是否重复
                const duplicates = units.filter((unit, index) =>
                    unit && units.indexOf(unit) !== index
                )
                if (duplicates.length > 0) {
                    this.duplicateError = `单位"${duplicates[0]}"重复使用`
                    this.$emit('error', this.duplicateError)
                } else {
                    this.duplicateError = ''
                    this.$emit('error', '')
                }
            }
        },
        value: {
            immediate: true,
            handler(val) {
                this.localValue = [...val]
                if (this.localValue.length < this.units.length) {
                    this.localValue = this.localValue.concat(
                        Array(this.units.length - this.localValue.length).fill('')
                    )
                }
            }
        }
    },
    methods: {
        handleInputChange(event, index) {
            const newValue = [...this.localValue]
            // 允许输入为空，只在失焦时才设置为'0'
            newValue[index] = event.target.value
            this.$emit('input', newValue)
        },
        handleTab(index) {
            if (index === this.units.length - 1) {
                this.$emit('tab-last')
            }
        },
        handleFocus(index) {
            this.focusedIndex = index
            this.blurredInputs.delete(index) // 重新聚焦时移除已失焦标记
        },
        handleEnter() {
            // 增加防抖处理
            clearTimeout(this.submitDebounceTimer)
            this.submitDebounceTimer = setTimeout(() => {
                if (this.validate()) {
                    this.$emit('enter')
                    this.blurredInputs.clear()
                }
            }, 200)
        },
        handleBlur() {
            this.blurredInputs.add(this.focusedIndex)
            this.focusedIndex = -1

            // 检查是否所有输入框都已失焦
            if (this.blurredInputs.size === this.units.length) {
                // 添加防抖，避免多个blur事件同时触发
                clearTimeout(this.submitDebounceTimer)
                this.submitDebounceTimer = setTimeout(() => {
                    // 验证并提交
                    if (this.validate()) {
                        this.$emit('enter')
                    }
                    this.blurredInputs.clear()
                }, 200)
            }

            // 处理单个输入框的值
            const newValue = this.localValue.map(v => v || '0')
            this.$emit('input', newValue)
        },
        validate() {
            const isSingleUnit = this.units.length === 1
            const isValid = this.localValue.every(value => {
                const numValue = Number(value)
                if (!value || isNaN(numValue)) return false
                if (isSingleUnit) {
                    return !isNaN(parseFloat(value))
                }
                return Number.isInteger(numValue) && numValue >= 0
            })

            // 如果验证通过，确保所有值都是有效数字
            if (isValid) {
                this.localValue = this.localValue.map(v => v || '0')
                this.$emit('input', this.localValue)
            }

            return isValid
        }
    },
    beforeDestroy() {
        // 清理定时器
        clearTimeout(this.submitDebounceTimer)
    }
}
</script>

<style lang="less" scoped>
.multi-unit-input {
    .input-container {
        display: flex;
        align-items: center;

        .input-group {
            display: flex;
            align-items: center;

            &+.input-group {
                margin-left: 16px;
            }
        }

        .input-wrapper {
            position: relative;
            width: 80px;

            .unit-label {
                position: absolute;
                // top: -10px;
                top: 20%;
                right: -15px;
                transform: translateX(-50%);
                font-size: 12px;
                color: #409EFF;
                white-space: nowrap;
                transition: all 0.3s;
                font-weight: 500;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }

            input {
                width: 100%;
                height: 32px;
                padding: 0 8px;
                border: 1px solid #DCDFE6;
                border-radius: 4px;
                font-size: 14px;
                color: #606266;
                transition: all 0.3s;
                outline: none;
                text-align: center;

                &::placeholder {
                    color: #C0C4CC;
                }

                &:hover {
                    border-color: #C0C4CC;
                }

                &:focus {
                    border-color: #409EFF;
                }

                &.is-focused {
                    border-color: #409EFF;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
                }
            }
        }

        .separator {
            position: relative;
            left: 16px;
            font-size: 16px;
            color: #909399;
            padding: 0 4px;
            user-select: none;
            line-height: 32px;
        }
    }

    .error-tip {
        margin-top: 4px;
        color: #F56C6C;
        font-size: 12px;
        line-height: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, 5px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>
