# 赛程管理 API 文档

## 1. 获取赛程列表
```http
GET /schedule/list

请求参数(application/x-www-form-urlencoded)：
- startDate: string (必需, YYYY-MM-DD) - 开始日期

响应格式：
{
    "code": 1,
    "msg": "success",
    "data": [
        {
            "seId": string,           // 赛程ID
            "datetime": string,       // 比赛开始时间 (YYYY-MM-DD HH:mm)
            "endtime": string,        // 比赛结束时间 (YYYY-MM-DD HH:mm)
            "name": string,           // 比赛项目名称
            "eventType": string,      // 比赛类型 ('track'|'field')
            "compType": number,       // 比赛阶段 (1-预赛,2-半决赛,3-决赛)
            "venue": string,          // 比赛场地
            "status": string         // 比赛状态 ('pending'|'ongoing'|'completed')
        }
    ]
}
```

## 2. 获取最近赛程
```http
GET /schedule/recent

请求参数(application/x-www-form-urlencoded)：
- date: string (必需, YYYY-MM-DD) - 查询日期
- status: array - 状态筛选 ['pending','ongoing','completed']

响应格式：同上
```

## 3. 更新赛程
```http
POST /schedule/update

请求体(application/x-www-form-urlencoded)：
- seId: string        // 赛程ID
- datetime: string    // 比赛开始时间 (YYYY-MM-DD HH:mm)
- endtime: string     // 比赛结束时间 (YYYY-MM-DD HH:mm)
- compType: number    // 比赛阶段 (1-预赛,2-半决赛,3-决赛)
- venue: string       // 比赛场地
- name: string        // 比赛项目名称

响应格式：
{
    "code": 1,
    "msg": "success",
    "data": {
        // 更新后的完整赛程信息
    }
}
```

## 数据字典

### 比赛阶段 (compType)
- 1: 预赛
- 2: 半决赛
- 3: 冠军赛

### 比赛状态 (status)
- pending: 未开始
- ongoing: 进行中
- completed: 已结束

### 错误码
- 1: 成功
- 0: 失败
- -1: 参数错误
- -2: 未授权
- -3: 服务器错误
