export const menuRoutes = [
    {
        path: '/',
        icon: 'el-icon-house',
        title: '主页'
    },
    {
        path: '/user-profile',
        icon: 'el-icon-user',
        title: '我的信息'
    },
    {
        path: '/sport-meetings',
        icon: 'el-icon-medal',
        title: '运动会广场'
    },
    {
        divider: true
    },
    {
        path: '/staff-settings',
        icon: 'el-icon-s-custom',
        title: '此运动会',
        requireAdmin: true
    },
    {
        divider: true
    },
    {
        path: '/department-management',
        icon: 'el-icon-user-solid',
        title: '团体管理'
    },
    {
        path: '/sports-management',
        icon: 'el-icon-data-analysis',
        title: '项目管理'
    },
    {
        path: '/judge-management',
        icon: 'el-icon-stopwatch',
        title: '裁判评分',
        requireAdmin: false,
        requireJudgeOrAdmin: true
    },
    // {
    //     path: '/check-center',
    //     icon: 'el-icon-check',
    //     title: '检查中心',
    //     requireAdmin: false,
    //     requireJudgeOrAdmin: true
    // },
    {
        path: '/ai-web',
        icon: 'el-icon-video-camera',
        // 使用 HTML 上标显示 beta 标记（App.vue 中已使用 v-html 渲染）
        title: '智能裁判<sup style="font-size:10px;color:#ff7a18;">β</sup>',
    },
    /* {
        path: '/registration-record',
        icon: 'el-icon-document',
        title: '报名记录',
        requireAdmin: true
    }, */
    {
        path: '/schedule-management',
        icon: 'el-icon-date',
        title: '赛程安排'
    },
    {
        divider: true
    },
    {
        path: '/system-settings',
        icon: 'el-icon-setting',
        title: '系统设置'
    }
]

/* const routes = [
    {
        path: '/user-profile',
        component: () => import('@/views/UserProfile.vue'),
        children: [
            {
                path: 'sport-meetings',
                component: () => import('@/views/SportMeetings.vue'),
            }
        ]
    }
] */
