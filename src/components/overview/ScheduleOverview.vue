<template>
    <div class="schedule-overview">
        <el-card>
            <div slot="header">
                <h3>赛程概况</h3>
                <div class="filter">
                    <el-radio-group v-model="timeFilter" size="small">
                        <el-radio-button label="today">今日赛程</el-radio-button>
                        <el-radio-button label="tomorrow">明日赛程</el-radio-button>
                        <el-radio-button label="all">全部赛程</el-radio-button>
                    </el-radio-group>
                </div>
            </div>

            <el-timeline>
                <el-timeline-item v-for="event in filteredSchedule" :key="event.id" :type="getEventType(event.status)"
                    :color="getEventColor(event.status)" :timestamp="formatTime(event)">
                    <el-card class="event-card">
                        <h4>{{ event.name }}</h4>
                        <p class="event-info">
                            <span>{{ getPhaseText(event.compType) }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>{{ event.venue || '待定' }}</span>
                        </p>
                        <p class="event-time" v-if="event.gameStartTime && event.gameEndTime">
                            {{ formatTimeRange(event.gameStartTime, event.gameEndTime) }}
                        </p>
                        <el-tag :type="getStatusType(event.status)" size="small">
                            {{ getStatusText(event.status) }}
                        </el-tag>
                    </el-card>
                </el-timeline-item>
            </el-timeline>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'ScheduleOverview',
    props: {
        schedule: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            timeFilter: 'today'
        }
    },
    computed: {
        filteredSchedule() {
            const today = new Date().setHours(0, 0, 0, 0)
            const tomorrow = today + 86400000

            return this.schedule.filter(event => {
                const eventDate = new Date(event.time).setHours(0, 0, 0, 0)
                switch (this.timeFilter) {
                    case 'today':
                        return eventDate === today
                    case 'tomorrow':
                        return eventDate === tomorrow
                    default:
                        return true
                }
            })
        }
    },
    methods: {
        formatTime(event) {
            if (!event.gameStartTime) return '时间待定';
            return new Date(event.gameStartTime).toLocaleDateString();
        },
        formatTimeRange(startTime, endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            return `${start.getHours()}:${String(start.getMinutes()).padStart(2, '0')} - ${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')}`;
        },
        getEventType(status) {
            return status === 'ongoing' ? 'primary' : ''
        },
        getEventColor(status) {
            const colors = {
                'pending': '#909399',
                'ongoing': '#409EFF',
                'finished': '#67C23A'
            }
            return colors[status] || '#909399'
        },
        getStatusType(status) {
            const types = {
                0: 'info',
                1: 'warning',
                2: 'success',
                3: 'warning',
                4: ''
            }
            return types[status] || 'info'
        },
        getStatusText(status) {
            const texts = {
                0: '未开始',
                1: '报名中',
                2: '进行中',
                3: '已评分',
                4: '已晋级/决胜负'
            }
            return texts[status] || '未知状态'
        },
        getPhaseText(compType) {
            const texts = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            return texts[compType] || '未知阶段';
        }
    }
}
</script>

<style lang="less" scoped>
.schedule-overview {
    ::v-deep .el-card__header {
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 16px;
        }
    }

    .event-card {
        h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }

        .event-info {
            color: #909399;
            font-size: 13px;
            margin: 10px 0;
        }

        .event-time {
            color: #409EFF;
            font-size: 13px;
            margin: 8px 0;
        }
    }

    ::v-deep .el-timeline-item__wrapper {
        padding-left: 15px;
    }
}
</style>
