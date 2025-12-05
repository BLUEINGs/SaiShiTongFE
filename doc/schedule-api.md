# 赛程管理接口文档

## 获取赛程列表

获取所有赛程信息。

### 请求

- 路径: `/getSchedules`
- 方法: `GET`
- 类型: `application/x-www-form-urlencoded`
- 参数: 无

### 响应

```javascript
{
  code: number,      // 1表示成功，0表示失败
  message: string,   // 响应消息
  data: Schedule[]   // 赛程数据数组
}

// Schedule对象结构
{
  spId: number,         // 赛程ID
  name: string,         // 比赛项目名称
  eventType: string,    // 比赛类型：'track'(田赛)/'field'(径赛)
  compType: number,     // 比赛阶段：1(预赛)/2(半决赛)/3(决赛)
  gameStartTime: string, // 开始时间，ISO格式，带时区如："2025-03-10T09:00:00+08:00"
  gameEndTime: string,   // 结束时间，ISO格式，带时区
  venue: string         // 比赛场地
}
```

## 更新赛程

更新单个赛程信息。

### 请求

- 路径: `/updateSchedule`
- 方法: `POST`
- 类型: `application/x-www-form-urlencoded`
- 参数:
  - spId: string    // 赛程ID
  - startTime: string    // ISO格式的开始时间
  - endTime: string     // ISO格式的结束时间
  - venue: string      // 比赛场地

### 响应

```javascript
{
  code: number,  // 1表示成功，0表示失败
  msg: string    // 响应消息
}
```
