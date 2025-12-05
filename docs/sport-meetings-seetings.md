### API接口文档

#### 1. 获取职员列表
```
GET /getStaffList
响应:
{
    "code": 1,
    "message": "success",
    "data": [
        {
            "id": "user_id",
            "username": "用户名",
            "userType": [1,2,3]  // 职位类型数组
        }
    ]
}
```

#### 2. 添加职员
```
POST /register
请求体:
{
    "username": "用户名",
    "password": "密码",
    "userType": [1,2,3]  // 职位类型数组
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 3. 获取邀请码列表
```
GET /getInviteCodes
响应:
{
    "code": 1,
    "message": "success",
    "data": [
        {
            "code": "邀请码",
            "userType": [1,2,3],
            "expireTime": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

#### 4. 创建邀请码
```
POST /createInviteCode
请求体:
{
    "code": "邀请码",
    "userType": [1,2,3],
    "expireTime": "2024-01-01T00:00:00.000Z"
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 5. 更新邀请码
```
PUT /updateInviteCode
请求体:
{
    "code": "邀请码",
    "userType": [1,2,3],
    "expireTime": "2024-01-01T00:00:00.000Z"
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 6. 删除邀请码
```
DELETE /deleteInviteCode/{code}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 7. 删除职员
```
DELETE /deleteStaff/{id}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 8. 获取当前运动会类型
```
GET /getCurrentMeetingType
响应:
{
    "code": 1,
    "message": "success",
    "data": {
        "type": 1  // 1-校运会，2-市运会
    }
}
```

#### 9. 获取运动会信息
```
GET /getMeetingInfo
响应:
{
    "code": 1,
    "message": "success",
    "data": [{
        "smId": 1,
        "name": "运动会名称",
        "cover": "封面URL",  // 新增封面字段
        "registrationDeadline": "2024-01-01T00:00:00.000Z",  // 新增报名截止时间
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-02T00:00:00.000Z",
        "amStartTime": "08:00:00",
        "amEndTime": "12:00:00",
        "pmStartTime": "14:00:00",
        "pmEndTime": "18:00:00"
    }]
}
```

#### 10. 更新运动会基本信息
```
PUT /updateMeetingBasic
请求体:
{
    "name": "运动会名称",
    "cover": "封面URL"
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 11. 更新运动会时间配置
```
PUT /updateMeetingTime
请求体:
{
    "registrationDeadline": "2024-01-01T00:00:00.000Z", // 新增报名截止时间
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-02T00:00:00.000Z",
    "amStartTime": "08:00:00",
    "amEndTime": "12:00:00",
    "pmStartTime": "14:00:00",
    "pmEndTime": "18:00:00"
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 12. 更新用户权限
```
PUT /updateUserPower
请求体:
{
    "uid": "用户ID",
    "powerDegree": [1,2,3]  // 权限数组
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 13. 更新邀请码权限
```
PUT /updateInviteCodePower
请求体:
{
    "code": "邀请码",
    "userType": [1,2,3]  // 权限数组
}
响应:
{
    "code": 1,
    "message": "success"
}
```

#### 14. 上传运动会封面
```
POST /uploadCover
请求体:
FormData格式，包含文件字段 'file'

响应:
{
    "code": 1,
    "message": "success",
    "data": {
        "url": "http://example.com/covers/xxx.jpg"
    }
}
```

注意事项：
1. 所有请求都需要在header中携带token进行身份验证
2. 后端根据token确定当前用户的权限和所属运动会
3. 所有接口的响应都遵循统一格式：
   - code: 1表示成功，0表示失败
   - message: 响应消息
   - data: 响应数据（可选）

已进行更改。