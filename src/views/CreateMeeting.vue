<template>
    <div class="create-meeting">
        <header class="page-header">
            <el-button icon="el-icon-back" @click="$router.back()">返回</el-button>
            <h2>创建运动会</h2>
        </header>

        <div class="content-wrapper">
            <!-- 加载动画 -->
            <div class="loading-overlay" v-if="isSubmitting">
                <div class="loading-content">
                    <i class="el-icon-loading"></i>
                    <p>正在初始化运动会，请稍后...</p>
                </div>
            </div>

            <div class="main-content">
                <!-- 成功提示内容 -->
                <div v-if="showSuccess" class="success-wrapper">
                    <div class="success-content">
                        <div class="success-header">
                            <i class="el-icon-success"></i>
                            <p class="success-title">发布成功！</p>
                        </div>
                        <div class="content-body">
                            <template v-if="isEmptyTemplate">
                                <p>由于您使用空模板，后续需要完成以下操作：</p>
                                <ol class="todo-list">
                                    <li>在"运动项目"页面发布运动项目</li>
                                    <li>在"裁判评分"页面创建比赛规则并为项目设置对应的比赛规则</li>
                                    <li>在"此运动会"页面邀请团体负责人和裁判注册</li>
                                    <li>裁判注册成功后，在"裁判评分"页面为各比赛分配其对应的裁判</li>
                                </ol>
                            </template>
                            <template v-else>
                                <p>您仍然需要完成以下操作：</p>
                                <ol class="todo-list">
                                    <li>在"此运动会"页面邀请团体负责人和裁判注册</li>
                                    <li>裁判注册成功后，在"裁判评分"页面为各比赛分配其对应的裁判</li>
                                </ol>
                            </template>
                        </div>
                        <div class="action-buttons">
                            <el-button type="primary" @click="copyTodoList">一键复制</el-button>
                            <el-button type="success" @click="$router.push('/sport-meetings')">我知道了</el-button>
                        </div>
                    </div>
                </div>

                <!-- 原有表单内容 -->
                <div v-if="!showSuccess">
                    <section class="template-section">
                        <h3>选择模板</h3>
                        <div class="template-list">
                            <div v-for="temp in templates" :key="temp.smId" class="template-card"
                                :class="{ 'active': selectedTemplate === temp.smId }" @click="selectTemplate(temp)">
                                <img :src="temp.img" :alt="temp.name">
                                <div class="template-info">
                                    <h4>{{ temp.name }}</h4>
                                    <p>{{ temp.description }}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form @submit.prevent="handleSubmit">
                        <section class="form-section">
                            <h3>基本信息</h3>
                            <div class="form-item">
                                <label class="required">运动会名称</label>
                                <base-input v-model="form.name" placeholder="请输入运动会名称" required />
                            </div>
                            <div class="form-item">
                                <label>运动会封面</label>
                                <image-uploader :imageUrl.sync="form.cover" :file.sync="form.coverFile" />
                            </div>
                        </section>

                        <section class="form-section">
                            <h3>时间配置</h3>
                            <div class="time-sections">
                                <div class="time-section">
                                    <div class="section-title">
                                        <h4>报名时间</h4>
                                        <span class="hint">设置报名截止时间，用于确定开始分组的时间点</span>
                                    </div>
                                    <div class="form-item">
                                        <label class="required">报名截止</label>
                                        <date-time-input v-model="form.registrationDeadline" placeholder="请选择报名截止时间"
                                            required />
                                    </div>
                                </div>

                                <div class="time-section">
                                    <div class="section-title">
                                        <h4>比赛时间</h4>
                                        <span class="hint">设置比赛时间段，用于赛程智能编排</span>
                                    </div>
                                    <div class="time-config">
                                        <div class="form-group">
                                            <div class="form-row">
                                                <label class="required">比赛时间</label>
                                                <div class="time-range">
                                                    <date-time-input v-model="form.startTime" placeholder="开始时间"
                                                        required />
                                                    <span class="separator">至</span>
                                                    <date-time-input v-model="form.endTime" placeholder="结束时间"
                                                        required />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="form-row">
                                                <label class="required">上午时段</label>
                                                <div class="time-range">
                                                    <time-input v-model="form.amStartTime" placeholder="开始时间" required
                                                        default-time="08:00" />
                                                    <span class="separator">至</span>
                                                    <time-input v-model="form.amEndTime" placeholder="结束时间" required
                                                        default-time="12:00" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="form-row">
                                                <label class="required">下午时段</label>
                                                <div class="time-range">
                                                    <time-input v-model="form.pmStartTime" placeholder="开始时间" required
                                                        default-time="14:00" />
                                                    <span class="separator">至</span>
                                                    <time-input v-model="form.pmEndTime" placeholder="结束时间" required
                                                        default-time="18:00" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="form-section">
                            <h3>团体配置</h3>
                            <div class="time-sections">
                                <div class="time-section">
                                    <div class="section-title">
                                        <h4>基础参数</h4>
                                        <span class="hint">设置团体人数和报名项目的限制</span>
                                    </div>
                                    <div class="form-item">
                                        <label class="required" style="width:120px">团体人数上限</label>
                                        <number-input :value="form.maxPlayers" @input="val => form.maxPlayers = val"
                                            :min="1" :max="10" />
                                    </div>
                                    <div class="form-item">
                                        <label class="required" style="width:120px">报名项目上限</label>
                                        <number-input :value="form.maxEvents" @input="val => form.maxEvents = val"
                                            :min="1" :max="5" />
                                    </div>
                                </div>

                                <div class="time-section">
                                    <div class="section-title">
                                        <h4>级别编号</h4>
                                        <span class="hint">设置系统自动编号的规则，用于生成参赛编号</span>
                                    </div>
                                    <div class="level-config-wrapper">
                                        <div v-for="(level, index) in form.levelConfig" :key="index"
                                            class="level-config-item">
                                            <div class="level-header" @click="handleLevelHeaderClick">
                                                <div class="level-info" @click.stop>
                                                    <el-input v-model="level.field" placeholder="如：学院" size="small" />
                                                    <el-radio-group v-model="level.isNumeric" size="small">
                                                        <el-radio :label="true">纯数字</el-radio>
                                                        <el-radio :label="false">自定义</el-radio>
                                                    </el-radio-group>
                                                </div>
                                                <div class="level-actions">
                                                    <el-button type="text"
                                                        :icon="level.isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                                                    <el-button v-if="index !== 0" type="danger" icon="el-icon-delete"
                                                        circle size="mini" @click.stop="removeLevelConfig(index)" />
                                                </div>
                                            </div>

                                            <div v-show="level.isExpanded" class="level-content">
                                                <template v-if="level.isNumeric">
                                                    <div class="form-item">
                                                        <label>位数限制</label>
                                                        <number-input :value="level.digits"
                                                            @input="val => level.digits = val" :min="1" :max="4" />
                                                    </div>
                                                </template>
                                                <template v-else>
                                                    <div class="value-pairs">
                                                        <div v-for="(pair, pairIndex) in level.valuePairs"
                                                            :key="pairIndex" class="value-pair">
                                                            <el-input v-model="pair.label" placeholder="显示值"
                                                                size="small" />
                                                            <el-input v-model="pair.value" placeholder="实际值"
                                                                size="small" />
                                                            <el-button type="danger" icon="el-icon-delete" circle
                                                                size="mini"
                                                                @click="removeValuePair(index, pairIndex)" />
                                                        </div>
                                                        <el-button type="primary" size="small"
                                                            @click="addValuePair(index)">添加选项</el-button>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>

                                        <div class="add-level">
                                            <el-button type="primary" icon="el-icon-plus"
                                                @click="addLevelConfig">添加级别</el-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="form-section">
                            <div class="section-header">
                                <div class="title-wrapper">
                                    <h3>初始职员</h3>
                                    <el-button type="text" size="large" class="toggle-btn"
                                        @click="showStaff = !showStaff">
                                        {{ showStaff ? '收起' : '展开' }}
                                        <i :class="['el-icon-arrow-' + (showStaff ? 'up' : 'down')]"></i>
                                    </el-button>
                                </div>
                            </div>
                            <transition name="collapse">
                                <div v-show="showStaff" class="staff-list">
                                    <div class="staff-item creator">
                                        <div class="staff-content">
                                            <div class="staff-avatar">
                                                <img :src="form.staff[0].head || defaultAvatar"
                                                    :alt="form.staff[0].username">
                                            </div>
                                            <div class="staff-info">
                                                <div class="staff-name">{{ form.staff[0].name }}</div>
                                                <div class="staff-role">运动会操办者</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="hint-text">
                                        您稍后可在"此运动会"页面完成职员配置
                                    </div>
                                </div>
                            </transition>
                        </section>

                        <div class="form-actions">
                            <el-button @click="$router.back()">取消</el-button>
                            <el-button type="primary" native-type="submit">创建</el-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BaseInput from '@/components/inputs/BaseInput.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import DateTimeInput from '@/components/inputs/DateTimeInput.vue'
import TimeInput from '@/components/inputs/TimeInput.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'
import request from '@/utils/request'
import { updateAuthInfo } from '@/utils/auth'

export default {
    name: 'CreateMeeting',
    components: {
        BaseInput,
        ImageUploader,
        DateTimeInput,
        TimeInput,
        NumberInput,
    },
    data() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        return {
            templates: [],
            selectedTemplate: null,
            showStaff: false,
            defaultAvatar: 'path/to/default-avatar.png',
            staffTypeOptions: [
                { id: 1, name: '用户' },
                { id: 2, name: '团体负责人' },
                { id: 3, name: '裁判' },
                { id: 4, name: '运动员' },
                { id: 5, name: '运动会操办者' }
            ],
            form: {
                name: '',
                cover: '',
                coverFile: null,
                startTime: '',
                endTime: '',
                amStartTime: '08:00',
                amEndTime: '12:00',
                pmStartTime: '14:00',
                pmEndTime: '18:00',
                registrationDeadline: '',
                staff: userInfo.uid ? [{
                    uid: userInfo.uid,
                    name: userInfo.name,
                    head: userInfo.head,
                    userType: [{ id: 5, name: '运动会操办者' }],
                    isCreator: true
                }] : [],
                levelConfig: [{
                    field: '年级',
                    isNumeric: true,
                    digits: 1,
                    isExpanded: true,
                    valuePairs: []
                }],
                maxPlayers: 3,
                maxEvents: 3
            },
            showSuccess: false,
            successDialogVisible: false,
            isEmptyTemplate: false,
            isSubmitting: false,
        }
    },
    async created() {
        await this.fetchTemplates()
        if (this.templates.length > 0) {
            this.templates.push({
                smId: null,
                name: '空模板',
                description: '不使用任何预设配置，完全从头开始创建运动会，配置繁琐。创建后我们会指示您下一步操作',
                img: `data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" fill="none">
                        <rect width="200" height="150" fill="#f5f7fa"/>
                        <circle cx="100" cy="75" r="30" stroke="#409EFF" stroke-width="2"/>
                        <path d="M100 60v30M85 75h30" stroke="#409EFF" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `)}`,
            })
            this.selectTemplate(this.templates[0])
        }
    },
    methods: {
        async fetchTemplates() {
            try {
                const res = await request({
                    url: '/meetingTemplates',
                    method: 'get'
                })
                if (res.code === 1) {
                    if (Array.isArray(res.data)) {
                        this.templates = res.data.map(template => ({
                            ...template,
                            description: template.description || '暂无描述'
                        }))
                    } else {
                        this.templates = res.data ? [{
                            ...res.data,
                            description: res.data.description || '暂无描述'
                        }] : []
                    }
                    if (this.templates.length === 0) {
                        this.$message.info('暂无可用模板')
                    }
                } else {
                    this.$message.warning(res.message || '获取模板列表失败')
                }
            } catch (error) {
                console.error('获取模板失败:', error)
                this.$message.error(error.message || '获取模板失败，请稍后重试')
            }
        },
        selectTemplate(template) {
            this.selectedTemplate = template.smId
            const numberConfig = template.numberConfig ? JSON.parse(template.numberConfig) : []

            this.form = {
                ...this.form,
                name: template.name,
                cover: '',
                startTime: template.startTime || '',
                endTime: template.endTime || '',
                amStartTime: template.amStartTime || '08:00',
                amEndTime: template.amEndTime || '12:00',
                pmStartTime: template.pmStartTime || '14:00',
                pmEndTime: template.pmEndTime || '18:00',
                registrationDeadline: template.registrationDeadline || '',
                maxPlayers: template.maxPlayers || 3,
                maxEvents: template.maxEvents || 3,
                levelConfig: numberConfig.length > 0 ? numberConfig.map(level => ({
                    ...level,
                    valuePairs: level.isNumeric ? [] : level.valueRange.map(([label, value]) => ({ label, value })),
                    isExpanded: true,
                    digits: level.isNumeric ? (level.valueRange.find(item => item[0] === 'digits')?.[1] || 2) : undefined
                })) : [{
                    field: '年级',
                    isNumeric: true,
                    digits: 1,
                    isExpanded: true,
                    valuePairs: []
                }]
            }
        },
        async handleSubmit() {
            try {
                // 添加表单验证
                if (!this.form.name?.trim()) {
                    this.$message.error('请填写运动会名称')
                    return
                }
                if (!this.form.startTime || !this.form.endTime) {
                    this.$message.error('请选择比赛时间')
                    return
                }
                if (!this.form.registrationDeadline) {
                    this.$message.error('请选择报名截止时间')
                    return
                }
                if (!this.form.amStartTime || !this.form.amEndTime) {
                    this.$message.error('请设置上午时段')
                    return
                }
                if (!this.form.pmStartTime || !this.form.pmEndTime) {
                    this.$message.error('请设置下午时段')
                    return
                }
                // 验证人数和项目限制
                if (!this.form.maxPlayers || this.form.maxPlayers < 1) {
                    this.$message.error('请设置有效的团体人数上限')
                    return
                }
                if (!this.form.maxEvents || this.form.maxEvents < 1) {
                    this.$message.error('请设置有效的报名项目上限')
                    return
                }
                // 验证级别编号配置
                if (this.form.levelConfig.length === 0) {
                    this.$message.error('请至少添加一个级别编号配置')
                    return
                }
                for (const level of this.form.levelConfig) {
                    if (!level.field?.trim()) {
                        this.$message.error('请填写所有级别编号的名称')
                        return
                    }
                    if (level.isNumeric && (!level.digits || level.digits < 1)) {
                        this.$message.error(`请为"${level.field}"设置有效的位数限制`)
                        return
                    }
                    if (!level.isNumeric && (!level.valuePairs || level.valuePairs.length === 0)) {
                        this.$message.error(`请为"${level.field}"添加自定义选项`)
                        return
                    }
                }

                // 设置提交状态
                this.isSubmitting = true

                // 原有的提交逻辑
                const formData = new FormData()
                const normalizeDate = (timestamp) => {
                    if (!timestamp || isNaN(timestamp)) {
                        throw new Error('Invalid timestamp')
                    }
                    const time = typeof timestamp === 'string' ?
                        Number(timestamp) : timestamp
                    const date = new Date(time)
                    if (isNaN(date.getTime())) {
                        throw new Error('Invalid date')
                    }
                    return date.toISOString()
                }

                if (!this.form.name) {
                    this.$message.error('请填写运动会名称')
                    return
                }
                if (!this.form.startTime || !this.form.endTime || !this.form.registrationDeadline) {
                    this.$message.error('请填写完整的时间信息')
                    return
                }

                // 添加templateId参数
                if (this.selectedTemplate) {
                    formData.append('templateId', this.selectedTemplate)
                }
                formData.append('name', this.form.name)

                if (this.form.coverFile) {
                    formData.append('cover', this.form.coverFile)
                }

                try {
                    formData.append('startTime', normalizeDate(this.form.startTime))
                    formData.append('endTime', normalizeDate(this.form.endTime))
                    formData.append('registrationDeadline', normalizeDate(this.form.registrationDeadline))
                } catch (error) {
                    console.error('时间格式转换错误:', error)
                    this.$message.error('请检查时间格式是否正确')
                    return
                }

                formData.append('amStartTime', this.form.amStartTime)
                formData.append('amEndTime', this.form.amEndTime)
                formData.append('pmStartTime', this.form.pmStartTime)
                formData.append('pmEndTime', this.form.pmEndTime)

                formData.append('levelConfig', JSON.stringify(this.form.levelConfig))

                formData.append('maxPlayers', this.form.maxPlayers)
                formData.append('maxEvents', this.form.maxEvents)

                const res = await request({
                    url: '/createMeeting',
                    method: 'post',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                if (res.code === 1) {
                    // 更新token信息
                    const [verify, myInfo] = res.data // 解构获取验证信息和用户信息
                    updateAuthInfo(verify, myInfo)

                    this.isEmptyTemplate = !this.selectedTemplate
                    this.showSuccess = true
                    window.scrollTo(0, 0)
                } else {
                    throw new Error(res.message || '创建失败')
                }
            } catch (error) {
                console.error('创建失败:', error)
                this.$message.error(error.message || '创建失败')
            } finally {
                this.isSubmitting = false
            }
        },
        async copyTodoList() {
            const content = this.isEmptyTemplate
                ? `后续需要完成的操作：
1. 在"运动项目"页面发布运动项目
2. 在"裁判评分"页面创建比赛规则并为项目设置对应的比赛规则
3. 在"此运动会"页面邀请团体负责人和裁判注册
4. 裁判注册成功后，在"裁判评分"页面为各比赛分配其对应的裁判`
                : `后续需要完成的操作：
1. 在"此运动会"页面邀请团体负责人和裁判注册
2. 裁判注册成功后，在"裁判评分"页面为各比赛分配其对应的裁判`

            let copied = false

            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(content)
                    copied = true
                } catch (err) {
                    console.warn('Clipboard API failed:', err)
                }
            }

            if (!copied) {
                const textarea = document.createElement('textarea')
                textarea.value = content
                textarea.style.cssText = 'position:fixed; top:-99999px; left:-99999px; opacity:0;'
                document.body.appendChild(textarea)

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    const range = document.createRange()
                    range.selectNodeContents(textarea)
                    const selection = window.getSelection()
                    selection.removeAllRanges()
                    selection.addRange(range)
                    textarea.setSelectionRange(0, 999999)
                } else {
                    textarea.select()
                }

                try {
                    copied = document.execCommand('copy')
                } catch (err) {
                    console.warn('execCommand error:', err)
                    copied = false
                }

                document.body.removeChild(textarea)
            }

            if (copied) {
                this.$message.success('复制成功')
            } else {
                this.$message.warning('复制失败，请手动复制')
            }
        },
        addLevelConfig() {
            this.form.levelConfig.push({
                field: '',
                isNumeric: true,
                digits: 2,
                isExpanded: true,
                valuePairs: []
            })
        },
        removeLevelConfig(index) {
            this.form.levelConfig.splice(index, 1)
        },
        addValuePair(levelIndex) {
            this.form.levelConfig[levelIndex].valuePairs.push({
                label: '',
                value: ''
            })
        },
        removeValuePair(levelIndex, pairIndex) {
            this.form.levelConfig[levelIndex].valuePairs.splice(pairIndex, 1)
        },
        handleLevelHeaderClick(e) {
            if (e.target.closest('.level-info')) return
            const levelIndex = this.form.levelConfig.findIndex(
                level => level.field === e.currentTarget.querySelector('input').value
            )
            if (levelIndex > -1) {
                this.form.levelConfig[levelIndex].isExpanded = !this.form.levelConfig[levelIndex].isExpanded
            }
        }
    }
}
</script>

<style lang="less" scoped>
.create-meeting {
    min-height: 100vh;
    background: #f5f7fa;
    padding-top: 0 !important;

    .page-header {
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 16px 24px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
        display: flex;
        align-items: center;
        gap: 20px;

        h2 {
            margin: 0;
            font-size: 18px;
        }
    }

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
    }

    .template-section {
        margin-bottom: 30px;

        .template-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        .template-card {
            border: 2px solid transparent;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                transform: translateY(-2px);
            }

            &.active {
                border-color: #409EFF;
            }

            img {
                width: 100%;
                height: 150px;
                object-fit: cover;
            }

            .template-info {
                padding: 12px;

                h4 {
                    margin: 0 0 8px;
                }

                p {
                    margin: 0;
                    font-size: 14px;
                    color: #606266;
                }
            }
        }
    }

    .form-section {
        position: relative;
        background: white;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 20px;

        h3 {
            margin-top: 0;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;

                h3 {
                    margin: 0;
                }

                .toggle-btn {
                    font-size: 16px;
                    color: #303133;
                    padding: 4px 8px;

                    i {
                        margin-left: 4px;
                        font-size: 16px;
                        transition: transform 0.3s;
                    }

                    &:hover {
                        color: #409EFF;
                    }
                }
            }
        }
    }

    .form-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 30px;
    }
}

.time-sections {
    .time-section {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        .section-title {
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;

            h4 {
                margin: 0 0 4px 0;
                font-size: 16px;
                color: #303133;
            }

            .hint {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

.time-config {
    .form-group {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }

        .form-row {
            display: flex;
            align-items: flex-start; // 修改对齐方式
            gap: 16px;

            label {
                flex: none;
                width: 80px;
                color: #606266;
                font-size: 14px; // 添加字体大小
                margin-top: 6px; // 添加上边距以对齐输入框

                &.required::after {
                    content: '*';
                    color: #f56c6c;
                    margin-left: 4px;
                }
            }

            .time-range {
                display: flex;
                align-items: center;
                gap: 4px;
                width: 460px; // 限制最大宽度

                .separator {
                    color: #909399;
                    padding: 0 2px;
                    display: none; // 隐藏"至"字
                }

                :deep(.datetime-input),
                :deep(.time-input) {
                    flex: 1;
                    max-width: 230px; // 限制每个输入框的最大宽度
                }
            }
        }
    }
}

.staff-list {
    position: relative;

    .staff-item {
        position: relative;
        margin-bottom: 16px;
        background: white;
        border-radius: 8px;

        &.creator {
            background-color: #f5f7fa;
        }

        .staff-content {
            display: flex;
            align-items: center;
            padding: 16px;
            gap: 16px;
        }

        .staff-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .staff-info {
            position: relative;
            flex: 1;
            min-width: 0;

            .staff-name {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 8px;
            }

            .staff-role {
                font-size: 14px;
                color: #606266;
            }
        }
    }

    .hint-text {
        text-align: center;
        color: #909399;
        font-size: 14px;
        margin-top: 16px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 4px;
    }
}

.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.3s ease-in-out;
    overflow: hidden;
}

.collapse-enter,
.collapse-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.text-button {
    background: none;
    border: none;
    color: #409EFF;
    cursor: pointer;
    padding: 4px 8px;

    &:hover {
        color: #66b1ff;
    }
}

.add-button {
    width: 100%;
    padding: 8px;
    background: #f0f9eb;
    border: 1px dashed #67c23a;
    color: #67c23a;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
        background: #f5faf0;
    }
}

.remove-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #f56c6c;
    cursor: pointer;
    padding: 4px;

    &:hover {
        color: #ff4949;
    }
}

.form-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    label {
        flex: none;
        width: 80px;
        margin-right: 12px;
        color: #606266;
        font-size: 14px;

        // 修改必填星号样式，只对必填项添加
        &.required::after {
            content: '*';
            color: #f56c6c;
            margin-left: 4px;
        }
    }

    :deep(.base-input),
    :deep(.datetime-input),
    :deep(.time-input) {
        flex: 1;
        margin-bottom: 0;
    }
}

.level-config-wrapper {
    padding: 16px 0;
}

.level-config-item {
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    margin-bottom: 16px;

    .level-header {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f5f7fa;
        cursor: pointer;

        &:hover {
            background: #e6e8eb;
        }

        .level-info {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;

            .el-input {
                width: 180px;
                display: -webkit-box;
                display: box;
                -webkit-box-orient: vertical;
                box-orient: vertical;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .level-content {
        padding: 16px;
        border-top: 1px solid #EBEEF5;

        .value-pairs {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .value-pair {
                display: flex;
                gap: 8px;
                align-items: center;

                .el-input {
                    width: 180px;
                    -webkit-line-clamp: 4;

                }
            }
        }
    }
}

.add-level {
    text-align: center;
    margin-top: 16px;
}

.success-wrapper {
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.success-content {
    max-width: 800px;
    margin: 0 auto;

    .success-header {
        text-align: center;
        margin-bottom: 40px;

        i {
            font-size: 56px;
            color: #67c23a;
            margin-bottom: 16px;
        }

        .success-title {
            font-size: 28px;
            color: #67c23a;
            margin: 0;
            font-weight: 500;
        }
    }

    .content-body {
        counter-reset: item;
        background: #f8f9fa;
        padding: 24px;
        border-radius: 8px;
        margin: 24px 0;

        p {
            margin: 16px 0;
            color: #303133;
            font-size: 16px;
            font-weight: 500;
        }

        .todo-list {
            margin: 24px 0;
            padding-left: 24px;
            list-style: none;

            li {
                margin-bottom: 16px;
                color: #606266;
                line-height: 1.6;
                font-size: 16px;
                position: relative;
                padding-left: 28px;

                &::before {
                    content: counter(item) ".";
                    counter-increment: item;
                    position: absolute;
                    left: 0;
                    color: #409EFF;
                    font-weight: 500;
                }
            }
        }
    }

    .action-buttons {
        text-align: center;
        margin-top: 40px;
        display: flex;
        justify-content: center;
        gap: 16px;

        .el-button {
            padding: 12px 24px;
            font-size: 16px;
        }
    }
}

// 添加加载动画样式
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease;

    .loading-content {
        text-align: center;
        padding: 30px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        i {
            font-size: 32px;
            color: #409EFF;
            margin-bottom: 16px;
        }

        p {
            margin: 0;
            color: #606266;
            font-size: 16px;
        }
    }
}

// 添加成功页面动画
.success-fade-enter-active {
    animation: slideDown 0.5s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.main-content {
    position: relative;
    z-index: 1;
}

@media (max-width: 768px) {
    .create-meeting {
        .content-wrapper {
            padding: 16px;
        }

        .page-header {
            padding: 12px 16px;
        }

        .form-section {
            padding: 16px;
        }

        .template-section {
            .template-list {
                display: flex;
                overflow-x: auto;
                padding: 10px 4px;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                gap: 12px;

                &::-webkit-scrollbar {
                    height: 4px;
                }

                &::-webkit-scrollbar-thumb {
                    background: #dcdfe6;
                    border-radius: 2px;
                }

                .template-card {
                    flex: 0 0 200px;
                    scroll-snap-align: start;

                    img {
                        height: 120px;
                    }

                    .template-info {
                        padding: 8px;

                        h4 {
                            font-size: 14px;
                            margin-bottom: 4px;
                        }

                        p {
                            font-size: 12px;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                    }
                }
            }
        }
    }

    .form-item,
    .time-config .form-group .form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;

        label {
            width: auto;
            margin-bottom: 4px;
        }

        .time-range {
            width: 100%;
            flex-direction: column;

            :deep(.datetime-input),
            :deep(.time-input) {
                max-width: 100%;
            }
        }
    }

    // 修复报名截止时间输入框溢出
    :deep(.datetime-input) {
        width: 100%;

        .el-input {
            width: 100%;
        }
    }
}
</style>
