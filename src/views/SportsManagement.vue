<template>
    <div class="sport-management" v-loading="loading" element-loading-text="加载中...">
        <!-- 头部操作栏 -->
        <div class="action-bar">
            <!-- 筛选器和新建按钮容器 -->
            <div class="action-bar-content">
                <!-- 筛选器组 -->
                <div class="filter-container">
                    <FilterDropdown v-model="currentStateFilter" :options="filterOptions.status" label="状态"
                        @change="handleStateFilter" />
                    <FilterDropdown v-model="currentEventType" :options="filterOptions.eventType" label="项目"
                        @change="handleEventTypeFilter" />
                    <FilterDropdown v-if="!isMobile" v-model="currentSystemFilter" :options="filterOptions.system"
                        label="赛制" @change="handleSystemFilter" />
                    <FilterDropdown v-model="currentGenderFilter" :options="filterOptions.gender" label="性别"
                        @change="handleGenderFilter" />
                </div>

                <!-- 添加新建按钮 -->
                <el-button v-if="isEditMode" type="primary" class="create-button" icon="el-icon-plus"
                    @click="handleCreate">发布新赛组</el-button>
            </div>
        </div>

        <!-- 赛组卡片列表 -->
        <transition-group name="card-list" tag="div" class="group-list" :class="{ 'has-active': activeGroupId }"
            :css="false">
            <group-card v-for="group in displayGroups" :key="group.id" :group-data="group"
                :is-active="String(group.id) === activeGroupId" :is-edit-mode="isEditMode" @toggle="toggleGroup"
                @edit="openEditDialog" @manage-groups="openGroupManagement" @delete="deleteGroup(group)" />

            <!-- 添加新建卡片 -->
            <div v-if="isEditMode" class="add-card" key="add-card-button" @click="handleCreate">
                <el-button type="dashed" icon="el-icon-plus">添加赛组</el-button>
            </div>

            <!-- 空状态提示 -->
            <el-empty v-if="groups.length === 0" key="empty-state-message" description="暂无赛组数据" />
        </transition-group>

        <!-- 使用封装的SportDialog组件 -->
        <sport-dialog :visible.sync="showEditDialog" :sport-data="currentGroup" :venues="venues"
            :score-rules="scoreRules" @save="saveGroup" @time-change="handleTimeChange" />

        <!-- 其他对话框 -->
        <responsive-dialog :visible.sync="showGroupManageDialog" :title="`${currentPhase.name || ''} - 分组管理`"
            width="90%">
            <div class="group-management-wrapper">
                <group-management :visible="showGroupManageDialog" :current-phase="currentPhase"
                    :events="currentGroup.sports || []" :athletes="currentGroup.players || []"
                    @save="handleGroupsSave" />
                <!-- 添加遮罩层和提示信息 -->
                <div class="feature-unavailable-mask">
                    <div class="message-box">
                        <i class="el-icon-info"></i>
                        <p>目前项目分组完全依赖系统自动分组。</p>
                        <p>手动分组管理功能暂未开放，将在后续的版本中启用手动分组。</p>
                    </div>
                </div>
            </div>
        </responsive-dialog>

        <!--         
        <div v-if="isEditMode" class="floating-buttons">
            <el-button type="primary" icon="el-icon-setting" circle @click="showConfig"></el-button>
        </div>

        <responsive-dialog title="参数配置" :visible.sync="configDialogVisible" width="500px" @confirm="saveConfig"
            @cancel="configDialogVisible = false">
            <div class="config-content">
                <div class="header">
                    <h3>比赛场地管理</h3>
                    <el-button type="primary" size="small" @click="addVenue">
                        添加场地
                    </el-button>
                </div>
                <div class="venues-list">
                    <el-tag v-for="(venue, index) in venues" :key="index" closable :disable-transitions="false"
                        @close="handleDeleteVenue(index)" class="venue-tag">
                        {{ venue }}
                    </el-tag>
                </div>
                <div v-if="showAddVenue" class="venue-input">
                    <el-input v-model="newVenue" ref="newVenueInput" size="small" @keyup.enter.native="handleAddVenue"
                        @blur="handleAddVenue" placeholder="请输入场地名称">
                        <template slot="append">
                            <el-button size="small" @click="handleAddVenue">确定</el-button>
                        </template>
</el-input>
</div>
</div>
</responsive-dialog> -->
    </div>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import GroupCard from '@/components/GroupCard.vue'
import GroupManagement from '@/components/GroupManagement.vue'
import SportDialog from '@/components/dialogs/SportDialog.vue'
import FilterDropdown from '@/components/filter/FilterDropdown.vue'
import request from '@/utils/request' // 引入request模块

export default {
    components: {
        GroupCard,
        GroupManagement,
        ResponsiveDialog,
        SportDialog,
        FilterDropdown
    },
    data() {
        const validateAppTime = (rule, value, callback) => {
            if (!this.formData.appTimeStart) {
                return callback(new Error('请先选择报名开始时间'));
            }
            if (!this.formData.appTimeEnd) {
                return callback(new Error('请选择报名结束时间'));
            }
            if (Number(this.formData.appTimeEnd) <= Number(this.formData.appTimeStart)) {
                return callback(new Error('报名结束时间必须晚于开始时间'));
            }
            callback();
        };

        return {
            loading: false, // 添加loading状态
            activeGroupId: null,
            showEditDialog: false,
            currentGroup: this.emptyGroup(),
            groups: [], // 移除 mockGroups，初始化为空数组
            formData: {
                name: '',
                system: 2,
                appTimeStart: '',
                appTimeEnd: '',
                events: [],
                preliminaryPromotionType: 'fixed',
                preliminaryPromotionQuota: 8,
                semifinalPromotionType: 'fixed',
                semifinalPromotionQuota: 4,
                preliminaryAthletePerGroup: 4, // 预赛每组人数
                semifinalAthletePerGroup: 4, // 半决赛每组人数
                finalAthletePerGroup: 4, // 冭赛每组人数
                // 添加场地相关字段
                preliminaryVenue: '',
                semifinalVenue: '',
                finalVenue: '',
            },
            rules: {
                name: [
                    { required: true, message: '请输入赛组名称', trigger: 'blur' }
                ],
                appTimeStart: [
                    { required: true, message: '请选择报名开始时间', trigger: 'change' }
                ],
                appTimeEnd: [
                    { required: true, message: '请选择报名结束时间', trigger: 'change' },
                    { validator: validateAppTime, trigger: 'change' }
                ]
            },
            activeGroupsEdit: [], // 编辑时展开的分组面板
            showGroupManageDialog: false,
            activeEventTab: '1',
            searchUnassigned: '',
            searchAssigned: '',
            selectedUnassigned: [],
            selectedAssigned: [],
            showMemberDialog: false,
            currentGroupEvents: [],
            currentPhase: {
                name: '',
                type: 1
            },
            activeConfigTab: 'promotion', // 默认显示晋级配置
            // 场地配置相关
            configDialogVisible: false,
            venues: ['主田径场', '副田径场', '室内体育馆', '训练场'],  // 默认场地
            showAddVenue: false,
            newVenue: '',
            currentFilter: 'all', // 添加筛选状态
            filteredGroups: [],    // 添加筛选后的赛组列表
            // 筛选相关
            currentStateFilter: 'enrolling', // 默认显示报名中
            currentSystemFilter: 'all',
            currentGenderFilter: 'all',
            currentEventType: 'all',
            currentSubEventType: 'all',
            stateFilterMap: {
                all: '全部',
                preparing: '筹备中',
                enrolling: '报名中',
                ongoing: '进行中',
                finished: '已结束'
            },
            timeSortMap: {
                none: '默认',
                asc: '升序',
                desc: '降序'
            },
            eventTypeMap: {
                all: '全部',
                1: '径赛',
                2: '田赛'
            },
            subEventTypeMap: {
                all: '全部',
                '1-1': '个人跑',
                '1-2': '接力跑',
                '2-1': '跳远',
                '2-2': '三级跳远',
                '2-3': '铅球',
                '2-4': '跳高'
            },
            filterOptions: {
                status: [
                    { value: 'all', label: '全部' },
                    { value: 'preparing', label: '筹备中' },
                    { value: 'enrolling', label: '报名中' },
                    { value: 'ongoing', label: '进行中' },
                    { value: 'finished', label: '已结束' }
                ],
                eventType: [
                    { value: 'all', label: '全部' },
                    { value: '1', label: '径赛' },
                    { value: '2', label: '田赛' }
                ],
                system: [
                    { value: 'all', label: '全部' },
                    { value: '1', label: '决赛' },
                    { value: '2', label: '预决' },
                    { value: '3', label: '预半决' }
                ],
                gender: [
                    { value: 'all', label: '全部' },
                    { value: 'male', label: '男子' },
                    { value: 'female', label: '女子' },
                    { value: 'unlimited', label: '不限' }
                ]
            },
            isMobile: false,
            scoreRules: [], // 添加评分规则数组
        }
    },
    watch: {
        'formData.appTimeStart'(val) {
            if (val && this.currentGroup.events?.[0]) {
                const appTime = [val]
                if (this.formData.appTimeEnd) appTime.push(this.formData.appTimeEnd)
                this.$set(this.currentGroup.events[0], 'appTime', appTime)
            }
        },
        'formData.appTimeEnd'(val) {
            if (val && this.currentGroup.events?.[0]) {
                const appTime = [this.formData.appTimeStart]
                if (val) appTime.push(val)
                this.$set(this.currentGroup.events[0], 'appTime', appTime)
            }
        }
    },
    computed: {
        /* isMobile() {
            return window.innerWidth < 768
        }, */
        filteredUnassignedPlayers() {
            // 确保 currentGroup 和 players 存在
            if (!this.currentGroup?.players) {
                return []
            }
            return this.currentGroup.players.filter(player => {
                return !this.currentGroupEvents.some(event => {
                    return event.groups?.some(group => {
                        return group.players?.some(p => p.id === player.id)
                    })
                }) && (
                        player.name.includes(this.searchUnassigned) ||
                        player.number.includes(this.searchUnassigned)
                    )
            })
        },
        filteredAssignedPlayers() {
            return this.currentGroupEvents.find(event => event.type === Number(this.activeEventTab))?.groups?.flatMap(group => group.players) || []
        },
        // 添加新的计算属性来获取所有运动员
        getAllAthletes() {
            // 使用 Map 来去重，以 id 为键
            const athletesMap = new Map()

            // 收集当前赛组所有阶段的运动员
            this.currentGroup.events?.forEach(event => {
                event.groups?.forEach(group => {
                    group.players?.forEach(player => {
                        if (player.id) {
                            athletesMap.set(player.id, player)
                        }
                    })
                })
            })

            // 转换为数组
            const athletes = Array.from(athletesMap.values())
            console.log('运动员数据已更新:', athletes)
            return athletes
        },
        // 添加过滤后的赛组列表计算属性
        displayGroups() {
            let filtered = [...this.groups];

            // 状态筛选
            if (this.currentStateFilter !== 'all') {
                const now = Date.now();
                filtered = filtered.filter(group => {
                    const firstSport = group.sports?.[0];
                    if (!firstSport) return false;

                    const appStartTime = new Date(firstSport.appStartTime).getTime();
                    const appEndTime = new Date(firstSport.appEndTime).getTime();
                    const lastSport = group.sports[group.sports.length - 1];
                    const gameEndTime = new Date(lastSport.gameEndTime).getTime();

                    switch (this.currentStateFilter) {
                        case 'preparing': return appStartTime > now;
                        case 'enrolling': return appStartTime <= now && appEndTime >= now;
                        case 'ongoing': return appEndTime < now && gameEndTime >= now;
                        case 'finished': return gameEndTime < now;
                        default: return true;
                    }
                });
            }

            // 项目类型筛选
            if (this.currentEventType !== 'all') {
                filtered = filtered.filter(group =>
                    String(group.eventType) === this.currentEventType
                );
            }

            // 赛制筛选
            if (this.currentSystemFilter !== 'all') {
                filtered = filtered.filter(group =>
                    String(group.compSystem) === this.currentSystemFilter
                );
            }

            // 性别筛选
            if (this.currentGenderFilter !== 'all') {
                filtered = filtered.filter(group => {
                    switch (this.currentGenderFilter) {
                        case 'male': return group.gender === true;
                        case 'female': return group.gender === false;
                        case 'unlimited': return group.gender === null;
                        default: return true;
                    }
                });
            }

            return filtered;
        },
        stateFilterText() {
            return this.stateFilterMap[this.currentStateFilter];
        },
        timeSortText() {
            return this.timeSortMap[this.currentTimeSort];
        },
        eventTypeText() {
            return this.eventTypeMap[this.currentEventType];
        },
        subEventTypeText() {
            const key = this.currentEventType === 'all' ? 'all' :
                `${this.currentEventType}-${this.currentSubEventType}`;
            return this.subEventTypeMap[key] || '全部';
        }
    },
    created() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const powerDegree = userInfo.powerDegree || [];
        this.isEditMode = powerDegree.includes(5);
        // 根据权限设置默认筛选状态
        this.currentStateFilter = powerDegree.includes(5) ? 'all' : 'enrolling';
    },
    methods: {
        // 初始化空赛组
        emptyGroup() {
            const now = Date.now()
            const tomorrow = now + 86400000 // 24小时后

            return {
                isEditMode: false,
                id: null,
                name: '',
                system: 2, // 默认预赛+决赛制
                signupCount: 0,
                players: [], // 添加 players 数组
                sports: [{  // 改为 sports
                    type: 1, // 预赛
                    compTime: null,
                    appTime: [now, tomorrow], // 修改为appTime
                    groups: null,
                    players: [], // 修改此处
                    finished: false,
                    promotionType: 'fixed',
                    promotionQuota: 8,
                    venue: '', // 初始化场地为空
                }, {
                    type: 3, // 冭赛
                    compTime: null,
                    groups: null,
                    players: [], // 修改此处
                    finished: false,
                    venue: '', // 初始化场地为空
                }]
            }
        },

        // 修改 toggleGroup 方法
        toggleGroup(id) {
            if (!id) return;
            const strId = String(id);
            this.activeGroupId = this.activeGroupId === strId ? null : strId;
        },

        // 打开编辑对话框
        openEditDialog(group) {
            try {
                if (!group || !group.sports?.[0]?.mainSpId) {
                    this.$message.warning('无效的赛组数据');
                    return;
                }

                // 深拷贝当前组数据，确保包含所有必要字段
                this.currentGroup = {
                    id: group.id,
                    name: group.name,
                    compSystem: group.compSystem,
                    sports: JSON.parse(JSON.stringify(group.sports)),
                    eventType: group.eventType,
                    subEventType: group.subEventType,
                    size: group.size,
                    gender: group.gender
                };

                this.showEditDialog = true;
            } catch (error) {
                console.error('Error in openEditDialog:', error);
                this.$message.error('打开编辑对话框失败');
            }
        },

        // 修改 saveGroup 方法
        async saveGroup(/* responseData */) {
            try {
                // 刷新整个列表数据
                await this.fetchSports();
                this.showEditDialog = false;
            } catch (error) {
                console.error('Error refreshing sports list:', error);
                this.$message.error('刷新数据失败');
            }
        },

        // 修改删除方法
        async deleteGroup(group) {
            try {
                // 从 sports 数组中获取 mainSpId
                const mainSpId = group.sports[0].mainSpId;
                if (!mainSpId) {
                    this.$message.error('获取赛组ID失败');
                    return;
                }

                const res = await request({
                    url: '/deleteSport',
                    method: 'get',
                    params: { mainSpId } // 修改这里：使用params传递mainSpId
                });

                if (res.code === 1) {
                    const index = this.groups.findIndex(g => g.id === group.id);
                    this.groups.splice(index, 1);
                    this.$message.success('删除成功');
                }
            } catch (error) {
                console.error('删除赛组失败:', error);
                this.$message.error('删除赛组失败');
            }
        },

        // 处理时间变更事件
        handleTimeChange() {
            // 更新当前组的报名时间
            if (this.currentGroup.events?.[0]) {
                this.$set(this.currentGroup.events[0], 'appTime', [
                    this.formData.appTimeStart,
                    this.formData.appTimeEnd
                ]);
            }
        },

        // 修改 handleSystemChange 方法
        handleSystemChange(system) {
            const events = []
            const oldEvents = this.currentGroup.events || []
            const appTime = [this.formData.appTimeStart, this.formData.appTimeEnd]

            // 辅助函数：从旧事件中查找对应类型的事件数据
            const findOldEvent = (type) => oldEvents.find(e => e.type === type)

            // 判断是否需要创建预赛
            if (system >= 2) {
                const oldPreliminary = findOldEvent(1)
                events.push({
                    type: 1,
                    compTime: oldPreliminary?.compTime || null,
                    appTime: appTime[0] && appTime[1] ? appTime : [Date.now(), Date.now() + 86400000],
                    groups: oldPreliminary?.groups || null,
                    players: oldPreliminary?.players || [],
                    finished: oldPreliminary?.finished || false,
                    promotionType: oldPreliminary?.promotionType || this.formData.preliminaryPromotionType,
                    promotionQuota: oldPreliminary?.promotionQuota || this.formData.preliminaryPromotionQuota,
                    venue: oldPreliminary?.venue || this.formData.preliminaryVenue, // 初始化场地
                })
            }

            // 判断是否需要创建半决赛
            if (system === 3) {
                const oldSemifinal = findOldEvent(2)
                events.push({
                    type: 2,
                    compTime: oldSemifinal?.compTime || null,
                    groups: oldSemifinal?.groups || null,
                    players: oldSemifinal?.players || [],
                    finished: oldSemifinal?.finished || false,
                    promotionType: oldSemifinal?.promotionType || this.formData.semifinalPromotionType,
                    promotionQuota: oldSemifinal?.promotionQuota || this.formData.semifinalPromotionQuota,
                    venue: oldSemifinal?.venue || this.formData.semifinalVenue, // 初始化场地
                })
            }

            // 创建决赛（所有赛制都需要）
            const oldFinal = findOldEvent(3)
            events.push({
                type: 3,
                compTime: oldFinal?.compTime || null,
                appTime: system === 1 ? appTime : null,
                groups: oldFinal?.groups || null,
                players: oldFinal?.players || [],
                finished: oldFinal?.finished || false,
                venue: oldFinal?.venue || this.formData.finalVenue, // 初始化场地
            })

            // 使用 $set 确保响应式更新
            this.$set(this.currentGroup, 'events', events)
        },

        // 处理报名时间变更
        handleAppTimeChange(time) {
            if (time) {
                // 获取第一个比赛阶段
                const firstEvent = this.currentGroup.events[0]
                if (firstEvent) {
                    // 使用 $set 确保响应式更新
                    this.$set(firstEvent, 'appTime', time)
                }
            }
        },

        // 重置表单
        resetForm() {
            this.$refs.groupForm?.resetFields();
            this.formData = {
                name: '',
                system: 2,
                appTimeStart: '',
                appTimeEnd: '',
                events: [],
                preliminaryPromotionType: 'fixed',
                preliminaryPromotionQuota: 8,
                semifinalPromotionType: 'fixed',
                semifinalPromotionQuota: 4,
                preliminaryAthletePerGroup: 4, // 预赛每组人数
                semifinalAthletePerGroup: 4, // 半决赛每组人数
                finalAthletePerGroup: 4, // 冭赛每组人数
                // 重置场地
                preliminaryVenue: '',
                semifinalVenue: '',
                finalVenue: '',
            };
            this.currentGroup = this.emptyGroup();
        },

        // 统一处理新建赛组的逻辑
        handleCreate() {
            this.currentGroup = this.emptyGroup()
            this.showEditDialog = true
        },

        // 获取赛事类型名称
        getEventTypeName(type) {
            const typeMap = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            return typeMap[type] || '未知赛段'
        },

        // 添加分组
        addGroup(eventIndex) {
            if (!this.formData.events[eventIndex].groups) {
                this.$set(this.formData.events[eventIndex], 'groups', [])
            }

            const newGroup = {
                id: `temp_${Date.now()}`,
                name: `第${this.formData.events[eventIndex].groups.length + 1}组`,
                compTime: null,
                players: []
            }
            this.formData.events[eventIndex].groups.push(newGroup)
            this.activeGroupsEdit.push(`${eventIndex}-${this.formData.events[eventIndex].groups.length - 1}`)
        },

        // 删除分组
        removeGroup(eventIndex, groupIndex) {
            this.$confirm('确定要删除该分组吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.formData.events[eventIndex].groups.splice(groupIndex, 1)
                this.activeGroupsEdit = this.activeGroupsEdit.filter(
                    name => name !== `${eventIndex}-${groupIndex}`
                )
            }).catch(() => { })
        },

        // 新增分组管理功能
        openGroupManageDialog(group) {
            this.currentGroup = JSON.parse(JSON.stringify({
                ...group,
                players: group.players || [] // 确保 players 存在
            }))
            this.currentGroupEvents = this.currentGroup.events || []
            this.showGroupManageDialog = true
        },

        addNewGroup(event) {
            if (!event.groups) {
                this.$set(event, 'groups', [])
            }
            event.groups.push({
                id: `temp_${Date.now()}`,
                name: `新分组`,
                compTime: null,
                players: []
            })
        },

        /* autoGenerateGroups(event) {
            // 自动分组逻辑
        }, */

        editGroupMembers(group) {
            this.currentGroup = group
            this.showMemberDialog = true
        },

        deleteGroupFromEvent(event, index) {
            event.groups.splice(index, 1)
        },

        assignMembers() {
            const event = this.currentGroupEvents.find(e => e.type === Number(this.activeEventTab))
            const group = event.groups.find(g => g.id === this.currentGroup.id)
            this.selectedUnassigned.forEach(id => {
                const player = this.currentGroup.players.find(p => p.id === id)
                group.players.push(player)
            })
            this.selectedUnassigned = []
        },

        unassignMembers() {
            const event = this.currentGroupEvents.find(e => e.type === Number(this.activeEventTab))
            const group = event.groups.find(g => g.id === this.currentGroup.id)
            this.selectedAssigned.forEach(id => {
                const index = group.players.findIndex(p => p.id === id)
                group.players.splice(index, 1)
            })
            this.selectedAssigned = []
        },

        // 打开分组管理
        async openGroupManagement(group) {
            if (!group || typeof group !== 'object') {
                this.$message.warning('无效的赛组数据');
                return;
            }

            // 检查报名时间
            const currentTime = new Date().getTime();
            const appEndTime = new Date(group.appEndTime).getTime();

            if (currentTime < appEndTime + 600000) { // 600000ms = 10分钟
                await this.$confirm(
                    '当前项目尚未完成报名，暂未自动分组，请于报名结束十分钟后再进行分组管理。',
                    '提示',
                    {
                        confirmButtonText: '知道了',
                        showCancelButton: false,
                        type: 'warning'
                    }
                );
                return;
            }

            this.currentPhase = {
                name: group.name || '',
                type: group.compSystem || 1,
                appEndTime: group.appEndTime // 添加报名结束时间
            };

            this.currentGroup = group;
            this.showGroupManageDialog = true;
        },

        // 保存分组结果
        handleGroupsSave(groups) {
            const index = this.groups.findIndex(g => g.id === this.currentGroup.id)
            if (index > -1) {
                const updatedGroup = { ...this.groups[index] }
                updatedGroup.events = groups
                this.$set(this.groups, index, updatedGroup)
            }
        },

        // 显示配置对话框
        showConfig() {
            this.configDialogVisible = true;
        },

        // 保存配置
        saveConfig() {
            // 这里可以调用API保存场地配置
            this.configDialogVisible = false;
            this.$message.success('保存成功');
        },

        // 添加场地相关方法
        addVenue() {
            this.showAddVenue = true;
            this.$nextTick(() => {
                this.$refs.newVenueInput.focus();
            });
        },

        handleAddVenue() {
            if (this.newVenue) {
                if (!this.venues.includes(this.newVenue)) {
                    this.venues.push(this.newVenue);
                }
                this.newVenue = '';
            }
            this.showAddVenue = false;
        },

        handleDeleteVenue(index) {
            this.$confirm('确定要删除该场地吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.venues.splice(index, 1);
            }).catch(() => { });
        },

        // 添加自动分组方法
        handleAutoGroup(phase) {
            // TODO: 实现自动分组逻辑
            this.$message.success(`${phase === 1 ? '预赛' : phase === 2 ? '半决赛' : '决赛'}自动分组成功`);
        },

        // 获取所有运动项目数据
        async fetchSports() {
            this.loading = true;
            try {
                const res = await request({
                    url: '/getSports',
                    method: 'get'
                });

                if (res.code === 1) {
                    this.groups = res.data.map(group => ({
                        ...group,
                        id: group.id || `group_${Date.now()}_${Math.random()}`
                    }));
                    // 获取数据后立即进行筛选
                    this.filterGroups();
                }
            } catch (error) {
                this.$message.error('获取运动项目数据失败');
            } finally {
                this.loading = false;
            }
        },

        // 添加筛选处理方法
        handleFilterChange(/* value */) {
            this.filterGroups();
        },

        // 筛选赛组
        filterGroups() {
            const now = Date.now();

            this.filteredGroups = this.groups.filter(group => {
                // 获取第一个比赛的报名开始时间
                const firstSport = group.sports?.[0];
                if (!firstSport) return false;

                const appStartTime = new Date(firstSport.appStartTime).getTime();
                // 获取最后一个比赛的结束时间
                const lastSport = group.sports[group.sports.length - 1];
                const gameEndTime = new Date(lastSport.gameEndTime).getTime();
                // 获取第一个比赛的报名结束时间
                const appEndTime = new Date(firstSport.appEndTime).getTime();

                switch (this.currentFilter) {
                    case 'preparing': // 筹备中
                        return appStartTime > now;
                    case 'enrolling': // 报名中
                        return appStartTime <= now && appEndTime >= now;
                    case 'ongoing': // 进行中
                        return appEndTime < now && gameEndTime >= now;
                    case 'finished': // 已结束
                        return gameEndTime < now;
                    default: // 全部
                        return true;
                }
            });
        },

        // 筛选器处理方法
        handleStateFilter(command) {
            this.currentStateFilter = command;
        },

        handleTimeSort(command) {
            this.currentTimeSort = command;
        },

        handleEventTypeFilter(command) {
            this.currentEventType = command;
            this.currentSubEventType = 'all'; // 重置子类型
        },

        handleSubEventFilter(command) {
            this.currentSubEventType = command;
        },

        handleSystemFilter(command) {
            this.currentSystemFilter = command;
        },

        handleGenderFilter(command) {
            this.currentGenderFilter = command;
        },

        // 添加检测移动端方法
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },

        // 添加获取评分规则方法
        async fetchScoreRules() {
            try {
                const res = await request({
                    url: '/getJudgeRules',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.scoreRules = res.data.map(rule => ({
                        ...rule,
                        units: rule.units.replace(/^\[|\]$/g, '').split(','),
                        mappings: typeof rule.mappings === 'string' ?
                            new Map(Object.entries(JSON.parse(rule.mappings))) :
                            new Map(Object.entries(rule.mappings)),
                        isRankMode: rule.isRankMode === true || rule.isRankMode === '1' || rule.isRankMode === 1
                    }))
                }
            } catch (error) {
                console.error('获取评分规则失败:', error)
                this.$message.error('获取评分规则失败')
            }
        },
    },
    mounted() {
        this.fetchSports();
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
        this.fetchScoreRules(); // 添加获取评分规则的调用
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile);
    }
}
</script>

<style lang="less" scoped>
.sport-management {
    // padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    .action-bar {
        margin-bottom: 24px;
        padding: 0 16px;

        .action-bar-content {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;

            // 当筛选器容器不是完整宽度时,按钮和筛选器在同一行
            .filter-container {
                display: flex;
                gap: 8px;
                flex-wrap: nowrap;
                flex: 1;
                min-width: 0; // 允许收缩
            }

            .create-button {
                white-space: nowrap; // 防止按钮文字换行
            }
        }

        @media screen and (max-width: 768px) {
            .action-bar-content {
                gap: 12px;

                // 在移动端时筛选器和按钮各占一行
                .filter-container,
                .create-button {
                    width: 100%;
                }

                .filter-container {
                    justify-content: space-between;
                }

                .create-button {
                    margin: 0;
                    height: 40px; // 与筛选器下拉框高度一致
                }
            }
        }
    }

    .group-list {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        transition: all 0.3s ease;
        padding: 0 16px;

        &.has-active {
            grid-template-columns: 1fr;
        }

        // 修改卡片列表动画
        .card-list-enter-active,
        .card-list-leave-active {
            transition: all 0.3s ease;
            // 添加一个延迟来减少频繁动画
            transition-delay: 0.1s;
        }

        .card-list-enter,
        .card-list-leave-to {
            opacity: 0;
            transform: translateY(30px);
        }

        .card-list-move {
            transition: transform 0.5s ease;
        }
    }

    .add-card {
        background: #fff;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        border: 2px dashed #dcdfe6;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            border-color: #409EFF;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .el-button {
                color: #409EFF;
                border-color: #409EFF;
            }
        }

        .el-button {
            width: 100%;
            height: 100%;
            border-style: dashed;
        }
    }

    .promotion-rules {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;

        // 紧凑型时间轴
        .compact-timeline {
            padding-left: 10px !important;
            margin-left: -10px;

            ::v-deep {
                .el-timeline-item__tail {
                    left: 2px;
                }

                .el-timeline-item__node {
                    left: 2px;
                    size: 8px;
                }

                .el-timeline-item__wrapper {
                    padding-left: 25px;
                }

                .el-timeline-item__timestamp {
                    color: #606266;
                    margin-bottom: 8px;
                    font-size: 14px;
                    text-align: center;
                }
            }
        }

        .phase-content {
            margin-bottom: 15px;
            max-width: 800px; // 限制最大宽度
            padding-right: 15px; // 稍微减少右边距

            .phase-info {
                color: #666;
                font-size: 13px;
                margin-bottom: 12px;
                font-style: italic;
            }

            .promotion-form {
                display: flex;
                flex-direction: column; // 改为纵向排列
                gap: 15px;
                align-items: flex-start;

                .promotion-form-item {
                    margin-bottom: 0;
                    display: flex;
                    width: 100%;

                    // 表单项紧凑布局
                    ::v-deep .el-form-item {
                        padding-right: 0;
                        margin-bottom: 0;
                        margin-right: 0;

                        .el-form-item__label {
                            padding: 0 8px 0 0;
                            min-width: 80px; // 设置标签最小宽度
                            text-align: left; // 标签左对齐
                        }

                        .el-form-item__content {
                            margin-left: 0 !important; // 移除默认的左边距
                            flex: 1;
                            min-width: 0; // 允许内容区域收缩

                            .el-select {
                                width: 100%; // 修改下拉框宽度与数字输入框一致
                            }

                            .el-input-number {
                                width: 100%; // 保持不变
                            }
                        }
                    }

                    // Select 和 InputNumber 样式调整
                    .el-select {
                        width: 200px; // 统一下拉框宽度
                    }

                    .el-input-number {
                        width: 120px; // 统一数字输入框宽度
                    }

                    .el-icon-question {
                        margin-left: 8px;
                        color: #909399;
                        cursor: help;
                    }
                }
            }
        }

        // 调整分组配置样式
        .group-settings {
            ::v-deep .el-form-item {
                display: flex;
                margin-right: 0;

                .el-form-item__label {
                    padding: 0 8px 0 0;
                    min-width: 80px;
                    text-align: left;
                }

                .el-form-item__content {
                    margin-left: 0 !important;
                    flex: 1;
                    min-width: 0;

                    .el-input-number {
                        width: 100%; // 确保与上面一致

                        // 修复数字显示问题
                        input {
                            width: 100%;
                            text-align: center;
                        }
                    }
                }
            }
        }

        // 移除所有hover效果
        ::v-deep {

            .el-timeline-item,
            .el-form-item,
            .el-timeline-item__node {
                &:hover {
                    transform: none !important;
                }
            }
        }

        // 调整时间轴样式
        .compact-timeline {
            padding-left: 0 !important;
            margin-left: 0;

            ::v-deep {
                .el-timeline-item__node {
                    left: 0;
                }

                .el-timeline-item__tail {
                    left: 0;
                }

                .el-timeline-item__wrapper {
                    padding-left: 20px; // 减小内容区域的左边距
                }
            }
        }

        // 调整分组配置样式
        .group-settings {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;

            .event-groups {
                margin-bottom: 20px;

                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;

                    h4 {
                        color: #606266;
                    }
                }
            }

            .group-time-settings {
                text-align: center;
                padding: 10px 0;
                color: #606266;
            }

            .group-actions {
                margin-top: 10px;
                text-align: right;
            }
        }

        // 分组管理样式
        .group-management {
            .group-tools {
                text-align: right;
                margin-bottom: 15px;
            }
        }

        .el-button.danger {
            color: #F56C6C;

            &:hover {
                color: #f89898;
            }
        }

        // 人员管理样式
        .member-management {
            .panel {
                background: #f5f7fa;
                padding: 15px;
                border-radius: 4px;
                height: 400px;

                ::v-deep {
                    display: flex;
                    flex-direction: column;

                    h3 {
                        margin: 0 0 15px 0;
                    }

                    .el-input {
                        margin-bottom: 15px;
                    }

                    .member-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: 10px;
                        background: #fff;
                        border-radius: 4px;

                        .el-checkbox-group {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }
                    }
                }
            }

            .flex-group {
                display: flex;

                .transfer-actions {
                    flex-direction: column;
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #EBEEF5;
                }
            }
        }

        // 更新对话框样式
        ::v-deep .el-dialog {
            margin-top: 0 !important;

            @media (min-width: 768px) {
                margin: 15vh auto !important;
            }
        }

        // 调整时间选择器宽度
        .time-field {
            ::v-deep .el-date-editor.el-input {
                width: 200px;
            }
        }

        ::v-deep .el-form-item {
            display: flex;

            .el-form-item__label {
                padding: 0 8px 0 0;
                min-width: 100px;
                text-align: left;
            }

            .el-form-item__content {
                margin-left: 0 !important;
                flex: 1;
                min-width: 0;

                .el-date-editor.el-input {
                    width: 180px; // 减小日期选择器宽度
                }
            }
        }

        /* 浮动操作按钮 */
        .floating-buttons {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        /* 场地配置样式 */
        .config-content {
            padding: 20px;

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;

                h3 {
                    margin: 0;
                }
            }

            .venues-list {
                margin-bottom: 15px;

                .el-tag {
                    margin: 0 8px 8px 0;
                }
            }

            .venue-input {
                margin-top: 10px;
            }
        }

        // 添加loading样式自定义
        ::v-deep .el-loading-mask {
            background-color: rgba(255, 255, 255, 0.9);

            .el-loading-spinner {
                .el-icon-loading {
                    font-size: 30px;
                    color: #409EFF;
                }

                .el-loading-text {
                    color: #409EFF;
                    margin-top: 10px;
                    font-size: 14px;
                }
            }
        }

        /* 移动端适配 */
        @media screen and (max-width: 768px) {
            .sport-management {
                padding: 15px;

                .header {
                    margin-bottom: 15px;
                }
            }
        }

        // 添加新的样式
        .config-tabs {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;

            ::v-deep .el-tabs__header {
                margin-bottom: 20px;
                padding: 0 20px;
            }

            ::v-deep .el-tabs__content {
                padding: 0 20px 20px;
                overflow: visible; // 防止内容被截断
            }
        }

        .group-settings {
            margin-top: 15px;

            .auto-group-actions {
                text-align: right;
            }
        }
    }
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    width: 100%;

    ::v-deep .el-dropdown {
        flex: 1;

        .el-button {
            width: 100%;
            min-width: 0; // 允许按钮收缩
            padding: 8px 12px;
            font-size: 14px;
            white-space: nowrap;
        }
    }
}

// 移动端样式优化
@media screen and (max-width: 768px) {
    .sport-management {
        .action-bar {
            ::v-deep .el-dropdown {
                .el-button {
                    padding: 8px 4px;
                    font-size: 13px;
                }
            }
        }

        .create-button {
            margin-top: 8px;
        }
    }
}

// 修改移动端页面布局
@media screen and (max-width: 768px) {
    .sport-management {

        // ...existing code...
        .action-bar {
            // padding: 0 8px; // 减小两侧padding

            .action-bar-content {
                .filter-container {
                    flex-wrap: nowrap;
                }
            }
        }
    }
}

::v-deep .el-select-dropdown {
    z-index: 2020 !important; // 确保下拉菜单在其他元素之上
}

.group-management-wrapper {
    position: relative;
    min-height: 300px;

    .feature-unavailable-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;

        .message-box {
            text-align: center;
            padding: 30px;

            i {
                font-size: 48px;
                color: #E6A23C;
                margin-bottom: 20px;
            }

            p {
                margin: 10px 0;
                color: #606266;
                font-size: 16px;
                line-height: 1.6;

                &:first-of-type {
                    font-weight: bold;
                    color: #303133;
                }
            }
        }
    }
}
</style>