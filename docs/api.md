# 运动会编排系统 API 文档

## 学校管理接口

### 获取学校列表
GET /getSchools

返回所有学校的基本信息。

**响应数据结构：**
```json
{
    "code": 1,
    "data": [
        {
            "scId": 1,
            "name": "第一中学",
            "slogan": "校训...",
            "img": "http://..."
        }
    ]
}
```

### 获取学校详情
GET /getSchoolDetail?scId=1

获取指定学校的详细信息，包括运动员和得分情况。

**响应数据结构：**
```json
{
    "code": 1,
    "data": {
        "players": [
            {
                "pid": 1,
                "name": "张三",
                "pClass": "高三(1)班",
                "gender": true,
                "head": "http://...",
                "sports": [1, 2, 3]
            }
        ],
        "totalDegree": 150,
        "maleDegree": 80,
        "femaleDegree": 70,
        "maleDegreeDetails": [
            {
                "eventName": "100米短跑",
                "athleteName": "张三",
                "score": "10.5秒",
                "degree": 10
            }
        ],
        "femaleDegreeDetails": [
            {
                "eventName": "跳高",
                "athleteName": "李四",
                "score": "1.65米",
                "degree": 8
            }
        ]
    }
}
```

## 更多接口...
// ...existing endpoints documentation...
