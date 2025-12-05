<template>
    <div class="sport-meeting-settings">
        <!-- 原有的设置内容 -->
        <div class="settings-container">
            <div class="content-wrapper">
                <!-- 上方基本信息和时间配置并排 -->
                <el-row :gutter="20" class="top-row">
                    <el-col :xs="24" :sm="24" :md="8">
                        <!-- 基本信息配置 -->
                        <div class="section">
                            <h3 class="section-title">基本信息配置</h3>
                            <el-form :model="basicForm" ref="basicForm" :rules="basicRules" label-width="120px"
                                class="basic-form">
                                <el-form-item label="运动会名称" prop="name">
                                    <el-input v-model="basicForm.name"></el-input>
                                </el-form-item>
                                <el-form-item label="运动会封面" prop="cover" class="cover-form-item">
                                    <div style="margin-top: 12px;margin-left:32px">
                                        <image-uploader :imageUrl.sync="coverPreview" :file.sync="basicForm.coverFile">
                                        </image-uploader>
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="handleBasicSave">保存</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="16">
                        <!-- 时间配置 -->
                        <div class="section">
                            <h3 class="section-title">时间配置</h3>
                            <el-form :model="timeForm" ref="timeForm" :rules="timeRules" label-width="120px">
                                <el-form-item label="运动会时间" required class="time-range">
                                    <div class="time-inputs">
                                        <el-form-item prop="startTime" class="time-input-item">
                                            <el-date-picker type="datetime" placeholder="开始时间"
                                                v-model="timeForm.startTime" style="width: 100%;"
                                                value-format="timestamp" :default-value="new Date()">
                                            </el-date-picker>
                                        </el-form-item>
                                        <el-form-item prop="endTime" class="time-input-item">
                                            <el-date-picker type="datetime" placeholder="结束时间"
                                                v-model="timeForm.endTime" style="width: 100%;" value-format="timestamp"
                                                :default-value="new Date()">
                                            </el-date-picker>
                                        </el-form-item>
                                    </div>
                                </el-form-item>

                                <el-form-item label="上午比赛时间" required class="time-range">
                                    <div class="time-inputs">
                                        <el-form-item prop="amStartTime" class="time-input-item">
                                            <el-time-picker placeholder="开始时间" v-model="timeForm.amStartTime"
                                                style="width: 100%;" value-format="HH:mm:ss"
                                                :default-value="new Date()">
                                            </el-time-picker>
                                        </el-form-item>
                                        <el-form-item prop="amEndTime" class="time-input-item">
                                            <el-time-picker placeholder="结束时间" v-model="timeForm.amEndTime"
                                                style="width: 100%;" value-format="HH:mm:ss"
                                                :default-value="new Date()">
                                            </el-time-picker>
                                        </el-form-item>
                                    </div>
                                </el-form-item>

                                <el-form-item label="下午比赛时间" required class="time-range">
                                    <div class="time-inputs">
                                        <el-form-item prop="pmStartTime" class="time-input-item">
                                            <el-time-picker placeholder="开始时间" v-model="timeForm.pmStartTime"
                                                style="width: 100%;" value-format="HH:mm:ss"
                                                :default-value="new Date()">
                                            </el-time-picker>
                                        </el-form-item>
                                        <el-form-item prop="pmEndTime" class="time-input-item">
                                            <el-time-picker placeholder="结束时间" v-model="timeForm.pmEndTime"
                                                style="width: 100%;" value-format="HH:mm:ss"
                                                :default-value="new Date()">
                                            </el-time-picker>
                                        </el-form-item>
                                    </div>
                                </el-form-item>

                                <el-form-item label="报名截止时间" required prop="registrationDeadline">
                                    <el-date-picker v-model="timeForm.registrationDeadline" type="datetime"
                                        placeholder="选择报名截止时间" style="width: 100%;" value-format="timestamp"
                                        :default-value="new Date()">
                                    </el-date-picker>
                                    <div class="time-tip">注意：报名截止时间是自动编排、自动分组、自动编号的时间点确认</div>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" @click="handleTimeSave">保存</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-col>
                </el-row>

                <!-- 进度阶段 -->
                <div class="section" style="margin-bottom: 20px;">
                    <h3 class="section-title">进行阶段</h3>
                    <div class="lifecycle-track">
                        <div class="status-point" v-for="(stage, index) in stages" :key="index" :class="{
                            'active': meetingInfo.status >= index + 1,
                            'current': meetingInfo.status === index + 1,
                            'clickable': index + 1 !== 3  // 除了已结束都可以点击
                        }" @click="index + 1 !== 3 && showStageInfo(index + 1)">
                            <div class="point"></div>
                            <div class="label">{{ stage.label }}</div>
                        </div>
                        <div class="progress-line" :style="{ width: progressWidth }"></div>
                    </div>
                </div>

                <!-- 职员配置 -->
                <div class="section">
                    <h3 class="section-title">职员配置</h3>
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="职员管理" name="staff">
                            <div class="action-bar">
                                <el-button type="primary" @click="showAddStaffDialog">添加职员</el-button>
                            </div>
                            <el-table :data="staffList" border @row-click="handleStaffRowClick">
                                <el-table-column prop="username" label="用户名" width="150">
                                    <template slot-scope="scope">
                                        <div class="clickable-cell">{{ scope.row.username }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="职位">
                                    <template slot-scope="scope">
                                        <div class="clickable-cell">
                                            <el-tag v-for="type in scope.row.userType" :key="type"
                                                :type="getTypeTag(type)" class="user-type-tag">
                                                {{ getTypeLabel(type) }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="100" align="right">
                                    <template slot-scope="scope">
                                        <div class="operation-buttons" @click.stop>
                                            <template v-if="scope.row.isEditing">
                                                <el-button size="mini" type="success"
                                                    @click="saveStaffEdit(scope.row)">保存</el-button>
                                                <el-button size="mini" type="info"
                                                    @click="cancelStaffEdit(scope.row)">取消</el-button>
                                            </template>
                                            <template v-else>
                                                <el-button size="mini" type="text" class="delete-btn"
                                                    @click="handleDeleteStaff(scope.row)">
                                                    <i class="el-icon-close"></i>
                                                </el-button>
                                                <el-button size="mini" type="text" class="edit-btn"
                                                    @click="handleEditStaff(scope.row)">
                                                    <i class="el-icon-edit"></i>
                                                </el-button>
                                            </template>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>

                        <el-tab-pane label="邀请码管理" name="invites">
                            <div class="action-bar">
                                <el-button type="primary" @click="showAddInviteDialog">添加邀请码</el-button>
                            </div>
                            <el-table :data="inviteList" border>
                                <el-table-column prop="code" label="邀请码" width="100">
                                    <template slot-scope="scope">
                                        <div class="clickable-cell" @click="handleEditInvite(scope.row)">
                                            {{ scope.row.code }}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="可用职位">
                                    <template slot-scope="scope">
                                        <div class="clickable-cell" @click="handleEditInvite(scope.row)">
                                            <el-tag v-for="type in scope.row.userType" :key="type"
                                                :type="getTypeTag(type)" class="user-type-tag">
                                                {{ getTypeLabel(type) }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="expireTime" label="有效期至">
                                    <template slot-scope="scope">
                                        <div class="clickable-cell" @click="handleEditInvite(scope.row)">
                                            {{ formatTime(scope.row.expireTime) }}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="80" align="right">
                                    <template slot-scope="scope">
                                        <el-button size="mini" type="text" class="delete-btn" icon="el-icon-close"
                                            circle @click.stop="handleDeleteInvite(scope.row)">
                                        </el-button>
                                        <el-button size="mini" type="text" class="edit-btn" icon="el-icon-edit" circle
                                            @click.stop="handleEditInvite(scope.row)">
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </div>

                <!-- 添加删除运动会按钮和对话框 -->
                <div class="danger-zone">
                    <h3 class="section-title">危险操作</h3>
                    <el-button type="danger" plain @click="showDeleteDialog = true">
                        删除运动会
                    </el-button>
                </div>

                <responsive-dialog :visible.sync="showDeleteDialog" title="删除运动会" width="400px"
                    :hide-default-footer="true">
                    <div class="delete-warning">
                        您确定要删除当前运动会？
                        <p class="warning-detail">
                            当前运动会的所有职员、比赛项目及规则、团体都会被删除，这是一个不可逆的操作！
                        </p>
                    </div>
                    <template #footer>
                        <div class="custom-footer">
                            <el-button type="danger" @click="handleDelete">删除</el-button>
                            <el-button type="primary" @click="showDeleteDialog = false">取消</el-button>
                        </div>
                    </template>
                </responsive-dialog>

                <!-- 添加Staff对话框 -->
                <responsive-dialog :visible.sync="staffDialog.visible" :title="staffDialog.title" width="500px"
                    @confirm="handleStaffConfirm" @cancel="staffDialog.visible = false">
                    <el-form ref="staffForm" :model="staffForm" :rules="staffRules" label-width="100px">
                        <template v-if="!staffDialog.isEdit">
                            <el-radio-group v-model="staffForm.addType" class="add-type-radio"
                                style="margin-bottom: 20px;">
                                <el-radio :label="1">分配账号</el-radio>
                                <el-radio :label="2">自主注册</el-radio>
                            </el-radio-group>

                            <!-- 分配账号表单 -->
                            <template v-if="staffForm.addType === 1">
                                <el-form-item label="用户名" prop="username">
                                    <el-input v-model="staffForm.username"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password">
                                    <el-input type="password" v-model="staffForm.password"></el-input>
                                </el-form-item>
                            </template>

                            <!-- 自主注册表单 -->
                            <template v-if="staffForm.addType === 2">
                                <el-form-item label="邀请码" prop="inviteCode">
                                    <el-input v-model="staffForm.inviteCode">
                                        <el-button slot="append" @click="generateInviteCode">生成</el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="有效期至" prop="expireTime">
                                    <el-date-picker v-model="staffForm.expireTime" type="datetime" placeholder="选择有效期"
                                        value-format="timestamp" :picker-options="{
                                            disabledDate(time) {
                                                return time.getTime() < Date.now() - 8.64e7;
                                            }
                                        }">
                                    </el-date-picker>
                                </el-form-item>
                            </template>
                        </template>

                        <el-form-item label="职位" prop="userType">
                            <el-checkbox-group v-model="staffForm.userType">
                                <el-checkbox :label="1">用户</el-checkbox>
                                <el-checkbox :label="2">团体负责人</el-checkbox>
                                <el-checkbox :label="3">裁判</el-checkbox>
                                <el-checkbox :label="4">运动员</el-checkbox>
                                <el-checkbox :label="5">运动会操办者</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <!-- 添加到编辑邀请码的表单中 -->
                        <el-form-item label="截止日期" prop="expireTime" v-if="staffDialog.isEdit && staffForm.code">
                            <el-date-picker v-model="staffForm.expireTime" type="datetime" placeholder="选择截止日期"
                                value-format="timestamp" :picker-options="{
                                    disabledDate(time) {
                                        return time.getTime() < Date.now() - 8.64e7;
                                    }
                                }">
                            </el-date-picker>
                        </el-form-item>

                        <!-- 显示错误信息 -->
                        <div v-if="staffForm.error" class="error-tip">{{ staffForm.error }}</div>
                    </el-form>
                </responsive-dialog>

                <!-- 把状态信息对话框移到这里 -->
                <responsive-dialog v-model="dialogVisible" :title="currentStage?.label || '状态信息'" width="500px"
                    :hideDefaultFooter="true" :visible.sync="dialogVisible">
                    <div class="stage-info">
                        <p>{{ currentStage?.description || '' }}</p>
                    </div>
                </responsive-dialog>

            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import dayjs from 'dayjs'
import ImageUploader from '@/components/ImageUploader.vue'

export default {
    name: 'SportMeetingSettings',
    components: {
        ResponsiveDialog,
        ImageUploader
    },
    data() {
        return {
            meetingInfo: {
                status: 1, // 设置默认值
                startTime: '',
                endTime: '',
                registrationDeadline: ''
            },
            dialogVisible: false,
            currentStage: null,
            stages: [
                {
                    label: '报名中',
                    status: 1,
                    description: '报名中状态将不会自动排赛、自动分组、自动晋级等，仅支持各种管理查询操作。'
                },
                {
                    label: '进行中',
                    status: 2,
                    description: '• 报名截至时将会自动完成赛程编排、预赛（或决赛制的预赛）分组\n• 该状态将持续统计更新运动员成绩，并且持续自动为完成评分的比赛晋级处理'
                },
                {
                    label: '已结束',
                    status: 3,
                    description: '所有比赛已结束，可以查看统计数据和成绩报告。'
                }
            ],
            activeTab: 'staff',
            isSchoolMode: true, // 通过API获取
            staffList: [],
            inviteList: [],
            staffDialog: {
                visible: false,
                title: '',
                isEdit: false
            },
            uploadUrl: process.env.VUE_APP_BASE_API + '/uploadCover',
            staffForm: {
                addType: 1,
                username: '',
                password: '',
                inviteCode: '',
                expireTime: '',
                userType: [],
                uid: '',
                error: '' // 添加错误信息字段
            },
            staffRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                inviteCode: [
                    { required: true, message: '请输入邀请码', trigger: 'blur' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母、数字和下划线', trigger: 'blur' }
                ],
                expireTime: [
                    { required: true, message: '请选择有效期', trigger: 'change' }
                ],
                userType: [
                    { required: true, message: '请选择至少一个职位', trigger: 'change' }
                ]
            },
            basicForm: {
                name: '',
                cover: '',
                coverFile: null // 添加封面文件对象
            },
            coverPreview: '', // 添加封面预览URL
            timeForm: {
                startTime: '',
                endTime: '',
                amStartTime: '',
                amEndTime: '',
                pmStartTime: '',
                pmEndTime: '',
                registrationDeadline: ''
            },
            basicRules: {
                name: [
                    { required: true, message: '请输入运动会名称', trigger: 'blur' }
                ]
            },
            timeRules: {
                startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
                endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
                amStartTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
                amEndTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
                pmStartTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
                pmEndTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
                registrationDeadline: [{ required: true, message: '请选择报名截止时间', trigger: 'change' }]
            },
            showDeleteDialog: false
        }
    },
    computed: {
        progressWidth() {
            const status = this.meetingInfo?.status || 0
            if (status <= 1) return '0%'
            if (status === 2) return '50%'
            return '100%'
        }
    },
    methods: {
        getTypeTag(type) {
            const tags = {
                1: '',
                2: 'success',
                3: 'warning'
            }
            return tags[type] || 'info'
        },
        getTypeLabel(type) {
            const types = {
                1: '用户',
                2: '团体负责人',
                3: '裁判',
                4: '运动员',
                5: '运动会操办者'
            }
            return types[type] || '未知职位'
        },
        formatTime(time) {
            if (!time) return '';
            const date = typeof time === 'string' ? new Date(time) : new Date(Number(time));
            return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
        },
        generateInviteCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'
            let code = ''
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            this.staffForm.inviteCode = code
        },
        showAddStaffDialog() {
            this.staffDialog.title = '添加职员'
            this.staffDialog.isEdit = false
            this.staffDialog.visible = true
            this.staffForm = {
                addType: 1, // 默认选择分配账号
                username: '',
                password: '',
                inviteCode: '',
                expireTime: '',
                userType: [],
                error: ''
            }
        },
        showAddInviteDialog() {
            // alert("测试")
            this.staffDialog.title = '添加邀请码'
            this.staffDialog.isEdit = false
            this.staffDialog.visible = true
            this.staffForm = {
                addType: 2, // 默认选择自主注册
                username: '',
                password: '',
                inviteCode: '',
                expireTime: '',
                userType: [],
                error: ''
            }
            this.generateInviteCode() // 自动生成邀请码
        },
        async handleStaffConfirm() {
            try {
                this.staffForm.error = '' // 清空之前的错误
                await this.$refs.staffForm.validate()
                if (this.staffDialog.isEdit) {
                    if (this.staffForm.code) {
                        // 编辑邀请码 - 更新权限
                        const res = await request({
                            url: '/updateInviteCodePower',
                            method: 'put',
                            data: {
                                code: this.staffForm.code,
                                userType: this.staffForm.userType
                            }
                        })
                        if (res.code === 1) {
                            this.$message.success('修改成功')
                            this.staffDialog.visible = false
                            this.fetchInviteList()
                        }
                    } else {
                        // 编辑职员 - 更新权限
                        const res = await request({
                            url: '/updateUserPower',
                            method: 'put',
                            data: {
                                uid: this.staffForm.uid,
                                userType: this.staffForm.userType
                            }
                        })
                        if (res.code === 1) {
                            this.$message.success('修改成功')
                            this.staffDialog.visible = false
                            this.fetchStaffList()
                        }
                    }
                } else if (this.staffForm.addType === 1) {
                    // 添加职员 - 分配账号
                    const registerInfo = new FormData()
                    registerInfo.append('name', this.staffForm.username)
                    registerInfo.append('password', this.staffForm.password)
                    registerInfo.append('powerDegree', JSON.stringify(this.staffForm.userType))

                    const res = await request({
                        url: '/register',
                        method: 'post',
                        data: registerInfo
                    })

                    if (res.code === 1) {
                        this.$message.success('添加成功')
                        this.staffDialog.visible = false
                        this.fetchStaffList()
                    }
                } else {
                    // 添加邀请码
                    const data = {
                        code: this.staffForm.inviteCode,
                        userType: this.staffForm.userType,
                        expireTime: new Date(this.staffForm.expireTime).toISOString()
                    }

                    const res = await request({
                        url: '/createInviteCode',
                        method: 'post',
                        data
                    })

                    if (res.code === 1) {
                        this.$message.success('邀请码创建成功')
                        this.staffDialog.visible = false
                        this.fetchInviteList()
                    } else if (res.code === 0 && res.message === 'DUPLICATED_CODE') {
                        // 设置错误信息
                        this.staffForm.error = '该邀请码已存在，请重新生成或手动输入'
                    }
                }
            } catch (error) {
                console.error('操作失败:', error)
            }
        },
        async handleBasicSave() {
            try {
                await this.$refs.basicForm.validate()
                const formData = new FormData()
                formData.append('name', this.basicForm.name)
                if (this.basicForm.coverFile) {
                    formData.append('cover', this.basicForm.coverFile)
                }

                const res = await request({
                    url: '/updateMeetingBasic',
                    method: 'put',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (res.code === 1) {
                    this.$message.success('保存成功')
                    if (res.data && res.data.coverUrl) {
                        this.basicForm.cover = res.data.coverUrl
                    }
                }
            } catch (error) {
                console.error('保存失败:', error)
            }
        },
        async handleTimeSave() {
            try {
                await this.$refs.timeForm.validate()

                // 转换时间格式: 只有开始/结束时间用ISO格式,上下午时间段保持HH:mm:ss格式
                const formData = {
                    startTime: new Date(this.timeForm.startTime).toISOString(),  // ISO格式
                    endTime: new Date(this.timeForm.endTime).toISOString(),      // ISO格式
                    amStartTime: this.timeForm.amStartTime,     // HH:mm:ss格式
                    amEndTime: this.timeForm.amEndTime,         // HH:mm:ss格式
                    pmStartTime: this.timeForm.pmStartTime,     // HH:mm:ss格式
                    pmEndTime: this.timeForm.pmEndTime,          // HH:mm:ss格式
                    registrationDeadline: new Date(this.timeForm.registrationDeadline).toISOString() // ISO格式
                }

                const res = await request({
                    url: '/updateMeetingTime',
                    method: 'put',
                    data: formData
                })
                if (res.code === 1) {
                    this.$message.success('保存成功')
                }
            } catch (error) {
                console.error('保存失败:', error)
            }
        },
        async fetchMeetingInfo() {
            try {
                const res = await request({
                    url: '/getMeetingInfo',
                    method: 'get'
                })
                if (res.code === 1) {
                    const data = res.data
                    // 更新meetingInfo
                    this.meetingInfo = {
                        status: data.status,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        registrationDeadline: data.registrationDeadline
                    }

                    // 更新基本信息
                    this.basicForm.name = data.name
                    this.basicForm.cover = data.img

                    // 更新时间配置
                    const startDate = new Date(data.startTime)
                    const endDate = new Date(data.endTime)
                    const registrationDeadlineDate = new Date(data.registrationDeadline)

                    this.timeForm = {
                        startTime: startDate.getTime(),
                        endTime: endDate.getTime(),
                        amStartTime: data.amStartTime,
                        amEndTime: data.amEndTime,
                        pmStartTime: data.pmStartTime,
                        pmEndTime: data.pmEndTime,
                        registrationDeadline: registrationDeadlineDate.getTime()
                    }
                }
            } catch (error) {
                console.error('获取运动会信息失败:', error)
                this.$message.error('获取运动会信息失败')
            }
        },
        async handleEditStaff(staff) {
            this.staffDialog.title = '编辑职员'
            this.staffDialog.isEdit = true
            this.staffDialog.visible = true
            // 编辑时只保留必要字段
            this.staffForm = {
                username: staff.username,
                userType: staff.userType,
                uid: staff.uid
            }
        },
        async handleEditInvite(invite) {
            this.staffDialog.title = '编辑邀请码'
            this.staffDialog.isEdit = true
            this.staffDialog.visible = true
            this.staffForm = { ...invite }
        },
        async handleDeleteStaff(staff) {
            try {
                await this.$confirm('确定要删除该职员吗（删除职员后，职员账号仍然存在，但不具有当前运动会的任何身份）？')
                const res = await request({
                    url: `/deleteStaff/${staff.uid}`,  // 使用uid替代id
                    method: 'delete'
                })

                if (res.code === 1) {
                    this.$message.success('删除成功')
                    this.fetchStaffList()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除失败:', error)
                }
            }
        },
        async handleDeleteInvite(invite) {
            try {
                await this.$confirm('确定要删除该邀请码吗？')
                const res = await request({
                    url: `/deleteInviteCode/${invite.code}`,
                    method: 'delete'
                })

                if (res.code === 1) {
                    this.$message.success('删除成功')
                    this.fetchInviteList()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除失败:', error)
                }
            }
        },
        async fetchStaffList() {
            try {
                const res = await request({
                    url: '/getStaffList',
                    method: 'get'
                })

                if (res.code === 1) {
                    // 修改字段映射以匹配新的响应格式
                    this.staffList = res.data.map(item => ({
                        uid: item.uid,
                        username: item.name,
                        // 修改这里：解析 powerDegree 字符串为数组
                        userType: JSON.parse(item.powerDegree || '[]')
                    }))
                }
            } catch (error) {
                console.error('获取职员列表失败:', error)
            }
        },
        async fetchInviteList() {
            try {
                const res = await request({
                    url: '/getInviteCodes',
                    method: 'get'
                })

                if (res.code === 1) {
                    this.inviteList = res.data
                }
            } catch (error) {
                console.error('获取邀请码列表失败:', error)
            }
        },
        handleCoverSuccess(res, /* file */) {
            if (res.code === 1) {
                this.basicForm.cover = res.data.url
            } else {
                this.$message.error('上传失败')
            }
        },
        beforeCoverUpload(file) {
            // 只检查文件类型
            if (!file.type.startsWith('image/')) {
                this.$message.error('请上传图片格式的文件!')
                return false
            }

            // 立即预览
            const reader = new FileReader()
            reader.onload = (e) => {
                this.coverPreview = e.target.result
                // 确保更新被Vue检测到
                this.$forceUpdate()
            }
            reader.readAsDataURL(file)

            // 保存文件对象
            this.basicForm.coverFile = file
            return false // 阻止自动上传
        },
        handleRowClick(row) {
            if (this.activeTab === 'staff') {
                // 给点击的行添加编辑状态
                row.isEditing = !row.isEditing;
                // 如果是取消编辑,需要重置数据
                if (!row.isEditing) {
                    this.fetchStaffList(); // 重新获取数据以恢复原状态
                }
            }
        },
        saveStaffEdit(staff) {
            this.handleEditStaff(staff);
        },
        cancelStaffEdit(staff) {
            staff.isEditing = false;
            this.fetchStaffList(); // 重新获取数据以恢复原状态
        },
        async handleDelete() {
            try {
                const res = await request({
                    url: '/deleteMeeting',
                    method: 'delete'
                })

                if (res.code === 1) {
                    this.$message.success('删除成功')
                    this.$router.push('/sport-meetings')
                }
            } catch (error) {
                console.error('删除失败:', error)
                this.$message.error(error.message || '删除失败')
            } finally {
                this.showDeleteDialog = false
            }
        },
        showStageInfo(status) {
            const stage = this.stages.find(s => s.status === status)
            if (stage) {
                this.currentStage = stage
                this.dialogVisible = true // 添加这行确保对话框显示
            }
        },
        formatTimeInfo(template) {
            if (!template) return ''
            return template
                .replace('{{ registrationDeadline }}', this.formatDateTime(this.meetingInfo?.registrationDeadline))
                .replace('{{ startTime }}', this.formatDateTime(this.meetingInfo?.startTime))
                .replace('{{ endTime }}', this.formatDateTime(this.meetingInfo?.endTime))
        },
        formatDateTime(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        handleStaffRowClick(row) {
            this.handleEditStaff(row);
        }
    },
    mounted() {
        this.fetchMeetingInfo()
        this.fetchStaffList()
        this.fetchInviteList()
        // 初始化时设置预览
        if (this.basicForm.cover) {
            this.coverPreview = this.basicForm.cover
        }
    },
    watch: {
        // 监听 cover 变化，同步更新预览
        'basicForm.cover': {
            handler(newVal) {
                if (newVal && !this.coverPreview) {
                    this.coverPreview = newVal
                }
            },
            immediate: true
        }
    }
}
</script>

<style lang="less" scoped>
.lifecycle-track {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    margin: 20px 0;

    .status-point {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .point {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #DCDFE6;
            margin-bottom: 8px;
            border: 2px solid #F2F6FC;
            transition: all 0.3s;
        }

        .label {
            font-size: 14px;
            color: #606266;
            transition: all 0.3s;
        }

        &.active {
            .point {
                background: #409EFF;
                border-color: #ECF5FF;
            }

            .label {
                color: #409EFF;
            }
        }

        &.current {
            .point {
                transform: scale(1.2);
                box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
            }
        }

        &.clickable {
            cursor: pointer;

            &:hover .point {
                transform: scale(1.1);
            }
        }

        &:not(.clickable) {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .progress-line {
        position: absolute;
        top: 8px;
        left: 40px;
        height: 2px;
        background: #409EFF;
        transition: width 0.3s ease;
    }

    &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 40px;
        right: 40px;
        height: 2px;
        background: #DCDFE6;
    }
}

.stage-info {
    padding: 16px;

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        color: #606266;
        white-space: pre-line; // 保留换行符
    }
}

.settings-container {
    padding: 20px;

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    .top-row {
        display: flex;
        margin-bottom: 20px;

        .el-col {
            display: flex;
            flex-direction: column;
        }
    }

    .section {
        background: #fff;
        padding: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        flex: 1;
        display: flex;
        flex-direction: column;

        .section-title {
            margin: 0 0 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
            font-size: 18px;
            color: #333;
        }

        .el-form {
            flex: 1;
            display: flex;
            flex-direction: column;

            // 添加这个新样式规则来让保存按钮居中
            .el-form-item:last-child {
                margin-bottom: 0;
                text-align: center;

                // 移除表单项的默认margin
                :deep(.el-form-item__content) {
                    margin-left: 0 !important;
                }
            }
        }
    }

    // 修改时间输入相关样式
    .time-range {
        .time-inputs {
            display: flex;
            gap: 10px;

            .time-input-item {
                flex: 1;
                margin-bottom: 0;
            }
        }

        @media (max-width: 1000px) {

            // 修改这里的断点
            .time-inputs {
                flex-direction: column;
                gap: 15px;
            }

            .el-form-item__label {
                margin-bottom: 10px;
            }
        }
    }

    // 修改表格相关样式
    :deep(.el-table) {
        border: none;

        th.el-table__cell,
        td.el-table__cell {
            border: none;
        }

        &::before {
            display: none;
        }
    }

    // 操作按钮样式
    .delete-btn,
    .edit-btn {
        padding: 4px;
        font-size: 12px;
    }

    .delete-btn {
        color: #F56C6C;

        &:hover {
            color: #ff4949;
        }
    }

    .edit-btn {
        color: #409EFF;

        &:hover {
            color: #66b1ff;
        }
    }

    // 确保表格内容垂直居中
    :deep(.el-table .cell) {
        display: flex;
        align-items: center;
    }

    :deep(.el-table__header-wrapper) {
        border-bottom: 1px solid #EBEEF5;
    }

    // 修改邀请码表格也应用相同的样式
    .el-tab-pane {
        :deep(.el-table) {
            border: none;

            th.el-table__cell,
            td.el-table__cell {
                border: none;
            }
        }
    }

    @media (max-width: 768px) {

        .top-row {
            display: block;

            .el-col {
                margin-bottom: 20px;
            }
        }

        padding: 10px;
    }
}

.error-tip {
    color: #F56C6C;
    font-size: 12px;
    margin-bottom: 15px;
    padding: 8px 16px;
    background-color: #FEF0F0;
    border-radius: 4px;
}

.cover-form-item {

    // 允许标签和内容在窄屏幕时换行
    :deep(.el-form-item__content) {
        display: block !important;
        margin-left: 0 !important;
        margin-top: 8px;
    }
}

.basic-form {
    .el-form-item {
        margin-bottom: 20px;
        width: 100%;

        .el-input {
            width: 100%;
        }
    }
}

.danger-zone {
    margin-top: 40px;
    padding: 24px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #fde2e2;

    .section-title {
        color: #f56c6c;
        margin: 0 0 16px;
        font-size: 18px;
    }
}

.delete-warning {
    font-size: 16px;
    color: #303133;

    .warning-detail {
        margin-top: 12px;
        color: #f56c6c;
        font-size: 14px;
        line-height: 1.6;
    }
}

.custom-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 24px;
}

@media screen and (max-width: 768px) {
    .cover-form-item {
        :deep(.el-form-item__label) {
            text-align: left;
            float: none;
            display: block;
            margin-bottom: 8px;
        }
    }
}

.operation-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .delete-btn,
    .edit-btn {
        padding: 4px 8px;

        &:hover {
            background-color: transparent;
        }
    }
}

/* 添加新的样式 */
.add-type-radio {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.error-tip {
    color: #F56C6C;
    font-size: 12px;
    margin: 8px 0;
    padding: 8px 16px;
    background-color: #FEF0F0;
    border-radius: 4px;
}

.el-table {
    .el-table__row {
        cursor: pointer;

        &:hover {
            background-color: #f5f7fa;
        }
    }
}

/* 添加可点击单元格样式 */
.clickable-cell {
    cursor: pointer;
    padding: 8px 0;

    &:hover {
        color: #409EFF;
    }
}
</style>
