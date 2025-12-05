# 登录注册接口文档

## 1. 登录接口

### 接口信息
- **路径**: `/login`
- **方法**: `POST`
- **数据格式**: `application/x-www-form-urlencoded`

### 请求参数
| 字段     | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

### 响应格式
```json
{
    "code": 1,              // 状态码：1成功，0失败
    "message": "登录成功",    // 响应消息
    "data": [              // 返回数组，包含验证信息和用户信息
        [                  // 第一个元素是验证信息数组
            "eyJhbGciOiJIUzI1NiIs...", // token字符串
            "2024-01-01T12:00:00Z"     // validTime ISO格式时间字符串
        ],
        {                  // 第二个元素是用户信息对象
            "uid": "1001", // 用户ID
            "name": "张三", // 用户名
            "head": "avatar.jpg", // 头像
            "powerDegree": 2 // 权限等级
        }
    ]
}
```

## 2. 注册接口

### 接口信息
- **路径**: `/register`
- **方法**: `POST`
- **数据格式**: `application/x-www-form-urlencoded`

### 请求参数
| 字段             | 类型    | 必填 | 说明                      |
|------------------|---------|------|---------------------------|
| username         | string  | 是   | 用户名                    |
| password         | string  | 是   | 密码                      |
| competitionType  | number  | 是   | 比赛类型：1校运会，2市运会  |
| userType         | number  | 是   | 用户身份：1普通用户，2管理员，3裁判 |
| inviteCode       | string  | 否   | 邀请码                    |
| joinOrganization | boolean | 是   | 是否加入组织              |

### 身份说明
1. 普通用户 (userType=1)
   - 校运会模式：学生身份
   - 市运会模式：教职工身份
   - powerDegree值：1

2. 管理员 (userType=2)  
   - 校运会模式：班级负责人
   - 市运会模式：学校负责人
   - powerDegree值：2

3. 裁判 (userType=3)
   - 校运会/市运会模式：裁判身份
   - powerDegree值：3

### 组织邀请码规则
1. 当 `joinOrganization` 为 true 时，`inviteCode` 必填
2. 当 `competitionType` 为 1 时，邀请码为班级邀请码
3. 当 `competitionType` 为 2 时，邀请码为学校邀请码

### 响应格式
```json
{
    "code": 1,              // 状态码：1成功，0失败
    "message": "注册成功",   // 响应消息
    "verify": [            // 注册成功时返回验证信息
        "token字符串",
        "2024-01-01T12:00:00Z"  // ISO格式的validTime
    ],
    "myInfo": {            // 用户基本信息
        "uid": "1001",     // 用户ID
        "name": "张三",     // 用户名
        "head": "avatar.jpg", // 头像
        "powerDegree": 2   // 权限等级
    }
}
```

### 响应头
| 字段       | 说明                    | 示例值                              |
|------------|------------------------|-----------------------------------|
| token      | 用户令牌                | "eyJhbGciOiJIUzI1NiIs..."         |
| valid-time | token有效期截止时间(时间戳) | "1683792000000"                   |

## 3. 错误码说明

| 错误码 | 说明                     |
|--------|------------------------|
| -1     | 系统错误                 |
| 0      | 操作失败                 |
| 1      | 操作成功                 |
| 1001   | 用户名已存在             |
| 1002   | 密码格式错误             |
| 1003   | 邀请码无效              |
| 1004   | 邀请码已过期             |
| 2001   | 用户名或密码错误          |
| 2002   | 账号已被禁用             |
| 3001   | token已过期             |
| 3002   | token无效              |
