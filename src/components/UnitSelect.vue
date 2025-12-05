<template>
    <div class="unit-select" :class="{ 'is-focused': isOpen }">
        <div class="input-wrapper">
            <input ref="input" type="text" v-model="inputValue" @focus="handleFocus" @blur="handleBlur"
                @input="handleInput" maxlength="4" :placeholder="placeholder">
            <template v-if="showDelete">
                <i class="el-icon-delete delete-icon" @click.stop="handleDelete"></i>
            </template>
            <template v-else>
                <i class="expand-icon" :class="{ 'is-open': isOpen }"></i>
            </template>
        </div>
        <transition name="dropdown">
            <div class="dropdown" v-show="isOpen">
                <div class="dropdown-content custom-scrollbar">
                    <div v-for="option in mergedOptions" :key="option" class="option"
                        @mousedown.prevent="selectOption(option)" :class="{ 'is-active': option === inputValue }">
                        {{ option }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'UnitSelect',
    props: {
        value: {
            type: String,
            default: ''
        },
        options: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String,
            default: '请选择'
        },
        showDelete: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputValue: this.value,
            isOpen: false
        }
    },
    computed: {
        mergedOptions() {
            const userInput = this.inputValue.trim()
            const allOptions = [...this.options]
            if (userInput && !allOptions.includes(userInput)) {
                allOptions.push(userInput)
            }
            return allOptions.filter(option =>
                option.toLowerCase().includes(this.inputValue.toLowerCase())
            )
        }
    },
    watch: {
        value(newVal) {
            this.inputValue = newVal
        }
    },
    methods: {
        handleFocus() {
            this.isOpen = true
        },
        handleBlur() {
            setTimeout(() => {
                this.isOpen = false
            }, 200)
        },
        handleInput() {
            this.$emit('input', this.inputValue)
            this.isOpen = true
        },
        selectOption(option) {
            this.inputValue = option
            this.$emit('input', option)
            this.isOpen = false
        },
        handleDelete() {
            this.$emit('delete')
        }
    }
}
</script>

<style scoped>
.unit-select {
    position: relative;
    width: 100px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    height: 28px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 24px 0 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.input-wrapper input:focus {
    border-color: #409EFF;
}

.expand-icon {
    position: absolute;
    right: 8px;
    width: 12px;
    height: 12px;
    transition: transform 0.3s;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23909399' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
}

.expand-icon.is-open {
    transform: rotate(180deg);
}

.dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #E4E7ED;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    z-index: 1000;
    max-height: 180px;
    overflow: hidden;
}

.dropdown-content {
    max-height: 180px;
    overflow-y: auto;
}

.option {
    padding: 4px 12px;
    cursor: pointer;
    font-size: 14px;
    height: 28px;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.option:hover {
    background: #F5F7FA;
}

.option.is-active {
    color: #409EFF;
    font-weight: bold;
    background: #F5F7FA;
}

/* 动画相关 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: transform 0.3s, opacity 0.3s;
    transform-origin: top;
}

.dropdown-enter,
.dropdown-leave-to {
    transform: scaleY(0);
    opacity: 0;
}

/* 自定义滚动条 */
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #909399 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 2px;
    opacity: 0.5;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #606266;
}

.delete-icon {
    position: absolute;
    right: 6px;
    font-size: 12px;
    color: #C0C4CC;
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s;
}

.delete-icon:hover {
    color: #F56C6C;
    transform: scale(1.1);
}
</style>
