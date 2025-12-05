<template>
    <div class="sport-meetings">
        <div class="content-wrapper">
            <div class="action-bar">
                <div class="filter-section">
                    <filter-bar v-model="filter" :options="filterOptions" @change="handleFilterChange" />
                </div>
                <div class="right" v-if="isEditMode">
                    <el-button type="primary" icon="el-icon-plus" @click="createMeeting">创建我的运动会</el-button>
                </div>
            </div>

            <div class="meetings-grid">
                <div v-for="meeting in filteredMeetings" :key="meeting.smId" class="meeting-card"
                    @click="goToDetail(meeting)">
                    <div class="meeting-cover">
                        <img :src="meeting.img || defaultImage" :alt="meeting.name">
                        <div class="meeting-status" :class="getStatusClass(meeting.status)">
                            {{ getStatusText(meeting.status) }}
                        </div>
                    </div>
                    <div class="meeting-info">
                        <h3>{{ meeting.name }}</h3>
                        <div class="meeting-stats">
                            <el-tag size="small">{{ meeting.schoolCount }}个学校</el-tag>
                            <el-tag size="small" type="success">{{ meeting.sportCount }}个项目</el-tag>
                            <el-tag size="small" type="warning">{{ meeting.playerCount }}名运动员</el-tag>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import FilterBar from '@/components/filter/FilterBar.vue'

export default {
    name: 'SportMeetings',
    components: {
        FilterBar
    },
    data() {
        return {
            isEditMode: true,
            filter: 0, // 默认显示全部
            meetings: [],
            defaultImage: 'default-meeting.jpg',
            filterOptions: [
                { value: 0, label: '全部' },
                { value: 1, label: '报名中' },
                { value: 2, label: '进行中' },
                { value: 3, label: '已结束' }
            ]
        }
    },
    computed: {
        filteredMeetings() {
            if (this.filter === 0) {
                return this.meetings;
            }
            return this.meetings.filter(m => m.status === this.filter)
        }
    },
    methods: {
        getStatusClass(status) {
            return {
                'status-ended': status === 3,
                'status-ongoing': status === 2,
                'status-enrolling': status === 1
            }
        },
        getStatusText(status) {
            const texts = {
                1: '报名中',
                2: '进行中',
                3: '已结束'
            }
            return texts[status] || '未知状态'
        },
        goToDetail(meeting) {
            this.$router.push({
                name: 'SportMeetingDetail',
                params: {
                    id: meeting.smId
                },
                props: {
                    fromList: true,
                    initialData: meeting
                }
            })
        },
        async fetchMeetings() {
            try {
                const res = await request({
                    url: '/getSportMeetings',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.meetings = res.data
                }
            } catch (error) {
                console.error('获取运动会列表失败:', error)
                this.$message.error('获取运动会列表失败')
            }
        },
        createMeeting() {
            this.$router.push('/create-meeting')
        },
        handleFilterChange(newFilter) {
            this.filter = newFilter;
        }
    },
    mounted() {
        this.fetchMeetings()
        // localStorage.getItem("userInfo")||{"userType":[1]}.userType.includes(5)?this.isEditMode=true:this.isEditMode=false
    }
}
</script>

<style lang="less" scoped>
.sport-meetings {
    padding: 20px;

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 16px;

        .filter-section {
            flex: 1;
            text-align: left; // 确保左对齐
        }

        .right {
            flex-shrink: 0;
        }

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 12px;
            // padding: 0 16px;
            // width: 100%;

            .filter-section {
                width: 100%;
            }

            .right {
                width: 100%;

                .el-button {
                    width: 100%;
                }
            }
        }
    }

    .meetings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .meeting-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .meeting-cover {
                position: relative;
                height: 200px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .meeting-status {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    color: white;
                    font-size: 12px;

                    &.status-ended {
                        background: #909399;
                    }

                    &.status-ongoing {
                        background: #67C23A;
                    }

                    &.status-enrolling {
                        background: #409EFF;
                    }
                }
            }

            .meeting-info {
                padding: 15px;

                h3 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }

                .meeting-stats {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
            }
        }
    }
}

.time-slots {
    .time-slot {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .slot-label {
            width: 50px;
        }

        .slot-separator {
            margin: 0 10px;
        }
    }
}

.time-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

@media (max-width: 768px) {
    .sport-meetings {
        padding: 10px;

        .content-wrapper {
            padding: 0 10px;
        }
    }
}
</style>
