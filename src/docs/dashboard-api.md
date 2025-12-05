# 主页仪表盘 API 文档

## 1. 获取赛程概览

### 请求信息
- 接口路径：`/dashboard/schedule`
- 请求方法：GET
- 请求参数：无

### 响应格式
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "ongoing": [
      {
        "spId": 1,
        "name": "男子100米预赛",
        "venue": "主操场",
        "startTime": "2024-01-20T14:30:00",
        "endTime": "2024-01-20T15:30:00"
      }
    ],
    "upcoming": [
      {
        "spId": 2,
        "name": "女子跳高决赛",
        "venue": "体育馆",
        "startTime": "2024-01-20T16:00:00",
        "endTime": "2024-01-20T17:30:00"
      }
    ]
  }
}
```

## 2. 获取个人成绩

### 请求信息
- 接口路径：`/dashboard/myScores`
- 请求方法：GET
- 请求参数：无

### 响应格式
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "totalScore": 25,
    "meetingRank": 3,
    "teamRank": 2,
    "recentScores": [
      {
        "spId": 1,
        "name": "男子100米预赛",
        "score": 10,
        "rank": 1
      }
    ]
  }
}
```

## 3. 获取团体成绩

### 请求信息
- 接口路径：`/dashboard/teamScore`
- 请求方法：GET
- 请求参数：无

### 响应格式
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "teamName": "计算机学院",
    "score": 120,
    "rank": 1,
    "trend": [
      {
        "date": "01-15",
        "score": 45
      },
      {
        "date": "01-16",
        "score": 78
      },
      {
        "date": "01-17",
        "score": 120
      }
    ]
  }
}
```
