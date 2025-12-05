<template>
    <div class="team-score">
        <div class="panel-header">
            <h3>团体成绩</h3>
            <el-select v-if="teams.length > 1" v-model="currentTeamName" size="small" placeholder="切换团队">
                <el-option v-for="team in teams" :key="team.teamName" :label="team.teamName" :value="team.teamName">
                </el-option>
            </el-select>
        </div>
        <div class="team-content" v-loading="loading">
            <div class="team-info" v-if="currentTeam">
                <div class="team-name">{{ currentTeam.teamName }}</div>
                <div class="score-info">
                    <div class="total-points">
                        <span class="label">总分</span>
                        <span class="value">{{ currentTeam.degree || 0 }}</span>
                    </div>
                    <div class="rank">
                        <span class="label">排名</span>
                        <span class="value">#{{ currentTeam.rank }}</span>
                    </div>
                </div>
            </div>

            <!-- 积分趋势图 -->
            <div class="score-trend" ref="chartContainer"></div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import * as echarts from 'echarts/core'
import { formatScore } from '@/utils/formatters'
import { LineChart } from 'echarts/charts'
import {
    GridComponent,
    TooltipComponent,
    TitleComponent
} from 'echarts/components'
import {
    CanvasRenderer
} from 'echarts/renderers'

// 注册必需的组件
echarts.use([
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LineChart,
    CanvasRenderer
])

export default {
    name: 'TeamScore',
    data() {
        return {
            loading: false,
            teams: [],
            currentTeamName: null,
            trendData: [],
            chart: null
        }
    },
    computed: {
        currentTeam() {
            return this.teams.find(t => t.teamName === this.currentTeamName) || this.teams[0]
        }
    },
    methods: {
        formatScore,
        async fetchTeamScore() {
            this.loading = true
            try {
                const res = await request({
                    url: '/dashboard/teamScore',
                    method: 'get'
                })

                if (res.code === 1 && res.data) {
                    this.teams = res.data
                    if (this.teams.length > 0) {
                        this.currentTeamName = this.teams[0].teamName
                    }
                    this.trendData = this.currentTeam.trend || []
                    this.$nextTick(() => {
                        this.initChart()
                    })
                }
            } catch (error) {
                console.error('获取团体成绩失败:', error)
            } finally {
                this.loading = false
            }
        },
        initChart() {
            if (!this.trendData.length) return

            const container = this.$refs.chartContainer
            if (!container) return

            this.chart = echarts.init(container)

            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 40,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: this.trendData.map(item => item.date),
                    axisLabel: {
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                series: [{
                    data: this.trendData.map(item => item.score),
                    type: 'line',
                    smooth: true,
                    symbolSize: 8,
                    lineStyle: {
                        width: 3
                    },
                    itemStyle: {
                        color: '#409EFF'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(64,158,255,0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(64,158,255,0.1)'
                        }])
                    }
                }]
            }

            this.chart.setOption(option)

            // 添加响应式调整
            window.addEventListener('resize', () => {
                this.chart?.resize()
            })
        }
    },
    mounted() {
        this.fetchTeamScore()
    },
    beforeDestroy() {
        // 清理事件监听器
        window.removeEventListener('resize', this.chart?.resize)
        if (this.chart) {
            this.chart.dispose()
            this.chart = null
        }
    }
}
</script>

<style lang="less" scoped>
.team-score {
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
    }

    .team-info {
        margin-bottom: 20px;

        .team-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 12px;
        }

        .score-info {
            display: flex;
            justify-content: space-around;

            .total-points,
            .rank {
                text-align: center;

                .label {
                    display: block;
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 4px;
                }

                .value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #409EFF;
                }
            }
        }
    }

    .score-trend {
        height: 200px;
        width: 100%;
    }
}
</style>
