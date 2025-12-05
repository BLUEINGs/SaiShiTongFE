# 运动会API文档

## 获取运动会模板列表

**请求URL：** `/meetingTemplates`

**请求方式：** GET

**响应示例：**

```json
{
    "code": 1,
    "message": "success",
    "data": [
        {
            "smId": 3,
            "name": "市/县运动会",
            "cover": null,
            "sportCount": null,
            "numberConfig": "[{\"field\":\"学校级别\",\"isNumeric\":false,\"valueRange\":[[\"高中\",\"4\"],[\"初中\",\"3\"],[\"农村小学\",\"2\"],[\"县直小学\",\"1\"]]}]",
            "schoolCount": null,
            "playerCount": null,
            "status": null,
            "img": "http://example.com/img.jpg",
            "startTime": null,
            "endTime": null,
            "amStartTime": "07:30:00",
            "amEndTime": "13:15:00",
            "pmStartTime": "12:00:00",
            "pmEndTime": "18:00:00",
            "registrationDeadline": null
        }
    ]
}
```

## 创建运动会

**请求URL：** `/createMeeting`

**请求方式：** POST

**请求类型：** multipart/form-data

**请求参数：**

| 参数名 | 类型 | 必选 | 说明 |
|-------|------|-----|------|
| templateId | number | 是 | 选择的模板ID |
| name | string | 是 | 运动会名称 |
| cover | file | 否 | 运动会封面图片 |
| startTime | string | 是 | 开始时间(ISO格式) |
| endTime | string | 是 | 结束时间(ISO格式) |
| amStartTime | string | 是 | 上午开始时间(HH:mm:ss) |
| amEndTime | string | 是 | 上午结束时间(HH:mm:ss) |
| pmStartTime | string | 是 | 下午开始时间(HH:mm:ss) |
| pmEndTime | string | 是 | 下午结束时间(HH:mm:ss) |
| registrationDeadline | string | 是 | 报名截止时间(ISO格式) |
| levelConfig | array | 是 | 团体级别配置 |
| maxPlayers | number | 是 | 团体运动员数量上限 |
| maxEvents | number | 是 | 运动员报名项目上限 |

**levelConfig 格式：**
```json
[{
    "field": "学校级别",
    "isNumeric": false,
    "valueRange": [["高中","4"],["初中","3"]]
}]
```

**响应示例：**

```json
{
    "code": 1,
    "message": "success",
    "data": {
        "id": "12345",
        "name": "2024校运会"
    }
}
```

## 删除运动会

**请求URL：** `/deleteMeeting`

**请求方式：** DELETE

**响应示例：**

```json
{
    "code": 1,
    "message": "success"
}
```

**说明：**
- 删除运动会会同时删除所有相关的职员、比赛项目、比赛规则和团体信息
- 该操作不可逆
- 需要运动会操办者权限
