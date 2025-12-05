<template>
    <div class="registration-record">
        <div class="filter-section">
            <el-card>
                <div class="filter-header">
                    <h3>筛选条件</h3>
                    <el-button type="text" @click="resetFilters">重置筛选</el-button>
                </div>
                <div class="filters">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12" :md="8" :lg="6">
                            <el-input v-model="filters.keyword" placeholder="搜索运动员姓名/学号" clearable
                                prefix-icon="el-icon-search" @input="handleFilter" />
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="8" :lg="6">
                            <el-select v-model="filters.event" placeholder="比赛项目" clearable @change="handleFilter">
                                <el-option-group v-for="group in eventGroups" :key="group.label" :label="group.label">
                                    <el-option v-for="item in group.options" :key="item.sp_id" :label="item.name"
                                        :value="item.sp_id" />
                                </el-option-group>
                            </el-select>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="8" :lg="6">
                            <el-select v-model="filters.phase" placeholder="比赛阶段" clearable @change="handleFilter">
                                <el-option label="预赛" value="preliminary" />
                                <el-option label="半决赛" value="semifinal" />
                                <el-option label="决赛" value="final" />
                            </el-select>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="8" :lg="6">
                            <el-select v-model="filters.hasScore" placeholder="成绩状态" clearable @change="handleFilter">
                                <el-option label="已有成绩" value="true" />
                                <el-option label="暂无成绩" value="false" />
                            </el-select>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </div>

        <div class="table-section">
            <el-card>
                <div class="table-header">
                    <div class="statistics">
                        <span>共 {{ filteredData.length }} 条记录</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>已录入成绩 {{ scoreCount }} 条</span>
                    </div>
                    <div class="actions">
                        <el-button type="primary" icon="el-icon-download" @click="exportToExcel">导出Excel</el-button>
                    </div>
                </div>

                <el-table :data="pagedData" stripe border style="width: 100%"
                    :default-sort="{ prop: 'timestamp', order: 'descending' }" v-loading="loading"
                    @sort-change="handleSortChange">
                    <el-table-column prop="timestamp" label="报名时间" width="180" sortable="custom"
                        :sort-orders="['ascending', 'descending']">
                        <template slot-scope="scope">
                            {{ formatTime(scope.row.timestamp) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="studentId" label="学号" width="120" />
                    <el-table-column prop="name" label="姓名" width="100" />
                    <el-table-column prop="school" label="学校" width="180" />
                    <el-table-column prop="eventName" label="比赛项目" min-width="150">
                        <template slot-scope="scope">
                            <el-tag :type="getEventTagType(scope.row.eventPhase)">
                                {{ scope.row.eventName }}（{{ getPhaseText(scope.row.eventPhase) }}）
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="score" label="成绩" width="120">
                        <template slot-scope="scope">
                            <template v-if="scope.row.score">
                                <span class="success-score">
                                    {{ formatScore(scope.row.score) }}
                                    <span class="point-text">({{ scope.row.point || '-' }}分)</span>
                                </span>
                            </template>
                            <el-tag v-else type="info" size="small">暂无成绩</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="rank" label="排名" width="100">
                        <template slot-scope="scope">
                            <template v-if="scope.row.rank">
                                <el-tag :type="getRankTagType(scope.row.rank)" size="medium">
                                    第{{ scope.row.rank }}名
                                </el-tag>
                            </template>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                        :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper" :total="filteredData.length">
                    </el-pagination>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
// 修改模拟数据
function generateMockData() {
    const events = [
        { sp_id: 'SP001', name: '100米短跑', type: 'track' },
        { sp_id: 'SP002', name: '200米短跑', type: 'track' },
        { sp_id: 'SP003', name: '400米短跑', type: 'track' },
        { sp_id: 'SP004', name: '跳高', type: 'field' },
        { sp_id: 'SP005', name: '跳远', type: 'field' },
        { sp_id: 'SP006', name: '铅球', type: 'field' }
    ];

    const schools = [
        '清华大学',
        '北京大学',
        '浙江大学',
        '复旦大学',
        '南京大学',
        '中国人民大学'
    ];
    const phases = ['preliminary', 'semifinal', 'final'];
    const records = [];

    // 生成200条模拟数据
    for (let i = 0; i < 200; i++) {
        const event = events[Math.floor(Math.random() * events.length)];
        const phase = phases[Math.floor(Math.random() * phases.length)];
        const hasScore = Math.random() > 0.3; // 70%的概率有成绩

        records.push({
            id: i + 1,
            timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // 随机7天内的时间
            studentId: `2024${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            name: `学生${i + 1}`,
            school: schools[Math.floor(Math.random() * schools.length)],
            eventName: event.name,
            eventType: event.type,
            sp_id: event.sp_id,  // 添加 sp_id
            eventPhase: phase,  // 添加这行，使用生成的 phase
            score: hasScore ? (event.type === 'track' ?
                (10 + Math.random() * 5).toFixed(2) : // 跑步项目（秒）
                (4 + Math.random() * 4).toFixed(2)    // 田赛项目（米）
            ) : null,
            point: hasScore ? (Math.floor(Math.random() * 30) + 70) : null, // 添加评分字段 70-100分
            rank: hasScore ? Math.floor(Math.random() * 20) + 1 : null
        });
    }

    return records;
}

export default {
    name: 'RegistrationRecord',
    data() {
        return {
            // ...existing code...
            records: generateMockData(),
            filters: {
                keyword: '',
                event: '',
                phase: '',
                hasScore: ''
            },
            currentPage: 1,
            pageSize: 20,
            loading: false,
            sortBy: { prop: 'timestamp', order: 'descending' }
        }
    },

    computed: {
        eventGroups() {
            const groups = {
                track: { label: '田赛项目', options: [] },
                field: { label: '径赛项目', options: [] }
            };

            // 使用 Set 和对象来确保唯一性
            const uniqueEvents = new Map(
                this.records.map(r => [r.sp_id, { sp_id: r.sp_id, name: r.eventName, type: r.eventType }])
            );

            uniqueEvents.forEach(event => {
                const option = {
                    sp_id: event.sp_id,
                    value: event.sp_id,
                    label: event.name,
                    name: event.name
                };

                if (event.type === 'track') {
                    groups.track.options.push(option);
                } else {
                    groups.field.options.push(option);
                }
            });

            return Object.values(groups);
        },

        filteredData() {
            return this.records.filter(record => {
                // 关键词搜索
                if (this.filters.keyword && !record.name.includes(this.filters.keyword) &&
                    !record.studentId.includes(this.filters.keyword)) {
                    return false;
                }

                // 比赛项目筛选
                if (this.filters.event && record.sp_id !== this.filters.event) {
                    return false;
                }

                // 比赛阶段筛选
                if (this.filters.phase && record.eventPhase !== this.filters.phase) {
                    return false;
                }

                // 成绩状态筛选
                if (this.filters.hasScore !== '') {
                    const hasScore = record.score !== null;
                    return hasScore === (this.filters.hasScore === 'true');
                }

                return true;
            }).sort((a, b) => {
                // 排序逻辑
                const { prop, order } = this.sortBy;
                if (order === 'ascending') {
                    return a[prop] > b[prop] ? 1 : -1;
                }
                return a[prop] < b[prop] ? 1 : -1;
            });
        },

        pagedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filteredData.slice(start, start + this.pageSize);
        },

        scoreCount() {
            return this.filteredData.filter(record => record.score !== null).length;
        }
    },

    methods: {
        handleFilter() {
            this.currentPage = 1;
        },

        resetFilters() {
            this.filters = {
                keyword: '',
                event: '',
                phase: '',
                hasScore: ''
            };
            this.handleFilter();
        },

        handleSortChange({ prop, order }) {
            // 如果用户尝试取消排序，强制使用默认排序（降序）
            if (!order) {
                this.sortBy = { prop: 'timestamp', order: 'descending' };
                return;
            }
            this.sortBy = { prop, order };
        },

        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
        },

        handleCurrentChange(val) {
            this.currentPage = val;
        },

        formatTime(timestamp) {
            return new Date(timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        formatScore(score) {
            return `${score}${score > 60 ? '秒' : '米'}`;
        },

        getEventTagType(phase) {
            const types = {
                preliminary: 'info',
                semifinal: 'warning',
                final: 'success'
            };
            return types[phase] || 'info';
        },

        getPhaseText(phase) {
            const texts = {
                preliminary: '预赛',
                semifinal: '半决赛',
                final: '决赛'
            };
            return texts[phase] || phase;
        },

        getRankTagType(rank) {
            if (rank <= 3) return 'success';
            if (rank <= 8) return 'warning';
            return 'info';
        },

        exportToExcel() {
            // 实际项目中需要实现导出逻辑
            this.$message.success('导出成功！');
        },
    }
}
</script>

<style lang="less" scoped>
.registration-record {
    padding: 20px;

    .filter-section,
    .table-section {
        margin-bottom: 20px;
    }

    .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            margin: 0;
            font-size: 16px;
            color: #303133;
        }
    }

    .filters {
        .el-select {
            width: 100%;
        }

        .el-col {
            margin-bottom: 16px;
        }
    }

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .statistics {
            color: #606266;
            font-size: 14px;
        }
    }

    .success-score {
        color: #67C23A;
        font-weight: bold;

        .point-text {
            color: #909399;
            font-weight: normal;
            font-size: 13px;
            margin-left: 4px;
        }
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }

    ::v-deep {
        .el-table {
            .el-tag {
                margin: 0 2px;
            }

            .cell {
                white-space: nowrap;
            }
        }

        .el-card {
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        }

        .el-card__body {
            padding: 20px;
        }
    }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .registration-record {
        padding: 10px;

        .table-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;

            .statistics {
                text-align: center;
            }

            .actions {
                display: flex;
                justify-content: center;
            }
        }

        ::v-deep {
            .el-table {
                .cell {
                    white-space: normal;
                }
            }
        }
    }
}
</style>
