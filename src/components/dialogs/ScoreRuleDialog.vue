<template>
    <responsive-dialog :visible="visible" :title="title" width="800px" @close="handleCancel" @confirm="handleSave">
        <div class="rule-form">
            <el-form :model="ruleForm" ref="ruleForm" label-width="100px">
                <el-form-item label="规则名称">
                    <el-input v-model="ruleForm.name" placeholder="请输入规则名称"></el-input>
                </el-form-item>

                <!-- 动态单位设置 -->
                <el-form-item label="单位">
                    <div class="units-row">
                        <div class="unit-item" v-for="(unit, index) in ruleForm.units" :key="index">
                            <unit-select v-model="ruleForm.units[index]" :options="commonUnits" placeholder="选择单位"
                                :show-delete="index > 0" @input="checkUnitDuplicates" @delete="removeUnit(index)" />
                            <span v-if="index < ruleForm.units.length - 1" class="unit-separator">:</span>
                        </div>
                        <button type="button" class="unit-item add-unit-btn" v-if="ruleForm.units.length < 5"
                            @click="addUnit">
                            <i class="el-icon-plus"></i>
                            <span>添加单位</span>
                        </button>
                    </div>
                    <div class="error-message" v-if="unitError">{{ unitError }}</div>
                </el-form-item>

                <!-- 分数映射表 -->
                <div class="mappings-section">
                    <div class="section-header">
                        <h3>分数映射</h3>
                        <el-button type="primary" size="small" @click="addMapping">添加映射</el-button>
                    </div>
                    <el-table :data="mappingsList" border style="width: 100%" class="mapping-table">
                        <el-table-column>
                            <template slot="header">
                                <div class="header-with-checkbox">
                                    <span>成绩/排名</span>
                                    <label class="custom-checkbox">
                                        <input type="checkbox" :checked="isRankMode" @change="toggleRankMode">
                                        <span class="box-outer">
                                            <span class="box-inner">✓</span>
                                        </span>
                                        <span class="label">根据排名赋分</span>
                                    </label>
                                </div>
                            </template>
                            <template slot-scope="scope">
                                <div class="score-cell">
                                    <template v-if="isRankMode">
                                        <multi-unit-input v-model="scope.row.scoreValues" :units="['名']"
                                            @enter="validateMapping(scope.$index)"
                                            @tab-last="validateMapping(scope.$index)" @error="handleMappingError" />
                                    </template>
                                    <template v-else>
                                        <multi-unit-input v-model="scope.row.scoreValues" :units="ruleForm.units"
                                            @enter="validateMapping(scope.$index)"
                                            @tab-last="validateMapping(scope.$index)" @error="handleMappingError" />
                                    </template>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="分数" width="120">
                            <template slot-scope="scope">
                                <el-input v-model.number="scope.row.points" class="points-input" type="number"
                                    @change="validateMapping(scope.$index)">
                                </el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" align="center">
                            <template slot-scope="scope">
                                <el-button type="danger" icon="el-icon-delete" circle size="mini"
                                    @click="removeMapping(scope.$index)">
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-form>
        </div>
    </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '../ResponsiveDialog.vue'
import MultiUnitInput from '../MultiUnitInput.vue'
import UnitSelect from '../UnitSelect.vue'
import request from '@/utils/request'

export default {
    name: 'ScoreRuleDialog',
    components: {
        ResponsiveDialog,
        MultiUnitInput,
        UnitSelect
    },
    props: {
        visible: Boolean,
        editData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            title: '评分规则',
            ruleForm: {
                name: '',
                units: [''],
                mappings: new Map()
            },
            mappingsList: [],
            rules: {}, // 清空验证规则
            commonUnits: ['米', '分', '秒', '毫秒'],
            unitError: '',
            hasError: false,
            isRankMode: false,
            validationError: ''
        }
    },
    watch: {
        visible(val) {
            if (val) {
                if (!this.editData?.rid) {
                    // 重置表单
                    this.ruleForm = {
                        name: '',
                        units: [''],
                        mappings: new Map()
                    }
                    this.mappingsList = []
                    this.hasError = false
                    this.unitError = ''
                } else {
                    this.initEditData()
                }
            }
        },
        'ruleForm.units': {
            deep: true,
            handler() {
                this.updateUnitsDisplay()
            }
        }
    },
    methods: {
        initEditData() {
            if (!this.editData || !this.editData.rid) return

            this.ruleForm = {
                name: this.editData.name,
                units: [...this.editData.units]
            }
            this.isRankMode = this.editData.isRankMode

            // 处理映射列表
            this.mappingsList = []
            if (this.editData.mappings instanceof Map) {
                // 如果是Map对象
                this.editData.mappings.forEach((points, score) => {
                    this.mappingsList.push({
                        scoreValues: score.split(':'),
                        points: Number(points)
                    })
                })
            } else {
                // 如果是普通对象或字符串
                let mappings = {}
                if (typeof this.editData.mappings === 'string') {
                    mappings = JSON.parse(this.editData.mappings)
                } else {
                    mappings = this.editData.mappings
                }

                Object.entries(mappings).forEach(([score, points]) => {
                    this.mappingsList.push({
                        scoreValues: score.split(':'),
                        points: Number(points)
                    })
                })
            }
        },
        addMapping() {
            this.mappingsList.push({
                scoreValues: Array(this.ruleForm.units.length).fill(''),
                points: null,
                rank: null
            })
        },
        removeMapping(index) {
            this.mappingsList.splice(index, 1)
        },
        validateMapping() {
            return true
        },
        async handleSave() {
            try {
                // 直接构建映射数据，不做验证
                const mappings = {}
                this.mappingsList.forEach(({ scoreValues, points }) => {
                    if (points !== null && points !== undefined) {
                        if (this.isRankMode) {
                            const rankValue = scoreValues[0]
                            if (rankValue && rankValue.trim() !== '') {
                                mappings[rankValue] = points
                            }
                        } else {
                            if (scoreValues.every(v => v !== null && v !== undefined && v !== '')) {
                                mappings[scoreValues.join(':')] = points
                            }
                        }
                    }
                })

                const params = new URLSearchParams()
                params.append('name', this.ruleForm.name)
                params.append('units', `[${this.ruleForm.units.join(',')}]`)
                params.append('mappings', JSON.stringify(mappings))
                params.append('isRankMode', this.isRankMode ? '1' : '0')

                if (this.editData?.rid) {
                    params.append('rid', this.editData.rid)
                }

                const res = await request({
                    url: '/saveJudgeRule',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                })

                if (res.code === 1) {
                    this.$message.success('保存成功')
                    this.$emit('save')
                    this.handleCancel()
                }
            } catch (error) {
                console.error('保存失败:', error)
                this.$message.error('保存失败')
            }
        },
        handleCancel() {
            this.$refs.ruleForm.resetFields()
            this.mappingsList = []
            this.$emit('update:visible', false)
        },
        addUnit() {
            if (this.ruleForm.units.length < 5) {
                this.ruleForm.units.push('')
            }
        },
        removeUnit(index) {
            this.ruleForm.units.splice(index, 1)
            this.checkUnitDuplicates()
        },
        checkUnitDuplicates() {
            const units = this.ruleForm.units
            const duplicates = units.filter((unit, index) =>
                unit && units.indexOf(unit) !== index
            )

            if (duplicates.length > 0) {
                this.unitError = `单位"${duplicates[0]}"重复使用`
                this.hasError = true
            } else {
                this.unitError = ''
                this.hasError = false
            }
        },
        handleMappingError() {
            // 删除错误处理
        },
        updateUnitsDisplay() {
            this.$nextTick(() => {
                const inputs = document.querySelectorAll('.el-select__input')
                inputs.forEach(input => {
                    input.addEventListener('input', function () {
                        this.select()
                    })
                })
            })
        },
        handleRankChange(value, index) {
            this.mappingsList[index].scoreValues = [`${value}`]
            this.validateMapping(index)
        },
        toggleRankMode(checked) {
            this.isRankMode = checked.target?.checked ?? checked

            // 处理现有的映射数据 - 修改保存逻辑
            this.mappingsList = this.mappingsList.map(mapping => ({
                ...mapping,
                scoreValues: this.isRankMode ?
                    // 排名模式：保留第一个值，如果没有则置空
                    [mapping.scoreValues[0] || ''] :
                    // 成绩模式：恢复为完整单位数组
                    (mapping._originalValues || Array(this.ruleForm.units.length).fill(''))
            }))

            this.validationError = ''
            this.$forceUpdate()
        },
        handleRankModeChange() {
            this.mappingsList.forEach(mapping => {
                mapping.rank = null
                mapping.scoreValues = Array(this.ruleForm.units.length).fill('')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.rule-form {
    .mappings-section {
        margin-top: 20px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            h3 {
                margin: 0;
            }
        }

        .mapping-table {
            margin-bottom: 24px; // 增加底部间距以显示错误提示

            :deep(.points-input) {
                .el-input__inner {
                    text-align: center;
                    height: 32px;
                    padding: 0 8px;
                    font-size: 14px;
                }
            }

            :deep(.el-table) {

                th,
                td {
                    padding: 8px;
                }

                .el-table__header {
                    th {
                        background-color: #f5f7fa;
                        color: #606266;
                    }
                }
            }
        }
    }

    .has-error {
        .el-select {
            .el-input__inner {
                border-color: #F56C6C;
            }
        }
    }

    .error-message {
        color: #F56C6C;
        font-size: 12px;
        line-height: 1;
        margin-top: 4px;
    }

    nts-input {
        :deep(.el-input__inner) {
            text-align: center;
            height: 32px;
            line-height: 32px;
        }
    }

    .units-display {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .units-row {
        display: flex;
        align-items: center; // 改为center对齐
        flex-wrap: wrap;
        gap: 4px;
        min-height: 40px;

        .unit-item {
            display: flex;
            align-items: center;

            .unit-separator {
                padding: 0 2px;
                color: #606266;
                font-weight: bold;
            }
        }

        .add-unit-btn {
            width: 90px; // 与UnitSelect组件同宽
            height: 28px; // 与输入框同高
            padding: 0 8px;
            border: 1px dashed #DCDFE6;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #409EFF;
            transition: all 0.3s;
            gap: 4px;
            margin: 0; // 移除margin

            &:hover {
                border-color: #409EFF;
                background: rgba(64, 158, 255, 0.1);
            }

            i {
                font-size: 12px;
            }

            span {
                font-size: 12px;
            }
        }
    }

    // 修改 UnitSelect 组件在当前场景下的样式
    :deep(.unit-select) {
        width: 90px; // 稍微窄一点

        .input-wrapper input {
            padding-right: 24px; // 为删除图标留出空间
        }
    }

    :deep(.el-input-number) {
        .el-input__wrapper {
            padding: 0;
        }

        .el-input__inner {
            text-align: center;
            padding: 0 30px; // 为增减按钮留出空间
            width: 120px; // 设置合适的宽度
        }

        // 确保增减按钮的位置正确
        .el-input-number__decrease {
            left: 0;
        }

        .el-input-number__increase {
            right: 0;
        }
    }
}

.header-with-checkbox {
    display: flex;
    align-items: center;
    gap: 12px;

    .custom-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;

        input {
            display: none;
        }

        .box-outer {
            width: 16px;
            height: 16px;
            border: 1px solid #DCDFE6;
            background: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;
        }

        .box-inner {
            color: transparent;
            font-size: 12px;
            transition: color 0.2s;
        }

        input:checked+.box-outer {
            background: #409EFF;
            border-color: #409EFF;

            .box-inner {
                color: white;
            }
        }

        .label {
            color: #606266;
        }
    }

    .custom-checkbox input:checked+.box {
        background-color: #409EFF;
        border-color: #409EFF;
    }
}

.score-cell {
    position: relative;
    padding-bottom: 24px; // 为错误提示留出空间

    .error-tip {
        position: absolute;
        left: 0;
        bottom: 4px;
        font-size: 12px;
        color: #F56C6C;
        line-height: 1.2;
    }
}

// 删除不需要的样式...

.rank-input {
    width: 100px !important;

    :deep(.el-input__inner) {
        text-align: center;
        height: 32px;
    }
}

/* 移除重复的分隔符相关样式 */
.el-select {
    width: 120px;
    margin-right: 8px;

    /* 删除这个样式，它会导致重复的分隔符 */
    &:not(:last-child)::after {
        content: none;
    }
}

// 单位输入框样式
:deep(.el-select__input) {
    &:focus {
        user-select: all;
    }
}

// 数字输入框样式
:deep(.el-input-number) {
    .el-input__inner {
        text-align: center;
        padding-right: 8px;
    }
}

// 单位显示样式
.units-display {
    display: flex;
    align-items: center;
    gap: 4px;

    .unit-item {
        display: flex;
        align-items: center;

        &:not(:last-child)::after {
            content: ':';
            margin: 0 4px;
            color: #606266;
        }
    }
}

.validation-error {
    margin-top: 16px;
    padding: 8px 12px;
    background-color: #fef0f0;
    border-radius: 4px;
    color: #f56c6c;
    line-height: 1.4;
    font-size: 14px;
}

.score-cell {
    position: relative;
    padding: 8px 0;
}
</style>
