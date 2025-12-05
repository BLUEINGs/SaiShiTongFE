<template>
    <div class="sports-overview">
        <el-card>
            <div slot="header">
                <h3>项目概况</h3>
                <div class="statistics">
                    <el-tag type="info">共{{ sports.length }}个项目</el-tag>
                </div>
            </div>
            <el-table :data="sports" style="width: 100%">
                <el-table-column prop="name" label="项目名称">
                    <template slot-scope="scope">
                        {{ getGenderPrefix(scope.row.gender) + scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column prop="compType" label="赛段">
                    <template slot-scope="scope">
                        <el-tag :type="getPhaseType(scope.row.compType)">
                            {{ getPhaseText(scope.row.compType) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'SportsOverview',
    props: {
        sports: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        getGenderPrefix(gender) {
            if (gender === true) return '男子';
            if (gender === false) return '女子';
            return '';
        },
        getPhaseText(compType) {
            switch (compType) {
                case 1: return '预赛';
                case 2: return '半决赛';
                case 3: return '决赛';
                default: return '未知赛段';
            }
        },
        getPhaseType(compType) {
            switch (compType) {
                case 1: return 'info';
                case 2: return 'warning';
                case 3: return 'success';
                default: return '';
            }
        },
        getStatusType(status) {
            switch (status) {
                case 0: return 'info';
                case 1: return 'warning';
                case 2: return 'success';
                case 3: return 'warning';
                case 4: return '';
                default: return 'info';
            }
        },
        getStatusText(status) {
            switch (status) {
                case 0: return '未开始';
                case 1: return '报名中';
                case 2: return '进行中';
                case 3: return '已评分';
                case 4: return '已晋级/决胜负';
                default: return '未知状态';
            }
        }
    }
}
</script>

<style lang="less" scoped>
.sports-overview {
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
}
</style>
