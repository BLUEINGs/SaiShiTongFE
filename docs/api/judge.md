# 裁判评分相关接口

## 获取可分配裁判列表
获取当前可以分配为裁判的用户列表。

- 请求方法: `GET`
- 请求路径: `/getAvailableJudges`
- 响应格式:
```json
{
    "code": 1,
    "data": [
        {
            "uid": 1001,
            "name": "张三",
            "head": "http://example.com/avatar.jpg" 
        }
    ]
}
```

## 分配裁判
将选中的用户分配为指定比赛的裁判。

- 请求方法: `POST`
- 请求路径: `/assignJudges`
- Content-Type: `application/x-www-form-urlencoded`
- 请求参数:
  - `spId`: 比赛ID
  - `judgeUid`: 裁判用户ID (多个judgeUid表示多个裁判)
- 响应格式:
```json
{
    "code": 1,
    "message": "分配成功"
}
```

## 获取比赛分组信息
获取比赛的分组信息,包含裁判组。

- 请求方法: `GET` 
- 请求路径: `/getJudgementGroups`
- 请求参数: `spId=xxx`
- 响应格式:
```json
{
    "code": 1,
    "data": [
        {
            "gid": 0,  // 0表示裁判组
            "name": "裁判组",
            "players": [
                {
                    "uid": 1001,
                    "name": "张三",
                    "head": "http://example.com/avatar.jpg"
                }
            ]
        },
        {
            "gid": 1,
            "name": "第一组",
            "players": []
        }
    ]
}
```
