<template>
    <el-dialog :title="title" :visible.sync="dialogVisible" width="400px" :show-close="false"
        @close="$emit('update:visible', false)">
        <div class="confirm-content">
            <p class="message">{{ message }}</p>
            <div class="checkbox-wrapper" v-if="showCheckbox">
                <el-checkbox v-model="checked">{{ checkboxLabel }}</el-checkbox>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name: 'ConfirmDialog',
    props: {
        visible: Boolean,
        title: {
            type: String,
            default: '提示'
        },
        message: {
            type: String,
            required: true
        },
        showCheckbox: Boolean,
        checkboxLabel: String
    },
    data() {
        return {
            dialogVisible: false,
            checked: false
        }
    },
    watch: {
        visible(val) {
            this.dialogVisible = val
            if (!val) {
                this.checked = false
            }
        }
    },
    methods: {
        handleConfirm() {
            this.$emit('confirm', this.checked)
            this.dialogVisible = false
        },
        handleCancel() {
            this.$emit('cancel')
            this.dialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>
.confirm-content {
    padding: 10px 0;

    .message {
        margin: 0 0 16px;
        font-size: 16px;
        color: #303133;
    }

    .checkbox-wrapper {
        margin-top: 16px;
    }
}
</style>
