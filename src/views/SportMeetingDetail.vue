<template>
    <div class="meeting-detail">
        <div class="content-wrapper">
            <div class="meeting-header">
                <div class="cover-image">
                    <img :src="meetingInfo.img || defaultImage" :alt="meetingInfo.name">
                </div>
                <div class="header-content">
                    <div class="title-container">
                        <h1>{{ meetingInfo.name }}</h1>
                    </div>
                    <div class="meeting-stats">
                        <el-tag>{{ meetingInfo.schoolCount }}个学校</el-tag>
                        <el-tag type="success">{{ meetingInfo.sportCount }}个项目</el-tag>
                        <el-tag type="warning">{{ meetingInfo.playerCount }}名运动员</el-tag>
                    </div>
                    <div class="action-buttons">
                        <el-button type="primary" @click="handleJoin">
                            加入运动会
                        </el-button>
                        <el-button v-if="!isLoggedIn" :type="isFollowed ? 'success' : 'info'" @click="toggleFollow">
                            {{ isFollowed ? '已关注' : '关注' }}
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 概览信息 -->
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="参赛学校" name="schools">
                    <department-overview :schools="meetingInfo.schools" v-loading="loading.schools" />
                </el-tab-pane>
                <el-tab-pane label="比赛项目" name="sports">
                    <sports-overview :sports="meetingInfo.sports" v-loading="loading.sports" />
                </el-tab-pane>
                <el-tab-pane label="赛程安排" name="schedule">
                    <schedule-overview :schedule="meetingInfo.schedule" v-loading="loading.schedule" />
                </el-tab-pane>
            </el-tabs>

            <!-- 加入对话框 -->
            <responsive-dialog title="加入运动会" :visible.sync="joinDialogVisible" width="400px" @confirm="submitJoin"
                @cancel="joinDialogVisible = false">
                <el-form :model="joinForm" label-width="80px">
                    <el-form-item label="邀请码" prop="inviteCode">
                        <el-input v-model="joinForm.inviteCode" placeholder="请输入邀请码">
                        </el-input>
                    </el-form-item>
                </el-form>
            </responsive-dialog>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import DepartmentOverview from '@/components/overview/DepartmentOverview.vue'
import SportsOverview from '@/components/overview/SportsOverview.vue'
import ScheduleOverview from '@/components/overview/ScheduleOverview.vue'

export default {
    name: 'SportMeetingDetail',
    components: {
        ResponsiveDialog,
        DepartmentOverview,
        SportsOverview,
        ScheduleOverview
    },
    props: {
        fromList: {
            type: Boolean,
            default: false
        },
        initialData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            meetingInfo: this.fromList ? this.initialData : {
                schools: [],
                sports: [],
                schedule: []
            },
            activeTab: 'schools',
            joinDialogVisible: false,
            joinForm: {
                inviteCode: ''
            },
            defaultImage: 'default-meeting.jpg',
            loading: {
                schools: false,
                sports: false,
                schedule: false
            },
            dataLoaded: {
                schools: false,
                sports: false,
                schedule: false
            }
        }
    },
    computed: {
        isLoggedIn() {
            return !!localStorage.getItem('token');
        },
        isFollowed() {
            if (this.isLoggedIn) {
                return this.meetingInfo.isFollowed;
            }
            // 从本地存储获取关注列表
            const smIds = JSON.parse(localStorage.getItem('smIds') || '[]');
            return smIds.includes(Number(this.$route.params.id));
        }
    },
    methods: {
        // 修改请求配置,添加 smId
        getRequestConfig(url) {
            return {
                url,
                method: 'get',
                params: {
                    smId: this.$route.params.id
                }
            }
        },

        // 获取运动会基本信息
        async fetchMeetingInfo() {
            try {
                const res = await request({
                    url: `/getSportMeeting/${this.$route.params.id}`,
                    method: 'get'
                });
                if (res.code === 1) {
                    this.meetingInfo = res.data;
                }
            } catch (error) {
                console.error('获取运动会详情失败:', error);
                this.$message.error('获取运动会详情失败');
            }
        },

        // 修改获取参赛学校信息的处理方法
        async fetchSchools() {
            try {
                const res = await request(this.getRequestConfig('/getSchools'));
                if (res.code === 1) {
                    // 直接使用后端返回的数据结构，不需要转换
                    this.meetingInfo.schools = res.data;
                }
            } catch (error) {
                console.error('获取学校信息失败:', error);
                this.$message.error('获取学校信息失败');
            }
        },

        // 获取比赛项目信息
        async fetchSports() {
            try {
                const res = await request(this.getRequestConfig('/getAvailableSports'));
                if (res.code === 1) {
                    this.meetingInfo.sports = res.data.map(sport => ({
                        id: sport.spId,
                        name: sport.name,
                        gender: sport.gender,
                        compType: sport.compType,
                        mainSpId: sport.mainSpId,
                        status: sport.status
                    }));
                }
            } catch (error) {
                console.error('获取比赛项目失败:', error);
                this.$message.error('获取比赛项目失败');
            }
        },

        // 获取赛程安排信息
        async fetchSchedule() {
            try {
                const res = await request(this.getRequestConfig('/getSchedules'));
                if (res.code === 1) {
                    this.meetingInfo.schedule = res.data;
                }
            } catch (error) {
                console.error('获取赛程安排失败:', error);
                this.$message.error('获取赛程安排失败');
            }
        },

        async handleJoin() {
            if (!this.isLoggedIn) {
                this.$confirm('加入运动会需要注册或登录，但您仍然可以点击关注按钮以便无身份查看运动会的开发数据', '提示', {
                    confirmButtonText: '去登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$router.push('/login');
                }).catch(() => { });
                return;
            }
            this.joinDialogVisible = true
        },

        async submitJoin() {
            try {
                const params = new URLSearchParams()
                params.append('smId', this.$route.params.id)
                params.append('inviteCode', this.joinForm.inviteCode)

                const res = await request({
                    url: '/joinSportMeeting',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                });

                if (res.code === 1) {
                    // 加入成功后获取更新的用户信息
                    const userInfoRes = await request({
                        url: '/getUserInfo',
                        method: 'get'
                    });

                    if (userInfoRes.code === 1) {
                        // 更新本地存储中的用户信息
                        const userInfo = userInfoRes.data;
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));

                        // 触发 storage 事件来更新导航栏等组件
                        window.dispatchEvent(new StorageEvent('storage', {
                            key: 'userInfo',
                            newValue: JSON.stringify(userInfo)
                        }));
                    }

                    this.$message.success('加入成功');
                    this.joinDialogVisible = false;
                }
            } catch (error) {
                this.$message.error('加入失败');
            }
        },

        async toggleFollow() {
            if (!this.isLoggedIn) {
                // 处理离线状态的关注逻辑
                const smId = Number(this.$route.params.id);
                let smIds = JSON.parse(localStorage.getItem('smIds') || '[]');
                let currentSmId = Number(localStorage.getItem('currentSmId'));

                if (this.isFollowed) {
                    // 取消关注
                    smIds = smIds.filter(id => id !== smId);
                    // 如果当前smId是被取消关注的，切换到下一个
                    if (currentSmId === smId) {
                        currentSmId = smIds.length > 0 ? smIds[0] : null;
                    }
                } else {
                    // 添加关注
                    smIds.push(smId);
                    currentSmId = smId;
                }

                localStorage.setItem('smIds', JSON.stringify(smIds));
                localStorage.setItem('currentSmId', currentSmId || '');

                this.$message.success(this.isFollowed ? '取消关注成功' : '关注成功');
                return;
            }

            // 登录用户发送请求
            try {
                const res = await request({
                    url: '/toggleFollowSportMeeting',
                    method: 'post',
                    headers: {
                        'SmId': this.$route.params.id
                    }
                });
                if (res.code === 1) {
                    this.meetingInfo.isFollowed = !this.meetingInfo.isFollowed;
                    this.$message.success(this.isFollowed ? '关注成功' : '取消关注成功');
                }
            } catch (error) {
                this.$message.error('操作失败');
            }
        },

        async handleTabClick(tab) {
            const tabName = tab.name;
            if (!this.dataLoaded[tabName]) {
                this.loading[tabName] = true;
                try {
                    switch (tabName) {
                        case 'schools':
                            await this.fetchSchools();
                            break;
                        case 'sports':
                            await this.fetchSports();
                            break;
                        case 'schedule':
                            await this.fetchSchedule();
                            break;
                    }
                    this.dataLoaded[tabName] = true;
                } catch (error) {
                    console.error(`加载${tabName}数据失败:`, error);
                } finally {
                    this.loading[tabName] = false;
                }
            }
        },

        async fetchData() {
            try {
                // 只获取基本信息
                await this.fetchMeetingInfo();
            } catch (error) {
                console.error('获取数据失败:', error);
                this.$message.error('获取数据失败');
            }
        }
    },
    mounted() {
        if (!this.fromList) {
            // 只有当不是从列表页面过来时才请求基本信息
            this.fetchMeetingInfo();
        }
        // 默认加载参赛学校数据
        this.handleTabClick({ name: 'schools' });
    }
}
</script>

<style lang="less" scoped>
.meeting-detail {
    padding: 20px;

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    .meeting-header {
        display: flex;
        margin-bottom: 30px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .cover-image {
            width: 300px;
            height: 200px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .header-content {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .title-container {
                display: flex;
                justify-content: center;
                width: 100%;

                h1 {
                    margin: 0;
                    font-size: 24px;
                    text-align: center;
                }
            }

            .meeting-stats {
                display: flex;
                gap: 10px;
            }

            .action-buttons {
                display: flex;
                gap: 10px;
            }
        }
    }
}

@media (max-width: 768px) {
    .meeting-detail {
        padding: 10px;

        .content-wrapper {
            padding: 0 10px;
        }

        .meeting-header {
            flex-direction: column;

            .cover-image {
                width: 100%;
                height: 200px;
            }

            .header-content {
                padding: 15px;
                gap: 15px;
            }
        }
    }
}
</style>
