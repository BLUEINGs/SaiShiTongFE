<template>
    <div class="group-card" :class="{ 'is-active': isActive }" v-loading="loading" v-bind="$attrs">
        <!-- 修改 handleToggle 的调用方式 -->
        <div class="card-header" @click.stop="handleCardClick">
            <div class="title">
                <h3>{{ title }}</h3>
                <div class="card-info">
                    <!-- 第一行：赛制标签 -->
                    <div class="info-row">
                        <el-tag size="small" :type="systemTagType">{{ systemText }}</el-tag>
                    </div>
                    <!-- 第二行：报名时间信息，允许自动换行 -->
                    <div class="info-row registration-time" v-if="firstEventWithRegistration">
                        <i class="el-icon-time"></i>
                        <span class="time-label">{{ registrationPhase }}报名时间：</span>
                        <span class="time-value">
                            {{ formatDateTime(firstEventWithRegistration.appStartTime) }} 至
                            {{ formatDateTime(firstEventWithRegistration.appEndTime) }}
                        </span>
                    </div>
                </div>
            </div>
            <!-- 简化按钮组逻辑，统一由 isEditMode 控制 -->
            <div class="actions" v-if="isEditMode">
                <el-button-group>
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click.stop="handleEdit" />
                    <el-button size="mini" type="success" icon="el-icon-menu" @click.stop="handleManageGroups" />
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click.stop="handleDelete" />
                </el-button-group>
            </div>
        </div>

        <!-- 卡片展开内容 -->
        <transition name="expand">
            <div v-show="isActive" class="card-content">
                <!-- 比赛阶段选项卡 -->
                <el-tabs v-model="activePhase" class="scrollable-tabs">
                    <el-tab-pane v-for="phase in availablePhases" :key="phase.value" :label="phase.label"
                        :name="phase.value">
                        <!-- 时间信息展示 -->
                        <div class="time-info">
                            <!-- 添加类型信息 -->
                            <div class="info-section">
                                <div class="info-item">
                                    <label>比赛项目：</label>
                                    <span>{{ combinedEventTypeText }}</span>
                                </div>
                                <div v-if="groupData.size" class="info-item">
                                    <label>比赛规格：</label>
                                    <span>{{ sizeText }}</span>
                                </div>
                                <div v-if="groupData.gender !== null" class="info-item">
                                    <label>性别要求：</label>
                                    <span>{{ groupData.gender ? '男子' : '女子' }}</span>
                                </div>
                                <div v-if="groupData.gender !== undefined" class="info-item">
                                    <label>性别限制：</label>
                                    <span>{{ groupData.gender === null ? '不限' : (groupData.gender ? '男子项目' : '女子项目')
                                    }}</span>
                                </div>
                            </div>
                            <div class="time-items">
                                <div v-if="currentPhaseData?.appTime && currentPhaseData.appTime.length === 2"
                                    class="time-item">
                                    <label>报名时间：</label>
                                    <span>{{ formatDateTime(currentPhaseData.appTime[0]) }} 至 {{
                                        formatDateTime(currentPhaseData.appTime[1]) }}</span>
                                </div>
                                <div v-if="currentPhaseData?.registrationTime" class="time-item">
                                    <label>报名时间：</label>
                                    <span>{{ formatDateTime(currentPhaseData.registrationTime[0]) }} 至 {{
                                        formatDateTime(currentPhaseData.registrationTime[1]) }}</span>
                                </div>
                                <div class="time-item">
                                    <label>比赛时间：</label>
                                    <span v-if="currentPhaseData?.compTime">
                                        {{ formatDateTime(currentPhaseData.compTime[0]) }} 至 {{
                                            formatDateTime(currentPhaseData.compTime[1]) }}
                                    </span>
                                    <span v-else class="pending">尚未安排</span>
                                    <!-- 添加场地信息 -->
                                    <template v-if="currentPhaseData?.venue">
                                        <span class="venue-separator">·</span>
                                        <span class="venue-info">
                                            <i class="el-icon-location"></i>
                                            {{ currentPhaseData.venue }}
                                        </span>
                                    </template>
                                </div>
                                <div class="time-item" v-if="false">
                                    <label>裁判时间：</label>
                                    <span v-if="currentPhaseData?.judgeTime">
                                        {{ formatDateTime(currentPhaseData.judgeTime[0]) }} 至 {{
                                            formatDateTime(currentPhaseData.judgeTime[1]) }}
                                    </span>
                                    <span v-else class="pending">尚未安排</span>
                                </div>
                            </div>
                            <div class="signup-section" v-if="showSignupButton && currentPhaseData?.compType === 1">
                                <el-tooltip v-if="isRegistrationClosed" content="已超过报名时间" placement="top">
                                    <el-button :type="isUserEnrolled ? 'danger' : 'primary'" size="medium"
                                        :disabled="isRegistrationClosed || signupLoading" @click.stop="handleSignup">
                                        {{ isUserEnrolled ? '取消报名' : '立即报名' }}
                                    </el-button>
                                </el-tooltip>
                                <el-button v-else :type="isUserEnrolled ? 'danger' : 'primary'" size="medium"
                                    :loading="signupLoading" @click.stop="handleSignup">
                                    {{ isUserEnrolled ? '取消报名' : '立即报名' }}
                                </el-button>
                            </div>
                        </div>

                        <!-- 视图切换 -->
                        <div class="view-controls">
                            <el-radio-group v-model="currentView" size="small" class="view-switch">
                                <el-radio-button label="players">选手一览</el-radio-button>
                                <el-radio-button label="groups"
                                    :disabled="!currentPhaseData?.groups">分组一览</el-radio-button>
                            </el-radio-group>
                        </div>

                        <!-- 选手一览视图 -->
                        <div v-if="currentView === 'players'" class="athletes-view">
                            <template v-if="hasPlayers">
                                <el-table :data="currentPhasePlayers" stripe>
                                    <el-table-column prop="name" label="姓名" />
                                    <el-table-column prop="number" label="号码" />
                                    <el-table-column prop="pclass" label="班级" />
                                </el-table>
                            </template>
                            <div v-else class="empty-tip">{{ emptyDescription }}</div>
                        </div>

                        <!-- 分组一览视图 -->
                        <div v-else-if="currentView === 'groups'" class="groups-view">
                            <template v-if="currentPhaseData?.groups?.length > 0">
                                <el-collapse v-model="activeGroups">
                                    <el-collapse-item v-for="group in currentPhaseData.groups" :key="group.gid"
                                        :title="group.name" :name="group.gid">
                                        <el-table :data="group.players || []" stripe>
                                            <el-table-column prop="name" label="姓名" />
                                            <el-table-column prop="number" label="号码" />
                                            <el-table-column prop="pclass" label="班级" />
                                            <el-table-column prop="score" label="成绩">
                                                <template slot-scope="scope">
                                                    {{ formatScore(scope.row.score) }}
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-collapse-item>
                                </el-collapse>
                            </template>
                            <div v-else class="empty-tip">暂无分组数据</div>
                        </div>
                    </el-tab-pane>
                </el-tabs>

            </div>
        </transition>
        <!-- 添加报名按钮和对话框 -->
        <form-dialog v-model="showSchoolDialog" :title="isUserEnrolled ? '选择要取消的参赛身份' : '选择参赛身份'">
            <el-form>
                <el-form-item label="参赛单位">
                    <el-select v-model="selectedSchool" placeholder="请选择" style="width: 100%">
                        <el-option v-for="school in schools" :key="school.scId" :label="school.name"
                            :value="school.scId">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showSchoolDialog = false">取 消</el-button>
                <el-button type="primary" @click="submitSignup">
                    {{ isUserEnrolled ? '确定取消' : '确定报名' }}
                </el-button>
            </template>
        </form-dialog>
    </div>
</template>

<script>
import request from '@/utils/request'
import bus from '@/utils/bus'
import FormDialog from '@/components/dialogs/FormDialog.vue'
import { formatEventName, formatScore } from '@/utils/formatters'

export default {
    name: 'GroupCard',

    props: {
        groupData: {
            type: Object,
            required: true
        },
        isActive: Boolean,
        isEditMode: Boolean
    },

    data() {
        return {
            players: [], // 独立的运动员列表
            activePhase: null, // 将初始值设为 null
            currentView: 'players', // 当前视图模式
            activeGroups: [], // 展开的分组
            loading: false,
            detailsLoaded: false,
            loadedPhases: new Set(), // 记录已加载分组数据的阶段
            localGroupData: {}, // 添加本地数据
            groupsCache: new Map(), // 添加缓存存储
            showSchoolDialog: false, // 控制报名对话框显示
            selectedSchool: null, // 选中的学校
            schools: [], // 用户加入的学校列表
            userPowerDegree: [], // 添加用户权限数组
            isMobile: false,
            currentUserId: null,
            userRegistrations: [], // 添加用户报名信息数组
            signupLoading: false // 添加报名加载状态
        }
    },

    created() {
        // 初始化本地数据
        this.localGroupData = JSON.parse(JSON.stringify(this.groupData));
        // 从localStorage获取用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        this.userPowerDegree = userInfo.powerDegree || [];
        this.currentUserId = userInfo.uid;
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile);
    },

    watch: {
        groupData: {
            handler(val) {
                this.localGroupData = JSON.parse(JSON.stringify(val));
            },
            deep: true
        },
        // 添加对 availablePhases 的监听
        availablePhases: {
            immediate: true,
            handler(phases) {
                if (phases.length > 0 && (!this.activePhase || !phases.find(p => p.value === this.activePhase))) {
                    this.activePhase = phases[0].value;
                }
            }
        },
        activePhase: {
            handler(newPhase) {
                if (newPhase && this.isActive && !this.loadedPhases.has(newPhase)) {
                    this.loadPhaseDetails(newPhase)
                }
            },
            immediate: true
        }
    },

    computed: {
        title() {
            // alert(formatEventName(this.groupData))
            return formatEventName(this.groupData)
        },
        systemText() {
            const system = Number(this.groupData.compSystem)
            const map = {
                1: '决赛制',
                2: '预赛+决赛',
                3: '预赛+半决赛+决赛'
            }
            return map[system] || '未知赛制'
        },

        systemTagType() {
            const system = Number(this.groupData.compSystem)
            const map = {
                1: 'success',
                2: 'warning',
                3: 'primary'
            }
            return map[system] || 'info'
        },

        availablePhases() {
            if (!Array.isArray(this.groupData?.sports)) return [];

            const phases = [];
            this.groupData.sports.forEach(sport => {
                if (sport && typeof sport.compType !== 'undefined') {
                    const label = this.getEventTypeName(sport.compType);
                    phases.push({
                        label,
                        value: String(sport.compType)
                    });
                }
            });
            return phases;
        },

        // 修改 currentPhaseData 计算属性
        currentPhaseData() {
            if (!this.activePhase || !Array.isArray(this.localGroupData?.sports)) {
                return null;
            }
            const sport = this.localGroupData.sports.find(sport =>
                String(sport.compType) === String(this.activePhase)
            );

            if (!sport) return null;

            // 添加对比赛时间的处理
            return {
                ...sport,
                compTime: sport.gameStartTime && sport.gameEndTime ? [
                    sport.gameStartTime,
                    sport.gameEndTime
                ] : null,
                venue: sport.venue || '',
                groups: sport.groups || []
            };
        },

        currentPhasePlayers() {
            if (!this.currentPhaseData) return [];

            // 如果是未分组状态(gid=-1)，直接返回该组的选手列表
            if (this.hasDefaultGroup) {
                const defaultGroup = this.currentPhaseData.groups?.find(g => g.gid === -1);
                return defaultGroup?.players || [];
            }

            // 如果已分组，合并所有组的选手
            if (this.currentPhaseData.groups) {
                return this.currentPhaseData.groups.reduce((acc, group) => {
                    if (Array.isArray(group.players)) {
                        return acc.concat(group.players);
                    }
                    return acc;
                }, []);
            }

            return [];
        },

        hasDefaultGroup() {
            return this.currentPhaseData?.groups?.some(g => g.gid === -1);
        },

        hasPlayers() {
            const players = this.currentPhasePlayers;
            return Array.isArray(players) && players.length > 0;
        },

        emptyDescription() {
            const phase = parseInt(this.activePhase);
            // 修改为使用sports数组
            const firstPhase = this.groupData.sports?.[0]?.compType;
            if (phase === firstPhase) {
                return "暂时无人报名";
            }
            return "上一场比赛尚未晋级";
        },

        // 添加新的计算属性
        firstEventWithRegistration() {
            if (!Array.isArray(this.groupData?.sports)) return null;

            return this.groupData.sports.find(sport =>
                sport && sport.appStartTime && sport.appEndTime
            );
        },

        registrationPhase() {
            if (!this.firstEventWithRegistration) return ''
            const phaseMap = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            return phaseMap[this.firstEventWithRegistration.compType] || ''
        },

        // 添加新的计算属性
        eventTypeText() {
            const types = {
                1: '径赛',
                2: '田赛'
            }
            return types[this.groupData.eventType] || '未知类型'
        },

        subEventTypeText() {
            const types = {
                1: this.groupData.eventType === 1 ? '个人跑' : '跳远',
                2: this.groupData.eventType === 1 ? '接力跑' : '三级跳远',
                3: '铅球',
                4: '跳高'
            }
            return types[this.groupData.subEventType] || '未知项目'
        },

        sizeText() {
            if (!this.groupData.size) return ''
            return this.groupData.eventType === 1 ?
                (this.groupData.subEventType === 2 ? this.groupData.size : `${this.groupData.size}米`) :
                this.groupData.size
        },

        showSignupButton() {
            return this.userPowerDegree.includes(4)
        },

        // 合并类型文本
        combinedEventTypeText() {
            const type = this.eventTypeText
            const subType = this.subEventTypeText
            return `${type} ${subType}`
        },

        // 判断用户是否已报名
        isUserEnrolled() {
            if (!this.currentUserId || !this.currentPhasePlayers) return false
            return this.currentPhasePlayers.some(player => player.uid === this.currentUserId)
        },

        // 添加报名时间检查计算属性
        isRegistrationClosed() {
            const currentTime = Date.now();
            const appEndTime = new Date(this.firstEventWithRegistration?.appEndTime).getTime();
            return currentTime > appEndTime;
        },

        // 获取当前用户的所有报名记录
        userRegistrationRecords() {
            if (!this.currentPhasePlayers || !this.currentUserId) return [];
            return this.currentPhasePlayers.filter(player =>
                player.uid === this.currentUserId
            ).map(player => ({
                scId: player.scId,
                pclass: player.pclass,
                pid: player.pid
            }));
        }
    },

    methods: {
        initAthletes() {
            // 修改为使用 sports 而不是 events
            if (!this.groupData?.sports) return;

            const allPlayers = new Map();

            // 遍历所有比赛阶段，收集所有运动员
            this.groupData.sports.forEach(sport => {
                if (Array.isArray(sport.groups)) {
                    sport.groups.forEach(group => {
                        if (Array.isArray(group.players)) {
                            group.players.forEach(player => {
                                if (player && player.pid) {
                                    allPlayers.set(player.pid, {
                                        id: player.pid,
                                        name: player.name,
                                        number: player.number,
                                        pclass: player.pclass
                                    });
                                }
                            });
                        }
                    });
                }
            });

            // 更新独立的运动员列表
            this.players = Array.from(allPlayers.values());
        },

        formatDateTime(timestamp) {
            if (!timestamp) return '待定';
            try {
                // 处理ISO格式时间字符串
                const date = new Date(timestamp);
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', timestamp);
                    return '待定';
                }

                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return '待定';
            }
        },

        handleDelete() {
            this.$confirm('确定要删除该赛组吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('delete')
            }).catch(() => { })
        },

        // 获取赛事类型名称
        getEventTypeName(compType) {
            const typeMap = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            };
            return typeMap[compType] || '未知赛段';
        },

        async handleCardClick() {
            if (!this.groupData?.id) {
                this.$message.warning('赛组数据无效');
                return;
            }

            try {
                if (!this.isActive && this.activePhase && !this.loadedPhases.has(this.activePhase)) {
                    await this.loadPhaseDetails(this.activePhase);
                }
                this.$emit('toggle', this.groupData.id);
            } catch (error) {
                console.error('Error in handleCardClick:', error);
                this.$message.error('操作失败');
            }
        },

        // 新增缓存管理方法
        getCachedGroups(spId) {
            return this.groupsCache.get(spId);
        },

        setCachedGroups(spId, groups) {
            this.groupsCache.set(spId, groups);
        },

        // 修改加载详情方法
        async loadPhaseDetails(compType) {
            console.log('Loading phase details - compType:', compType);

            const sportWithType = this.localGroupData.sports.find(s =>
                s.compType === Number(compType)
            );

            if (!sportWithType) return;

            // 检查缓存
            const cachedGroups = this.getCachedGroups(sportWithType.spId);
            if (cachedGroups) {
                console.log('Using cached data for spId:', sportWithType.spId);
                const sportIndex = this.localGroupData.sports.findIndex(s =>
                    s.spId === sportWithType.spId
                );
                if (sportIndex > -1) {
                    // 确保数据更新触发视图更新
                    this.$set(this.localGroupData.sports[sportIndex], 'groups', JSON.parse(JSON.stringify(cachedGroups)));
                    this.loadedPhases.add(compType);
                }
                return;
            }

            this.loading = true;
            try {
                const res = await request({
                    url: '/getMatchGroups',
                    method: 'get',
                    params: { spId: sportWithType.spId }
                });

                if (res.code === 1) {
                    // 更新缓存
                    this.setCachedGroups(sportWithType.spId, res.data);

                    const sportIndex = this.localGroupData.sports.findIndex(s =>
                        s.compType === Number(compType)
                    );

                    if (sportIndex > -1) {
                        this.$set(this.localGroupData.sports[sportIndex], 'groups', res.data);
                        this.loadedPhases.add(compType);
                    }
                }
            } catch (error) {
                console.error('Error loading phase details:', error);
                this.$message.error('获取分组数据失败');
            } finally {
                this.loading = false;
            }
        },

        // 修改管理分组方法
        async handleManageGroups() {
            try {
                this.loading = true;
                console.log('Start loading group data...');

                // 重新初始化本地数据
                this.localGroupData = JSON.parse(JSON.stringify(this.groupData));

                // 先加载所有未缓存的数据
                const unloadedSports = this.localGroupData.sports.filter(sport =>
                    !this.getCachedGroups(sport.spId)
                );

                if (unloadedSports.length > 0) {
                    const promises = unloadedSports.map(async sport => {
                        try {
                            const res = await request({
                                url: '/getMatchGroups',
                                method: 'get',
                                params: { spId: sport.spId }
                            });

                            return {
                                success: res.code === 1,
                                spId: sport.spId,
                                compType: sport.compType,
                                data: res.code === 1 ? res.data : []
                            };
                        } catch (error) {
                            console.error(`Error loading groups:`, error);
                            return {
                                success: false,
                                spId: sport.spId,
                                compType: sport.compType,
                                data: []
                            };
                        }
                    });

                    const results = await Promise.all(promises);

                    // 更新缓存和本地数据
                    results.forEach(result => {
                        if (result.success) {
                            this.setCachedGroups(result.spId, result.data);
                            const sportIndex = this.localGroupData.sports.findIndex(s =>
                                s.spId === result.spId
                            );
                            if (sportIndex > -1) {
                                this.$set(this.localGroupData.sports[sportIndex], 'groups', result.data);
                            }
                        }
                    });
                }

                // 使用缓存数据更新其他阶段
                this.localGroupData.sports.forEach(sport => {
                    const cachedGroups = this.getCachedGroups(sport.spId);
                    if (cachedGroups) {
                        const sportIndex = this.localGroupData.sports.findIndex(s =>
                            s.spId === sport.spId
                        );
                        if (sportIndex > -1) {
                            this.$set(this.localGroupData.sports[sportIndex], 'groups', cachedGroups);
                        }
                    }
                });

                // 发送数据到分组管理组件
                bus.$emit('group-data-init', this.localGroupData);
                this.$emit('manage-groups', this.localGroupData);

            } catch (error) {
                console.error('Error in handleManageGroups:', error);
                this.$message.error('获取分组数据失败');
            } finally {
                this.loading = false;
            }
        },

        handleEdit() {
            console.log('Edit group data:', this.groupData);
            this.$emit('edit', this.groupData);
        },

        checkMobile() {
            this.isMobile = window.innerWidth <= 768
        },

        // 修改报名处理方法
        async handleSignup() {
            if (this.isRegistrationClosed || this.signupLoading) {
                return;
            }

            this.signupLoading = true;
            const wasEnrolled = this.isUserEnrolled;

            try {
                if (wasEnrolled) {
                    // 处理取消报名
                    const records = this.userRegistrationRecords;

                    if (records.length === 0) {
                        this.$message.warning('未找到报名记录');
                        return;
                    }

                    if (records.length === 1) {
                        await this.submitCancelSignup(records[0].scId);
                    } else {
                        this.schools = records.map(record => ({
                            scId: record.scId,
                            name: record.pclass
                        }));
                        this.selectedSchool = null;
                        this.showSchoolDialog = true;
                    }
                } else {
                    const res = await request({
                        url: '/getUserInfo',
                        method: 'get'
                    });

                    if (res.code === 1) {
                        const schools = res.data.joinedSchools;
                        if (!schools || schools.length === 0) {
                            this.$message.warning('您还未加入任何团体');
                            return;
                        }

                        this.schools = schools;
                        if (schools.length === 1) {
                            this.selectedSchool = schools[0].scId;
                            await this.submitSignup();
                        } else {
                            this.showSchoolDialog = true;
                        }
                    }
                }
            } catch (error) {
                console.error('报名操作失败:', error);
                this.$message.error('操作失败');

                // 恢复本地报名状态
                if (!wasEnrolled) {
                    await this.loadPhaseDetails(this.activePhase);
                }
            } finally {
                this.signupLoading = false;
            }
        },

        async submitSignup() {
            if (!this.selectedSchool) {
                this.$message.warning('请选择参赛团体')
                return
            }

            if (this.isUserEnrolled) {
                // 取消报名
                await this.submitCancelSignup(this.selectedSchool);
            } else {
                // 原有的报名逻辑
                try {
                    const formData = new URLSearchParams()
                    formData.append('spId', this.groupData.sports[0].spId)
                    formData.append('scId', this.selectedSchool)

                    const res = await request({
                        url: '/signup',
                        method: 'post',
                        data: formData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })

                    if (res.code === 1) {
                        this.$message.success('报名成功')
                        this.showSchoolDialog = false
                    } else {
                        this.$message.error(res.message || '报名失败')
                    }
                } catch (error) {
                    console.error('报名失败:', error)
                    this.$message.error('报名失败')
                }
            }
        },

        // 添加取消报名的具体实现
        async submitCancelSignup(scId) {
            try {
                const formData = new URLSearchParams()
                formData.append('spId', this.groupData.sports[0].spId)
                formData.append('scId', scId)

                const res = await request({
                    url: '/cancelSignup',
                    method: 'post',
                    data: formData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })

                if (res.code === 1) {
                    this.$message.success('取消报名成功')
                    this.showSchoolDialog = false
                    // 重新加载数据
                    this.loadPhaseDetails(this.activePhase)
                } else {
                    this.$message.error(res.message || '取消报名失败')
                }
            } catch (error) {
                console.error('取消报名失败:', error)
                this.$message.error('取消报名失败')
            }
        },

        formatScore // 添加formatScore方法引用
    },
    components: {
        FormDialog
    }
}
</script>

<style lang="less" scoped>
.group-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    transition: all 0.3s ease;
    transform-origin: top;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), grid-column 0s;
    grid-column: auto;

    &:hover {
        transform: translateY(-2px);
    }

    &.is-active {
        grid-column: 1 / -1; // 展开时占据整行
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    .card-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start; // 修改为顶部对齐
        cursor: pointer;
        min-height: 48px; // 确保收起状态下的最小高度
        gap: 12px; // 添加间距
        position: relative; // 添加相对定位作为定位上下文

        .title {
            h3 {
                margin: 0 0 8px;
                font-size: 16px;
                transition: color 0.3s ease;
            }

            .el-tag {
                transition: all 0.3s ease;
                transform-origin: center;
            }

            flex: 1;
            min-width: 0; // 允许内容收缩
            padding-right: 60px; // 为固定定位的按钮预留空间

            .card-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 8px;

                .info-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    &.registration-time {
                        font-size: 13px;
                        color: #606266;
                        flex-wrap: wrap; // 允许内容换行
                        padding-right: 8px;

                        .el-icon-time {
                            color: #909399;
                            margin-right: 4px;
                            flex-shrink: 0; // 图标不缩小
                        }

                        .time-label {
                            white-space: nowrap; // 标签文字不换行
                            flex-shrink: 0; // 标签不缩小
                        }

                        .time-value {
                            word-break: break-all; // 允许在任意字符间换行
                            flex: 1; // 占据剩余空间
                            min-width: 200px; // 设置最小宽度以触发换行
                        }
                    }
                }
            }
        }

        .actions {
            flex-shrink: 0; // 防止按钮组被压缩
            margin-top: 4px; // 微调按钮位置
            position: absolute; // 始终固定定位
            right: 16px;
            top: 16px;
            z-index: 2; // 确保按钮在上层

            .el-button-group {
                .el-button {
                    padding: 7px 10px; // 稍微调整按钮大小

                    // 添加悬停效果
                    &:hover {
                        transform: scale(1.05);
                    }
                }
            }
        }

        &:hover {
            .title h3 {
                color: #409EFF;
            }

            .el-tag {
                transform: scale(1.05);
            }
        }
    }

    .card-content {
        padding: 16px;
        border-top: 1px solid #eee;
    }

    .view-switch {
        margin-bottom: 16px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .athletes-view,
    .groups-view {
        margin-top: 16px;
    }
}

// 添加展开/收起动画
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 1000px; // 设置一个足够大的高度
    opacity: 1;
    overflow: hidden;
}

.expand-enter,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding: 0 16px;
}

.time-info {
    margin-bottom: 20px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    .info-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;

        .info-item {
            display: flex;
            align-items: center;

            label {
                color: #606266;
                margin-right: 8px;
                font-weight: bold;
                min-width: 80px;
            }

            span {
                color: #303133;
            }
        }

        .el-button {
            align-self: flex-end;
            margin-top: 8px;
        }
    }

    .time-items {
        .time-item {
            margin: 8px 0;

            label {
                color: #606266;
                margin-right: 8px;
                font-weight: bold;
            }

            .pending {
                color: #909399;
                font-style: italic;
            }

            .venue-separator {
                margin: 0 8px;
                color: #909399;
            }

            .venue-info {
                color: #67C23A;

                i {
                    margin-right: 4px;
                }
            }
        }
    }

    .signup-section {
        text-align: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);

        .el-button {
            width: 80%;
            max-width: 300px;

            &:disabled {
                cursor: not-allowed;
                opacity: 0.9;
            }
        }
    }

    &:hover {
        background: #eef1f6;
    }
}

.empty-tip {
    text-align: center;
    color: #909399;
    padding: 30px 0;
    font-size: 14px;
}

// 添加表格行hover效果
::v-deep .el-table {
    tr {
        transition: background-color 0.2s ease;
    }

    tbody tr:hover>td {
        background-color: #f0f7ff !important;
    }
}

@media (max-width: 768px) {
    .group-card {
        .card-header {
            flex-direction: column;
            align-items: flex-start;

            .title {
                padding-right: 60px; // 为按钮预留空间

                .card-info {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    margin-right: 48px; // 为按钮预留空间

                    .info-row {
                        &.registration-time {
                            font-size: 12px;

                            .time-value {
                                min-width: 100%; // 移动端时间值总是独占一行
                                margin-top: 4px; // 添加一些间距
                            }
                        }
                    }
                }
            }

            .actions {
                position: absolute; // 将按钮组定位到右上角
                right: 16px;
                top: 16px;
            }
        }
    }
}

.view-controls {
    // 修改视图控制区域样式，移除多余的空间
    display: flex;
    justify-content: center;
    margin: 16px 0;
}

.default-group-tip {
    text-align: center;
    padding: 20px;
    color: #909399;
    background: #f5f7fa;
    border-radius: 4px;
    margin: 10px 0;
}

/* 添加水平滚动样式 */
.scrollable-tabs {
    ::v-deep .el-tabs__header {
        margin: 0 -16px 16px;

        .el-tabs__nav-wrap {
            overflow-x: auto;
            overflow-y: hidden;

            &::-webkit-scrollbar {
                display: none;
            }

            .el-tabs__nav-scroll {
                padding: 0 16px;
                white-space: nowrap;
            }
        }
    }
}

.signup-button {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
}

// 调整信息行样式
.info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}

/* 移动端样式优化 */
.signup-dialog {
    ::v-deep .el-dialog__body {
        padding: 20px;

        .el-select {
            width: 100%;
        }
    }

    @media screen and (max-width: 768px) {
        margin: 0 !important;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: none;

        .el-form-item {
            margin-bottom: 15px;
        }
    }
}
</style>