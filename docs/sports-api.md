 # 运动项目管理接口文档

## 获取赛组及比赛列表

### 请求
- 路径: `/getSports`
- 方法: `GET`

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 赛组数组
        {
            id: number,          // 赛组ID
            name: string,        // 赛组名称
            compSystem: number,  // 赛制类型：1(决赛制)/2(预决赛制)/3(预半决赛制)
            eventType: number,   // 比赛类型：1(径赛)/2(田赛)
            subEventType: number,// 子类型：径赛(1个人跑,2接力跑)/田赛(1跳远,2三级跳远,3铅球,4跳高)
            size: string,        // 规格：个人跑("100")/接力跑("4*100")
            appStartTime: string,// 报名开始时间，ISO格式
            appEndTime: string,  // 报名结束时间，ISO格式
            sports: [            // 比赛阶段数组
                {
                    spId: number,        // 比赛ID
                    mainSpId: number,    // 主赛事ID
                    name: string,        // 比赛名称
                    eventType: number,   // 比赛类型
                    subEventType: number,// 子类型
                    size: string,        // 规格
                    compType: number,    // 比赛阶段：1(预赛)/2(半决赛)/3(决赛)
                    compSystem: number,  // 赛制类型
                    playerCount: number, // 运动员数量
                    countPgp: number,    // 每组人数，不分组时为null
                    appStartTime: string,// 报名开始时间
                    appEndTime: string,  // 报名结束时间
                    gameStartTime: string,// 比赛开始时间
                    gameEndTime: string, // 比赛结束时间
                    venue: string,       // 比赛场地
                    status: number,      // 比赛状态：0(未开始)/1(进行中)/2(已结束)
                    riseType: boolean,   // 晋级方式：true(固定名额)/false(动态分组)
                    riseCount: number,   // 晋级名额数量
                    smId: number         // 管理ID
                }
            ]
        }
    ]
}
```

## 获取比赛分组详情

### 请求
- 路径: `/getMatchGroups`
- 方法: `GET` 
- 参数:
  - spId: number // 比赛ID

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 分组数组
        {
            gid: number,      // 分组ID
            name: string,     // 分组名称
            spId: number,     // 比赛ID
            smId: number,     // 管理ID
            players: [        // 运动员数组
                {
                    pid: number,    // 运动员ID
                    name: string,   // 运动员姓名
                    number: string, // 运动员号码
                    pclass: string, // 班级
                    scId: number,   // 学院ID
                    age: number,    // 年龄
                    gender: number  // 性别
                }
            ]
        }
    ]
}
```

## 新增运动项目

### 请求
- 路径: `/addSport` 
- 方法: `POST`
- 类型: `application/json`
- 参数:
```javascript
{
    name: string,         // 赛组名称
    compSystem: number,   // 赛制类型：1/2/3
    eventType: number,    // 比赛类型：1(径赛)/2(田赛)
    subEventType: number, // 子类型：径赛(1个人跑,2接力跑)/田赛(1跳远,2三级跳远,3铅球,4跳高)
    size: string,         // 规格：个人跑("100")/接力跑("4*100")
    appStartTime: string, // 报名开始时间(ISO格式)
    appEndTime: string,  // 报名结束时间(ISO格式)
    sports: [            // 比赛阶段配置
        {
            compType: number,  // 比赛阶段：1(预赛)/2(半决赛)/3(决赛)
            countPgp: number,  // 每组人数，不分组时为null
            venue: string,     // 比赛场地
            riseType: boolean, // 晋级方式：true(固定名额)/false(动态分组)
            riseCount: number  // 晋级名额数量
        }
    ]
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: {         // 新建的赛组信息
        id: number  // 赛组ID
    }
}
```

## 修改运动项目

### 请求
- 路径: `/modifySport`
- 方法: `POST` 
- 类型: `application/json`
- 参数: 同新增运动项目，但sports数组中需要包含spId字段：
```javascript
{
    // ...新增运动项目的所有字段
    sports: [
        {
            spId: number,      // 比赛ID(修改时必须)
            compType: number,   // 比赛阶段：1/2/3
            countPgp: number,   // 每组人数，不分组时为null
            venue: string,      // 比赛场地
            riseType: boolean,  // 晋级方式：true(固定名额)/false(动态分组)
            riseCount: number   // 晋级名额数量
        }
    ]
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```

## 更新分组信息

### 请求
- 路径: `/updateGroups`
- 方法: `POST`
- 类型: `application/json`
- 参数:
```javascript
{
    spId: number,      // 比赛ID
    groups: [          // 分组信息
        {
            gid: number,     // 分组ID，新建分组时为空
            name: string,    // 分组名称
            players: [       // 运动员列表
                {
                    pid: number  // 运动员ID
                }
            ]
        }
    ]
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```

## 删除运动项目

### 请求
- 路径: `/deleteSport`
- 方法: `POST`
- 类型: `application/x-www-form-urlencoded`
- 参数: mainSpId: number // 赛组主ID

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```

## 随机分组

### 请求
- 路径: `/randomGroups`
- 方法: `GET`
- 参数: 
  - spId: number // 比赛ID

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 分组数组
        {
            gid: number,      // 分组ID
            name: string,     // 分组名称
            spId: number,     // 比赛ID
            smId: number,     // 管理ID
            players: [        // 运动员数组
                {
                    pid: number,    // 运动员ID
                    name: string,   // 运动员姓名
                    number: string, // 运动员号码
                    pclass: string, // 班级
                    scId: number,   // 学院ID
                    age: number,    // 年龄
                    gender: number  // 性别
                }
            ]
        }
    ]
}
```

## 更新分组信息

注意：新增的分组不需要传gid字段，后端会自动创建。

### 请求
- 路径: `/updateGroups`
- 方法: `POST`
- 类型: `application/json`
- 参数:
```javascript
{
    spId: number,      // 比赛ID
    groups: [          // 分组信息
        {
            gid: number,     // 分组ID，新建分组时为空
            name: string,    // 分组名称
            players: [       // 运动员列表
                {
                    pid: number  // 运动员ID
                }
            ]
        }
    ]
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```
