<template>
    <div>

        <!-- PC端顶部导航 -->
        <div class="top-navbar" v-if="!isMobile">
            <div class="nav-content">
                <el-menu :default-active="$route.path" mode="horizontal" @select="handleSelect">
                    <el-menu-item index="/">
                        <i class="el-icon-house"></i>
                        <span>主页</span>
                    </el-menu-item>
                    <el-menu-item index="/user-profile">
                        <i class="el-icon-user"></i>
                        <span>我的</span>
                    </el-menu-item>
                    <el-menu-item index="/sport-meetings">
                        <i class="el-icon-medal"></i>
                        <span>运动会广场</span>
                    </el-menu-item>
                    <el-menu-item index="/department-management">
                        <i class="el-icon-user-solid"></i>
                        <span>团体</span>
                    </el-menu-item>
                    <el-menu-item index="/sports-management">
                        <i class="el-icon-data-analysis"></i>
                        <span>项目</span>
                    </el-menu-item>
                    <el-menu-item index="/judge-management" v-if="userPowerDegree.includes(3)">
                        <i class="el-icon-stopwatch"></i>
                        <span>评分</span>
                    </el-menu-item>
                    <!-- 暂时注释掉报名记录选项 -->
                    <!-- <el-menu-item index="/registration-record" v-if="userPowerDegree.includes(5)">
                        <i class="el-icon-document"></i>
                        <span>报名</span>
                    </el-menu-item> -->
                    <el-menu-item index="/schedule-management">
                        <i class="el-icon-date"></i>
                        <span>赛程</span>
                    </el-menu-item>
                </el-menu>

                <!-- 用户信息区域 -->
                <div class="user-info">
                    <el-popover placement="bottom-end" width="280" trigger="hover" v-model="showUserPopover"
                        popper-class="user-popover-card" transition="el-fade-in-linear">
                        <template v-if="isLoggedIn">
                            <div class="user-popover">
                                <div class="user-header">
                                    <el-avatar :size="60" :src="userAvatar">{{ userInfo.name?.charAt(0) }}</el-avatar>
                                    <div class="user-details">
                                        <div class="user-name">{{ userInfo.name }}</div>
                                        <div class="user-roles">
                                            <el-tag v-for="type in userInfo.userType" :key="type" size="small"
                                                effect="plain">
                                                {{ getRoleLabel(type) }}
                                            </el-tag>
                                        </div>
                                    </div>
                                </div>
                                <div class="divider"></div>
                                <div class="user-actions">
                                    <div class="action-item" @click="$router.push('/user-profile')">
                                        <i class="el-icon-user"></i>
                                        个人中心
                                    </div>
                                    <div class="action-item logout-btn" @click="handleLogout">
                                        <i class="el-icon-switch-button"></i>
                                        退出登录
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="user-popover">
                                <div class="not-logged-in">
                                    <i class="el-icon-user-solid"></i>
                                    <p>未登录</p>
                                    <el-button type="text" @click="goToLogin">点击登录</el-button>
                                </div>
                            </div>
                        </template>
                        <div slot="reference" class="user-trigger">
                            <el-avatar :size="32" :src="userAvatar">
                                {{ isLoggedIn ? userInfo.name?.charAt(0) : '游' }}
                            </el-avatar>
                            <span class="username" v-if="isLoggedIn">{{ userInfo.name }}</span>
                        </div>
                    </el-popover>
                </div>
            </div>
        </div>

        <!-- 移动端底部导航 -->
        <div class="mobile-navbar" v-else>
            <el-menu :default-active="$route.path" mode="horizontal" @select="handleSelect">
                <el-menu-item index="/">
                    <i class="el-icon-house"></i>
                    <span>主页</span>
                </el-menu-item>
                <el-menu-item index="/department-management"
                    v-if="!(userPowerDegree.includes(3) && (!userPowerDegree.includes(4) || !userPowerDegree.includes(1)))">
                    <i class="el-icon-user-solid"></i>
                    <span>团体</span>
                </el-menu-item>
                <el-menu-item index="/sports-management"
                    v-if="!(userPowerDegree.includes(3) && (!userPowerDegree.includes(4) || !userPowerDegree.includes(1)))">
                    <i class="el-icon-data-analysis"></i>
                    <span>项目</span>
                </el-menu-item>
                <el-menu-item index="/judge-management" v-if="userPowerDegree.includes(3)">
                    <i class="el-icon-stopwatch"></i>
                    <span>评分</span>
                </el-menu-item>
                <el-menu-item index="/schedule-management">
                    <i class="el-icon-date"></i>
                    <span>赛程</span>
                </el-menu-item>
                <el-menu-item index="/user-profile">
                    <i class="el-icon-user"></i>
                    <span>我的</span>
                </el-menu-item>
            </el-menu>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TopNavbar',
    data() {
        return {
            showUserPopover: false,
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            userPowerDegree: JSON.parse(localStorage.getItem('userInfo') || '{}').powerDegree || [],
            isMobile: false
        }
    },
    computed: {
        isLoggedIn() {
            return !!this.userInfo.uid
        },
        userAvatar() {
            return this.userInfo.head || ''
        },
        canShowSidebar() {
            return this.userPowerDegree.includes(2) || this.userPowerDegree.includes(5)
        },
        currentPageTitle() {
            const routeMap = {
                '/': '主页',
                '/user-profile': '我的信息',
                '/sport-meetings': '运动会广场',
                '/staff-settings': '此运动会',
                '/department-management': '团体管理',
                '/sports-management': '项目管理',
                '/judge-management': '裁判评分',
                '/registration-record': '报名记录',
                '/schedule-management': '赛程安排',
                '/system-settings': '系统设置'
            }
            return routeMap[this.$route.path] || ''
        }
    },
    mounted() {
        this.checkDevice()
        window.addEventListener('resize', this.checkDevice)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkDevice)
    },
    methods: {
        handleSelect(index) {
            // 添加路径有效性检查
            if (index && index !== this.$route.path) {
                this.$router.push(index).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        console.error('路由错误:', err);
                    }
                });
            }
        },
        getRoleLabel(type) {
            const roles = {
                2: '团体负责人',
                3: '裁判',
                4: '运动员',
                5: '运动会操办者'
            }
            return roles[type] || '用户'
        },
        handleLogout() {
            localStorage.removeItem('token')
            localStorage.removeItem('expiredTime')
            localStorage.removeItem('userInfo')
            this.$router.push('/login')
        },
        goToLogin() {
            this.$router.push('/login')
        },
        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },
        toggleSidebar() {
            // 触发事件通知 App.vue
            this.$emit('toggle-sidebar')
        }
    }
}
</script>

<style lang="less" scoped>
.top-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

    .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .el-menu {
        border-bottom: none;
        background: transparent;

        .el-menu-item {
            height: 50px; // 减小高度
            line-height: 50px;
            padding: 0 12px; // 减小内边距
            font-size: 15px; // 稍微调小字号
            font-weight: 500;

            &.is-active {
                border-bottom: 2px solid #409EFF;
                color: #409EFF;
            }

            i {
                font-size: 16px;
                margin-right: 4px; // 减小图标和文字的间距
            }
        }
    }
}

.mobile-navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    // right: 0;
    background: #fff;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .el-menu {
        display: flex;
        justify-content: space-around;
        border-bottom: none;

        .el-menu-item {
            height: 60px; // 增加高度以适应垂直布局
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 8px 0;
            font-size: 12px;

            i {
                display: block;
                font-size: 20px;
                margin: 0 0 4px; // 调整图标下方间距
            }

            span {
                display: block;
                line-height: 1.2;
                text-align: center;
                width: 100%;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .top-navbar {
        .nav-content {
            padding: 0 10px;
        }

        .el-menu-item {
            padding: 0 10px;
            font-size: 12px;

            i {
                margin-right: 2px;
            }
        }
    }

    .main-content-full {
        padding-bottom: 56px; // 为底部导航栏留出空间
    }

    .mobile-navbar {
        .el-menu-item {
            padding: 6px 0 !important;
            flex-direction: column !important;
            align-items: center !important;

            i {
                margin: 0 0 4px !important;
            }

            span {
                font-size: 11px !important;
            }
        }
    }

    // 移动端底部导航栏固定在底部
    .mobile-navbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: #fff;
        box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    }

    // 为底部导航腾出空间
    body {
        padding-bottom: 60px;
    }
}

.user-info {
    .user-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.3s;
        cursor: pointer;
        user-select: none; // 禁止选中文本

        &:hover {
            background: rgba(64, 158, 255, 0.1);
        }

        .username {
            font-size: 14px;
            color: #606266;
        }
    }
}

:deep(.user-popover-card) {
    padding: 0;

    .el-popover__title {
        margin: 0;
        padding: 0;
    }

    .user-popover {
        .user-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #e6f3ff 0%, #f0f9eb 100%);
            user-select: none;

            .el-avatar {
                width: 48px; // 减小头像尺寸
                height: 48px;
                font-size: 20px !important; // 增大头像中的文字
                background: #409EFF;
                color: #fff;
            }

            .user-details {
                flex: 1;

                .user-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #303133;
                    margin-bottom: 8px;
                }

                .user-roles {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;

                    .el-tag {
                        border-radius: 12px;
                    }
                }
            }
        }

        .divider {
            height: 1px;
            background: #ebeef5;
            margin: 0;
        }

        .user-actions {
            padding: 12px 0;

            .action-item {
                margin: 0 8px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s;
                color: #606266;
                border-radius: 6px;
                user-select: none;

                i {
                    font-size: 18px;
                }

                &:hover {
                    background: #f5f7fa;
                    color: #409EFF;
                }

                &.logout-btn {
                    margin-top: 8px;

                    &:hover {
                        background: #fef0f0;
                        color: #f56c6c;
                    }
                }
            }
        }
    }

    .not-logged-in {
        text-align: center;
        padding: 24px;
        user-select: none;

        i {
            font-size: 32px;
            color: #909399;
            margin-bottom: 8px;
        }

        p {
            margin: 8px 0;
            color: #606266;
        }
    }
}

.mobile-top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 16px;
    z-index: 999;

    .menu-btn {
        padding: 8px;
        margin-right: 12px;
        border: none;
    }

    .page-title {
        font-size: 16px;
        font-weight: 500;
    }
}
</style>

<style lang="less">
// 添加全局样式
.el-popover.user-popover-card {
    padding: 0;

    .user-popover {
        .user-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #e6f3ff 0%, #f0f9eb 100%);
            user-select: none;

            .el-avatar {
                width: 48px;
                height: 48px;
                font-size: 20px !important;
                background: #409EFF;
                color: #fff;
            }

            .user-details {
                flex: 1;

                .user-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #303133;
                    margin-bottom: 8px;
                }

                .user-roles {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;

                    .el-tag {
                        border-radius: 12px;
                    }
                }
            }
        }

        .divider {
            height: 1px;
            background: #ebeef5;
            margin: 0;
        }

        .user-actions {
            padding: 12px 0;

            .action-item {
                margin: 0 8px;
                height: 46px;
                padding: 0 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s;
                color: #606266;
                border-radius: 6px;
                user-select: none;
                font-size: 15px;

                i {
                    font-size: 18px;
                }

                &:hover {
                    background: #f5f7fa;
                    color: #409EFF;
                }

                &.logout-btn {
                    margin-top: 8px;
                    color: #f56c6c;

                    &:hover {
                        background: #fef0f0;
                        color: #f56c6c;
                    }
                }
            }
        }
    }

    .not-logged-in {
        text-align: center;
        padding: 24px;
        user-select: none;

        i {
            font-size: 32px;
            color: #909399;
            margin-bottom: 8px;
        }

        p {
            margin: 8px 0;
            color: #606266;
        }
    }

    .popper__arrow {
        border-bottom-color: #e6f3ff !important;

        &::after {
            border-bottom-color: #e6f3ff !important;
        }
    }
}
</style>
