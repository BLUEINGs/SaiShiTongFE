<template>
    <responsive-dialog :title="isEdit ? `编辑团体` : `新增团体`" :visible.sync="dialogVisible" width="500px"
        @confirm="submitForm" @cancel="$emit('update:visible', false)">
        <div class="dialog-body">
            <el-form :model="schoolForm" label-width="80px" :rules="rules" ref="schoolForm">
                <el-form-item label="团体名称" prop="name">
                    <el-input v-model="schoolForm.name" placeholder="请输入团体名称"></el-input>
                </el-form-item>
                <el-form-item label="团体级别" prop="teamNumber">
                    <multi-level-input v-model="schoolForm.teamNumber" :levels="levelConfig"
                        @validate="handleTeamNumberValidate" />
                </el-form-item>
                <el-form-item label="团体口号">
                    <el-input v-model="schoolForm.slogan" type="textarea" :rows="3" placeholder="请输入团体口号"
                        class="slogan-input"></el-input>
                </el-form-item>
                <el-form-item label="团体图片">
                    <image-uploader :imageUrl="schoolForm.image" @update:imageUrl="updateSchoolImage"
                        @update:file="updateSchoolFile" />
                </el-form-item>
            </el-form>
        </div>
    </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import MultiLevelInput from '@/components/MultiLevelInput.vue'
import request from '@/utils/request'

export default {
    name: 'SchoolDialog',
    components: {
        ResponsiveDialog,
        ImageUploader,
        MultiLevelInput
    },
    props: {
        visible: Boolean,
        isEdit: Boolean,
        schoolData: Object,
        levelConfig: { // 添加levelConfig props
            type: Array,
            required: true
        }
    },
    data() {
        return {
            dialogVisible: false,
            schoolForm: {
                id: null,
                name: '',
                slogan: '',
                image: '',
                teamNumber: []
            },
            schoolFile: null,
            rules: {
                name: [
                    { required: true, message: '团体名称不能为空', trigger: 'blur' }
                ],
                teamNumber: [
                    {
                        required: true,
                        message: '请完整填写团体级别',
                        trigger: 'change',
                        validator: (rule, value, callback) => {
                            if (!Array.isArray(value) || value.length === 0) {
                                callback(new Error('请填写团体级别'));
                                return;
                            }
                            // 检查是否所有级别都已填写
                            const allFilled = value.every(v => v !== '' && v !== undefined);
                            if (!allFilled) {
                                callback(new Error('请完整填写所有级别'));
                                return;
                            }
                            callback();
                        }
                    }
                ]
            },
            isTeamNumberValid: false // 添加团体级别验证状态
        }
    },
    watch: {
        visible(val) {
            this.dialogVisible = val
            if (val && this.isEdit && this.schoolData) {
                this.initEditForm()
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.$emit('update:visible', false)
            }
        }
    },
    methods: {
        initEditForm() {
            console.log('初始化编辑表单,接收的数据:', this.schoolData); // 添加日志
            // 修改：确保teamNumber是数组且进行深拷贝
            const teamNumber = Array.isArray(this.schoolData.teamNumber) ?
                JSON.parse(JSON.stringify(this.schoolData.teamNumber)) : []

            this.schoolForm = {
                id: this.schoolData.id,
                name: this.schoolData.name,
                slogan: this.schoolData.slogan,
                image: this.schoolData.image,
                teamNumber // 使用处理后的值
            }

            // 确保teamNumber的值符合格式要求
            if (Array.isArray(this.schoolData.teamNumber)) {
                const formattedTeamNumber = this.schoolData.teamNumber.map((value, index) => {
                    const level = this.levelConfig[index];
                    if (level && level.isNumeric) {
                        // 对数字类型的值进行格式化，确保位数正确
                        return String(value).padStart(level.digits, '0');
                    }
                    return value;
                });

                this.schoolForm.teamNumber = formattedTeamNumber;
            }

            console.log('处理后的表单数据:', this.schoolForm); // 添加日志
        },
        updateSchoolImage(imageUrl) {
            this.schoolForm.image = imageUrl
        },
        updateSchoolFile(file) {
            this.schoolFile = file
        },
        handleTeamNumberValidate(isValid) {
            this.isTeamNumberValid = isValid;
        },
        async submitForm() {
            try {
                await this.$refs.schoolForm.validate();

                const formData = new FormData();
                formData.append('name', this.schoolForm.name);
                formData.append('slogan', this.schoolForm.slogan);

                if (this.schoolFile) {
                    formData.append('imgFile', this.schoolFile);
                }

                // 修改：仅当teamNumber有值时才添加到formData
                if (Array.isArray(this.schoolForm.teamNumber) && this.schoolForm.teamNumber.length > 0) {
                    formData.append('teamNumber', JSON.stringify(this.schoolForm.teamNumber));
                }

                const url = this.isEdit ? '/modifySchool' : '/addSchool';
                if (this.isEdit) {
                    formData.append('scId', this.schoolForm.id);
                }

                const res = await request({
                    url,
                    method: 'post',
                    data: formData
                });

                if (res.code === 1) {
                    // 构造统一格式的返回数据
                    const updatedSchool = {
                        id: this.isEdit ? this.schoolForm.id : res.data,
                        scId: this.isEdit ? this.schoolForm.id : res.data,
                        name: this.schoolForm.name,
                        slogan: this.schoolForm.slogan,
                        image: this.schoolForm.image,
                        teamNumber: this.schoolForm.teamNumber,
                        players: []
                    };

                    this.$emit('success', updatedSchool);
                    this.$message.success(`${this.isEdit ? '修改' : '添加'}成功`);
                    this.dialogVisible = false;
                }
            } catch (error) {
                console.error(`${this.isEdit ? '修改' : '添加'}团体失败:`, error);
                this.$message.error(`${this.isEdit ? '修改' : '添加'}团体失败`);
            }
        },
        validateTeamNumber() {
            if (!Array.isArray(this.schoolForm.teamNumber)) {
                return false;
            }

            // 检查每个级别的值是否符合要求
            for (let i = 0; i < this.levelConfig.length; i++) {
                const level = this.levelConfig[i];
                const value = this.schoolForm.teamNumber[i];

                if (value === undefined || value === '') {
                    this.$message.error(`请输入${level.field}级别的值`);
                    return false;
                }

                if (level.isNumeric) {
                    // 检查数字格式
                    if (!/^\d+$/.test(value)) {
                        this.$message.error(`${level.field}必须是纯数字`);
                        return false;
                    }
                    // 检查位数
                    if (value.length !== level.digits) {
                        this.$message.error(`${level.field}必须是${level.digits}位数字`);
                        return false;
                    }
                } else {
                    // 检查自定义值是否在允许的范围内
                    const validValues = level.valuePairs.map(pair => pair.value);
                    if (!validValues.includes(value)) {
                        this.$message.error(`${level.field}的值不在允许范围内`);
                        return false;
                    }
                }
            }

            return true;
        }
    }
}
</script>

<style lang="less" scoped>
.slogan-input {
    :deep(.el-textarea__inner) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        resize: none;
    }
}
</style>
