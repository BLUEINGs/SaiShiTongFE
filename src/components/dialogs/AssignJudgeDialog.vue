<template>
    <responsive-dialog :visible.sync="dialogVisible" title="分配裁判" @close="handleClose" @confirm="handleConfirm">
        <div class="judge-list" v-loading="loading">
            <div v-if="error" class="error-message">
                <i class="el-icon-warning"></i>
                <span>{{ error }}</span>
            </div>
            <el-alert v-if="loading && !judges.length" type="info" :closable="false" title="正在加载可用裁判..." />
            <el-alert v-else-if="!loading && !judges.length" type="warning" :closable="false" title="暂无可用裁判" />
            <el-checkbox-group v-model="selectedJudges">
                <div v-for="judge in judges" :key="judge.uid" class="judge-item">
                    <el-checkbox :label="judge.uid">
                        <div class="judge-info">
                            <el-avatar :size="32" :src="judge.head">{{ judge.name.charAt(0) }}</el-avatar>
                            <span class="judge-name">{{ judge.name }}</span>
                        </div>
                    </el-checkbox>
                </div>
            </el-checkbox-group>
        </div>
    </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '../ResponsiveDialog.vue'

export default {
    name: 'AssignJudgeDialog',
    components: { ResponsiveDialog },
    props: {
        visible: Boolean,
        judges: {
            type: Array,
            default: () => []
        },
        currentJudges: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selectedJudges: [],
            error: ''
        }
    },
    computed: {
        dialogVisible: {
            get() { return this.visible },
            set(val) { this.$emit('update:visible', val) }
        }
    },
    watch: {
        visible(val) {
            if (val) {
                this.error = ''
                this.selectedJudges = this.currentJudges.map(judge => judge.uid)
            }
        }
    },
    methods: {
        handleClose() {
            this.$emit('update:visible', false)
        },
        handleConfirm() {
            if (this.selectedJudges.length === 0) {
                this.error = '请至少选择一名裁判'
                return
            }
            this.$emit('confirm', this.selectedJudges)
        }
    }
}
</script>

<style lang="less" scoped>
.judge-list {
    min-height: 200px;
    max-height: 60vh;
    overflow-y: auto;

    .error-message {
        margin: 0 0 16px;
        padding: 10px 15px;
        border-radius: 4px;
        background-color: rgba(245, 108, 108, 0.1);
        color: #F56C6C;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;

        i {
            font-size: 16px;
        }
    }

    .judge-item {
        padding: 12px;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
            border-bottom: none;
        }

        .judge-info {
            display: inline-flex;
            align-items: center;
            margin-left: 8px;
            gap: 12px;

            .judge-name {
                font-size: 14px;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .judge-list {
        .judge-item {
            padding: 16px;

            .judge-info {
                gap: 16px;

                .judge-name {
                    font-size: 16px;
                }
            }
        }
    }
}
</style>
