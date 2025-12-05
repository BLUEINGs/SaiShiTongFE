<template>
    <div class="container">
        <!-- 固定顶部导航栏 -->
        <TopNavbar :title="'部门管理'" :isEditMode="isEditMode" @add="handleAddSchool" @toggle-edit="toggleEditMode" />
        <!-- 学校列表 -->
        <div class="department-management">
            <div class="school-grid">
                <div v-for="school in schools" :key="school.id" class="school-card" :class="{
                    'active': activeSchoolId === school.id,
                    'edit-mode': isEditMode
                }">
                    <!-- 学校头部 -->
                    <div class="school-header" @click="toggleAthletes(school.id)">
                        <img :src="school.image" class="school-image">
                        <h2 class="school-name">{{ school.name }}</h2>
                    </div>
                    <!-- 运动员列表 -->
                    <transition name="slide">
                        <div v-show="activeSchoolId === school.id" class="athletes-list">
                            <el-button class="collapse-btn" type="info" icon="el-icon-arrow-up" circle
                                @click.native="closePanel"></el-button>
                            <div class="athletes-container">
                                <!-- 运动员项（每行一个） -->
                                <div v-for="athlete in school.athletes" :key="athlete.id" class="athlete-item">
                                    <div class="athlete-content">
                                        <div class="athlete-avatar">
                                            <img :src="athlete.avatar">
                                        </div>
                                        <div class="athlete-info">
                                            <h3>{{ athlete.name }}</h3>
                                            <p class="meta">{{ athlete.class }} · {{ athlete.events }}</p>
                                        </div>
                                    </div>
                                    <!-- 操作按钮组（仅编辑模式显示） -->
                                    <div v-if="isEditMode" class="action-buttons">
                                        <el-button type="primary" icon="el-icon-edit" circle
                                            @click.stop="handleEditAthlete(school, athlete)"></el-button>
                                        <el-button type="danger" icon="el-icon-delete" circle
                                            @click.stop="handleDeleteAthlete(school, athlete)"></el-button>
                                    </div>
                                </div>
                                <!-- 添加按钮（独占一行） -->
                                <div v-if="isEditMode && school.athletes.length < 3" class="add-athlete">
                                    <el-button type="text" icon="el-icon-plus" @click.stop="handleAddAthlete(school)"
                                        class="full-width-btn">
                                        添加运动员
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
        <!-- 编辑/添加对话框 -->
        <!-- 添加/编辑对话框 -->
        <el-dialog :title="isEdit ? '编辑运动员' : '添加运动员'" :visible.sync="dialogVisible" width="600px"
            @closed="handleDialogClose">
            <el-form :model="currentAthlete" label-width="80px" :rules="rules" ref="athleteForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="currentAthlete.name" placeholder="请输入姓名"></el-input>
                </el-form-item>

                <el-form-item label="班级" prop="class">
                    <el-input v-model="currentAthlete.class" placeholder="例如：高三（1）班"></el-input>
                </el-form-item>

                <el-form-item label="项目" prop="events">
                    <el-select v-model="currentAthlete.events" placeholder="请选择参赛项目">
                        <el-option v-for="item in sportEvents" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="头像" prop="avatar">
                    <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handlePreview"
                        :before-remove="handleRemove">
                        <!-- 预览区域 -->
                        <div v-if="currentAthlete.avatar" class="preview-wrapper">
                            <img :src="currentAthlete.avatar" class="preview-image">
                            <div class="preview-mask">
                                <i class="el-icon-zoom-in"></i>
                                <i class="el-icon-delete" @click.stop="clearPreview"></i>
                            </div>
                        </div>
                        <!-- 上传按钮 -->
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
            </el-form>

            <span slot="footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :title="isSchoolEdit ? '编辑学校' : '新增学校'" :visible.sync="schoolDialogVisible">
            <el-form :model="currentSchool" label-width="80px" v-if="currentSchool">
                <el-form-item label="学校名称">
                    <el-input v-model="currentSchool.name"></el-input>
                </el-form-item>
                <el-form-item label="学校口号">
                    <el-input v-model="currentSchool.slogan" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="学校图片">
                    <ImageUploader :imageUrl="currentSchool.image" @update:imageUrl="updateSchoolImage"
                        @update:file="updateSchoolFile" />
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="schoolDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveSchool">保存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import TopNavbar from '@/components/TopNavbar.vue';
import ImageUploader from '@/components/ImageUploader.vue';

export default {
    components: {
        TopNavbar,
        ImageUploader
    },
    data() {
        return {
            isEditMode: false,
            activeSchoolId: null,
            schools: [
                {
                    id: 1,
                    name: '第一中学',
                    image: 'http://8.140.62.7/img/lgd.png',
                    athletes: Array(3).fill().map((_, i) => ({
                        id: i + 1,
                        name: `运动员 ${i + 1}`,
                        class: `高三（${i + 1}）班`,
                        events: ['100米跑', '跳远'][i % 2],
                        avatar: 'http://8.140.62.7/img/lgd.png'
                    }))
                },
                ...Array(5).fill().map((_, i) => ({
                    id: i + 2,
                    name: `第${i + 2}中学`,
                    image: 'http://8.140.62.7/img/lgd.png',
                    athletes: Array(2).fill().map((_, j) => ({
                        id: j + 1,
                        name: `选手 ${j + 1}`,
                        class: `高一（${j + 1}）班`,
                        events: ['铅球', '跳高'][j % 2],
                        avatar: 'http://8.140.62.7/img/lgd.png'
                    }))
                }))
            ],
            // 添加/编辑对话框
            dialogVisible: false,
            isEdit: false,
            currentSchool: {
                id: null,
                name: '',
                slogan: '',
                image: '',
                athletes: []
            },
            currentAthlete: {
                id: null,
                name: '',
                class: '',
                events: '',
                avatar: ''
            },
            sportEvents: ['100米跑', '跳远', '铅球', '跳高', '游泳', '篮球'],
            rules: {
                name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
                class: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
                events: [{ required: true, message: '请选择参赛项目', trigger: 'change' }]
            },

            // 学校编辑对话框
            schoolDialogVisible: false,
            isSchoolEdit: false,
            schoolFile: null
        }
    },
    methods: {
        toggleEditMode() {
            this.isEditMode = !this.isEditMode
            if (!this.isEditMode) this.activeSchoolId = null
        },
        toggleAthletes(schoolId) {
            // 修改：允许任何模式展开
            this.activeSchoolId = this.activeSchoolId === schoolId ? null : schoolId
        },
        closePanel() {
            this.activeSchoolId = null
        },
        handleAddSchool() {
            // 添加学校逻辑
        },
        handleAddAthlete(school) {
            if (school.athletes.length >= 3) return
            this.currentSchool = school
            this.isEdit = false
            this.dialogVisible = true
            this.currentAthlete = {
                id: Date.now(),
                name: '新运动员',
                class: '未知班级',
                events: '',
                avatar: 'http://8.140.62.7/img/lgd.png'
            }
        },
        handleEditAthlete(school, athlete) {
            // 触发编辑逻辑
            this.currentSchool = school
            this.isEdit = true
            this.dialogVisible = true
            // 深拷贝运动员数据
            this.currentAthlete = { ...athlete }
            console.log('Editing:', school, athlete)
        },
        handleDeleteAthlete(school, athlete) {
            this.$confirm(`确定删除 ${athlete.name} 吗？`, '警告', {
                type: 'warning'
            }).then(() => {
                const index = school.athletes.findIndex(a => a.id === athlete.id)
                school.athletes.splice(index, 1)
            }).catch(() => {
                // 处理取消删除的情况，避免报错
                console.log('取消删除');
            });
        },
        // 关闭对话框重置表单
        handleDialogClose() {
            this.$refs.athleteForm.resetFields()
            this.currentSchool = {
                id: null,
                name: '',
                slogan: '',
                image: '',
                athletes: []
            }
        },
        // 处理文件选择
        handlePreview(file) {
            // 生成临时预览URL
            const previewURL = URL.createObjectURL(file.raw)

            // 更新数据
            this.currentAthlete = {
                ...this.currentAthlete,
                avatar: previewURL,
                rawFile: file.raw // 保存原始文件用于后续上传
            }

            // 组件销毁时释放内存
            this.$once('hook:beforeDestroy', () => {
                URL.revokeObjectURL(previewURL)
            })
        },
        clearPreview() {
            URL.revokeObjectURL(this.currentAthlete.avatar)
            this.currentAthlete.avatar = ''
            this.currentAthlete.rawFile = null
        },
        // 删除前确认
        handleRemove() {
            return this.$confirm('确定移除该头像？', '提示', {
                type: 'warning'
            })
        },

        // 头像上传成功处理（修改后）
        handleAvatarSuccess(res, file) {
            // 保存文件对象用于后续上传
            this.currentAthlete.file = file.raw
            // 本地预览
            this.currentAthlete.avatar = URL.createObjectURL(file.raw)
        },
        // 提交表单，应该是本地刷新数据的方法
        async submitForm() {
            this.$refs.athleteForm.validate(valid => {
                if (valid) {
                    // 创建FormData对象
                    const formData = new FormData()
                    formData.append('name', this.currentAthlete.name)
                    formData.append('class', this.currentAthlete.class)
                    formData.append('events', this.currentAthlete.events)

                    // 如果有新上传的文件
                    if (this.currentAthlete.file) {
                        formData.append('avatar', this.currentAthlete.file)
                    } else if (this.isEdit) {
                        // 编辑模式保留原有头像
                        formData.append('avatar', this.currentAthlete.avatar)
                    }

                    // 此处需要向服务器发送请求（示例）
                    // axios.post('/api/athletes', formData, {
                    //   headers: {
                    //     'Content-Type': 'multipart/form-data'
                    //   }
                    // }).then(response => {

                    /* 本地更新开始 */
                    if (this.isEdit) {
                        const index = this.currentSchool.athletes.findIndex(
                            a => a.id === this.currentAthlete.id
                        )
                        this.$set(this.currentSchool.athletes, index, {
                            ...this.currentAthlete,
                            // 实际项目中应使用服务器返回的URL
                            avatar: this.currentAthlete.avatar
                        })
                    } else {
                        this.currentSchool.athletes.push({
                            ...this.currentAthlete,
                            id: Date.now() // 实际项目中应使用服务器返回的ID
                        })
                    }
                    /****************** 本地更新结束 ******************/

                    this.dialogVisible = false
                    // }).catch(error => {
                    //   this.$message.error('保存失败')
                    // })
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
/* 上传容器 */
.avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
    transition: border-color 0.3s;

    &:hover {
        border-color: #409EFF;
    }
}

/* 预览容器 */
.preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* 悬浮遮罩 */
    .preview-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;

        i {
            color: white;
            font-size: 20px;
            margin: 0 5px;
            cursor: pointer;

            &:hover {
                color: #409EFF;
            }
        }
    }

    &:hover .preview-mask {
        opacity: 1;
    }
}

/* 上传图标 */
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

/* 头像上传样式 */
.avatar-uploader {
    ::v-deep .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;

        &:hover {
            border-color: #409EFF;
        }
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
}

.container {
    .department-management {
        margin-top: 60px;

        .school-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;

            @media (max-width: 767px) {
                grid-template-columns: 1fr;
                padding: 10px;
            }

            .school-card {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                overflow: hidden;

                &.active {
                    @media (min-width: 768px) {
                        grid-column: 1 / -1;
                        display: grid;
                        grid-template-columns: 1fr 2fr;
                        gap: 20px;

                        .school-header {
                            height: auto;
                            cursor: default;

                            .school-image {
                                height: 300px;
                            }
                        }

                        .athletes-list {
                            display: block !important;
                            position: relative;
                            padding: 0;
                            background: transparent;

                            .athletes-container {
                                margin-top: 46px;

                                .athlete-item {
                                    box-sizing: border-box;
                                    width: calc(100% - 20px);
                                    max-width: none;
                                }
                            }

                            .add-athlete {
                                width: calc(100% - 20px);
                                margin-top: 15px;
                            }
                        }
                    }
                }

                .school-header {
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s ease;

                    .school-image {
                        width: 100%;
                        height: 200px;
                        object-fit: cover;
                        transition: height 0.3s ease;

                        @media (max-width: 767px) {
                            height: 150px !important;
                        }
                    }

                    .school-name {
                        position: absolute;
                        bottom: 20px;
                        left: 20px;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                        margin: 0;
                    }
                }

                .athletes-list {
                    position: relative;
                    padding: 40px 1rem 1rem;
                    background: #f8f9fa;

                    @media (min-width: 768px) {
                        background: transparent;
                        padding: 20px;
                    }

                    .collapse-btn {
                        position: absolute;
                        right: 10px;
                        top: 10px;
                        padding: 6px;
                        z-index: 2;
                    }

                    .athletes-container {
                        width: 100%;

                        .athlete-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px;
                            margin-bottom: 8px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

                            .athlete-content {
                                display: flex;
                                align-items: center;
                                flex: 1;

                                .athlete-avatar img {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    margin-right: 1rem;
                                }

                                .athlete-info {
                                    h3 {
                                        margin: 0;
                                        font-size: 1rem;
                                        color: #34495e;
                                    }

                                    .meta {
                                        margin: 0;
                                        font-size: 0.85rem;
                                        color: #7f8c8d;
                                    }
                                }
                            }

                            .action-buttons {
                                display: flex;
                                gap: 8px;
                                margin-left: 12px;

                                .el-button {
                                    margin: 0 !important;
                                }
                            }
                        }

                        .add-athlete {
                            margin-top: 12px;
                            text-align: center;

                            .el-button {
                                width: 100%;
                                color: #2196F3;
                                border: 1px dashed #2196F3;
                                padding: 12px;

                                &:hover {
                                    background-color: #e3f2fd;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    overflow: hidden;

    @media (min-width: 768px) {
        max-height: 1000px;
    }
}

.slide-enter,
.slide-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>