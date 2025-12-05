<template>
    <div class="department-overview">
        <el-card>
            <div slot="header">
                <h3>参赛学校概况</h3>
                <div class="statistics">
                    <el-tag type="info">共{{ schools.length }}个学校</el-tag>
                </div>
            </div>
            <div class="schools-list">
                <el-row :gutter="20">
                    <el-col v-for="school in schools" :key="school.scId" :span="8">
                        <el-card shadow="hover" class="school-card">
                            <img :src="school.img" class="school-image" :alt="school.name">
                            <h4>{{ school.name }}</h4>
                            <div class="school-slogan">{{ school.slogan }}</div>
                            <p class="meta">
                                <span>{{ (school.players || []).length }}名运动员</span>
                            </p>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'DepartmentOverview',
    props: {
        schools: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style lang="less" scoped>
.department-overview {
    .el-card {
        margin-bottom: 20px;
    }

    ::v-deep .el-card__header {
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 16px;
        }
    }

    .school-card {
        margin-bottom: 20px;

        .school-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }

        .school-slogan {
            color: #606266;
            font-size: 12px;
            margin-bottom: 10px;
            font-style: italic;
        }

        .meta {
            display: flex;
            justify-content: center;
            color: #909399;
            font-size: 12px;
            margin: 0;
        }
    }
}
</style>
