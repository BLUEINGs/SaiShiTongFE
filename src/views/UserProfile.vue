<template>
    <div class="user-profile">
        <!-- 添加一个用于切换视图的 computed 属性 -->
        <template v-if="!isSubRoute">
            <!-- 原有的个人信息页内容 -->
            <el-card class="profile-card">
                <div class="profile-header">
                    <div class="left-section">
                        <div class="avatar-wrapper" @click="handleAvatarClick">
                            <el-avatar :size="80" :src="userInfo.head">
                                {{ userInfo.name?.charAt(0) || '游' }}
                            </el-avatar>
                            <div v-if="!isLoggedIn" class="login-tip">点击登录</div>
                        </div>
                        <div class="info-wrapper">
                            <div class="name-line">
                                <h2>{{ userInfo.name || '未登录' }}</h2>
                                <div class="roles" :class="{ 'wrap-roles': userRoles.length >= 3 }">
                                    <el-tag v-for="role in userRoles" :key="role.id" :type="role.type" size="small">
                                        {{ role.label }}
                                    </el-tag>
                                </div>
                            </div>
                            <br>
                            <el-button v-if="isLoggedIn" type="text" @click="handleLogout" class="logout-btn">
                                退出登录
                            </el-button>
                        </div>
                    </div>
                    <div class="right-actions">
                        <el-button type="text" @click="$router.push('/system-settings')" class="settings-btn">
                            <i class="el-icon-setting"></i>
                        </el-button>
                        <br>

                    </div>
                </div>

                <div class="current-meeting">
                    <div class="meeting-label">当前运动会</div>
                    <el-select v-model="currentSmId" placeholder="暂未选择" @change="handleMeetingChange">
                        <el-option v-for="meeting in followedMeetings" :key="meeting.smId" :label="meeting.name"
                            :value="meeting.smId">
                        </el-option>
                        <el-divider></el-divider>
                        <el-option value="more">
                            <div class="join-more" @click="goToSportMeetings">
                                <i class="el-icon-plus"></i>
                                {{ followedMeetings.length ? '加入更多运动会' : '加入运动会' }}
                            </div>
                        </el-option>
                    </el-select>
                </div>
            </el-card>

            <el-tabs v-model="activeTab" class="profile-tabs">
                <!-- 添加我的团体标签页 -->
                <el-tab-pane label="我的团体" name="schools">
                    <div v-if="isLoggedIn" class="schools-list">
                        <school-card v-for="school in mySchools" :key="school.scId" :school-data="{
                            id: school.scId,
                            name: school.name,
                            slogan: school.slogan,
                            image: school.img,
                            detail: school
                        }" :is-active="activeSchoolId === school.scId" :is-edit-mode="hasManagePermission"
                            :sport-events="availableSports" :loading.sync="schoolLoading"
                            :max-players="configForm.maxPlayers" :max-events="configForm.maxEvents"
                            :level-config="configForm.levelConfig" @toggle="toggleSchool" />
                    </div>
                    <div v-else class="empty-state">
                        <el-empty>
                            <template slot="description">
                                <p>登录后可加入团体</p>
                                <el-button type="primary" @click="$router.push('/login')">
                                    去登录
                                </el-button>
                            </template>
                        </el-empty>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="我的项目" name="events">
                    <div v-if="isLoggedIn">
                        <judge-competition-card v-for="event in userInfo.mySports" :key="event.spId"
                            :competition-data="event" :is-active="activeEventId === event.spId" :pid="userInfo.pid"
                            :is-edit-mode="false" :score-rules="[]" @toggle="toggleEvent" />
                        <el-empty v-if="!userInfo.mySports?.length" description="暂无参赛项目">
                        </el-empty>
                    </div>
                    <div v-else class="empty-state">
                        <el-empty>
                            <template slot="description">
                                <p>登录后可报名参赛</p>
                                <el-button type="primary" @click="$router.push('/login')">
                                    去登录
                                </el-button>
                            </template>
                        </el-empty>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </template>

        <!-- 添加子路由显示区域 -->
        <router-view v-else />
    </div>
</template>

<script>
import SchoolCard from '@/components/SchoolCard.vue'
import JudgeCompetitionCard from '@/components/JudgeCompetitionCard.vue'
import request from '@/utils/request'
import { updateAuthInfo } from '@/utils/auth'

export default {
    name: 'UserProfile',
    components: {
        SchoolCard,
        JudgeCompetitionCard,
    },
    data() {
        return {
            userInfo: {
                name: '',
                head: '',
                powerDegree: [],
                joinedSportMeetings: [],
                smId: null, // 改为 smId
                judgeEvents: [], // 裁判负责的比赛ID数组
                mySports: []
            },
            defaultAvatar: '/default-avatar.jpg',
            activeTab: 'schools', // 默认显示团体标签页
            isLoggedIn: !!localStorage.getItem('token'),
            currentSmId: null, // 初始值统一设为 null
            allMeetings: [], // 所有运动会数据
            allMeetingsLoaded: false, // 添加标记确保数据加载完成
            mySchools: [],
            activeSchoolId: null, // 添加激活的学校ID
            schoolLoading: false, // 添加loading状态
            activeEventId: null, // 添加激活的项目ID
            availableSports: [], // 添加可用项目列表
            configForm: {
                maxPlayers: 7,  // 默认值
                maxEvents: 3,   // 默认值
                levelConfig: [] // 将由请求获取
            }
        }
    },
    computed: {
        userRoles() {
            if (!this.isLoggedIn) {
                return [{
                    id: 'guest',
                    label: '访客',
                    type: 'info'
                }]
            }
            const roleMap = {
                1: { label: '用户', type: '' },
                2: { label: '团体负责人', type: 'success' },
                3: { label: '裁判', type: 'warning' },
                4: { label: '运动员', type: 'info' },
                5: { label: '运动会操办人', type: 'danger' }
            }
            // 确保 powerDegree 是数组，并且每个角色只出现一次
            const powerDegree = Array.isArray(this.userInfo.powerDegree)
                ? [...new Set(this.userInfo.powerDegree)]
                : (this.userInfo.powerDegree ? [this.userInfo.powerDegree] : []);

            return powerDegree.map(degree => ({
                id: `role_${degree}`, // 使用前缀确保 id 唯一
                ...roleMap[degree]
            }))
        },
        hasFollowedMeetings() {
            return this.allMeetingsLoaded && (this.isLoggedIn
                ? (this.userInfo.joinedSportMeetings || []).length > 0
                : JSON.parse(localStorage.getItem('smIds') || '[]').length > 0)
        },
        followedMeetings() {
            if (!this.allMeetingsLoaded) return [];

            if (this.isLoggedIn) {
                return this.userInfo.joinedSportMeetings || [];
            }

            const smIds = JSON.parse(localStorage.getItem('smIds') || '[]');
            const meetings = this.allMeetings.filter(m => smIds.includes(m.smId));
            // 将数据格式化为与登录状态一致的格式
            return meetings.map(m => ({
                smId: m.smId,
                name: m.name
            }));
        },
        currentMeetingName() {
            const currentMeeting = this.followedMeetings.find(m => m.smId === this.currentSmId);
            return currentMeeting ? currentMeeting.name : '未选择运动会';
        },
        hasManagePermission() {
            return this.userInfo.powerDegree?.some(power => [2, 5].includes(power))
        },
        // 将项目按mainSpId分组
        groupedEvents() {
            const events = this.userInfo.mySports || []
            const groups = {}

            events.forEach(event => {
                if (!groups[event.mainSpId]) {
                    groups[event.mainSpId] = {
                        name: event.name,
                        events: []
                    }
                }
                groups[event.mainSpId].events.push(event)
            })

            return Object.values(groups)
        },
        userAvatar() {
            return this.userInfo.head || null
        },
        // 添加判断是否为子路由的计算属性
        isSubRoute() {
            return this.$route.path !== '/user-profile';
        },
    },
    methods: {
        getEventName(event) {
            return `${event.gender ? '男子' : '女子'}${event.name}`
        },
        getCompTypeTag(type) {
            const tags = {
                1: 'info',
                2: 'warning',
                3: 'success'
            }
            return tags[type] || ''
        },
        getCompTypeText(type) {
            const texts = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            return texts[type] || '未知'
        },
        getStatusTag(status) {
            const tags = {
                1: 'info',
                2: 'warning',
                3: 'success',
                4: ''
            }
            return tags[status] || ''
        },
        getStatusText(status) {
            const texts = {
                1: '未开始',
                2: '报名中',
                3: '进行中',
                4: '已结束'
            }
            return texts[status] || '未知'
        },
        handleAvatarClick() {
            if (!this.isLoggedIn) {
                this.$router.push('/login');
            }
        },
        async handleMeetingChange(val) {
            if (val === 'more') {
                this.goToSportMeetings();
                // 恢复之前的选择
                this.$nextTick(() => {
                    this.currentSmId = this.userInfo.smId;
                });
                return;
            }

            // 如果值相同，则不发送请求
            if (val === this.userInfo.smId) {
                return;
            }

            try {
                const params = new URLSearchParams();
                params.append('smId', val);
                const res = await request({
                    url: '/switchCurrentMeeting',
                    method: 'post',
                    data: params
                });

                if (res.code === 1) {
                    // 更新认证信息
                    updateAuthInfo(res.data[0], res.data[1]);

                    // 重新获取完整的用户信息
                    await this.fetchUserInfo();

                    this.$message.success('切换成功');

                    // 更新团体列表
                    this.updateMySchools();
                }
            } catch (error) {
                console.error('切换运动会失败:', error);
                this.$message.error('切换运动会失败');
                // 恢复之前的选择
                this.$nextTick(() => {
                    this.currentSmId = this.userInfo.smId;
                });
            }
        },
        async fetchUserInfo() {
            if (!this.isLoggedIn) return;
            try {
                const res = await request({
                    url: '/getUserInfo',
                    method: 'get'
                });
                if (res.code === 1) {
                    const userInfo = {
                        ...res.data,
                        powerDegree: res.data.powerDegree || [],
                        joinedSportMeetings: res.data.joinedSportMeetings || [],
                        smId: res.data.smId, // 直接使用后端返回的 smId,允许为 null
                        judgeEvents: res.data.judgeEvents || [],
                        mySports: res.data.mySports || []
                    }

                    // 更新本地数据
                    this.userInfo = {
                        name: '',
                        head: '',
                        powerDegree: [],
                        joinedSportMeetings: [],
                        smId: null,
                        judgeEvents: [],
                        mySports: [],
                        ...userInfo
                    }

                    // 从后端获取到的 smId 更新到 currentSmId
                    this.currentSmId = res.data.smId;

                    // 更新我的团体数据
                    this.updateMySchools()
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                this.$message.error('获取用户信息失败');
            }
        },
        getMeetingName(smId) {
            const meeting = this.allMeetings.find(m => m.smId === smId);
            return meeting ? meeting.name : '';
        },
        async fetchMeetings() {
            try {
                const res = await request({
                    url: '/getSportMeetings',
                    method: 'get'
                });
                if (res.code === 1) {
                    this.allMeetings = res.data;
                    this.allMeetingsLoaded = true;

                    // 数据加载完成后，根据登录状态设置当前运动会
                    if (this.isLoggedIn) {
                        await this.fetchUserInfo();
                    } else {
                        const storedSmId = localStorage.getItem('currentSmId');
                        if (storedSmId) {
                            const smId = Number(storedSmId);
                            // 确保这个 smId 在关注列表中
                            const smIds = JSON.parse(localStorage.getItem('smIds') || '[]');
                            if (smIds.includes(smId)) {
                                this.currentSmId = smId;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('获取运动会列表失败:', error);
                this.$message.error('获取运动会列表失败');
            }
        },
        // 根据当前选择的运动会筛选学校
        updateMySchools() {
            const currentSmId = this.currentSmId
            if (!currentSmId || !this.userInfo.joinedSchools) {
                this.mySchools = []
                return
            }
            this.mySchools = this.userInfo.joinedSchools.filter(
                school => school.smId === currentSmId
            )
        },
        // 格式化事件数据以适配 JudgeGroupCard
        formatEventData(eventGroup) {
            const latestEvent = eventGroup.events[eventGroup.events.length - 1]
            return {
                id: eventGroup.events[0].mainSpId,
                name: eventGroup.name,
                currentEvent: {
                    type: latestEvent.compType,
                    status: latestEvent.status,
                    phase: this.getPhaseText(latestEvent.compType),
                    compTime: [latestEvent.compStartTime, latestEvent.compEndTime],
                    players: [{
                        id: this.userInfo.pid,
                        name: this.userInfo.name,
                        avatar: this.userInfo.head,
                        number: '未分配',
                        class: '未知',
                        score: latestEvent.score,
                        points: latestEvent.points
                    }]
                }
            }
        },
        getPhaseText(compType) {
            const phases = {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }
            return phases[compType] || '未知阶段'
        },
        // 添加团体卡片展开/收起方法
        toggleSchool(schoolId) {
            this.activeSchoolId = this.activeSchoolId === schoolId ? null : schoolId
        },
        // 添加项目卡片展开/收起方法
        toggleEvent(eventId) {
            this.activeEventId = this.activeEventId === eventId ? null : eventId
        },
        async fetchAvailableSports() {
            if (!this.isLoggedIn) return;  // 未登录直接返回

            try {
                const res = await request({
                    url: '/getAvailableSports',
                    method: 'get'
                })
                if (res.code === 1) {
                    this.availableSports = res.data.map(event => ({
                        spId: event.spId,
                        name: event.name,
                        gender: event.gender,
                        status: event.status,
                        compType: event.compType,
                        mainSpId: event.mainSpId
                    }))
                }
            } catch (error) {
                console.error('获取运动项目列表失败:', error)
                this.$message.error('获取运动项目列表失败')
            }
        },
        async fetchConfig() {
            if (!this.isLoggedIn) return;  // 未登录直接返回

            try {
                const res = await request({
                    url: '/getDepartmentConfig',
                    method: 'get'
                });
                if (res.code === 1) {
                    const config = res.data;
                    // 解析并转换配置数据结构
                    const levelConfig = JSON.parse(config.levelConfig).map(level => {
                        if (level.isNumeric) {
                            const digits = level.valueRange.find(item => item[0] === 'digits');
                            return {
                                ...level,
                                digits: digits ? digits[1] : 2,
                                valuePairs: [],
                                isExpanded: false
                            };
                        } else {
                            return {
                                ...level,
                                valuePairs: level.valueRange.map(([label, value]) => ({
                                    label,
                                    value
                                })),
                                isExpanded: false
                            };
                        }
                    });

                    this.configForm = {
                        maxPlayers: config.maxPlayers,
                        maxEvents: config.maxEvents,
                        levelConfig
                    };
                }
            } catch (error) {
                console.error('获取配置失败:', error);
                this.$message.error('获取配置失败');
            }
        },
        handleLogout() {
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 清除用户信息和认证相关的存储
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
                localStorage.removeItem('expireTime');

                // 重置组件状态
                this.userInfo = {
                    name: '',
                    head: '',
                    powerDegree: [],
                    joinedSportMeetings: [],
                    smId: null,
                    judgeEvents: [],
                    mySports: []
                };
                this.isLoggedIn = false;

                // 显示提示
                this.$message.success('已退出登录');

                // 跳转到登录页
                this.$router.push('/login');
            }).catch(() => { });
        },
        goToSportMeetings() {
            // 修改这里，使用相对路径
            this.$router.push('sport-meetings');
            // 将当前选择恢复为原值
            this.$nextTick(() => {
                this.currentSmId = this.userInfo.smId;
            });
        }
    },
    watch: {
        currentSmId: {
            immediate: false,
            handler(val, oldVal) {
                // 移除对 handleMeetingChange 的调用，只更新学校列表
                if (val === oldVal || val === 'more') return;
                this.updateMySchools();
            }
        }
    },
    async mounted() {
        await this.fetchConfig(); // 先获取配置
        await this.fetchAvailableSports(); // 然后获取运动项目
        this.fetchMeetings(); // 最后获取其他数据
    }
}
</script>

<style lang="less" scoped>
.user-profile {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    .profile-card {
        margin-bottom: 20px;

        .profile-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;

            .left-section {
                display: flex;
                align-items: flex-start;
                gap: 20px;
            }

            .avatar-wrapper {
                margin-right: 20px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    transform: translateY(-2px);
                }

                .el-avatar {
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    background: #409EFF;
                    color: #fff;
                    font-size: 32px;
                    font-weight: 500;
                }

                .login-tip {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 4px;
                    text-align: center;
                    font-size: 12px;
                }
            }

            .info-wrapper {
                .name-line {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;

                    h2 {
                        margin: 0;
                    }
                }

                .roles {
                    display: flex;
                    gap: 4px;
                    flex-wrap: nowrap;

                    &.wrap-roles {
                        flex-wrap: wrap;
                        margin-top: 4px;
                    }

                    .el-tag {
                        margin: 0;
                    }
                }

                .logout-btn {
                    border: #F56C6C 2px dotted;
                    padding: 6px 24px;
                    color: #F56C6C;

                    &:hover {
                        color: #f78989;
                    }
                }
            }

            .right-actions {
                display: flex;
                gap: 10px;

                .settings-btn {
                    font-size: 20px;
                    padding: 0;
                    color: #909399;

                    &:hover {
                        color: #409EFF;
                    }
                }


            }
        }

        .current-meeting {
            display: flex;
            align-items: center;
            gap: 10px;

            .meeting-label {
                font-weight: bold;
            }

            .el-select {
                width: 300px;
            }
        }
    }

    .profile-tabs {
        background: white;
        padding: 20px !important;
        border-radius: 4px;

        // 添加卡片间距样式
        ::v-deep .el-tab-pane {
            .competition-card {
                margin-bottom: 20px; // 增加卡片间距

                &:last-child {
                    margin-bottom: 0; // 最后一个卡片不需要底部间距
                }
            }
        }

        ::v-deep .el-tabs__content {
            overflow: visible;
        }
    }

    /* 添加这些样式以确保子路由内容能够正确显示 */
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;

    /* 当显示子路由时移除内边距 */
    &:has(> .router-view) {
        padding: 0;
    }
}

@media (max-width: 768px) {
    .user-profile {
        // padding: 10px;

        .profile-card {
            .profile-header {
                flex-direction: row; // 保持水平布局
                padding: 15px;

                .left-section {
                    flex: 1;
                }

                .avatar-wrapper {
                    margin: 0 0 20px 0;
                }
            }

            .current-meeting {
                flex-direction: column;
                align-items: stretch;

                .el-select {
                    width: 100%;
                }
            }
        }
    }

    .schools-list {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        margin-top: 20px;
    }

    .profile-tabs {
        ::v-deep .el-tabs__content {
            overflow: visible;
        }
    }
}

.schools-list {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    margin-top: 20px;
}

.profile-tabs {
    ::v-deep .el-tabs__content {
        overflow: visible;
    }
}

@media screen and (max-width: 768px) {
    padding: 0; // 移除所有内边距

    .profile-card {
        margin-bottom: 10px;
        border-radius: 0;
        box-shadow: none;

        .profile-header {
            padding: 15px;

            .avatar-wrapper {
                margin: 0 0 15px 0;
            }
        }

        .current-meeting {
            padding: 0 15px 15px;
        }
    }

    .profile-tabs {
        background: white;
        padding: 0 !important; // 移除内边距
        border-radius: 0;

        ::v-deep .el-tabs__header {
            margin-bottom: 10px;
        }

        ::v-deep .el-tabs__content {
            padding: 0 10px;
        }
    }

    .schools-list {
        margin: 10px 0;
        gap: 10px;
        grid-template-columns: 1fr; // 移动端单列显示
    }

    .score-stats {
        grid-template-columns: 1fr;
        padding: 10px;
        gap: 10px;

        .degree-item {
            margin: 0;
            border-radius: 4px;
        }
    }

    // 调整分数详情面板
    .score-details-panel {
        padding: 10px;

        .panel-header {
            margin-bottom: 10px;
        }

        .score-details-content {
            margin-top: 10px;
        }
    }
}

.user-profile {
    @media (max-width: 768px) {
        padding: 0;

        .profile-card {
            margin: 0;
            border-radius: 0;
            box-shadow: none;
        }

        .profile-tabs {
            margin: 0;
            border-radius: 0;

            .schools-list {
                margin: 0;
                // padding: 10px;
                grid-template-columns: 1fr;
                gap: 10px;
            }
        }
    }
}

// 添加空状态样式
.empty-state {
    text-align: center;
    padding: 40px 0;

    .el-empty {
        padding: 40px;

        /deep/ .el-empty__description {
            p {
                color: #909399;
                margin-bottom: 16px;
            }
        }
    }
}

// 添加样式
.join-more {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #409EFF;

    i {
        font-size: 14px;
    }
}
</style>
