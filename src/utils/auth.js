// 更新验证信息的方法
export function updateAuthInfo(token, userInfo) {
    if (token) {
        localStorage.setItem('token', token[0]);
        localStorage.setItem('tokenExpire', token[1]);
    }
    if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
}

// 获取用户信息的方法
export function getUserInfo() {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

// 清除验证信息的方法
export function clearAuthInfo() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpire');
    localStorage.removeItem('userInfo');
}
