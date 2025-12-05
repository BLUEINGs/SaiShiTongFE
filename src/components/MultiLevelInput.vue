<template>
    <div class="multi-level-input">
        <div class="input-container">
            <div v-for="level in levels" :key="level.field" class="input-group">
                <span class="level-label">
                    {{ level.field }}{{ level.isNumeric ? '（数字）' : '' }}
                </span>
                <div class="input-wrapper" :class="{ 'is-error': errors[level.field] }">
                    <template v-if="!level.isNumeric">
                        <div class="custom-select"
                            :class="{ 'is-active': level.isOpen, 'is-error': errors[level.field] }">
                            <div class="select-trigger" @click="toggleSelect(level)">
                                <span class="placeholder" v-if="!localValues[level.field]">
                                    请选择{{ level.field }}
                                </span>
                                <span v-else>
                                    {{ getDisplayValue(level, localValues[level.field]) }}
                                </span>
                                <i class="el-icon-arrow-down" :class="{ 'is-reverse': level.isOpen }"></i>
                            </div>
                            <transition name="dropdown">
                                <div class="select-dropdown" v-show="level.isOpen" @click.stop>
                                    <ul class="option-list">
                                        <li v-for="option in getLevelOptions(level)" :key="option.value"
                                            :class="{ 'is-selected': localValues[level.field] === option.value }"
                                            @click="selectOption(level.field, option.value)">
                                            {{ option.label }}
                                        </li>
                                    </ul>
                                </div>
                            </transition>
                        </div>
                    </template>
                    <template v-else>
                        <input type="text" :value="localValues[level.field]" :placeholder="`请输入${level.field}`"
                            @input="e => handleNumericInput(level.field, e.target.value)"
                            @blur="validateField(level.field)" class="numeric-input"
                            :class="{ 'is-error': errors[level.field] }">
                    </template>
                </div>
                <div class="error-message" v-if="errors[level.field]">{{ errors[level.field] }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MultiLevelInput',
    props: {
        value: {
            type: [String, Array], // 允许字符串或数组
            default: () => []
        },
        levels: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            localValues: {}, // 将由watch value初始化
            dropdownStates: new Map(),
            errors: {}, // 添加错误状态
            showError: false // 添加错误显示状态
        }
    },
    methods: {
        handleValueChange() {
            // 修改值的处理逻辑
            const values = this.levels.map(level => {
                const value = this.localValues[level.field]
                return value !== undefined ? value : ''
            })

            // 确保有至少一个非空值时才发出数组
            const hasValue = values.some(v => v !== '')
            this.$emit('input', hasValue ? values : [])
        },

        handleInputChange(field, value) {
            this.localValues[field] = value;
            this.handleValueChange();
        },

        handleNumericInput(field, value) {
            const numericValue = value.replace(/[^\d]/g, '');
            const level = this.levels.find(l => l.field === field);

            if (level && level.digits) {
                if (numericValue.length > level.digits) {
                    this.$set(this.errors, field, `${level.field}不能超过${level.digits}位数字`);
                    // 截断超出的部分
                    const truncated = numericValue.slice(0, level.digits);
                    this.$set(this.localValues, field, truncated);
                } else {
                    this.$set(this.errors, field, '');
                    this.$set(this.localValues, field, numericValue);
                }
                this.handleValueChange();
                this.$emit('validate', !Object.values(this.errors).some(error => error));
            }
        },

        validateField(field) {
            const level = this.levels.find(l => l.field === field);
            const value = this.localValues[field];

            if (!value) {
                if (level.isNumeric) {
                    this.$set(this.errors, field, `请输入${level.field}`);
                } else {
                    this.$set(this.errors, field, `请选择${level.field}`);
                }
            } else if (level.isNumeric && value.length > level.digits) {
                this.$set(this.errors, field, `${level.field}不能超过${level.digits}位数字`);
            } else {
                this.$set(this.errors, field, '');
            }

            // 触发验证状态
            const hasErrors = Object.values(this.errors).some(error => error);
            this.$emit('validate', !hasErrors);
        },

        parseValueToLocal(value) {
            // 修改：确保正确初始化本地值
            const valueArray = Array.isArray(value) ? value : []

            this.levels.forEach((level, index) => {
                this.$set(this.localValues, level.field, valueArray[index] || '')
            })
        },

        getLevelOptions(level) {
            if (!level.isNumeric && level.valueRange) {
                // 确保 valueRange 是二维数组
                if (Array.isArray(level.valueRange) && Array.isArray(level.valueRange[0])) {
                    return level.valueRange.map(([label, value]) => ({
                        label,
                        value
                    }));
                }
            }
            return []; // 当不满足条件时返回空数组
        },

        getMaxDigits(level) {
            if (!level.valueRange || !Array.isArray(level.valueRange)) return 9999;

            const digits = level.valueRange.find(item => item[0] === 'digits');
            if (digits) {
                return Math.pow(10, digits[1]) - 1;
            }
            return 9999;
        },

        getDisplayValue(level, value) {
            if (value === undefined || value === null || value === '') return '';

            if (!level.isNumeric && level.valueRange) {
                // 修改这里：正确处理选项映射
                const option = level.valueRange.find(([/* label */, optionValue]) => optionValue === value);
                return option ? option[0] : value;
            }
            return value;
        },

        toggleSelect(level) {
            // 阻止事件冒泡
            event.stopPropagation();

            // 修改: 使用 Object.prototype.hasOwnProperty.call
            if (!Object.prototype.hasOwnProperty.call(level, 'isOpen')) {
                this.$set(level, 'isOpen', false);
            }

            // 切换状态
            this.$set(level, 'isOpen', !level.isOpen);

            // 关闭其他下拉框
            this.levels.forEach(l => {
                if (l !== level && Object.prototype.hasOwnProperty.call(l, 'isOpen')) {
                    this.$set(l, 'isOpen', false);
                }
            });
        },
        selectOption(field, value) {
            this.$set(this.localValues, field, value);
            this.$set(this.errors, field, ''); // 清除错误
            this.$nextTick(() => {
                this.handleValueChange();
            });

            const level = this.levels.find(l => l.field === field);
            if (level) {
                this.$set(level, 'isOpen', false);
            }
        },
        // 添加数字值转换方法
        convertNumberToLabel(level, value) {
            if (!level.valueRange) return value;

            // 如果是数字类型且有digits配置
            if (level.isNumeric) {
                const digits = level.valueRange.find(item => item[0] === 'digits');
                if (digits) {
                    // 确保数字长度符合要求
                    return String(value).padStart(digits[1], '0');
                }
                return value;
            }

            // 如果是非数字类型，从选项中查找对应标签
            const option = level.valueRange.find(item => item[1] === value);
            return option ? option[0] : value;
        },
        // 添加关闭其他下拉框的方法
        closeOtherDropdowns(currentLevel) {
            this.levels.forEach(level => {
                if (level !== currentLevel) {
                    this.$set(level, 'isOpen', false);
                }
            });
        }
    },
    mounted() {
        // 修改：保存handleClickOutside引用以便移除
        this.handleClickOutside = (e) => {
            if (!this.$el.contains(e.target)) {
                this.levels.forEach(level => {
                    if (Object.prototype.hasOwnProperty.call(level, 'isOpen')) {
                        this.$set(level, 'isOpen', false);
                    }
                });
            }
        };

        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        // 修改：正确移除事件监听器
        document.removeEventListener('click', this.handleClickOutside);
    },
    watch: {
        value: {
            immediate: true,
            handler(newValue) {
                // 确保总是解析值到本地
                this.parseValueToLocal(newValue)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.multi-level-input {
    .input-container {
        display: flex;
        align-items: center;
        gap: 16px;

        .input-group {
            position: relative;
            margin-bottom: 16px;

            .level-label {
                position: absolute;
                top: -8px; // 调整: 更接近输入框
                left: 16px;
                font-size: 12px;
                color: #409EFF;
                line-height: 1;
                z-index: 1;
            }

            .input-wrapper {
                width: 150px; // 修改宽度为100px

                &.is-error {

                    .custom-select .select-trigger,
                    .numeric-input {
                        border-color: #f56c6c;
                    }
                }

                .custom-select {
                    position: relative;

                    &.is-error {
                        .select-trigger {
                            border-color: #f56c6c;
                        }
                    }

                    .select-trigger {
                        height: 32px;
                        padding: 0 12px;
                        border: 1px solid #dcdfe6;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        cursor: pointer;
                        background: #fff;
                        transition: all 0.3s;

                        &:hover {
                            border-color: #c0c4cc;
                        }

                        .placeholder {
                            color: #909399;
                        }

                        i {
                            color: #c0c4cc;
                            transition: transform 0.3s;

                            &.is-reverse {
                                transform: rotate(180deg);
                            }
                        }
                    }

                    .select-dropdown {
                        position: absolute;
                        top: calc(100% + 4px);
                        left: 0;
                        width: 100%;
                        background: #fff;
                        border: 1px solid #e4e7ed;
                        border-radius: 4px;
                        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
                        z-index: 1000;
                        transform-origin: top;

                        .option-list {
                            margin: 0;
                            padding: 4px 0; // 调整: 减少内边距
                            list-style: none;
                            max-height: 200px;
                            overflow-y: auto;

                            li {
                                padding: 6px 12px; // 调整: 减小选项高度
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: 13px; // 调整: 稍微减小字号
                                line-height: 1.2; // 调整: 减小行高

                                &:hover {
                                    background: #f5f7fa;
                                }

                                &.is-selected {
                                    color: #409EFF;
                                    background: #f5f7fa;
                                }
                            }
                        }
                    }

                    &.is-active {
                        .select-trigger {
                            border-color: #409EFF;
                        }
                    }
                }

                .numeric-input {
                    width: 100%;
                    height: 32px;
                    padding: 0 12px;
                    border: 1px solid #dcdfe6;
                    border-radius: 4px;
                    transition: all 0.3s;
                    outline: none;

                    &.is-error {
                        border-color: #f56c6c;
                    }

                    &:focus {
                        border-color: #409EFF;
                    }
                }
            }
        }
    }

    .error-message {
        position: absolute;
        font-size: 12px;
        color: #f56c6c;
        line-height: 1;
        padding-top: 4px;
        width: 100%;
    }

    // 添加下拉框动画
    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: all 0.3s ease;
        transform-origin: top;
    }

    .dropdown-enter,
    .dropdown-leave-to {
        transform: scaleY(0);
        opacity: 0;
    }
}
</style>
