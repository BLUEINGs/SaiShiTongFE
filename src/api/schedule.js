import request from '@/utils/request'

// 获取所有赛程
export function getSchedules() {
    return request({
        url: '/getSchedules',
        method: 'get'
    })
}

// 更新赛程
export function updateSchedule(data) {
    // 转换参数名称以匹配后端API
    const requestData = {
        spId: data.spId,
        gameStartTime: data.startTime,
        gameEndTime: data.endTime,
        venue: data.venue
    }

    return request({
        url: '/updateSchedule',
        method: 'post',
        data: requestData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [function (data) {
            let ret = '';
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            return ret;
        }]
    })
}