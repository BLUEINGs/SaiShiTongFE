# 用户信息接口文档

## 1. 获取用户信息
**接口地址**: `/getUserInfo`  
**方法**: `GET`  

**响应示例**:
```json
{
    "code": 1,
    "message": "获取成功",
    "data": {
        "name": "张三",
        "head": "http://example.com/avatar.jpg",
        "powerDegree": [1, 4],
        "joinedSportMeetings": [
            {
                "smId": 1,
                "name": "2024校运会"
            }
        ],
        "smId": 1,  // 当前选择的运动会ID
        "judgeEvents": [1, 2, 3],
        "mySports": [
            {
                "spId": 1,
                "name": "100米短跑",
                "gender": false,
                "compType": 3,
                "mainSpId": 1,
                "status": 4
            }
        ]
    }
}
```

## 2. 切换当前运动会
**接口地址**: `/switchCurrentMeeting`  
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
    "message": "切换成功",
    "data": null,
    "verify": {
        "content": "new-jwt-token",
        "expireTime": 1735660800000
    },
    "myInfo": {
        "name": "张三",
        "head": "http://example.com/avatar.jpg",
        "powerDegree": [1, 4],
        // ...其他用户信息
    }
}
```

**说明**:
- 切换运动会成功后会返回新的认证信息
- verify 和 myInfo 字段与登录接口返回格式一致

## 错误码说明
| 错误码 | 说明 |
|--------|------|
| -1 | 系统错误 |
| 0 | 操作失败 |
| 1 | 操作成功 |
