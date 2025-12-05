# 审查员相关接口

## 获取可分配审查员列表
获取当前可以分配为审查员的用户列表。

- 请求方法: `GET`
- 请求路径: `/getAvailableCheckers`

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

## 分配审查员
将选中的用户分配为指定比赛的审查员。

- 请求方法: `POST`
- 请求路径: `/assignCheckers`
- Content-Type: `application/x-www-form-urlencoded`
- 请求参数:
  - `spId`: 比赛ID
  - `checkerUid`: 审查员用户ID (多个checkerUid表示多个审查员)
- 响应格式:
```json
{
    "code": 1,
    "message": "分配成功"
}
```