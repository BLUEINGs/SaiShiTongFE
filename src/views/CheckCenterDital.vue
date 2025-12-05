<template>
    <div class="check-center-detail" v-loading="loading">
        <div class="action-bar">
            <el-button type="primary" @click="goBack">
                <i class="el-icon-arrow-left"></i> 返回
            </el-button>
            <span class="title">{{ competition?.name || '比赛详情' }}</span>
        </div>

        <el-card v-if="competition" class="competition-info">
            <div slot="header">
                <span>比赛信息</span>
            </div>
            <el-descriptions :column="2" border>
                <el-descriptions-item label="比赛名称">{{ competition.name }}</el-descriptions-item>
                <el-descriptions-item label="赛型">{{ compTypeLabel(competition.compType) }}</el-descriptions-item>
                <el-descriptions-item label="开始时间">{{ competition.gameStartTime }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ statusLabel(competition.status) }}</el-descriptions-item>
                <el-descriptions-item label="评分规则">
                    {{ ruleName(competition.rid) }}
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card class="score-list" v-if="competition">
            <div slot="header">
                <span>评分详情</span>
            </div>
            <el-table :data="competition.scores || []" border>
                <el-table-column prop="judgeName" label="裁判" />
                <el-table-column prop="score" label="分数" />
                <el-table-column prop="degree" label="评分等级" />
                <el-table-column prop="comment" label="评语" />
            </el-table>
        </el-card>

        <el-empty v-if="!competition && !loading" description="暂无比赛详情" />
    </div>
</template>

<script>
import request from '@/utils/request'

export default {
    name: 'CheckCenterDital',
    data() {
        return {
            loading: false,
            competition: null,
            scoreRules: []
        }
    },
    methods: {
        async fetchCompetitionDetail() {
            this.loading = true
            try {
                const spId = this.$route.query.spId
                const res = await request({
                    url: '/getJudgementDetail',
                    method: 'get',
                    params: { spId }
                })
                if (res.code === 1) {
                    this.competition = res.data
                }
            } catch (e) {
                this.$message.error('获取比赛详情失败')
            } finally {
                this.loading = false
            }
        },
        async fetchScoreRules() {
            try {
                const res = await request({
                    url: '/getJudgeRules',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.scoreRules = res.data
                }
            } catch (e) {}
        },
        compTypeLabel(type) {
            const map = { 1: '预赛', 2: '半决赛', 3: '决赛' }
            return map[type] || '未知'
        },
        statusLabel(status) {
            const map = {
                1: '未开始',
                2: '未开始',
                3: '待评分',
                4: '已评分',
                5: '已评分'
            }
            return map[status] || '未知'
        },
        ruleName(rid) {
            const rule = this.scoreRules.find(r => r.rid === rid)
            return rule ? rule.name : '无'
        },
        goBack() {
            this.$router.back()
        }
    },
    mounted() {
        this.fetchScoreRules()
        this.fetchCompetitionDetail()
    }
}
</script>

<style lang="less" scoped>
.check-center-detail {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 8px;

    .action-bar {
        display: flex;
        align-items: center;
        margin-bottom: 18px;
        .title {
            font-size: 20px;
            font-weight: bold;
            margin-left: 18px;
        }
    }

    .competition-info {
        margin-bottom: 24px;
    }

    .score-list {
        margin-bottom: 24px;
    }
}
</style>