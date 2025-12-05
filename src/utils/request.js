import axios from 'axios';
import { updateAuthInfo } from './auth';

// 创建axios实例时不直接设置baseURL
const service = axios.create({
    timeout: 5000
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 从localStorage获取baseURL
        const baseURL = localStorage.getItem('baseURL') || 'http://8.140.62.7:8080';
        config.baseURL = baseURL;

        const token = localStorage.getItem('token');
        if (token) {
            config.headers['token'] = token;
        } else {
            // 未登录时，添加当前选中的运动会ID
            const currentSmId = localStorage.getItem('currentSmId');
            if (currentSmId) {
                config.headers['SmId'] = currentSmId;
            }
        }
        return config;
    },
    error => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        const data = response.data;

        // 检查是否有验证信息需要更新
        if (data.verify && data.myInfo) {
            updateAuthInfo(data[0], data[1])
        }

        // 处理特定错误：NO_SM_ID
        if (data.code === 0 && data.message === 'NO_SM_ID') {
            // 导入 Element UI 的 Message 组件
            const Message = require('element-ui').Message;
            Message({
                message: data.data,
                type: 'warning',
                duration: 5000,
                showClose: true
            });

            // 获取当前路由路径
            const currentPath = window.location.pathname;

            // 排除个人中心和运动会详情页
            if (!currentPath.startsWith('/user-profile') && !currentPath.startsWith('/sport-meetings')) {
                window.location.href = '/';
            }

            return Promise.reject(new Error(data.data));
        }

        // 处理登录失效的情况
        if (data.code === 0 && data.message === 'EXPIRED_LOGIN') {
            // 导入 Element UI 的 Message 组件
            const Message = require('element-ui').Message;
            // 清除登录信息
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpire');

            // 显示错误信息
            Message({
                message: data.data,
                type: 'warning',
                duration: 5000,
                showClose: true
            });

            // 跳转到登录页面并传递错误信息
            window.location.href = `/login?error=${encodeURIComponent(data.data)}`;
            return Promise.reject(new Error(data.data));
        }

        // 处理其他未定义的错误(code=0且message为空)
        if (data.code === 0 && data.message === '') {
            // 导入 Element UI 的 Message 组件
            const Message = require('element-ui').Message;
            // 显示错误信息
            Message({
                message: data.data,
                type: 'error',
                duration: 5000,
                showClose: true
            });
            // 返回 rejected promise
            return Promise.reject(new Error(data.data));
        }

        return data;
    },
    error => {
        console.error('响应错误:', error);
        return Promise.reject(error);
    }
);

// 确保使用默认导出
export default function request(config) {
    return service(config);
}
