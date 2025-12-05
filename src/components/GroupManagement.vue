<template>
    <div class="group-management">

        <!-- 阶段选择器 -->
        <el-tabs v-model="activePhase" type="card" class="phase-tabs">
            <el-tab-pane v-for="event in localEvents" :key="event.type" :label="getEventTypeName(event.type)"
                :name="String(event.type)">
                <!-- 分组内容区域 -->
                <div class="phase-content">
                    <!-- 头部信息 -->
                    <div class="phase-header">
                        <span class="athletes-count">待分配运动员：{{ unassignedAthletes.length }}人</span>
                        <div class="actions">
                            <el-button type="primary" size="small" @click="addNewGroup">
                                <i class="el-icon-plus"></i> 新建分组
                            </el-button>
                            <el-button type="success" size="small" @click="handleRandomGroup">
                                <i class="el-icon-sort"></i> 随机分组
                            </el-button>
                        </div>
                    </div>

                    <!-- 主要内容区域 -->
                    <el-row :gutter="20">
                        <!-- 左侧：待分配运动员 -->
                        <el-col :span="8">
                            <div class="panel athlete-panel">
                                <div class="panel-header">
                                    <h4>待分配运动员</h4>
                                    <el-input v-model="searchText" size="small" placeholder="搜索..." />
                                </div>
                                <div class="athlete-list">
                                    <el-table :data="filteredUnassignedAthletes"
                                        @selection-change="handleSelectionChange">
                                        <el-table-column type="selection" width="55" />
                                        <el-table-column prop="name" label="姓名" />
                                        <el-table-column prop="number" label="号码" />
                                    </el-table>
                                </div>
                            </div>
                        </el-col>

                        <!-- 右侧：分组列表 -->
                        <el-col :span="16">
                            <div class="panel groups-panel">
                                <el-collapse v-model="activeGroups">
                                    <el-collapse-item v-for="(group, index) in currentPhaseGroups" :key="index"
                                        :name="index">
                                        <template slot="title">
                                            <el-input v-model="group.name" size="small" style="width: 200px"
                                                @click.native.stop />
                                            <span class="group-count">
                                                ({{ group.players?.length || 0 }}人)
                                            </span>
                                        </template>

                                        <el-table :data="group.players || []" stripe>
                                            <el-table-column prop="name" label="姓名" />
                                            <el-table-column prop="number" label="号码" />
                                            <el-table-column label="操作" width="100">
                                                <template slot-scope="scope">
                                                    <el-button type="text"
                                                        @click="removeFromGroup(index, scope.$index)">
                                                        移出
                                                    </el-button>
                                                </template>
                                            </el-table-column>
                                        </el-table>

                                        <div class="group-footer">
                                            <el-button type="primary" size="small" :disabled="!selectedAthletes.length"
                                                @click="assignToGroup(index)">
                                                添加选中运动员
                                            </el-button>
                                            <el-button type="danger" size="small" @click="removeGroup(index)">
                                                删除分组
                                            </el-button>
                                        </div>
                                    </el-collapse-item>
                                </el-collapse>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import bus from '@/utils/bus'
import request from '@/utils/request' // 添加 request 导入

export default {
    name: 'GroupManagement',
    components: {
        // ResponsiveDialog
    },
    props: {
        visible: Boolean,
        currentPhase: {
            type: Object,
            required: true
        },
        events: {
            type: Array,
            default: () => []
        },
        athletes: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            debug: true, // 添加调试开关
            activePhase: null, // 修改初始值为 null
            searchText: '',
            selectedAthletes: [],
            activeGroups: [],
            isMobile: window.innerWidth < 768,
            // 新增本地运动员列表缓存
            localEvents: [], // 用于存储本地编辑的赛事数据
            localAthletes: [], // 用于存储所有可用运动员的副本
            mobileActivePanel: 'unassigned', // 新增移动端面板切换控制
        }
    },

    created() {
        // 监听事件总线
        bus.$on('group-data-init', this.initLocalData);

        // 如果有初始数据就直接初始化
        if (this.events.length > 0 || this.athletes.length > 0) {
            console.log('Initializing with props data:', {
                events: this.events,
                athletes: this.athletes
            });

            // 使用 props 数据进行初始化
            this.localAthletes = this.athletes.map(athlete => ({
                ...athlete,
                id: athlete.pid || athlete.id
            }));

            this.localEvents = this.events.map(event => ({
                ...event,
                type: event.type || event.compType,
                groups: Array.isArray(event.groups) ? event.groups.map(group => ({
                    ...group,
                    id: group.gid || group.id,
                    players: Array.isArray(group.players) ? group.players.map(player => ({
                        ...player,
                        id: player.pid || player.id
                    })) : []
                })) : []
            }));

            // 设置默认活动阶段
            if (this.localEvents.length > 0) {
                this.activePhase = String(this.localEvents[0].type);
            }
        }
    },

    beforeDestroy() {
        // 清理事件监听
        bus.$off('group-data-init', this.initLocalData);
    },

    watch: {
        // 添加对 visible 的监听
        visible: {
            immediate: true,
            async handler(val) {
                if (val) {
                    // 先检查是否可以进行分组管理
                    const canProceed = await this.checkEnrollmentStatus();
                    if (!canProceed) {
                        this.$emit('update:visible', false); // 关闭对话框
                        return;
                    }

                    console.log('Dialog opened, initializing data...');
                    this.initLocalData();
                }
            }
        },
        // 添加对 athletes 的监听
        athletes: {
            immediate: true,
            handler(val) {
                if (val && val.length > 0) {
                    this.localAthletes = JSON.parse(JSON.stringify(val))
                    console.log('运动员数据已更新到本地:', this.localAthletes)
                }
            }
        },
        activePhase: {
            immediate: true,
            handler(newPhase, oldPhase) {
                console.log('Active phase changed:', {
                    from: oldPhase,
                    to: newPhase,
                    currentPhaseGroups: this.currentPhaseGroups
                });
            }
        }
    },

    computed: {
        currentPhaseGroups() {
            const event = this.localEvents.find(e => String(e.type) === this.activePhase);
            if (!event?.groups) {
                return [];
            }
            return event.groups;
        },

        unassignedAthletes() {
            // 获取当前阶段已分配的所有运动员ID
            const assignedIds = new Set();
            const currentGroups = this.currentPhaseGroups;

            currentGroups.forEach(group => {
                (group.players || []).forEach(player => {
                    assignedIds.add(player.id);
                });
            });

            const unassigned = this.localAthletes.filter(athlete => !assignedIds.has(athlete.id));
            console.log('Unassigned athletes:', {
                total: this.localAthletes.length,
                assigned: assignedIds.size,
                unassigned: unassigned.length
            });
            return unassigned;
        },

        filteredUnassignedAthletes() {
            return this.unassignedAthletes.filter(athlete =>
                athlete.name.includes(this.searchText) ||
                athlete.number.includes(this.searchText)
            )
        }
    },

    methods: {
        // 添加缺失的方法
        getEventTypeName(type) {
            return {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }[type] || '未知阶段'
        },

        // 初始化本地数据
        initLocalData(data) {
            console.log('Initializing with new data:', data);

            // 如果是通过 visible watch 触发且没有数据,直接返回不做处理
            if (!data && !this.localEvents.length) {
                console.log('Skip initialization - no data and no existing local data');
                return;
            }

            // 如果有新数据就重置状态,否则保持当前状态
            if (data) {
                // 重置所有状态
                this.selectedAthletes = [];
                this.activeGroups = [];
                this.searchText = '';

                // 重新初始化数据
                const sourceData = data.sports;
                if (!Array.isArray(sourceData)) {
                    console.warn('Sports data is not an array:', sourceData);
                    return;
                }

                // 更新本地数据
                this.localEvents = sourceData.map(event => {
                    const type = String(event.type || event.compType);
                    console.log(`Processing event ${type}:`, event);
                    return {
                        ...event,
                        type,
                        groups: Array.isArray(event.groups) ? event.groups.map(group => ({
                            ...group,
                            id: group.gid || group.id,
                            players: (group.players || []).map(player => ({
                                ...player,
                                id: player.pid || player.id
                            }))
                        })) : []
                    };
                });

                // 收集运动员数据
                const playersMap = new Map();
                this.localEvents.forEach(event => {
                    event.groups?.forEach(group => {
                        group.players?.forEach(player => {
                            if (player.pid || player.id) {
                                playersMap.set(player.pid || player.id, {
                                    ...player,
                                    id: player.pid || player.id
                                });
                            }
                        });
                    });
                });

                this.localAthletes = Array.from(playersMap.values());
                console.log('Initialized athletes:', this.localAthletes);
            }

            // 确保活动阶段设置正确
            if (!this.activePhase && this.localEvents.length > 0) {
                this.$nextTick(() => {
                    this.activePhase = String(this.localEvents[0].type);
                    console.log('Setting active phase to:', this.activePhase);
                });
            }
        },

        updateLocalData(data) {
            // 更新分组数据
            this.localEvents = data.sports?.map(sport => ({
                ...sport,
                type: sport.compType,
                groups: sport.groups || []
            })) || [];
        },

        // 从分组中移除运动员
        removeFromGroup(groupIndex, playerIndex) {
            // const playerToRemove = this.currentPhaseGroups[groupIndex].players[playerIndex]
            // 直接移除运动员
            this.currentPhaseGroups[groupIndex].players.splice(playerIndex, 1)
        },

        // 添加运动员到分组
        assignToGroup(groupIndex) {
            if (!this.currentPhaseGroups[groupIndex].players) {
                this.$set(this.currentPhaseGroups[groupIndex], 'players', [])
            }

            // 为选中的运动员创建深拷贝并添加到分组
            this.selectedAthletes.forEach(athlete => {
                const athleteCopy = JSON.parse(JSON.stringify(athlete))
                this.currentPhaseGroups[groupIndex].players.push(athleteCopy)
            })

            // 清空选择
            this.selectedAthletes = []
        },

        // 简化自动分组方法
        handleAutoGroup() {
            // TODO: 调用后端分组API
            this.$message.success('自动分组成功')
            // 后续可以刷新分组数据
        },

        // 保存分组结果
        handleSave() {
            // 触发保存事件，传递本地编辑的数据
            this.$emit('save', this.localEvents)
            this.$emit('update:visible', false)
        },

        // 添加新分组方法
        addNewGroup() {
            const currentEvent = this.localEvents.find(e => e.type.toString() === this.activePhase)
            if (!currentEvent.groups) {
                this.$set(currentEvent, 'groups', [])
            }

            currentEvent.groups.push({
                id: `group_${Date.now()}`,
                name: `第${currentEvent.groups.length + 1}组`,
                players: []
            })

            // 自动展开新建的分组
            this.activeGroups.push(currentEvent.groups.length - 1)
        },

        // 处理选手选择变更
        handleSelectionChange(selection) {
            this.selectedAthletes = selection
        },

        // 删除分组
        removeGroup(index) {
            const currentEvent = this.localEvents.find(e => e.type.toString() === this.activePhase)
            this.$confirm('确定要删除该分组吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                currentEvent.groups.splice(index, 1)
                this.activeGroups = this.activeGroups.filter(i => i !== index)
            }).catch(() => { })
        },

        handleTabClick(tab) {
            console.log('Tab clicked:', tab.name);
            console.log('Current phase groups:', this.currentPhaseGroups);
        },

        // 修改打开分组管理时的检查
        async checkEnrollmentStatus() {
            const currentTime = new Date().getTime();
            // console.log(currentTime);
            const appEndTime = new Date(this.currentPhase.appEndTime).getTime();

            // 如果当前时间小于报名结束时间加10分钟
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
                return false;
            }
            return true;
        },

        // 修改随机分组方法
        async handleRandomGroup() {
            try {
                const currentEvent = this.localEvents.find(e => e.type.toString() === this.activePhase);
                if (!currentEvent?.spId) {
                    this.$message.error('无法获取比赛ID');
                    return;
                }

                const res = await request({
                    url: '/randomGroups',
                    method: 'get',
                    params: {
                        spId: currentEvent.spId
                    }
                });

                if (res.code === 1) {
                    // 更新当前阶段的分组数据
                    if (currentEvent) {
                        currentEvent.groups = res.data;
                    }
                    this.$message.success('随机分组成功');
                } else {
                    this.$message.error(res.message || '随机分组失败');
                }
            } catch (error) {
                console.error('随机分组失败:', error);
                this.$message.error('随机分组失败');
            }
        },
    }
}
</script>

<style lang="less" scoped>
.group-management {
    padding: 20px;
    height: 100%;
    min-height: 500px;

    .debug-info {
        margin-bottom: 20px;
        padding: 10px;
        background: #f5f7fa;
        border-radius: 4px;
        font-size: 12px;
    }

    .phase-tabs {
        height: calc(100% - 40px);
    }

    .panel {
        background: #fff;
        border-radius: 4px;
        padding: 20px;
        height: 100%;
        min-height: 400px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

        .panel-header {
            margin-bottom: 15px;
        }
    }

    .athlete-list {
        height: calc(100% - 100px);
        overflow-y: auto;
    }

    .groups-panel {
        .el-collapse-item__content {
            padding: 15px;
        }
    }

    // ...其他样式保持不变...
}
</style>
