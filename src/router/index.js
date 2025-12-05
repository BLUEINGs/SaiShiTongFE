
import Vue from 'vue';
import VueRouter from 'vue-router';
import DepartmentManagement from '@/views/DepartmentManagement.vue';
import SportsManagement from '@/views/SportsManagement.vue';
import JudgeManagement from '@/views/JudgeManagement.vue';
import RegistrationRecord from '@/views/RegistrationRecord.vue';
import ScheduleManagement from '@/views/ScheduleManagement.vue';
import SystemSettings from '@/views/SystemSettings.vue';
import LoginRegister from '@/views/LoginRegister.vue';
import SportMeetingSettings from '@/views/SportMeetingSettings.vue';
import UserProfile from '@/views/UserProfile.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomePage.vue')
    },
    {
        path: '/login',
        name: 'LoginRegister',
        component: LoginRegister,
        meta: {
            noNav: true // 标记不需要导航栏的路由
        }
    },
    {
        path: '/login-register',
        redirect: to => {
            return { path: '/login', query: to.query }
        }
    },
    {
        path: '/department-management',
        component: DepartmentManagement
    },
    {
        path: '/sports-management',
        component: SportsManagement
    },
    {
        path: '/judge-management',
        component: JudgeManagement
    },
    {
        path: '/registration-record',
        component: RegistrationRecord
    },
    {
        path: '/check-center',
        component: () => import('@/views/CheckCenter.vue')
    },
    // 添加ai-judge路由
    {
        path: '/ai-judge/:spId',
        name: 'AiJudge',
        component: () => import('@/views/AiJudge.vue'),
        props: true,  // 将路由参数作为组件的props传入
        meta: {
            title: '智能评分',
            requireJudgeOrAdmin: true
        }
    },
    {
        path: '/ai-web',
        name: 'AiWeb',
        component: () => import('@/views/AiWeb.vue')
    },
    {
        path: '/schedule-management',
        component: ScheduleManagement
    },
    {
        path: '/system-settings',
        component: SystemSettings
    },
    {
        path: '/sport-meetings',
        name: 'SportMeetings',
        component: () => import('@/views/SportMeetings.vue')
    },
    {
        path: '/sport-meetings/:id',
        name: 'SportMeetingDetail',
        component: () => import('@/views/SportMeetingDetail.vue'),
        props: (route) => ({
            fromList: !!route.params.fromList,
            initialData: route.params.initialData || {}
        })
    },
    {
        path: '/sport-meetings/:id/settings',
        name: 'SportMeetingSettings',
        component: SportMeetingSettings,
        props: true
    },
    {
        path: '/staff-settings',
        component: SportMeetingSettings
    },
    {
        path: '/user-profile',
        name: 'UserProfile',
        component: UserProfile,
        children: [
            {
                path: 'sport-meetings',
                name: 'UserSportMeetings',
                component: () => import('@/views/SportMeetings.vue')
            }
        ]
    },
    {
        path: '/create-meeting',
        name: 'CreateMeeting',
        component: () => import('@/views/CreateMeeting.vue'),
        meta: {
            noNav: true
        }
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, from, next) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !userInfo.token) {
        next('/login');
    }
    else if (to.path === '/login' && userInfo.token) {
        next('/');
    }
    else {
        next();
    }
});

router.onError((error) => {
    console.error('路由错误:', error);
    if (error.name === 'NavigationDuplicated' ||
        error.message.includes('Avoided redundant navigation')) {
        return;
    }
});

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
        if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationAborted') {
            throw err;
        }
        return Promise.resolve(false);
    });
};

export default router;