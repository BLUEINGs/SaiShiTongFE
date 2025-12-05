<template>
    <div class="judge-group-card" :class="{ 'is-active': isActive }" v-bind="$attrs">
        <!-- 卡片头部 -->
        <div class="card-header" @click="$emit('toggle')">
            <div class="title">
                <h3>{{ groupData.name }}</h3>
                <div class="card-info">
                    <div class="info-row">
                        <el-tag size="small" :type="statusTagType">{{ currentEvent.phase }}</el-tag>
                        <el-tag size="small" :type="statusType">{{ statusText }}</el-tag>
                    </div>
                    <div class="info-row competition-time">
                        <i class="el-icon-time"></i>
                        <span class="time-label">比赛时间：</span>
                        <span class="time-value">
                            {{ formatDateTime(currentEvent.compTime[0]) }} 至
                            {{ formatDateTime(currentEvent.compTime[1]) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 卡片展开内容 -->
        <transition name="expand">
            <div v-show="isActive" class="card-content">
                <!-- 评分列表 -->
                <div class="athletes-list">
                    <div v-for="player in sortedPlayers" :key="player.id" class="athlete-item"
                        :class="{ 'is-scored': player.score !== null, 'current-user': isCurrentUser(player.id) }">
                        <div class="athlete-info">
                            <el-avatar :src="player.avatar" :size="48">
                                {{ player.name.charAt(0) }}
                            </el-avatar>
                            <div class="athlete-details">
                                <div class="name">{{ player.name }}</div>
                                <div class="meta">
                                    <span>编号：{{ player.number }}</span>
                                    <span>班级：{{ player.class }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="score-section">
                            <template v-if="isEditMode">
                                <div class="score-inputs">
                                    <!-- 成绩和分数输入组 -->
                                    <div class="input-container" v-if="editingPlayer === player.id">
                                        <div class="input-fields">
                                            <!-- 成绩输入 -->
                                            <div class="score-input-group">
                                                <el-input v-model="scoreInputs[player.id].result" placeholder="请输入成绩"
                                                    size="small" clearable :ref="`scoreInput_${player.id}`"
                                                    @keyup.enter.native="moveToNext(player.id)"
                                                    @keyup.tab.native="moveToNext(player.id)" style="width: 120px">
                                                </el-input>
                                            </div>
                                            <!-- 分数输入 -->
                                            <div class="points-input-group">
                                                <el-input-number v-model="scoreInputs[player.id].points" :precision="2"
                                                    :step="0.1" :min="0" size="small"
                                                    :disabled="scoreInputs[player.id].autoCalculate"
                                                    style="width: 160px" placeholder="分数">
                                                </el-input-number>
                                            </div>
                                        </div>
                                        <!-- 自动计算开关 -->
                                        <div class="calc-control">
                                            <el-checkbox v-model="scoreInputs[player.id].autoCalculate"
                                                @change="handleAutoCalculateChange(player.id)">
                                                根据成绩自动计算分数
                                            </el-checkbox>
                                        </div>
                                        <!-- 操作按钮 -->
                                        <div class="action-buttons">
                                            <el-button-group>
                                                <el-button type="primary" size="mini"
                                                    @click="handleScoreSubmit(player.id)">
                                                    保存并继续 (Enter/Tab)
                                                </el-button>
                                                <el-button type="info" size="mini" @click="cancelEdit(player.id)">
                                                    取消
                                                </el-button>
                                            </el-button-group>
                                        </div>
                                    </div>
                                    <!-- 显示状态 -->
                                    <div v-else class="score-display clickable" @click="startEdit(player.id)">
                                        <div class="display-content">
                                            <span class="result">{{ player.score || '点击录入成绩' }}</span>
                                            <span class="points" v-if="player.points">{{ player.points }}分</span>
                                        </div>
                                        <i class="el-icon-edit"></i>
                                    </div>
                                </div>
                            </template>
                            <div v-else class="score-display" :class="{ 'no-score': !player.score }">
                                <span class="result">{{ player.score || '暂无成绩' }}</span>
                                <span v-if="player.points !== null && player.points !== undefined" class="points">
                                    ({{ player.points }}分)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'JudgeGroupCard',
    props: {
        groupData: {
            type: Object,
            required: true
        },
        isActive: Boolean,
        isEditMode: Boolean,
        pid: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            scoreInputs: {},
            editingPlayer: null
        }
    },
    computed: {
        currentEvent() {
            return this.groupData.currentEvent || {}
        },
        statusType() {
            const map = {
                'pending': 'warning',
                'ongoing': 'primary',
                'finished': 'success'
            }
            return map[this.currentEvent.status] || 'info'
        },
        statusText() {
            const map = {
                'pending': '待评分',
                'ongoing': '评分中',
                'finished': '已完成'
            }
            return map[this.currentEvent.status] || '未知状态'
        },
        statusTagType() {
            const map = {
                1: 'warning', // 预赛
                2: 'primary', // 半决赛
                3: 'success'  // 决赛
            }
            return map[this.currentEvent.type] || 'info'
        },
        sortedPlayers() {
            if (!this.currentEvent.players) return []
            return [...this.currentEvent.players].sort((a, b) => {
                // 如果有pid，将当前用户置顶
                if (this.pid) {
                    if (a.id === this.pid) return -1
                    if (b.id === this.pid) return 1
                }
                return 0
            })
        }
    },
    methods: {
        formatDateTime(timestamp) {
            if (!timestamp) return '待定'
            const date = new Date(timestamp)
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        },
        handleScoreChange(playerId, score) {
            this.$emit('score-change', {
                groupId: this.groupData.id,
                playerId,
                score
            })
        },
        enableEdit(playerId) {
            this.startEdit(playerId)
        },
        startEdit(playerId) {
            const player = this.currentEvent.players.find(p => p.id === playerId)
            if (player) {
                this.$set(this.scoreInputs, playerId, {
                    result: player.score || '',
                    points: player.points !== undefined ? player.points : null,
                    autoCalculate: true // 默认开启自动计算
                })
                this.editingPlayer = playerId

                // 使用动态 ref 名称聚焦到对应的输入框
                this.$nextTick(() => {
                    const inputRef = this.$refs[`scoreInput_${playerId}`]
                    if (inputRef && inputRef[0]) {
                        inputRef[0].focus()
                    }
                })
            }
        },

        moveToNext(currentPlayerId) {
            // 保存当前成绩
            this.handleScoreSubmit(currentPlayerId)

            // 找到下一个运动员
            const players = this.currentEvent.players
            const currentIndex = players.findIndex(p => p.id === currentPlayerId)
            const nextPlayer = players[currentIndex + 1]

            // 如果有下一个运动员，自动开始编辑
            if (nextPlayer) {
                this.$nextTick(() => {
                    this.startEdit(nextPlayer.id)
                })
            }
        },

        cancelEdit(playerId) {
            this.editingPlayer = null
            this.$delete(this.scoreInputs, playerId)
        },

        handleScoreSubmit(playerId) {
            if (this.scoreInputs[playerId]?.result) {
                const { result, points, autoCalculate } = this.scoreInputs[playerId]
                // 如果开启了自动计算，重新计算一次分数
                const finalPoints = autoCalculate ? this.calculatePoints(result) : points

                this.$emit('score-change', {
                    groupId: this.groupData.id,
                    playerId,
                    score: result,
                    points: finalPoints
                })
                this.editingPlayer = null
            }
        },

        handleAutoCalculateChange(playerId) {
            const inputs = this.scoreInputs[playerId]
            if (inputs.autoCalculate && inputs.result) {
                // TODO: 根据成绩计算分数的逻辑
                // 示例：可以根据不同类型的比赛设置不同的计算规则
                // this.calculatePoints(inputs.result, this.groupData.type)
                inputs.points = this.calculatePoints(inputs.result)
            }
        },

        calculatePoints(result) {
            result
            // TODO: 在这里实现具体的计算逻辑
            // 示例：暂时返回0，等待实际计算逻辑的实现
            return 0
        },

        isCurrentUser(playerId) {
            return this.pid && playerId === this.pid
        }
    }
}
</script>

<style lang="less" scoped>
.judge-group-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &.is-active {
        grid-column: 1 / -1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-header {
        padding: 16px;
        cursor: pointer;

        .title {
            h3 {
                margin: 0 0 8px;
                font-size: 16px;
            }

            .card-info {
                .info-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    margin-bottom: 8px;

                    &.competition-time {
                        font-size: 13px;
                        color: #606266;
                    }
                }
            }
        }
    }

    .card-content {
        padding: 16px;
        border-top: 1px solid #eee;

        .athletes-list {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .athlete-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f5f7fa;
                border-radius: 8px;
                transition: all 0.3s ease;

                &:hover {
                    background: #eef1f6;
                }

                &.is-scored {
                    background: #f0f9eb;
                }

                &.current-user {
                    background-color: #ecf5ff !important;
                    border: 1px solid #409EFF;
                }

                .athlete-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .athlete-details {
                        .name {
                            font-weight: bold;
                            margin-bottom: 4px;
                        }

                        .meta {
                            font-size: 12px;
                            color: #606266;

                            span {
                                margin-right: 12px;
                            }
                        }
                    }
                }

                .score-section {
                    .score-inputs {
                        display: flex;
                        gap: 16px;
                        align-items: center;

                        .input-container {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            padding: 12px;
                            background: #f8f9fa;
                            border-radius: 4px;

                            .input-fields {
                                display: flex;
                                gap: 16px;
                                align-items: center;
                                flex-wrap: wrap; // 允许在窄屏上换行
                            }

                            .calc-control {
                                margin: 8px 0;
                                color: #606266;
                            }

                            .action-buttons {
                                display: flex;
                                justify-content: flex-end;
                                margin-top: 8px;
                            }
                        }

                        .score-display.clickable {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 8px 12px;
                            border: 1px dashed #dcdfe6;
                            border-radius: 4px;
                            cursor: pointer;

                            .display-content {
                                display: flex;
                                gap: 8px;
                                align-items: center;

                                .points {
                                    color: #67c23a;
                                    font-size: 0.9em;
                                }
                            }

                            &:hover {
                                border-color: #409EFF;
                                color: #409EFF;
                            }
                        }
                    }

                    .score-display {
                        display: flex;
                        align-items: center;
                        gap: 12px;

                        .result {
                            font-weight: bold;
                        }

                        .points {
                            color: #67c23a;
                        }

                        &.no-score {
                            color: #909399;
                            font-style: italic;
                        }
                    }
                }
            }
        }
    }
}

// 展开动画
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 2000px;
    opacity: 1;
    overflow: hidden;
}

.expand-enter,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding: 0 16px;
}

@media (max-width: 768px) {
    .judge-group-card {
        .athlete-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .score-section {
                width: 100%;
                display: flex;
                justify-content: flex-end;
            }
        }
    }
}
</style>
