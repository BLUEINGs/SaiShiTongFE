<template>
    <div v-if="isMobile" class="top-title">
        <el-button v-if="shouldShowSideNav" class="menu-btn" icon="el-icon-menu" @click="toggleSidebar"></el-button>
        <span class="page-title">{{ currentTitle }}</span>
    </div>
</template>

<script>
export default {
    name: 'TopTitle',
    props: {
        shouldShowSideNav: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isMobile: window.innerWidth <= 768
        }
    },
    computed: {
        currentTitle() {
            const routeMap = {
                '/': '主页',
                '/user-profile': '我的信息',
                '/sport-meetings': '运动会广场',
                '/staff-settings': '此运动会',
                '/department-management': '团体管理',
                '/ai-web': '智能裁判（测试）',
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
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.isMobile = window.innerWidth <= 768
        },
        toggleSidebar() {
            this.$emit('toggle-sidebar')
        }
    }
}
</script>

<style lang="less" scoped>
.top-title {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 16px;
    z-index: 20;

    .menu-btn {
        padding: 8px;
        margin-right: 12px;
        border: none;
        background: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }
    }

    .page-title {
        font-size: 20px;
        font-weight: 500;
        line-height: 50px; // 添加行高以垂直居中
    }
}
</style>
