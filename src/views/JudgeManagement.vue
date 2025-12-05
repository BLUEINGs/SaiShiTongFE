<template>
    <div class="judge-management" v-loading="loading">
        <!-- 头部操作栏 -->
        <div class="action-bar">
            <div class="filter-container">
                <FilterDropdown v-model="currentStateFilter" :options="filterOptions.status" label="状态"
                    :default-value="defaultStateFilter" @change="handleStateFilter" />
                <FilterDropdown v-model="currentTimeSort" :options="filterOptions.time" label="时间" default-value="none"
                    @change="handleTimeSort" />
                <FilterDropdown v-model="currentCompType" :options="filterOptions.compType" label="赛型"
                    default-value="all" @change="handleCompTypeFilter" />
                <el-button v-if="canModifyRule" type="primary" class="rule-config-btn" @click="showRuleManagement">
                    <i class="el-icon-setting"></i>
                    配置规则
                </el-button>
            </div>
        </div>

        <!-- 比赛卡片列表 -->
        <transition-group name="card-list" tag="div" class="competition-list"
            :class="{ 'has-active': activeCompetitionId }">
            <judge-competition-card v-for="competition in filteredCompetitions" :key="competition.spId"
                :competition-data="competition" :is-active="activeCompetitionId === competition.spId"
                :is-edit-mode="isEditMode" :score-rules="scoreRules" :available-judges="availableJudges"
                :loading-judges="loadingJudges" @toggle="toggleCompetition" @score-change="handleScoreChange"
                @rule-create="showRuleManagement" @rule-select="handleRuleSelect"
                @fetch-judges="fetchAvailableJudges" />

            <!-- 空状态 -->
            <el-empty v-if="filteredCompetitions.length === 0" :key="'empty'" :description="emptyTipText" />
        </transition-group>

        <!-- 评分规则对话框 -->
        <score-rule-dialog :visible.sync="ruleDialogVisible" :edit-data="currentRule" @save="handleRuleSave"
            @close="handleRuleDialogClose" :use-global-mask="false" />

        <!-- 规则管理对话框 -->
        <responsive-dialog title="评分规则管理" :visible.sync="ruleManageVisible" width="900px" :use-global-mask="true">
            <div class="rules-container">
                <div class="rules-header">
                    <el-button type="primary" @click="showRuleDialog()">添加规则</el-button>
                </div>
                <el-table :data="scoreRules" border style="width: 100%" class="mapping-table">
                    <el-table-column prop="name" label="规则名称" />
                    <el-table-column label="计量单位">
                        <template slot-scope="scope">
                            {{ scope.row.units.join(', ') }}
                        </template>
                    </el-table-column>
                    <el-table-column label="映射数量">
                        <template slot-scope="scope">
                            {{ Object.keys(scope.row.mappings).length }}
                        </template>
                    </el-table-column>
                    <el-table-column label="使用中" width="100">
                        <template slot-scope="scope">
                            <el-tag v-if="isRuleInUse(scope.row.rid)" type="success" size="small">是</el-tag>
                            <el-tag v-else type="info" size="small">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button type="primary" size="small" @click="editRule(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="deleteRule(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </responsive-dialog>

        <!-- 分配裁判对话框 -->
        <!-- 删除这里重复的 AssignJudgeDialog -->
        <!-- <assign-judge-dialog ref="assignJudgeDialog" ... /> -->
    </div>
</template>

<script>
import JudgeCompetitionCard from '@/components/JudgeCompetitionCard.vue'//赛事卡片
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'//移动端
import ScoreRuleDialog from '@/components/dialogs/ScoreRuleDialog.vue'//评分规则对话框
import FilterDropdown from '@/components/filter/FilterDropdown.vue'
// import AssignJudgeDialog from '@/components/dialogs/AssignJudgeDialog.vue'
import request from '@/utils/request'//响应请求

export default {
    name: 'JudgeManagement',
    components: {
        JudgeCompetitionCard,
        ResponsiveDialog,
        ScoreRuleDialog,
        FilterDropdown,
        // AssignJudgeDialog
    },
    props: {
        isEditMode: {
            type: Boolean,
            default: true
        }
    },
    data() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const isAdmin = userInfo.powerDegree?.includes(5)

        return {
            loading: false,
            activeCompetitionId: null,
            competitions: [],
            scoreRules: [],
            currentFilter: 'pending',
            ruleDialogVisible: false,
            ruleManageVisible: false,
            currentRule: null,
            currentStateFilter: userInfo.powerDegree?.includes(5) ? 'all' : 'pending',
            currentTimeSort: 'none',
            currentCompType: 'all',
            filterOptions: {
                status: [
                    { value: 'all', label: '全部' },
                    { value: 'notStarted', label: '未开始' },
                    { value: 'pending', label: '待评分' },
                    { value: 'scored', label: '已评分' }
                ],
                time: [
                    { value: 'none', label: '默认' },
                    { value: 'asc', label: '升序' },
                    { value: 'desc', label: '降序' }
                ],
                compType: [
                    { value: 'all', label: '全部' },
                    { value: '1', label: '预赛' },
                    { value: '2', label: '半决赛' },
                    { value: '3', label: '决赛' }
                ]
            },
            defaultStateFilter: isAdmin ? 'all' : 'pending',
            availableJudges: [], // 添加可用裁判列表
            loadingJudges: false, // 添加加载状态
            assignDialogVisible: false
        }
    },
    computed: {
        canModifyRule() {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            return userInfo.powerDegree?.includes(3) || userInfo.powerDegree?.includes(5)
        },
        filteredCompetitions() {
            let filtered = [...this.competitions];
            // const now = Date.now();

            // 修改状态筛选逻辑
            if (this.currentStateFilter !== 'all') {
                filtered = filtered.filter(comp => {
                    switch (this.currentStateFilter) {
                        case 'notStarted':
                            return comp.status === 1 || comp.status === 2;
                        case 'pending':
                            return comp.status === 3;
                        case 'scored':
                            return comp.status === 4 || comp.status === 5;
                        default:
                            return true;
                    }
                });
            }

            // 赛制筛选
            if (this.currentCompType !== 'all') {
                filtered = filtered.filter(comp =>
                    String(comp.compType) === this.currentCompType
                );
            }

            // 时间排序
            if (this.currentTimeSort !== 'none') {
                filtered.sort((a, b) => {
                    const timeA = new Date(a.gameStartTime).getTime();
                    const timeB = new Date(b.gameStartTime).getTime();
                    return this.currentTimeSort === 'asc' ? timeA - timeB : timeB - timeA;
                });
            }

            return filtered;
        },
        emptyTipText() {
            const tips = {
                notStarted: '暂无报名中的比赛',
                assigning: '暂无分配中的比赛',
                pending: '暂无待评分的比赛',
                scored: '暂无已评分的比赛',
                finished: '暂无已完成的比赛',
                all: '暂无比赛数据'
            }
            return tips[this.currentStateFilter] || tips.all
        }
    },
    methods: {
        async fetchCompetitions() {
            this.loading = true
            try {
                const res = await request({
                    url: '/getJudgements',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.competitions = res.data
                }
            } catch (error) {
                this.$message.error('获取比赛数据失败')
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
                    // 处理后端返回的数据
                    this.scoreRules = res.data.map(rule => ({
                        ...rule,
                        // 处理 units 字符串
                        units: rule.units.replace(/^\[|\]$/g, '').split(','),
                        // 处理 mappings 字符串
                        mappings: typeof rule.mappings === 'string' ?
                            new Map(Object.entries(JSON.parse(rule.mappings))) :
                            new Map(Object.entries(rule.mappings)),
                        // 确保 isRankMode 是布尔值
                        isRankMode: rule.isRankMode === true || rule.isRankMode === '1' || rule.isRankMode === 1
                    }))
                }
            } catch (error) {
                console.error('解析评分规则失败:', error)
                this.$message.error('获取评分规则失败')
            }
        },

        toggleCompetition(id) {
            console.log('切换展开状态:', id) // 添加日志
            this.activeCompetitionId = this.activeCompetitionId === id ? null : id
        },

        async handleScoreChange({ spId, pid, score, degree }) {
            try {
                const res = await request({
                    url: '/submitScore',
                    method: 'post',
                    data: { spId, pid, score, degree }
                })
                if (res.code === 1) {
                    this.$message.success('评分成功')
                    await this.fetchCompetitions()
                }
            } catch (error) {
                this.$message.error('评分失败')
            }
        },

        showRuleManagement() {
            this.ruleManageVisible = true
        },

        showRuleDialog(rule = null) {
            this.currentRule = rule
            this.ruleDialogVisible = true
        },

        handleRuleDialogClose() {
            this.ruleDialogVisible = false
            this.ruleManageVisible = true
        },

        // 添加新的方法处理规则创建请求
        handleRuleCreate() {
            this.showRuleDialog()
        },

        editRule(rule) {
            this.showRuleDialog(rule)
        },

        async deleteRule(rule) {
            if (this.isRuleInUse(rule.rid)) {
                this.$message.warning('该规则正在使用中，无法删除')
                return
            }

            try {
                await this.$confirm('确定要删除该评分规则吗？', '提示', {
                    type: 'warning'
                })

                const params = new URLSearchParams()
                params.append('rid', rule.rid)

                const res = await request({
                    url: '/deleteJudgeRule',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                })

                if (res.code === 1) {
                    this.$message.success('删除成功')
                    await this.fetchScoreRules()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('删除失败')
                }
            }
        },

        async handleRuleSave() {
            // 直接重新获取规则列表
            await this.fetchScoreRules()
            this.ruleDialogVisible = false
            this.ruleManageVisible = true
        },

        async handleRuleSelect(competitionId, ruleId) {
            try {
                const params = new URLSearchParams()
                params.append('spId', competitionId)
                params.append('rid', ruleId)

                const res = await request({
                    url: '/updateCompetitionRule',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                })

                if (res.code === 1) {
                    this.$message.success('规则更新成功')
                    // 更新本地数据
                    const competition = this.competitions.find(c => c.spId === competitionId)
                    if (competition) {
                        competition.rid = ruleId
                    }
                }
            } catch (error) {
                this.$message.error('规则更新失败')
            }
        },

        // 移除 handleFilterChange 方法中的请求
        handleFilterChange() {
            // 仅使用本地数据进行筛选,不发送请求
            console.log('切换筛选:', this.currentFilter)
        },

        handleStateFilter(value) {
            this.currentStateFilter = value;
        },
        handleTimeSort(value) {
            this.currentTimeSort = value;
        },
        handleCompTypeFilter(value) {
            this.currentCompType = value;
        },

        // 检查规则是否正在被使用
        isRuleInUse(rid) {
            return this.competitions.some(comp => comp.rid === rid)
        },

        // 获取可用裁判列表
        async fetchAvailableJudges() {
            this.loadingJudges = true
            try {
                const res = await request({
                    url: '/getAvailableJudges',
                    method: 'get'
                })
                if (res.code === 1) {
                    // 确保转换为需要的格式
                    this.availableJudges = (res.data || []).map(judge => ({
                        uid: judge.uid,
                        name: judge.name,
                        head: judge.head || ''
                    }))
                } else {
                    this.availableJudges = []
                }
            } catch (error) {
                console.error('获取可用裁判失败:', error)
                this.availableJudges = []
            } finally {
                this.loadingJudges = false
            }
        }
    },
    mounted() {
        this.fetchCompetitions()
        this.fetchScoreRules()
        this.fetchAvailableJudges() // 添加获取可用裁判的请求
    }
}
</script>

<style lang="less" scoped>
.judge-management {
    // padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: auto; // 确保不会有多余的高度

    .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 0 16px;
        flex-wrap: wrap;
        gap: 16px;

        .left-section {
            display: flex;
            align-items: center;
        }

        .filter-container {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            width: 100%;

            .rule-config-btn {
                margin-left: auto;
                border-radius: 4px;

                @media screen and (max-width: 768px) {
                    width: 100%;
                    margin-top: 8px;
                }

                i {
                    margin-right: 4px;
                }
            }

            @media screen and (max-width: 768px) {
                width: 100%;
                justify-content: space-between;
            }
        }
    }

    .competition-list {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        transition: all 0.3s ease;
        padding: 0 16px;

        &.has-active {
            grid-template-columns: 1fr;
        }
    }

    // Card animations
    .card-list-enter-active,
    .card-list-leave-active {
        transition: all 0.3s ease;
    }

    .card-list-enter,
    .card-list-leave-to {
        opacity: 0;
        transform: translateY(30px);
    }

    .card-list-move {
        transition: transform 0.5s ease;
    }

    @media (max-width: 768px) {
        padding: 12px;

        .action-bar {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    @media screen and (max-width: 768px) {
        padding: 0;
        margin-bottom: 60px; // 为底部导航留出空间

        .competition-list {
            padding: 10px;
            gap: 10px;
        }
    }
}
</style>
