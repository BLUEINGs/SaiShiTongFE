# 裁判评分接口文档

## 获取比赛列表

### 请求
- 路径: `/getJudgements`
- 方法: `GET`
- 参数: 无

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 比赛数组
        {
            spId: number,           // 比赛ID
            name: string,           // 比赛名称
            status: string,         // 比赛状态：pending/ongoing/finished
            gameStartTime: string,  // 比赛开始时间(修改)
            venue: string,          // 比赛场地
            ruleId: number         // 评分规则ID
        }
    ]
}
```

## 获取比赛分组详情

### 请求
- 路径: `/getJudgementGroups`
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
            players: [        // 运动员数组
                {
                    pid: number,    // 运动员ID
                    name: string,   // 姓名
                    number: string, // 编号
                    pClass: string, // 班级
                    head: string,   // 头像
                    score: string,  // 成绩
                    degree: number  // 分数
                }
            ]
        }
    ]
}
```

## 获取评分规则列表

### 请求
- 路径: `/getJudgeRules`
- 方法: `GET`

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 规则数组
        {
            rid: number,      // 规则ID
            name: string,     // 规则名称
            units: string[],  // 单位数组
            mappings: Map<string, number>  // 分数映射表
        }
    ]
}
```

## 保存评分规则

### 请求
- 路径: `/saveJudgeRule`
- 方法: `POST`
- Content-Type: `application/x-www-form-urlencoded`
- 参数:
```javascript
{
    rid?: number,      // 规则ID，新建时不需要
    name: string,      // 规则名称
    units: string,     // 单位数组字符串，格式为"[分,秒]" (不带引号)
    mappings: string,  // 映射JSON字符串
    isRankMode: '0'|'1' // 是否为排名评分模式，0否1是
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: number     // 返回规则ID(rid)
}
```

## 删除评分规则

### 请求
- 路径: `/deleteJudgeRule`
- 方法: `POST`
- 参数: 
  - rid: number // 规则ID

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```

## 提交评分

### 请求
- 路径: `/submitScore`
- 方法: `POST`
- 参数:
```javascript
{
    spId: number,    // 比赛ID
    pid: number,     // 运动员ID
    score: {         // 成绩Map
        [unit: string]: string  // 单位: 成绩值
    },
    degree: number   // 分数
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```

## 更新比赛评分规则

### 请求
- 路径: `/updateCompetitionRule`
- 方法: `POST`
- 参数:
```javascript
{
    spId: number,    // 比赛ID
    rid: number     // 规则ID
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```
