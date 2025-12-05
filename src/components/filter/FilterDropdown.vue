<template>
    <div class="filter-dropdown" :class="{ 'is-active': isOpen, 'has-value': hasSelected }">
        <div class="filter-trigger" @click="toggleDropdown">
            <span class="label" v-if="!hideLabel">{{ label }}: </span>
            <span class="value" :class="{ 'no-label': hideLabel }">{{ selectedLabel }}</span>
            <i class="el-icon-arrow-down" :class="{ 'is-reverse': isOpen }"></i>
        </div>
        <transition name="dropdown">
            <div class="filter-options" v-show="isOpen">
                <div v-for="option in options" :key="option.value" class="option-item"
                    :class="{ 'is-selected': option.value === value }" @click="handleSelect(option.value)">
                    {{ option.label }}
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'FilterDropdown',
    props: {
        value: { // 改用 value 而不是 modelValue
            type: [String, Number],
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        defaultValue: {  // 添加默认值属性
            type: [String, Number],
            default: null
        },
        hideLabel: {
            type: Boolean,
            default: false  // 默认显示标签
        }
    },
    data() {
        return {
            isOpen: false,
            localValue: this.value  // 添加本地值
        }
    },
    computed: {
        selectedLabel() {
            const selected = this.options.find(opt => opt.value === this.value)
            return selected ? selected.label : '全部'
        },
        hasSelected() {
            return this.value !== 'all' && this.value !== 'none'
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen
        },
        handleSelect(value) {
            this.$emit('input', value) // 改用 input 事件
            this.$emit('change', value)
            this.isOpen = false
        },
        handleClickOutside(e) {
            if (!this.$el.contains(e.target)) {
                this.isOpen = false
            }
        }
    },
    created() {
        // 如果有默认值且当前值为空,则使用默认值
        if (this.defaultValue && !this.value) {
            this.$emit('input', this.defaultValue)
            this.$emit('change', this.defaultValue)
        }
    },
    watch: {
        value(val) {
            this.localValue = val
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside)
    }
}
</script>

<style lang="less" scoped>
.filter-dropdown {
    position: relative;
    min-width: 120px;
    flex: 1;

    .filter-trigger {
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.3s;

        &:hover {
            border-color: #c0c4cc;
        }

        .label {
            color: #909399;
            font-size: 13px;
            margin-right: 4px;
        }

        .value {
            color: #606266;
            font-weight: 500;
            margin-right: auto;
        }

        .value.no-label {
            padding-left: 0;
            font-size: 12px;
        }

        .el-icon-arrow-down {
            font-size: 12px;
            transition: transform 0.3s;
            color: #909399;

            &.is-reverse {
                transform: rotate(180deg);
            }
        }
    }

    .filter-options {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;

        .option-item {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 13px;
            color: #606266;
            transition: all 0.3s;

            &:hover {
                background-color: #f5f7fa;
            }

            &.is-selected {
                color: #409EFF;
                font-weight: 500;
                background-color: #ecf5ff;
            }
        }
    }

    &.is-active {
        .filter-trigger {
            border-color: #409EFF;
        }
    }

    &.has-value {
        .filter-trigger {
            border-color: #409EFF;

            .value {
                color: #409EFF;
            }
        }
    }
}

// 自定义滚动条样式
.filter-options {
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background: #f5f7fa;
    }
}

// 添加下拉动画
.dropdown-enter-active,
.dropdown-leave-active {
    transform-origin: top;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter,
.dropdown-leave-to {
    transform: scaleY(0);
    opacity: 0;
}
</style>
