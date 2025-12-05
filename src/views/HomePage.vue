<template>
    <div class="home-page">
        <el-row :gutter="20">
            <el-col :span="24" :lg="16">
                <schedule-overview v-if="isLoggedIn" class="dashboard-panel" />
                <el-card v-else class="dashboard-panel welcome-card">
                    <div slot="header">
                        <span>欢迎使用运动会管理系统</span>
                    </div>
                    <div class="welcome-content">
                        <i class="el-icon-trophy"></i>
                        <p>本页面需要登录并加入运动会后查看</p>
                        <p>您可以先：</p>
                        <div class="action-links">
                            <router-link to="/sport-meetings" class="action-link">
                                <i class="el-icon-medal"></i>
                                逛逛运动会广场
                            </router-link>
                            <router-link to="/login" class="action-link">
                                <i class="el-icon-user"></i>
                                登录/注册
                            </router-link>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="24" :lg="8">
                <score-panel v-if="isLoggedIn" class="dashboard-panel" />
                <team-score v-if="isLoggedIn" class="dashboard-panel" />
            </el-col>
        </el-row>
    </div>
</template>

<script>
import ScheduleOverview from '@/components/dashboard/ScheduleOverview.vue'
import ScorePanel from '@/components/dashboard/ScorePanel.vue'
import TeamScore from '@/components/dashboard/TeamScore.vue'
import { formatScore } from '@/utils/formatters'

export default {
    name: 'HomePage',
    components: {
        ScheduleOverview,
        ScorePanel,
        TeamScore
    },
    data() {
        return {
            isLoggedIn: true
        }
    },
    created() {
        const token = localStorage.getItem('token')
        // alert(token)
        // 只要有 token 就认为是已登录状态
        this.isLoggedIn = token
    },
    methods: {
        formatScore
    }
}
</script>

<style lang="less" scoped>
.home-page {
    padding: 20px;

    .dashboard-panel {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
        }
    }

    .welcome-card {
        text-align: center;
        padding: 40px 20px;

        .welcome-content {
            padding: 20px;

            i {
                font-size: 48px;
                color: #409EFF;
                margin-bottom: 20px;
            }

            p {
                color: #606266;
                font-size: 16px;
                margin: 10px 0;
            }

            .action-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 30px;

                .action-link {
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    background: #409EFF;
                    color: white;
                    border-radius: 4px;
                    text-decoration: none;
                    transition: all 0.3s ease;

                    i {
                        font-size: 16px;
                        margin-right: 8px;
                        margin-bottom: 0;
                        color: white;
                    }

                    &:hover {
                        background: #66b1ff;
                        transform: translateY(-2px);
                    }
                }
            }
        }
    }
}

// 移动端适配
@media screen and (max-width: 768px) {
    .home-page {
        padding: 10px 0; // 移动端几乎铺满屏幕，只保留少许边距
    }

    .dashboard-panel {
        margin: 10px;
        border-radius: 0; // 移动端卡片可以不需要圆角
        box-shadow: none; // 移动端减少阴影效果

        &:hover {
            transform: none; // 移动端取消悬停效果
            box-shadow: none;
        }
    }

    .welcome-card {
        margin: 0;
        border-radius: 0;

        .welcome-content {
            padding: 15px;

            .action-links {
                flex-direction: column; // 移动端按钮垂直排列
                gap: 10px;
                margin-top: 20px;

                .action-link {
                    box-sizing: border-box;
                    width: 100%; // 按钮占满宽度
                    justify-content: center;

                    &:hover {
                        transform: none; // 移动端取消悬停效果
                    }
                }
            }
        }
    }
}
</style>
