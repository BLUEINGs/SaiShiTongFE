<template>
    <div class="schedule-overview">
        <div class="panel-header">
            <h3>赛事动态</h3>
        </div>
        <div class="schedule-content" v-loading="loading">
            <!-- 已结束的比赛 -->
            <div class="passed-events" v-if="passedEvents.length > 0">
                <div class="section-title">
                    <i class="el-icon-check"></i>
                    已结束
                </div>
                <div class="event-cards">
                    <div v-for="event in passedEvents" :key="event.spId" class="event-card passed">
                        <div class="event-info">
                            <div class="event-name">{{ formatEventName(event) }}</div>
                            <div class="event-meta">
                                <span class="venue"><i class="el-icon-location"></i>{{ event.venue }}</span>
                                <span class="time"><i class="el-icon-time"></i>{{ formatEventTime(event.gameStartTime,
                                    event.gameEndTime) }}</span>
                            </div>
                        </div>
                        <el-tag type="success">已结束</el-tag>
                    </div>
                </div>
            </div>

            <!-- 正在进行的比赛 -->
            <div class="ongoing-events" v-if="ongoingEvents.length > 0">
                <div class="section-title">
                    <i class="el-icon-video-play"></i>
                    正在进行
                </div>
                <div class="event-cards">
                    <div v-for="event in ongoingEvents" :key="event.spId" class="event-card ongoing">
                        <div class="event-info">
                            <div class="event-name">{{ formatEventName(event) }}</div>
                            <div class="event-meta">
                                <span class="venue"><i class="el-icon-location"></i>{{ event.venue }}</span>
                                <span class="time"><i class="el-icon-time"></i>{{ formatEventTime(event.gameStartTime,
                                    event.gameEndTime) }}</span>
                            </div>
                        </div>
                        <el-tag type="warning">进行中</el-tag>
                    </div>
                </div>
            </div>

            <!-- 即将开始的比赛 -->
            <div class="upcoming-events" v-if="upcomingEvents.length > 0">
                <div class="section-title">
                    <i class="el-icon-timer"></i>
                    即将开始
                </div>
                <div class="event-cards">
                    <div v-for="event in upcomingEvents" :key="event.spId" class="event-card upcoming">
                        <div class="event-info">
                            <div class="event-name">{{ formatEventName(event) }}</div>
                            <div class="event-meta">
                                <span class="venue"><i class="el-icon-location"></i>{{ event.venue }}</span>
                                <span class="time"><i class="el-icon-time"></i>{{ formatEventTime(event.gameStartTime,
                                    event.gameEndTime) }}</span>
                            </div>
                        </div>
                        <div class="countdown">{{ getCountdown(event.gameStartTime) }}</div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <el-empty
                v-if="!loading && passedEvents.length === 0 && ongoingEvents.length === 0 && upcomingEvents.length === 0"
                class="custom-empty" description="今日暂无赛事">
            </el-empty>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import { formatEventName } from '@/utils/formatters'
import { formatDate } from '@/utils/date'

export default {
    name: 'ScheduleOverview',
    data() {
        return {
            loading: false,
            passedEvents: [],
            ongoingEvents: [],
            upcomingEvents: [],
            timer: null
        }
    },
    methods: {
        formatEventName,
        formatEventTime(startTime, endTime) {
            if (!startTime) return '--:--'
            const start = new Date(startTime)
            const end = endTime ? new Date(endTime) : null
            if (!end) return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
            return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
        },
        formatTime(time) {
            return formatDate(new Date(time), 'HH:mm')
        },
        getCountdown(startTime) {
            if (!startTime) return '时间待定'
            const now = new Date()
            const start = new Date(startTime)
            const diff = start - now

            if (diff <= 0) return '即将开始'

            const minutes = Math.floor(diff / 1000 / 60)
            if (minutes < 60) return `${minutes}分钟后`

            const hours = Math.floor(minutes / 60)
            return `${hours}小时后`
        },
        async fetchSchedule() {
            this.loading = true
            try {
                const res = await request({
                    url: '/dashboard/schedule',
                    method: 'get'
                })

                if (res.code === 1) {
                    this.passedEvents = res.data.passed || []
                    this.ongoingEvents = res.data.ongoing || []
                    this.upcomingEvents = res.data.upcoming || []
                }
            } catch (error) {
                console.error('获取赛程失败:', error)
            } finally {
                this.loading = false
            }
        }
    },
    created() {
        this.fetchSchedule()
        // 每分钟更新一次
        this.timer = setInterval(this.fetchSchedule, 60000)
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    }
}
</script>

<style lang="less" scoped>
.schedule-overview {
    padding: 20px;

    .panel-header {
        margin-bottom: 20px;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }
    }

    .section-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        i {
            margin-right: 4px;
        }
    }

    .event-cards {
        .event-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 12px;

            &.ongoing {
                background: #fef9e7;
            }

            &.passed {
                background: #f0f9eb;
            }

            .event-info {
                .event-name {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .event-meta {
                    font-size: 13px;
                    color: #909399;
                    display: flex;
                    gap: 16px;

                    span {
                        display: flex;
                        align-items: center;

                        i {
                            margin-right: 4px;
                        }
                    }
                }
            }

            .countdown {
                color: #409EFF;
                font-size: 14px;
            }
        }
    }

    .custom-empty {
        padding: 24px 0;

        // 修改 Element UI 默认的空状态图片大小
        :deep(.el-empty__image) {
            width: 60px;
            height: 60px;
        }

        // 修改描述文字大小和颜色
        :deep(.el-empty__description) {
            margin-top: 8px;
            font-size: 14px;
            color: #909399;
        }
    }
}
</style>
