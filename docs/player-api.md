# 运动员管理接口文档

## 获取运动员列表
### 请求
- 路径: `/getPlayers`
- 方法: `GET`
- 参数: 无

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 运动员数组
        {
            pid: number,     // 运动员ID 
            name: string,    // 姓名
            number: string,  // 运动员号码
            pclass: string,  // 班级
            scId: number,    // 学校/班级ID
            age: number,     // 年龄
            gender: boolean, // 性别：true(男)/false(女)
            head: string,    // 头像URL
            sports: string   // 已报名的运动项目，JSON字符串
        }
    ]
}
```

## 获取可参与比赛项目列表
### 请求
- 路径: `/getAvailableSports`
- 方法: `GET`
- 参数: 无

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: [         // 可参与的比赛项目数组
        {
            spId: number,    // 比赛ID
            name: string,    // 比赛名称
            gender: boolean, // 性别限制：true(男子项目)/false(女子项目)
            type: string    // 比赛类型：如"100米跑"、"跳远"等
        }
    ]
}
```

## 添加运动员
### 请求
- 路径: `/addPlayer`
- 方法: `POST`
- 类型: `multipart/form-data`
- 参数:
```javascript
{
    name: string,     // 姓名
    age: number,      // 年龄
    gender: boolean,  // 性别：true(男)/false(女)
    pClass: string,   // 班级
    scId: number,     // 所属学校/班级ID
    number: string,   // 运动员号码
    sports: string,   // JSON字符串，包含所报名的比赛ID数组
    headFile?: File   // 可选，头像文件
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string, // 响应消息
    data: number    // 新建的运动员ID
}
```

## 修改运动员信息
### 请求
- 路径: `/modifyPlayer`
- 方法: `POST`
- 类型: `multipart/form-data`
- 参数:
```javascript
{
    pid: number,      // 运动员ID
    name: string,     // 姓名
    age: number,      // 年龄
    gender: boolean,  // 性别：true(男)/false(女)
    pClass: string,   // 班级
    scId: number,     // 所属学校/班级ID
    number: string,   // 运动员号码
    sports: string,   // JSON字符串，包含所报名的比赛ID数组
    headFile?: File   // 可选，头像文件
}
```

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```
