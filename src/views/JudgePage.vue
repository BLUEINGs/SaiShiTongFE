<template>
    <div class="container">
        <!-- 比赛卡片列表 -->
        <div class="competition-management">
            <div class="competition-grid">
                <div v-for="competition in competitions" :key="competition.id" class="competition-card"
                    :class="{ 'active': activeCompetitionId === competition.id }">
                    <div class="card-header" @click="toggleCompetition(competition.id)">
                        <h3 class="competition-name">{{ competition.name }}</h3>
                        <div class="meta-info">
                            <span class="date">{{ formatDate(competition.date) }}</span>
                            <el-tag type="info">{{ competition.participants }}人参赛</el-tag>
                        </div>
                    </div>

                    <!-- 展开的选手列表 -->
                    <transition name="slide">
                        <div v-show="activeCompetitionId === competition.id" class="participants-list">
                            <div class="participants-container">
                                <div v-for="athlete in competition.athletes" :key="athlete.id" class="participant-item">
                                    <div class="athlete-info">
                                        <div class="avatar">
                                            <img :src="athlete.avatar">
                                        </div>
                                        <div class="details">
                                            <h4>{{ athlete.name }}</h4>
                                            <p>{{ athlete.class }}</p>
                                        </div>
                                    </div>
                                    <el-button v-if="isEditMode" type="primary" size="small"
                                        @click.stop="openScoreDialog(athlete)">
                                        {{ athlete.score ? '修改成绩' : '录入成绩' }}
                                    </el-button>
                                    <el-tag v-else type="success" v-show="athlete.score">
                                        成绩：{{ formatScore(athlete.score) }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <!-- 成绩录入对话框 -->
        <el-dialog :title="`${currentAthlete.name} 的成绩录入`" :visible.sync="scoreDialogVisible" width="90%"
            :fullscreen="isMobile">
            <el-form :model="scoreForm" :rules="scoreRules" ref="scoreForm">
                <el-form-item label="分钟" prop="minutes">
                    <el-input-number v-model="scoreForm.minutes" :min="0" :max="59" controls-position="right" />
                </el-form-item>

                <el-form-item label="秒钟" prop="seconds">
                    <el-input-number v-model="scoreForm.seconds" :min="0" :max="59" :precision="2"
                        controls-position="right" />
                </el-form-item>
            </el-form>

            <span slot="footer">
                <el-button @click="scoreDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitScore">确认提交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        isEditMode: Boolean
    },
    data() {
        return {
            activeCompetitionId: null,
            scoreDialogVisible: false,
            currentAthlete: {},
            scoreForm: {
                minutes: 0,
                seconds: 0
            },
            scoreRules: {
                minutes: [
                    { required: true, message: '请输入分钟数', trigger: 'blur' },
                    { type: 'number', min: 0, max: 59, message: '请输入0-59之间的数字' }
                ],
                seconds: [
                    { required: true, message: '请输入秒钟数', trigger: 'blur' },
                    { type: 'number', min: 0, max: 59.99, message: '请输入0-59.99之间的数字' }
                ]
            },
            competitions: [
                {
                    id: 1,
                    name: '男子100米预赛',
                    date: Date.now(),
                    participants: 32,
                    athletes: [
                        {
                            id: 1,
                            name: '张三',
                            class: '高三（1）班',
                            avatar: 'http://example.com/avatar1.jpg',
                            score: null
                        },
                        // 更多运动员数据...
                    ]
                }
            ]
        }
    },
    computed: {
        isMobile() {
            return window.innerWidth < 768
        }
    },
    methods: {
        toggleCompetition(id) {
            this.activeCompetitionId = this.activeCompetitionId === id ? null : id
        },
        openScoreDialog(athlete) {
            this.currentAthlete = athlete
            this.scoreForm = {
                minutes: Math.floor(athlete.score / 60) || 0,
                seconds: (athlete.score % 60).toFixed(2) || 0
            }
            this.scoreDialogVisible = true
        },
        submitScore() {
            this.$refs.scoreForm.validate(valid => {
                if (valid) {
                    const totalSeconds = this.scoreForm.minutes * 60 + this.scoreForm.seconds
                    this.currentAthlete.score = parseFloat(totalSeconds.toFixed(2))
                    this.scoreDialogVisible = false
                }
            })
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        },
        formatScore(seconds) {
            const mins = Math.floor(seconds / 60)
            const secs = (seconds % 60).toFixed(2)
            return `${mins}分${secs}秒`
        }
    }
}
</script>

<style lang="less" scoped>
.competition-management {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.competition-card {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    .card-header {
        padding: 16px;
        cursor: pointer;

        .competition-name {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #333;
        }

        .meta-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .date {
                color: #666;
                font-size: 14px;
            }
        }
    }
}

.participants-list {
    padding: 16px;
    background: #f8f9fa;

    .participant-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 8px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        .athlete-info {
            display: flex;
            align-items: center;
            flex: 1;

            .avatar {
                width: 40px;
                height: 40px;
                margin-right: 16px;

                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
            }

            .details {
                h4 {
                    margin: 0;
                    font-size: 14px;
                    color: #333;
                }

                p {
                    margin: 4px 0 0;
                    font-size: 12px;
                    color: #666;
                }
            }
        }
    }
}

/* 移动端适配 */
@media (max-width: 767px) {
    ::v-deep .el-dialog {
        .el-dialog__body {
            padding: 10px;
        }

        .el-form-item {
            margin-bottom: 12px;

            &__label {
                line-height: 1.5;
            }
        }

        .el-input-number {
            width: 100%;
        }
    }

    .participant-item {
        flex-wrap: wrap;

        .athlete-info {
            width: 100%;
            margin-bottom: 8px;
        }

        .el-button,
        .el-tag {
            width: 100%;
            margin-left: 0;
            text-align: center;
        }
    }
}

/* 保持原有过渡动画 */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
    max-height: 1000px;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>