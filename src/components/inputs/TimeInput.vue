<template>
    <div class="time-input" ref="container">
        <div class="time-select" tabindex="0" @click="handleFocus">
            <input readonly :value="displayValue" :placeholder="placeholder" />
            <i class="el-icon-time"></i>
        </div>
        <bottom-sheet v-model="showPicker" :target="$refs.container">
            <div class="time-picker-layout">
                <div class="time-columns">
                    <div class="column hours">
                        <div v-for="h in 24" :key="h" class="time-option" :class="{ active: selectedHour === (h - 1) }"
                            @click="selectHour(h - 1)">
                            {{ String(h - 1).padStart(2, '0') }}
                        </div>
                    </div>
                    <div class="column minutes">
                        <div v-for="m in 60" :key="m" class="time-option"
                            :class="{ active: selectedMinute === (m - 1) }" @click="selectMinute(m - 1)">
                            {{ String(m - 1).padStart(2, '0') }}
                        </div>
                    </div>
                </div>
                <div class="picker-footer">
                    <button type="button" class="btn cancel-btn" @click="showPicker = false">取消</button>
                    <button type="button" class="btn confirm-btn" @click="confirmSelection">确定</button>
                </div>
            </div>
        </bottom-sheet>
    </div>
</template>

<script>
import { EventBus, PICKER_EVENTS } from '@/utils/eventBus'
import BottomSheet from '@/components/base/BottomSheet.vue'

export default {
    name: 'TimeInput',
    components: { BottomSheet },
    props: {
        label: String,
        value: String,
        placeholder: String,
        showLabel: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            id: `time-${Math.random().toString(36).substr(2, 9)}`,
            isMobile: window.innerWidth <= 768,
            showPicker: false,
            selectedHour: 0,
            selectedMinute: 0,
            pickerStyle: {},
            componentId: `time-${Date.now()}`
        }
    },
    computed: {
        displayValue() {
            if (!this.value) return ''
            return this.value
        }
    },
    methods: {
        selectHour(hour) {
            this.selectedHour = hour
        },
        selectMinute(minute) {
            this.selectedMinute = minute
        },
        handleFocus() {
            this.showPicker = !this.showPicker
        },
        confirmSelection() {
            const time = `${String(this.selectedHour).padStart(2, '0')}:${String(this.selectedMinute).padStart(2, '0')}`
            this.$emit('input', time)
            this.showPicker = false
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(val) {
                if (val) {
                    const [hours, minutes] = val.split(':')
                    this.selectedHour = parseInt(hours)
                    this.selectedMinute = parseInt(minutes)
                }
            }
        }
    },
    created() {
        EventBus.$on(PICKER_EVENTS.PICKER_OPENED, (id) => {
            if (id !== this.componentId) {
                this.showPicker = false
            }
        })
    },
    mounted() {
        document.addEventListener('click', (e) => {
            if (!this.$el.contains(e.target)) {
                this.showPicker = false
            }
        })
    },
    beforeDestroy() {
        EventBus.$off(PICKER_EVENTS.PICKER_OPENED)
        document.removeEventListener('click', this.handleOutsideClick)
    }
}
</script>

<style lang="less" scoped>
.time-input {
    position: relative;
    width: 100%;
}

.time-select {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;

    input {
        box-sizing: border-box;
        height: 32px;
        padding: 4px 12px;
        padding-right: 30px;
        font-size: 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        background: #fff;
        transition: border-color 0.2s;
        outline: none;

        &:focus {
            border-color: #409EFF;
        }
    }

    i {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #909399;
        pointer-events: none;
    }
}

.time-picker-layout {
    padding: 16px;
    // min-width: 200px;

    .time-columns {
        display: flex;
        height: 200px;

        .column {
            width: 80px;
            overflow-y: auto;
            border-right: 1px solid #eee;

            &::-webkit-scrollbar {
                width: 4px;
            }

            &::-webkit-scrollbar-track {
                background: #f5f7fa;
            }

            &::-webkit-scrollbar-thumb {
                background: #dcdfe6;
                border-radius: 2px;
            }

            &:last-child {
                border-right: none;
            }

            .time-option {
                padding: 8px 16px;
                text-align: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;

                &:hover {
                    background: #ecf5ff;
                }

                &.active {
                    color: #409EFF;
                    background: #ecf5ff;
                }
            }
        }
    }

    .picker-footer {
        display: flex;
        justify-content: flex-end;
        padding: 8px;
        gap: 8px;
        border-top: 1px solid #EBEEF5;

        .btn {
            font: inherit;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;

            &:hover {
                opacity: 0.8;
            }

            &.cancel-btn {
                color: #606266;
                background: #fff;
                border: 1px solid #dcdfe6;

                &:hover {
                    color: #409EFF;
                    border-color: #c6e2ff;
                    background-color: #ecf5ff;
                }
            }

            &.confirm-btn {
                color: #fff;
                background: #409EFF;

                &:hover {
                    background: #66b1ff;
                }
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@media (max-width: 768px) {
    .time-picker-layout {
        border-radius: 16px 16px 0 0;
    }
}
</style>
