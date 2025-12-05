<template>
    <div class="datetime-input" ref="container">
        <div class="datetime-select" tabindex="0" @click="handleFocus">
            <input readonly :value="displayValue" :placeholder="placeholder" />
            <i class="el-icon-date"></i>
        </div>
        <bottom-sheet v-model="showPicker" :target="$refs.container" :style="{ zIndex: 10000 }">
            <div class="datetime-picker-layout">
                <div class="calendar-section">
                    <div class="calendar-header">
                        <button @click="changeMonth(-1)"><i class="el-icon-arrow-left"></i></button>
                        <span>{{ currentYearMonth }}</span>
                        <button @click="changeMonth(1)"><i class="el-icon-arrow-right"></i></button>
                    </div>
                    <div class="weekdays">
                        <span v-for="day in weekDays" :key="day">{{ day }}</span>
                    </div>
                    <div class="days-grid">
                        <div v-for="(day, index) in daysArray" :key="index" class="day-cell" :class="getDayClass(day)"
                            @click="selectDay(day)">
                            {{ day.date }}
                        </div>
                    </div>
                </div>
                <div class="picker-right-section">
                    <div class="time-section">
                        <div class="time-columns">
                            <div class="column hours">
                                <div v-for="h in 24" :key="h" class="time-option"
                                    :class="{ active: selectedHour === h - 1 }" @click="selectedHour = h - 1">
                                    {{ String(h - 1).padStart(2, '0') }}
                                </div>
                            </div>
                            <div class="column minutes">
                                <div v-for="m in 60" :key="m" class="time-option"
                                    :class="{ active: selectedMinute === m - 1 }" @click="selectedMinute = m - 1">
                                    {{ String(m - 1).padStart(2, '0') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="picker-footer">
                        <button type="button" class="btn cancel-btn" @click="showPicker = false">取消</button>
                        <button type="button" class="btn now-btn" @click="setToNow">此刻</button>
                        <button type="button" class="btn confirm-btn" @click="confirmSelection">确定</button>
                    </div>
                </div>
            </div>
        </bottom-sheet>
    </div>
</template>

<script>
import { EventBus, PICKER_EVENTS } from '@/utils/eventBus'
import BottomSheet from '@/components/base/BottomSheet.vue'

export default {
    name: 'DateTimeInput',
    components: { BottomSheet },
    props: {
        label: String,
        value: [String, Number],
        placeholder: String,
        showLabel: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            id: `datetime-${Math.random().toString(36).substr(2, 9)}`,
            isMobile: window.innerWidth <= 768,
            currentMonth: new Date(),
            weekDays: ['日', '一', '二', '三', '四', '五', '六'],
            mobileDate: '',
            showPicker: false,
            selectedDate: null,
            selectedHour: 0,
            selectedMinute: 0,
            componentId: `datetime-${Date.now()}`,
            showTimeSelect: false
        }
    },
    computed: {
        formattedValue() {
            if (!this.value) return ''
            const date = new Date(Number(this.value))
            return date.toISOString().slice(0, 16)
        },
        currentYearMonth() {
            return new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: 'long'
            }).format(this.currentMonth)
        },
        daysArray() {
            const year = this.currentMonth.getFullYear()
            const month = this.currentMonth.getMonth()
            const firstDay = new Date(year, month, 1)
            const lastDay = new Date(year, month + 1, 0)

            const days = []
            for (let i = 0; i < firstDay.getDay(); i++) {
                const prevDate = new Date(year, month, -i)
                days.unshift({
                    date: prevDate.getDate(),
                    fullDate: prevDate,
                    isCurrentMonth: false
                })
            }

            for (let i = 1; i <= lastDay.getDate(); i++) {
                const currentDate = new Date(year, month, i)
                days.push({
                    date: i,
                    fullDate: currentDate,
                    isCurrentMonth: true
                })
            }

            const remainingDays = 42 - days.length
            for (let i = 1; i <= remainingDays; i++) {
                const nextDate = new Date(year, month + 1, i)
                days.push({
                    date: i,
                    fullDate: nextDate,
                    isCurrentMonth: false
                })
            }

            return days
        },
        displayValue() {
            if (!this.selectedDate) return ''
            const date = new Date(this.selectedDate)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(this.selectedHour).padStart(2, '0')}:${String(this.selectedMinute).padStart(2, '0')}`
        },
        timeString() {
            return `${String(this.selectedHour).padStart(2, '0')}:${String(this.selectedMinute).padStart(2, '0')}`
        }
    },
    watch: {
        showPicker(val) {
            if (this.isMobile) {
                this.showPicker = val
            }
        }
        ,
        // 当父组件通过 v-model 改变 value 时，同步到内部选择
        value: {
            immediate: true,
            handler(v) {
                if (!v) {
                    // 如果没有值，不自动选择（保留现有内部状态）
                    return
                }
                const d = new Date(Number(v))
                if (isNaN(d.getTime())) return
                // 如果 picker 正在打开并且用户正在编辑，我们避免打断
                if (this.showPicker) return
                this.selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                this.selectedHour = d.getHours()
                this.selectedMinute = d.getMinutes()
            }
        }
    },
    methods: {
        handleDocumentClick(e) {
            if (!this.$el.contains(e.target)) {
                this.showPicker = false
            }
        },
        handleInput(event) {
            const timestamp = new Date(event.target.value).getTime()
            this.$emit('input', timestamp)
        },
        changeMonth(delta) {
            this.currentMonth = new Date(
                this.currentMonth.getFullYear(),
                this.currentMonth.getMonth() + delta,
                1
            )
        },
        selectDay(day) {
            this.selectedDate = day.fullDate
        },
        getDayClass(day) {
            return {
                'other-month': !day.isCurrentMonth,
                'selected': this.selectedDate &&
                    day.fullDate.toDateString() === this.selectedDate.toDateString()
            }
        },
        handleFocus() {
            const willOpen = !this.showPicker
            this.showPicker = willOpen
            if (willOpen) {
                // 通知其他 picker 关闭
                EventBus.$emit(PICKER_EVENTS.PICKER_OPENED, this.componentId)
                // 初始化为当前值或当前时间
                this.initSelectionFromValueOrNow()
            }
        },
        confirmSelection() {
            if (!this.selectedDate) return
            const dt = new Date(this.selectedDate)
            dt.setHours(this.selectedHour)
            dt.setMinutes(this.selectedMinute)
            dt.setSeconds(0)
            dt.setMilliseconds(0)
            this.$emit('input', dt.getTime())
            this.showPicker = false
        },
        setToNow() {
            const now = new Date()
            this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            this.selectedHour = now.getHours()
            this.selectedMinute = now.getMinutes()
            // 立即将“此刻”写回 v-model，便于上层立即使用（用户期望默认/此刻同步）
            const dt = new Date(this.selectedDate)
            dt.setHours(this.selectedHour)
            dt.setMinutes(this.selectedMinute)
            dt.setSeconds(0)
            dt.setMilliseconds(0)
            this.$emit('input', dt.getTime())
        },
        initSelectionFromValueOrNow() {
            if (this.value) {
                const d = new Date(Number(this.value))
                this.selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                this.selectedHour = d.getHours()
                this.selectedMinute = d.getMinutes()
            } else {
                this.setToNow()
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
        document.addEventListener('click', this.handleDocumentClick)
    },
    beforeDestroy() {
        EventBus.$off(PICKER_EVENTS.PICKER_OPENED)
        document.removeEventListener('click', this.handleDocumentClick)
    }
}
</script>

<style lang="less">
input {
    outline: none;
}

.datetime-input {
    position: relative;
    width: 100%;
}

.datetime-select {
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

.datetime-picker-layout {
    display: flex;
    gap: 16px;
    padding: 16px;
    min-height: 320px;

    @media (max-width: 768px) {
        flex-direction: column;
        min-height: auto;
    }

    .calendar-section {
        flex: 1;
        min-width: 280px;

        .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;

            button {
                border: none;
                background: none;
                padding: 4px 8px;
                cursor: pointer;
                color: #606266;

                &:hover {
                    color: #409EFF;
                }
            }
        }

        .weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            border-bottom: 1px solid #EBEEF5;
            padding: 8px 0;

            span {
                color: #606266;
                font-size: 14px;
            }
        }

        .days-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            padding: 8px 0;

            .day-cell {
                text-align: center;
                padding: 6px;
                cursor: pointer;
                border-radius: 4px;

                &:hover {
                    color: #409EFF;
                    background-color: #ecf5ff;
                }

                &.other-month {
                    color: #909399;
                }

                &.selected {
                    background-color: #409EFF;
                    color: white;
                }

                &.today {
                    color: #409EFF;
                    font-weight: bold;
                }
            }
        }
    }

    .picker-right-section {
        display: flex;
        flex-direction: column;
        width: 160px;

        @media (max-width: 768px) {
            width: 100%;
        }

        .time-section {
            flex: 1;
            margin-bottom: 12px;

            .time-columns {
                display: flex;
                height: 240px;
                border: 1px solid #EBEEF5;
                border-radius: 4px;

                .column {
                    flex: 1;
                    overflow-y: auto;

                    &:first-child {
                        border-right: 1px solid #EBEEF5;
                    }

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

                    .time-option {
                        padding: 8px 0;
                        text-align: center;
                        font-size: 14px;
                        cursor: pointer;
                        min-width: 60px;

                        &:hover {
                            background-color: #ecf5ff;
                        }

                        &.active {
                            color: #409EFF;
                            background-color: #ecf5ff;
                        }
                    }
                }
            }
        }

        .picker-footer {
            display: flex;
            gap: 8px;
            justify-content: flex-end;

            .btn {
                padding: 7px 16px;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
                border: none;

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

                &.now-btn {
                    color: #fff;
                    background: #2d8cf0;
                    border: none;

                    &:hover {
                        background: #3aa0ff;
                    }
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

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-out;
    max-height: 300px;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
}

@media (max-width: 768px) {
    .datetime-picker-panel {
        display: none; // 移动端使用BottomSheet
    }
}
</style>
