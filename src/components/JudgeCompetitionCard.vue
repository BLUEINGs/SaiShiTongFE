<template>
    <div class="competition-card" :class="{ 'is-active': isActive }">
        <!-- 卡片头部 -->
        <div class="card-header" @click="handleToggle">
            <div class="competition-info">
                <div class="title-row">
                    <h3>{{ title }}</h3>
                    <span class="comp-type">{{ getCompTypeText(competition.compType) }}</span>
                </div>
                <div class="time-info">
                    <i class="el-icon-time"></i>
                    <span>比赛时间: {{ formatTime(competition.gameStartTime) }}</span>
                </div>
            </div>
            <div class="status-tags">
                <el-tag :type="getStatusType(competition.status)" size="small">{{ getStatusText(competition.status)
                    }}</el-tag>
                <el-tag v-if="competition.venue" type="info" size="small">{{ competition.venue }}</el-tag>
            </div>
        </div>

        <!-- 展开内容 -->
        <div v-show="isActive" class="card-content">
            <!-- 评分规则选择 - 只要有权限就能修改，不受状态限制 -->
            <div class="rule-select" v-if="canModifyRule">
                <el-select v-model="selectedRuleId" placeholder="选择评分规则" filterable @change="handleRuleChange">
                    <el-option v-for="rule in scoreRules" :key="rule.rid"
                        :label="`${rule.name} (${rule.units.join(',')})`" :value="rule.rid" />
                    <el-divider></el-divider>
                    <el-option value="new">
                        <div @click="handleAddRule">
                            <i class="el-icon-plus"></i> 添加新规则
                        </div>
                    </el-option>
                </el-select>
            </div>

            <!-- 状态提示 - 有权限但状态不允许时显示 -->
            <div v-if="canModifyRule && competition.status < 2" class="status-alert">
                <el-alert type="warning" :closable="false" show-icon>
                    比赛尚未开始评分阶段
                </el-alert>
            </div>

            <!-- 分组标签页 -->
            <div v-if="groups.length > 0" class="groups-tabs">
                <!-- 添加裁判组展示区域 -->
                <div v-if="judgeGroup" class="judges-section">
                    <div class="header-section">
                        <h4>裁判组</h4>
                    </div>
                    <div class="judges-list">
                        <div v-for="judge in judgeGroup.players" :key="judge.uid" class="judge-item"
                            :class="{ 'is-current': judge.uid === currentUid }">
                            <el-avatar :size="32" :src="judge.head">
                                {{ judge.name.charAt(0) }}
                            </el-avatar>
                            <span class="judge-name">{{ judge.name }}</span>
                            <el-tag v-if="judge.uid === currentUid" size="mini" type="warning">我</el-tag>
                        </div>
                        <div v-if="canAssignJudges" class="judge-item assign-btn" @click="showAssignJudge">
                            <el-avatar :size="32" icon="el-icon-plus"></el-avatar>
                            <span class="judge-name">分配裁判</span>
                        </div>
                    </div>
                </div>

                <el-divider v-if="judgeGroup" />

                <!-- 当前用户信息展示区 -->
                <div v-if="currentUserInfo" class="athlete-item current-athlete">
                    <div class="athlete-info">
                        <el-avatar :size="40" :src="currentUserInfo.head || null">
                            {{ currentUserInfo.name.charAt(0) }}
                        </el-avatar>
                        <div class="details">
                            <div class="name">
                                {{ currentUserInfo.name }}
                                <el-tag size="mini" type="primary" class="group-tag">
                                    {{ currentUserInfo.groupName }}
                                </el-tag>
                            </div>
                            <div class="meta">
                                <span>编号：{{ currentUserInfo.number }}</span>
                                <span>班级：{{ currentUserInfo.pClass }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="score-area">
                        <!-- 与下面成绩显示区域相同代码 -->
                        <template v-if="isEditMode && !currentUserInfo.score">
                            <multi-unit-input v-model="scoreInputs[currentUserInfo.pid]" :units="currentRule.units"
                                @enter="handleEnter(currentUserInfo)" @tab-last="submitScore(currentUserInfo)" />
                        </template>
                        <template v-else>
                            <div class="score-display">
                                <span class="score">{{ formatScore(currentUserInfo.score) }}</span>
                                <span v-if="currentUserInfo.degree" class="points">{{ currentUserInfo.degree }}分</span>
                            </div>
                            <el-button v-if="isEditMode && currentUserInfo.score" type="text" size="small"
                                @click="enableEdit(currentUserInfo)">
                                修改
                            </el-button>
                        </template>
                    </div>
                </div>

                <el-divider v-if="currentUserInfo" class="thin-divider"></el-divider>

                <!-- 修改分组标签页部分 -->
                <div class="tabs-container">
                    <el-tabs v-model="activeGroupIndex" @tab-click="handleGroupChange">
                        <el-tab-pane v-for="(group, index) in athleteGroups" :key="group.gid || index"
                            :label="group.name" :name="String(index)">
                            <!-- 运动员列表 -->
                            <div class="athletes-list">
                                <div v-for="athlete in sortedAthletes" :key="athlete.pid" class="athlete-item"
                                    :class="{ 'is-current': athlete.pid === pid || athlete.uid === currentUid, 'has-score': athlete.score }">
                                    <!-- 运动员信息 -->
                                    <div class="athlete-info">
                                        <el-avatar :size="40" :src="athlete.head">
                                            {{ athlete.name.charAt(0) }}
                                        </el-avatar>
                                        <div class="details">
                                            <div class="name">
                                                {{ athlete.name }}
                                                <el-tag size="mini" type="info" v-if="athlete.number">
                                                    #{{ athlete.number }}
                                                </el-tag>
                                                <el-tag size="mini" type="warning" v-if="athlete.uid === currentUid">
                                                    我
                                                </el-tag>
                                            </div>
                                            <div class="meta">
                                                <span>团体：{{ athlete.pclass }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 成绩录入区域 -->
                                    <div class="score-area">
                                        <template v-if="isEditMode && !athlete.score">
                                            <multi-unit-input v-model="scoreInputs[athlete.pid]"
                                                :units="currentRule.units" @enter="handleEnter(athlete)"
                                                @tab-last="submitScore(athlete)" />
                                        </template>
                                        <template v-else>
                                            <div class="score-display">
                                                <span class="score">{{ formatScore(athlete.score) }}</span>
                                                <span v-if="athlete.degree" class="points">{{ athlete.degree
                                                }}分</span>
                                            </div>
                                            <el-button v-if="isEditMode && athlete.score" type="text" size="small"
                                                @click="enableEdit(athlete)">
                                                修改
                                            </el-button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
            <el-empty v-else description="暂无分组数据"></el-empty>
        </div>
        <!-- 修改分配裁判弹窗的引用 -->
        <assign-judge-dialog :visible.sync="assignDialogVisible" :judges="availableJudges" :loading="loadingJudges"
            :current-judges="judgeGroup?.players || []" @confirm="handleAssignJudges" />
    </div>
</template>

<script>
import request from '@/utils/request'//获得赛程
import { formatDate } from '@/utils/date'//格式化时间
import { formatEventName } from '@/utils/formatters' //格式化比赛项目 添加这行引入
import MultiUnitInput from './MultiUnitInput.vue'//输入框
import AssignJudgeDialog from './dialogs/AssignJudgeDialog.vue'//裁判分配

export default {
    name: 'JudgeCompetitionCard',
    components: {
        MultiUnitInput,
        AssignJudgeDialog
    },
    props: {
        competitionData: {
            type: Object,
            required: true
        },
        isActive: Boolean,
        pid: {
            type: Number,
            required: false
        },
        scoreRules: {    // 添加这个 props
            type: Array,
            default: () => []
        },
        availableJudges: {
            type: Array,
            default: () => []
        },
        loadingJudges: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            groups: [],
            activeGroupIndex: '0',
            selectedRuleId: null,
            scoreInputs: {},
            competition: this.competitionData,
            isSubmitting: false, // 添加防抖标志
            currentUid: null,
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            assignDialogVisible: false
        }
    },
    computed: {
        // 是否可以修改规则（裁判组成员）
        canModifyRule() {
            // 判断当前用户是否在裁判组中
            return this.judgeGroup?.players?.some(judge => judge.uid === this.currentUid)
        },

        // 是否可以评分（需同时满足：有评分权限 且 比赛状态允许）
        isEditMode() {
            // 修改可编辑判断逻辑，只有在待评分状态下才可编辑
            return this.canModifyRule && this.competition.status === 3
        },
        currentRule() {
            // 优先使用选择的规则，如果没有则使用比赛默认的规则
            const ruleId = this.selectedRuleId || this.competition.rid
            return this.scoreRules.find(r => r.rid === ruleId) || { units: [] }
        },
        currentUserInfo() {
            for (const group of this.groups) {
                const player = group.players?.find(p => p.pid === this.pid);
                if (player) {
                    return {
                        ...player,
                        groupName: group.name
                    };
                }
            }
            return null;
        },
        sortedAthletes() {
            const currentGroup = this.athleteGroups[this.activeGroupIndex];
            if (!currentGroup?.players?.length) return [];
            return currentGroup.players;
        },
        judgeGroup() {
            return this.groups.find(g => g.gid === 0) || { players: [] };
        },
        athleteGroups() {
            return this.groups.filter(g => g.gid !== 0 && Array.isArray(g.players));
        },
        // 修改标题计算方式
        title() {
            return formatEventName(this.competition)
        },
        // 添加新的计算属性用于判断是否可以分配裁判（管理员）
        canAssignJudges() {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            return userInfo.powerDegree?.includes(5)
        }
    },
    watch: {
        // 修改监听逻辑
        competitionData: {
            immediate: true,
            handler(val) {
                this.competition = val;
                this.selectedRuleId = val.rid;
                // 如果卡片是激活状态，立即获取分组数据
                if (this.isActive) {
                    this.fetchGroups();
                }
            }
        },
        // 监听 isActive 变化
        isActive: {
            immediate: false,
            handler(val) {
                if (val) {
                    this.fetchGroups();
                }
            }
        },
        // 添加对 groups 的监听,设置默认选中第一个运动员组
        groups: {
            immediate: true,
            handler(groups) {
                if (groups?.length > 0) {
                    // 直接选择第一个group作为默认值
                    this.activeGroupIndex = '0';
                }
            }
        }
    },
    methods: {
        handleToggle() {
            console.log('卡片点击:', this.competition.spId) // 添加日志
            this.$emit('toggle', this.competition.spId)
        },
        formatTime(time) {
            if (!time) return '待定';
            return formatDate(time, 'MM-DD HH:mm');
        },
        getStatusType(status) {
            const types = {
                1: 'info',     // 报名中
                2: 'warning',  // 分配中
                3: 'primary',  // 待评分
                4: 'success',  // 已评分
                5: 'info'      // 已完成
            }
            return types[status] || 'info'
        },
        getStatusText(status) {
            const texts = {
                1: '报名中',
                2: '分配中',
                3: '待评分',
                4: '已评分',
                5: this.competition.compType === 3 ? '已结束' : '已晋级'
            }
            return texts[status] || '未知状态'
        },
        async fetchGroups() {
            console.log('获取分组数据:', this.competition.spId) // 添加日志
            try {
                const res = await request({
                    url: '/getJudgementGroups',
                    method: 'get',
                    params: { spId: this.competition.spId }
                })

                if (res.code === 1) {
                    this.groups = Array.isArray(res.data) ? res.data : []
                }
            } catch (error) {
                console.error('获取分组数据失败:', error)
                this.$message.error('获取分组数据失败')
            }
        },
        handleGroupChange(tab) {
            this.activeGroupIndex = tab.name
        },
        enableEdit(athlete) {
            const scoreMap = typeof athlete.score === 'string'
                ? JSON.parse(athlete.score.replace(/=/g, ':').replace(/([^:,\s{}]+)/g, '"$1"'))
                : athlete.score
            const units = this.currentRule.units
            const scoreValues = units.map(unit => scoreMap[unit] || '')
            this.$set(this.scoreInputs, athlete.pid, scoreValues)
            // 清除已有的成绩显示，切换到输入模式
            this.$set(athlete, 'score', null)
        },
        canJudge() {
            const now = new Date().getTime()
            const gameStart = new Date(this.competition.gameStartTime).getTime()
            return now >= gameStart
        },
        handleTab(athlete, index) {
            if (index === this.currentRule.units.length - 1) {
                this.submitScore(athlete)
            }
        },
        handleEnter(athlete) {
            this.submitScore(athlete)
        },
        formatScore(scoreMap) {
            if (!scoreMap) return '暂无成绩'
            // 处理字符串形式的 scoreMap
            if (typeof scoreMap === 'string') {
                try {
                    // 移除大括号并分割每个单位-值对
                    const pairs = scoreMap.replace(/[{}]/g, '').split(',')
                    return pairs.map(pair => {
                        const [unit, value] = pair.split('=')
                        return `${value}${unit}`
                    }).join('')
                } catch (e) {
                    console.error('分数格式化失败:', e)
                    return '格式错误'
                }
            }
            // 处理对象形式的 scoreMap
            return Object.entries(scoreMap)
                .map(([unit, value]) => `${value}${unit}`)
                .join('')
        },
        validateScore(inputs) {
            if (!this.currentRule || !inputs) return false
            return inputs.every(value => {
                if (!value) return false
                return !isNaN(Number(value))
            })
        },
        async submitScore(athlete) {
            // 防抖处理
            if (this.isSubmitting) return
            this.isSubmitting = true

            try {
                if (!this.canJudge()) {
                    this.$message.warning('比赛尚未开始,暂不能评分')
                    return
                }

                const inputs = this.scoreInputs[athlete.pid]
                if (!this.validateScore(inputs)) {
                    this.$message.error('请输入有效的成绩')
                    return
                }

                const scoreMap = {}
                this.currentRule.units.forEach((unit, index) => {
                    scoreMap[unit] = inputs[index] || '0'
                })

                // 立即更新UI显示
                const degree = this.calculateDegree(scoreMap)
                athlete.score = scoreMap
                athlete.degree = degree

                await this.$emit('score-change', {
                    spId: this.competition.spId,
                    pid: athlete.pid,
                    score: scoreMap,
                    degree: degree
                })

                this.$delete(this.scoreInputs, athlete.pid)

                // 移动到下一个运动员
                const players = this.groups[this.activeGroupIndex].players
                const currentIndex = players.findIndex(p => p.pid === athlete.pid)
                if (currentIndex < players.length - 1) {
                    this.$nextTick(() => {
                        const nextAthlete = players[currentIndex + 1]
                        if (!nextAthlete.score) {
                            this.$set(this.scoreInputs, nextAthlete.pid, Array(this.currentRule.units.length).fill('0'))
                        }
                    })
                }
            } catch (error) {
                athlete.score = null
                athlete.degree = null
                console.error('提交成绩失败:', error)
                this.$message.error('提交成绩失败')
            } finally {
                this.isSubmitting = false
            }
        },
        calculateDegree(scoreMap) {
            const rule = this.scoreRules.find(r => r.rid === this.selectedRuleId)
            if (!rule || !rule.mappings) return null

            const scoreStr = Object.values(scoreMap).join(':')

            // 如果完全匹配则直接返回
            const exactMatch = rule.mappings.get(scoreStr)
            if (exactMatch !== undefined) return exactMatch

            // 转换所有成绩为数组形式以便比较
            const currentScore = this.parseScore(scoreStr)
            const mappings = Array.from(rule.mappings.entries()).map(([score, points]) => ({
                score: this.parseScore(score),
                points
            }))

            if (rule.isRankMode) {
                // 排名模式: 直接比较第一个数字
                const rank = Number(currentScore[0])
                const sortedMappings = mappings.sort((a, b) => Number(a.score[0]) - Number(b.score[0]))

                if (rank <= Number(sortedMappings[0].score[0])) {
                    return sortedMappings[0].points
                }
                if (rank >= Number(sortedMappings[sortedMappings.length - 1].score[0])) {
                    return sortedMappings[sortedMappings.length - 1].points
                }
            } else {
                // 成绩模式: 按单位逐个比较
                const sortedMappings = mappings.sort((a, b) => {
                    for (let i = 0; i < a.score.length; i++) {
                        if (a.score[i] !== b.score[i]) {
                            return Number(a.score[i]) - Number(b.score[i])
                        }
                    }
                    return 0
                })

                // 找到第一个比当前成绩大的映射
                for (let i = 0; i < sortedMappings.length; i++) {
                    const mapping = sortedMappings[i]
                    const comparison = this.compareScores(currentScore, mapping.score)
                    if (comparison <= 0) {
                        return mapping.points
                    }
                }
                // 如果所有映射都比当前成绩小，返回最后一个映射的分数
                return sortedMappings[sortedMappings.length - 1].points
            }
        },

        parseScore(scoreStr) {
            return scoreStr.split(':').map(Number)
        },

        compareScores(currentScore, mappingScore) {
            for (let i = 0; i < currentScore.length; i++) {
                if (currentScore[i] !== mappingScore[i]) {
                    return currentScore[i] - currentScore[i]
                }
            }
            return 0
        },
        handleAddRule() {
            this.$emit('rule-create')
        },
        getCompTypeText(type) {
            console.log('比赛类型原始值:', type) // 添加日志以便调试
            const types = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            // 确保传入的类型是数字
            const numType = Number(type)
            return types[numType] || '未知赛段'
        },
        handleRuleChange(ruleId) {
            if (ruleId === 'new') {
                this.$emit('rule-create')
                // 恢复原来的选择
                this.$nextTick(() => {
                    this.selectedRuleId = this.competition.rid
                })
                return
            }

            // 只有当选择了实际的规则ID时才发送更新请求
            if (ruleId && ruleId !== this.competition.rid) {
                this.$emit('rule-select', this.competition.spId, ruleId)
            }
        },
        showAssignJudge() {
            this.$emit('fetch-judges') // 触发获取裁判列表的事件
            this.assignDialogVisible = true
        },
        async handleAssignJudges(selectedUids) {
            try {
                const params = new URLSearchParams();
                params.append('spId', this.competition.spId);
                // 对每个选中的uid都添加一个judgeUid参数
                selectedUids.forEach(uid => {
                    params.append('judgeUid', uid);
                });

                const res = await request({
                    url: '/assignJudges',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                });

                if (res.code === 1) {
                    this.$message.success('分配裁判成功');
                    await this.fetchGroups();
                    this.assignDialogVisible = false;
                }
            } catch (error) {
                this.$message.error('分配裁判失败');
            }
        },
    }, mounted() {
        this.currentUid = this.userInfo.uid
    }
}
</script>

<style lang="less" scoped>
.competition-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &.is-active {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-header {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        &:hover {
            background: #f5f7fa;
        }
    }

    .competition-info {
        .title-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            h3 {
                margin: 0;
                font-size: 16px;
            }

            .comp-type {
                font-size: 13px;
                color: #409EFF;
                background: rgba(64, 158, 255, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 500;
            }
        }

        .time-info {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #606266;
            font-size: 13px;
        }
    }

    .status-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap; // 添加这行以防标签太多换行
    }

    .card-content {
        padding: 16px;
        border-top: 1px solid #ebeef5;

        .rule-select {
            margin-bottom: 16px;

            .el-select {
                width: 100%;
            }
        }

        .athletes-list {
            display: flex;
            flex-direction: column;
            gap: 20px; // 增加项目之间的间距

            .athlete-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-radius: 4px;
                margin-bottom: 8px;
                background: #f5f7fa;
                transition: all 0.3s;

                &.has-score {
                    background: #f0f9eb;
                }

                &.is-current {
                    background-color: #ecf5ff;
                    border: 1px solid #409EFF;

                    .athlete-info .name {
                        color: #409EFF;
                    }
                }

                .athlete-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .details {
                        .name {
                            font-weight: 500;
                            margin-bottom: 4px;
                        }

                        .meta {
                            font-size: 12px;
                            color: #909399;

                            span {
                                margin-right: 12px;
                            }
                        }
                    }
                }

                .score-area {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .score-inputs {
                        .units-label {
                            display: flex;
                            gap: 8px;
                            margin-bottom: 4px;

                            span {
                                flex: 1;
                                text-align: center;
                                color: #909399;
                                font-size: 12px;
                            }
                        }

                        .input-group {
                            display: flex;
                            gap: 8px;

                            .el-input {
                                width: 80px;
                            }
                        }
                    }

                    .score-display {
                        text-align: right;

                        .score {
                            font-weight: 500;
                            margin-right: 8px;
                        }

                        .points {
                            font-size: 13px;
                            color: #67c23a;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }

    .current-athlete {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #ecf5ff !important;
        border: 1px solid #409EFF !important;
        border-radius: 8px;
        margin-bottom: 16px;

        .athlete-info {
            display: flex;
            align-items: center;
            gap: 16px;

            .details {
                .name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    font-weight: 500;
                    color: #409EFF;
                    margin-bottom: 4px;
                }

                .meta {
                    font-size: 13px;
                    color: #606266;

                    span {
                        margin-right: 12px;
                    }
                }
            }

            .group-tag {
                margin-left: 8px;
                padding: 2px 8px;
                font-size: 12px;
                border-radius: 4px;
                background: rgba(64, 158, 255, 0.1);
                color: #409EFF;
            }
        }

        .score-area {
            display: flex;
            align-items: center;
            gap: 12px;

            .score-display {
                text-align: right;

                .score {
                    font-weight: 500;
                    font-size: 15px;
                    margin-right: 8px;
                }

                .points {
                    font-size: 13px;
                    color: #67c23a;
                    font-weight: 500;
                }
            }
        }
    }

    .thin-divider {
        margin: 16px 0;
        border-top: 1px solid #ebeef5;
    }

    .current-user-info {
        background: #f0f7ff;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        border: 1px solid #c6e2ff;

        .group-indicator {
            font-size: 14px;
            color: #409EFF;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .athlete-item {
            background: #fff !important;
        }
    }
}

.judges-section {
    margin-bottom: 20px;

    h4 {
        color: #606266;
        margin: 0 0 12px 0;
    }

    .judges-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .judge-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #f5f7fa;
            border-radius: 20px;
            transition: all 0.3s;

            &.is-current {
                background: #fdf6ec;
            }

            &.assign-btn {
                cursor: pointer;
                background: #f0f9eb;
                color: #67c23a;

                &:hover {
                    background: #e1f3d8;
                }

                .el-avatar {
                    background: #67c23a;
                    color: #fff;
                }
            }

            .judge-name {
                font-size: 14px;
                color: #606266;
            }

            .el-tag {
                margin-left: 4px;
            }
        }
    }

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .assign-btn {
            padding: 4px 12px;

            i {
                margin-right: 4px;
            }
        }
    }
}

/* 修改选项卡滚动样式 */
.tabs-container {
    position: relative;
    width: 100%;

    .el-tabs {
        /deep/ .el-tabs__header {
            margin-bottom: 20px;
        }

        /deep/ .el-tabs__nav-wrap {
            // 移动端显示水平滚动条
            @media (max-width: 768px) {
                overflow-x: auto;

                &::after {
                    display: none; // 移除底部阴影
                }

                .el-tabs__nav {
                    white-space: nowrap;
                    float: none;
                    width: max-content; // important：确保内容不会换行
                }
            }
        }

        /deep/ .el-tabs__nav {
            display: flex;

            .el-tabs__item {
                flex-shrink: 0; // 防止tab项被压缩
                padding: 0 20px; // 调整间距
            }
        }

        /deep/ .el-tabs__content {
            overflow: visible; // 确保内容可见
        }
    }
}

// 修改移动端卡片样式,确保不会被撑宽
@media (max-width: 768px) {
    .competition-card {
        width: 100%; // 设置宽度100%
        min-width: 0; // 允许低于最小宽度
        overflow-x: hidden; // 隐藏水平溢出

        .card-content {
            // width: 100%;
            overflow-x: hidden;
        }
    }
}

/* 修改移动端样式 */
@media (max-width: 768px) {
    .athlete-item {
        flex-direction: row !important; // 强制保持水平布局
        align-items: center !important;

        .score-area {
            width: auto !important; // 取消宽度限制
            justify-content: flex-end !important;
        }
    }
}

.status-alert {
    margin-bottom: 16px;
}
</style>
