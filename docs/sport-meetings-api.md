# 运动会实例接口文档

## 1. 获取运动会基本信息
**接口地址**: `/getSportMeeting/:id`  
**方法**: `GET`  

**响应示例**:
```json
{
    "code": 1,
    "message": "获取成功",
    "data": {
        "smId": 1,
        "name": "2024校运会",
        "sportCount": 10,
        "schoolCount": 5,
        "playerCount": 200,
        "status": 2,
        "img": "http://example.com/image.jpg",
        "isFollowed": true
    }
}
```

## 2. 获取参赛学校列表
**接口地址**: `/getSchools`  
**方法**: `GET`  
**请求参数**:
```
smId: 1  // 运动会ID
```

**响应示例**:
```json
{
    "code": 1,
    "message": "获取成功",
    "data": [{
        "scId": 1,
        "name": "计算机学院",
        "img": "http://example.com/image.jpg",
        "slogan": "编码未来",
        "players": []
    }]
}
```

## 3. 获取比赛项目列表
**接口地址**: `/getSport`  
**方法**: `GET`  
**请求头**:
```
SmId: 1  // 运动会ID
```

**响应示例**:
```json
{
    "code": 1,
    "message": "获取成功",
    "data": [{
        "spId": 1,
        "name": "100米跑",
        "type": "track",
        "compSystem": "淘汰赛",
        "status": "registering",
        "maxCount": 100,
        "registeredCount": 50
    }]
}
```

## 4. 获取赛程安排
**接口地址**: `/getSchedule`  
**方法**: `GET`  
**请求头**:
```
SmId: 1  // 运动会ID
```

**响应示例**:
```json
{
    "code": 1,
    "message": "获取成功",
    "data": [{
        "id": 1,
        "name": "100米预赛第一组",
        "time": "2024-03-27T09:00:00.000Z",
        "venue": "田径场",
        "phase": "preliminary",
        "status": "pending"
    }]
}
```

## 5. 加入运动会
**接口地址**: `/joinSportMeeting`  
**方法**: `POST`  
**数据格式**: `application/x-www-form-urlencoded`

**请求参数**:
```
smId: 1           // 运动会ID
inviteCode: "xxx" // 邀请码
```

**响应示例**:
```json
{
    "code": 1,
    "message": "加入成功",
    "data": null
}
```

## 6. 关注/取消关注运动会
**接口地址**: `/toggleFollowSportMeeting`  
**方法**: `POST`  
**数据格式**: `application/x-www-form-urlencoded`

**请求参数**:
```
smId: 1  // 运动会ID
```

**响应示例**:
```json
{
    "code": 1,
    "message": "操作成功",
    "data": null
}
```

## 7. 创建运动会
**接口地址**: `/createSportMeeting`  
**方法**: `POST`  
**数据格式**: `application/json`

**请求参数**:
```json
{
    "name": "2024校运会",
    "startTime": "2024-03-27T00:00:00.000Z",  // ISO格式的时间字符串
    "endTime": "2024-03-31T00:00:00.000Z",    // ISO格式的时间字符串
    "amStartTime": "08:00:00",  // 24小时制时间字符串
    "amEndTime": "11:30:00",    // 24小时制时间字符串
    "pmStartTime": "14:00:00",  // 24小时制时间字符串
    "pmEndTime": "17:00:00"     // 24小时制时间字符串
}
```

**参数说明**:
- startTime和endTime使用ISO 8601格式的UTC时间字符串
- amStartTime、amEndTime、pmStartTime、pmEndTime使用24小时制的时间字符串(HH:mm:ss)

**响应示例**:
```json
{
    "code": 1,
    "message": "创建成功",
    "data": {
        "smId": 1
    }
}
```

## 错误码说明
| 错误码 | 说明 |
|--------|------|
| -1 | 系统错误 |
| 0 | 操作失败 |
| 1 | 操作成功 |
| 1001 | 邀请码无效 |
| 1002 | 已经加入该运动会 |
| 1003 | 运动会不存在 |
