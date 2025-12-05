<template>
    <div class="score-panel">
        <div class="panel-header">
            <h3>我的成绩</h3>
            <div class="identity-selector">
                <el-select v-model="selectedTeam" placeholder="选择身份" size="small">
                    <el-option v-for="team in teamScores" :key="team.teamName" :label="team.teamName"
                        :value="team.teamName"></el-option>
                </el-select>
                <el-tooltip content="您在多个团体中的成绩数据是分开统计的" placement="top">
                    <i class="el-icon-question"></i>
                </el-tooltip>
            </div>
        </div>
        <div class="score-content" v-loading="loading">
            <!-- 总分和排名 -->
            <div class="score-overview">
                <div class="total-score">
                    <div class="label">总分</div>
                    <div class="value">{{ totalScore }}</div>
                </div>
                <div class="rankings">
                    <div class="rank-item">
                        <div class="label">运动会排名</div>
                        <div class="value">#{{ meetingRank }}</div>
                    </div>
                    <div class="rank-item">
                        <div class="label">团体排名</div>
                        <div class="value">#{{ teamRank }}</div>
                    </div>
                </div>
            </div>

            <!-- 最近比赛成绩 -->
            <div class="recent-scores">
                <div class="section-title">最近比赛</div>
                <el-table :data="recentScores" style="width: 100%" size="small">
                    <el-table-column prop="eventName" label="项目" show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{ formatEventName(scope.row) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="成绩" width="100" align="center">
                        <template slot-scope="scope">
                            {{ formatScore(scope.row.score || scope.row.degree) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="rank" label="排名" width="80" align="center">
                        <template slot-scope="scope">
                            <el-tag size="mini" :type="getRankType(scope.row.rank)">
                                第{{ scope.row.rank }}名
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import { formatEventName, formatScore } from '@/utils/formatters'

export default {
    name: 'ScorePanel',
    data() {
        return {
            loading: false,
            selectedTeam: '',
            teamScores: [],
            totalScore: 0,
            meetingRank: 0,
            teamRank: 0,
            recentScores: []
        }
    },
    watch: {
        selectedTeam(newTeam) {
            this.updateDisplayData(newTeam)
        }
    },
    methods: {
        formatEventName,
        formatScore,
        getRankType(rank) {
            if (rank <= 3) return 'success'
            if (rank <= 6) return 'warning'
            return 'info'
        },
        async fetchScores() {
            this.loading = true
            try {
                const res = await request({
                    url: '/dashboard/myScores',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.teamScores = res.data
                    if (this.teamScores.length > 0) {
                        this.selectedTeam = this.teamScores[0].teamName
                        this.updateDisplayData(this.selectedTeam)
                    }
                }
            } catch (error) {
                console.error('获取成绩失败:', error)
            } finally {
                this.loading = false
            }
        },
        updateDisplayData(teamName) {
            const teamData = this.teamScores.find(team => team.teamName === teamName)
            if (teamData) {
                this.totalScore = teamData.totalScore || 0
                this.meetingRank = teamData.meetingRank || 0
                this.teamRank = teamData.teamRank || 0
                this.recentScores = teamData.recentScores || []
            }
        }
    },
    created() {
        this.fetchScores()
    }
}
</script>

<style lang="less" scoped>
.score-panel {
    padding: 20px;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }

        .identity-selector {
            display: flex;
            align-items: center;
            gap: 8px;

            .el-select {
                width: 150px;
            }

            .el-icon-question {
                color: #909399;
                cursor: help;
                font-size: 14px;

                &:hover {
                    color: #409EFF;
                }
            }
        }
    }

    .score-content {
        .score-overview {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            gap: 20px;

            .total-score {
                text-align: center;

                .label {
                    font-size: 14px;
                    color: #909399;
                    margin-bottom: 4px;
                }

                .value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #409EFF;
                }
            }
        }

        .rankings {
            display: flex;
            gap: 20px;

            .rank-item {
                text-align: center;

                .label {
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 4px;
                }

                .value {
                    font-size: 18px;
                    font-weight: 500;
                    color: #409EFF;
                }
            }
        }
    }

    .recent-scores {
        .section-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 12px;
        }

        .el-table {
            .el-table__body-wrapper {
                .el-table__row {
                    .el-table__cell {
                        .event-name {
                            display: inline-block;
                            max-width: 120px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .score {
                            font-weight: 500;
                            color: #409EFF;
                        }
                    }
                }
            }
        }
    }
}

// 移动端适配
@media screen and (max-width: 768px) {
    .score-panel {
        .panel-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;

            .identity-selector {
                width: 100%;

                .el-select {
                    flex: 1;
                }
            }
        }
    }
}
</style>