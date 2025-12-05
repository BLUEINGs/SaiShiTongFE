# 审查中心API


## 获取比赛列表

### 请求
- 路径: `/getCheckers`
- 方法: `GET`
- 参数: 无

### 响应

{
  "code": "1",
  "data": {
    "venue": "proident in eu",
    "list": [],
    "checkEndTime": "2025-07-30T13:45:36.656+0800",
    "checkBeginTime": "2025-07-30T14:05:36.656+0800",
    "venue":"操场",
    "list":{
        "gid":"1",
        "name":"第一组",
        "list":{
            "pid":"运动员ID",
            "name":"运动员姓名",
            "pClass":"1班",
            "checkState":"0",
            "track":"0"
        }
    }
  },
  "message": "ok",
  
}

## 提交审查

### 请求
- 路径: `/submitCheck`
- 方法: `PUT`

- 参数:
  - gid: number // 分组ID
  - pid: number // 运动员ID
  - checkState: number // 检录状态

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}

## 更新比赛赛道

### 请求
- 路径: `/updateTrack`
- 方法: `PUT`

- 参数:
  - gid: number // 分组ID
  - pid: number // 运动员ID
  - track: number // 赛道号

### 响应
```javascript
{
    code: number,    // 1表示成功，0表示失败
    message: string  // 响应消息
}
```
