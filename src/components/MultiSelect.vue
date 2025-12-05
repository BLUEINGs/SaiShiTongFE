<template>
    <div class="custom-multi-select" v-click-outside="closeDropdown">
        <!-- 选择框区域 -->
        <div class="select-box" @click="toggleDropdown">
            <div class="selected-items">
                <template v-if="selectedItems.length">
                    <div class="selected-tags">
                        <el-tag v-for="item in selectedItems" :key="item.id" size="small" :closable="canRemove(item)"
                            @close.stop="removeItem(item)">
                            {{ item.name }}
                            <span class="comp-type-tag" :class="getCompTypeClass(item.compType)">
                                {{ getCompTypeText(item.compType) }}
                            </span>
                        </el-tag>
                    </div>
                </template>
                <span v-else class="placeholder">{{ placeholder }}</span>
            </div>
            <i :class="['el-icon-arrow-down', { 'is-reverse': isOpen }]"></i>
        </div>

        <!-- 下拉选项区域 -->
        <transition name="zoom-in-top">
            <div v-show="isOpen" class="select-dropdown">
                <div class="select-dropdown__list">
                    <!-- 只渲染未被隐藏的项目 -->
                    <div v-for="item in visibleOptions" :key="item.id" class="select-dropdown__item" :class="{
                        'is-selected': isSelected(item),
                        'is-disabled': isDisabled(item)
                    }" @click.stop="handleSelect(item)">
                        {{ item.name }}
                        <span class="comp-type-tag" :class="getCompTypeClass(item.compType)">
                            {{ getCompTypeText(item.compType) }}
                        </span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'MultiSelect',
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
        },
        maxLimit: { // 添加最大限制
            type: Number,
            default: Infinity
        }
    },
    data() {
        return {
            isOpen: false,
            selectedItems: []
        }
    },
    created() {
        // 初始化选中项
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
    computed: {
        visibleOptions() {
            // 只返回未被隐藏的选项
            return this.options.filter(item => !item.hidden)
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen
        },
        closeDropdown() {
            this.isOpen = false
        },
        isSelected(item) {
            return this.selectedItems.some(selected => selected.id === item.id)
        },
        handleSelect(item) {
            if (this.isDisabled(item)) return

            const index = this.selectedItems.findIndex(selected => selected.id === item.id)
            if (index === -1) {
                // 添加前检查限制
                if (!this.canAdd(item)) return
                // 保存完整的项目信息，包括赛段信息
                this.selectedItems.push(item)
            } else {
                // 移除前检查是否允许
                if (!this.canRemove(item)) {
                    this.$message.error('当前比赛已截至报名，禁止退赛！')
                    return
                }
                this.selectedItems.splice(index, 1)
            }
            this.$emit('input', this.selectedItems)
            this.$emit('change', this.selectedItems)
        },
        removeItem(item) {
            if (!this.canRemove(item)) {
                this.$message.error('当前比赛已截止报名，禁止退赛！')
                return
            }
            const index = this.selectedItems.findIndex(selected => selected.id === item.id)
            if (index !== -1) {
                this.selectedItems.splice(index, 1)
                this.$emit('input', this.selectedItems)
                this.$emit('change', this.selectedItems)
            }
        },
        getCompTypeText(type) {
            // 确保type是数字
            const numType = Number(type)
            const types = {
                1: '(预赛)',
                2: '(半决赛)',
                3: '(决赛)'
            }
            return types[numType] || ''
        },
        getCompTypeClass(type) {
            // 确保type是数字
            const numType = Number(type)
            return `type-${numType}`
        },
        canAdd(newItem) {
            // 获取当前已选的不同 mainSpId 的数量
            const currentMainSpIds = new Set(
                this.selectedItems.map(item => item.mainSpId)
            )
            // 如果新项目的 mainSpId 已存在，不计入总数
            if (!currentMainSpIds.has(newItem.mainSpId)) {
                if (currentMainSpIds.size >= this.maxLimit) {
                    this.$message.error(`每名运动员最多可报${this.maxLimit}个项目`)
                    return false
                }
            }
            return true
        },
        canRemove(item) {
            // 状态<2的项目才能移除
            return item.status < 2
        },
        isDisabled(item) {
            // 如果状态>=2或者性别不匹配，则禁用
            return item.disabled || item.status >= 2
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
        z-index: 100;

        &__list {
            padding: 6px 0;
            overflow-y: auto;
            max-height: 240px;
        }

        &__item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 12px;
            min-height: 34px;
            line-height: 1.2; // 调整行高以适应长文本
            white-space: normal; // 允许文本换行
            height: 34px;
            line-height: 34px;
            font-size: 14px;
            color: #606266;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &:hover:not(.is-disabled) {
                background-color: #f5f7fa;
            }

            &.is-selected {
                color: #409eff;
                font-weight: bold;
                background-color: #f5f7fa;
            }

            &.is-disabled {
                color: #c0c4cc;
                cursor: not-allowed;
                background-color: #f5f7fa;

                .comp-type-tag {
                    opacity: 0.6;
                }

                &:hover {
                    background-color: #f5f7fa;
                }
            }

            .comp-type-tag {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: normal;

                &.type-1 {
                    background: #e1f3d8;
                    color: #67c23a;
                }

                &.type-2 {
                    background: #fdf6ec;
                    color: #e6a23c;
                }

                &.type-3 {
                    background: #f0f9eb;
                    color: #409eff;
                }
            }
        }
    }
}

// 动画效果
.zoom-in-top-enter-active,
.zoom-in-top-leave-active {
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.zoom-in-top-enter,
.zoom-in-top-leave-to {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: center top;
}
</style>
