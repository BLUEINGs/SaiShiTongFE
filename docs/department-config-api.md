# 团体管理配置接口文档

## 获取配置信息

### 请求信息
- 接口：`/getDepartmentConfig`
- 方法：GET
- 权限：需要管理员权限

### 响应信息
```json
{
    "code": 1,
    "message": "SUCCESS",
    "data": {
        "maxPlayers": 7,
        "maxEvents": 3,
        "levelConfig": "[{\"field\":\"学院\",\"isNumeric\":false,\"valueRange\":[[\"信息学院\",\"A1\"],[\"机械学院\",\"A2\"],[\"电气学院\",\"A3\"]]},{\"field\":\"班级\",\"isNumeric\":true,\"valueRange\":[[\"digits\",2]]}]"
    }
}
```

## 更新配置信息

### 请求信息
- 接口：`/updateDepartmentConfig`
- 方法：POST
- 权限：需要管理员权限

### 请求参数
```json
{
    "maxPlayers": 7,
    "maxEvents": 3,
    "levelConfig": "[{\"field\":\"学院\",\"isNumeric\":false,\"valueRange\":[[\"信息学院\",\"A1\"],[\"机械学院\",\"A2\"],[\"电气学院\",\"A3\"]]},{\"field\":\"班级\",\"isNumeric\":true,\"valueRange\":[[\"digits\",2]]}]"
}
```

### 响应信息
```json
{
    "code": 1,
    "message": "SUCCESS"
}
```

## 数据结构说明

### levelConfig
- JSON字符串格式，解析后为数组
- 每个级别对象包含：
  - field: 级别名称
  - isNumeric: 是否为数字类型
  - valueRange: 值范围
    - 数字类型：[["digits", 位数]]
    - 文本类型：[[显示值, 实际值], ...]
