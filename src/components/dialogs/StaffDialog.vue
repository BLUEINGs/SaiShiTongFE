<template>
    <responsive-dialog :visible.sync="dialogVisible" :title="title" width="500px" @confirm="handleConfirm">
        <el-form :model="form" ref="staffForm" :rules="rules" label-width="100px">
            <el-form-item label="用户名" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="职位" prop="userType">
                <base-multi-select v-model="form.userType" :options="staffTypeOptions" placeholder="选择职位"
                    class="staff-select" />
            </el-form-item>
        </el-form>
        <!-- 添加底部空隙 -->
        <div class="bottom-space"></div>
    </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import BaseMultiSelect from '@/components/inputs/BaseMultiSelect.vue'

export default {
    name: 'StaffDialog',
    components: { ResponsiveDialog, BaseMultiSelect },
    props: {
        visible: Boolean,
        isEdit: Boolean,
        staffData: Object
    },
    data() {
        return {
            dialogVisible: false,
            staffTypeOptions: [
                { id: 1, name: '用户' },
                { id: 2, name: '团体负责人' },
                { id: 3, name: '裁判' },
                { id: 4, name: '运动员' },
                { id: 5, name: '运动会操办者' }
            ],
            form: {
                name: '',
                password: '',
                userType: [],
            },
            rules: {
                name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                userType: [{ required: true, message: '请选择至少一个职位', trigger: 'change' }]
            }
        }
    },
    computed: {
        title() {
            return '添加职员'
        }
    },
    watch: {
        visible(val) {
            this.dialogVisible = val
            if (val && this.staffData) {
                this.form = { ...this.staffData }
            }
        },
        dialogVisible(val) {
            if (!val) this.$emit('update:visible', false)
        }
    },
    methods: {
        async handleConfirm() {
            try {
                await this.$refs.staffForm.validate()
                // 构建staff对象，直接传递完整的userType对象
                const staffData = {
                    name: this.form.name,
                    password: this.form.password,
                    userType: this.form.userType, // 不要map，直接传递原始对象数组
                    uid: null,
                    head: '',
                }
                this.$emit('confirm', staffData)
                this.dialogVisible = false
            } catch (error) {
                console.error('表单验证失败:', error)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.error-tip {
    color: #F56C6C;
    padding: 8px 12px;
    background-color: #FEF0F0;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
}

:deep(.staff-select) {
    .select-dropdown {
        z-index: 3100; // 设置更高的z-index以确保在对话框上方显示
    }
}

.bottom-space {
    height: 240px; // 给下拉框预留足够的空间
}
</style>
