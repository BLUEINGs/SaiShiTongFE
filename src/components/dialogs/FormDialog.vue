<template>
    <el-dialog :visible.sync="dialogVisible" :title="title" :width="dialogWidth" :append-to-body="true"
        :close-on-click-modal="false" :close-on-press-escape="true" custom-class="form-dialog" @close="handleClose">

        <div class="dialog-content">
            <slot></slot>
        </div>

        <template #footer>
            <slot name="footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="handleConfirm">确 定</el-button>
            </slot>
        </template>
    </el-dialog>
</template>

<script>
export default {
    name: 'FormDialog',
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    props: {
        modelValue: Boolean,
        title: String
    },
    data() {
        return {
            isMobile: false
        }
    },
    computed: {
        dialogVisible: {
            get() {
                return this.modelValue
            },
            set(val) {
                this.$emit('update:modelValue', val)
            }
        },
        dialogWidth() {
            return this.isMobile ? '70%' : '420px'
        }
    },
    created() {
        this.checkMobile()
        window.addEventListener('resize', this.checkMobile)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile)
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768
        },
        handleClose() {
            this.$emit('update:modelValue', false)
        },
        handleConfirm() {
            this.$emit('confirm')
        }
    }
}
</script>

<style lang="less" scoped>
.form-dialog {
    ::v-deep .el-dialog {
        .el-dialog__body {
            padding: 20px;
        }

        .el-dialog__footer {
            padding: 15px 20px;
            border-top: 1px solid #EBEEF5;
            text-align: right;

            .el-button+.el-button {
                margin-left: 10px;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .form-dialog {
        ::v-deep .el-dialog {
            margin: 15vh auto !important;

            .el-dialog__body {
                padding: 15px;
            }

            .el-dialog__footer {
                padding: 10px 15px;

                .el-button {
                    min-width: 80px;
                }
            }
        }
    }
}
</style>
