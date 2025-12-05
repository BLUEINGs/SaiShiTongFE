<template>
    <div class="custom-multi-select" v-click-outside="closeDropdown">
        <div class="select-box" @click="toggleDropdown">
            <div class="selected-items">
                <template v-if="selectedItems.length">
                    <div class="selected-tags">
                        <el-tag v-for="item in selectedItems" :key="item.id" size="small" @close.stop="removeItem(item)"
                            closable>
                            {{ item.name }}
                        </el-tag>
                    </div>
                </template>
                <span v-else class="placeholder">{{ placeholder }}</span>
            </div>
            <i :class="['el-icon-arrow-down', { 'is-reverse': isOpen }]"></i>
        </div>

        <transition name="zoom-in-top">
            <div v-show="isOpen" class="select-dropdown">
                <div class="select-dropdown__list">
                    <div v-for="item in options" :key="item.id" class="select-dropdown__item"
                        :class="{ 'is-selected': isSelected(item) }" @click.stop="handleSelect(item)">
                        {{ item.name }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'BaseMultiSelect',
    props: {
        value: {
            type: Array,
            default: () => []
        },
        options: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String,
            default: '请选择'
        }
    },
    data() {
        return {
            isOpen: false,
            selectedItems: []
        }
    },
    created() {
        this.selectedItems = [...this.value]
    },
    watch: {
        value: {
            handler(newVal) {
                this.selectedItems = [...newVal]
            },
            deep: true
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = true
        },
        closeDropdown() {
            this.isOpen = false
        },
        isSelected(item) {
            return this.selectedItems.some(selected => selected.id === item.id)
        },
        handleSelect(item) {
            const index = this.selectedItems.findIndex(selected => selected.id === item.id)
            if (index === -1) {
                this.selectedItems.push(item)
            } else {
                this.selectedItems.splice(index, 1)
            }
            this.$emit('input', this.selectedItems)
            this.$emit('change', this.selectedItems)
        },
        removeItem(item) {
            const index = this.selectedItems.findIndex(selected => selected.id === item.id)
            if (index !== -1) {
                this.selectedItems.splice(index, 1)
                this.$emit('input', this.selectedItems)
                this.$emit('change', this.selectedItems)
            }
        }
    },
    directives: {
        clickOutside: {
            bind(el, binding) {
                el.__vueClickOutside__ = function (event) {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value(event)
                    }
                }
                document.addEventListener('click', el.__vueClickOutside__)
            },
            unbind(el) {
                document.removeEventListener('click', el.__vueClickOutside__)
                delete el.__vueClickOutside__
            }
        }
    }
}
</script>

<style lang="less" scoped>
.custom-multi-select {
    position: relative;
    width: 100%;

    .select-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 32px;
        padding: 0 8px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        transition: border-color 0.2s;

        &:hover {
            border-color: #c0c4cc;
        }

        .selected-items {
            flex: 1;
            display: flex;
            align-items: center;
            min-height: 30px;
            padding: 4px 0;

            .selected-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }

            .placeholder {
                color: #909399;
            }
        }

        .el-icon-arrow-down {
            font-size: 12px;
            color: #c0c4cc;
            transition: transform 0.3s;

            &.is-reverse {
                transform: rotate(180deg);
            }
        }
    }

    .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        max-height: 240px;
        background-color: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        &__list {
            padding: 6px 0;
            overflow-y: auto;
            max-height: 240px;
            background: #fff;
            border-radius: 4px;
        }

        &__item {
            padding: 0 12px;
            height: 34px;
            line-height: 34px;
            font-size: 14px;
            color: #606266;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
            }

            &.is-selected {
                color: #409eff;
                font-weight: bold;
                background-color: #f5f7fa;
            }
        }
    }
}

// 修改动画以避免内容被截断
.zoom-in-top-enter-active,
.zoom-in-top-leave-active {
    opacity: 1;
    transform-origin: center top;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.zoom-in-top-enter,
.zoom-in-top-leave-to {
    opacity: 0;
    transform: scaleY(0);
}
</style>
