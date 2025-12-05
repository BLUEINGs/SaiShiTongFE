<template>
    <div class="login-register">
        <div class="form-container">
            <!-- 表单标题 -->
            <h2>{{ isLogin ? '登录' : '注册' }}</h2>

            <!-- 登录表单 -->
            <el-form v-if="isLogin" ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">
                <!-- 登录错误提示 -->
                <div v-if="loginError" class="error-message">
                    <i class="el-icon-warning"></i>
                    <span>{{ loginError }}</span>
                </div>
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"
                        placeholder="密码"></el-input>
                </el-form-item>
                <el-form-item prop="captcha">
                    <div class="captcha-container">
                        <el-input v-model="loginForm.captcha" placeholder="请输入验证码"></el-input>
                        <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" :alt="'验证码: ' + captchaText">
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" class="submit-btn">登录</el-button>
                </el-form-item>
            </el-form>

            <!-- 注册表单 -->
            <el-form v-else ref="registerForm" :model="registerForm" :rules="registerRules" label-width="0">
                <!-- 注册错误提示 -->
                <div v-if="registerError" class="error-message">
                    <i class="el-icon-warning"></i>
                    <span>{{ registerError }}</span>
                </div>
                <el-form-item prop="name">
                    <el-input v-model="registerForm.name" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" prefix-icon="el-icon-lock" type="password"
                        placeholder="密码"></el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" prefix-icon="el-icon-lock" type="password"
                        placeholder="确认密码"></el-input>
                </el-form-item>

                <!-- 加入组织（可选） -->
                <div class="join-org" v-if="!isLogin">
                    <el-checkbox v-model="registerForm.wantJoin">
                        加入团体
                    </el-checkbox>
                </div>

                <!-- 身份选择（仅当选择加入组织时显示） -->
                <el-form-item v-if="registerForm.wantJoin && !isLogin" prop="userType">
                    <el-checkbox-group v-model="registerForm.userType">
                        <el-checkbox :label="2">团体负责人</el-checkbox>
                        <el-checkbox :label="3">裁判</el-checkbox>
                        <el-checkbox :label="4">运动员</el-checkbox>
                        <el-checkbox :label="5">运动会操办者</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <!-- 邀请码（仅当选择加入组织时显示） -->
                <el-form-item v-if="registerForm.wantJoin" prop="inviteCode">
                    <el-input v-model="registerForm.inviteCode" prefix-icon="el-icon-key"
                        :placeholder="`请输入邀请码`"></el-input>
                </el-form-item>

                <el-form-item prop="captcha">
                    <div class="captcha-container">
                        <el-input v-model="registerForm.captcha" placeholder="请输入验证码"></el-input>
                        <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" :alt="'验证码: ' + captchaText">
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleRegister" class="submit-btn">注册</el-button>
                </el-form-item>
            </el-form>

            <!-- 切换登录/注册 -->
            <div class="switch-form">
                <span @click="toggleForm">
                    {{ isLogin ? '没有账号？立即注册' : '已有账号？立即登录' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request'
import { updateAuthInfo } from '@/utils/auth'

export default {
    name: 'LoginRegister',
    components: {
        // VueCaptcha
    },
    data() {
        // 密码验证规则
        const validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'))
            } else if (value.length < 6) {
                callback(new Error('密码不能少于6个字符'))
            } else {
                if (this.registerForm.confirmPassword !== '') {
                    this.$refs.registerForm.validateField('confirmPassword')
                }
                callback()
            }
        }

        // 确认密码验证规则
        const validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }

        return {
            isLogin: true,
            captchaUrl: '', // 验证码图片URL
            captchaText: '', // 存储正确的验证码文本
            loginForm: {
                username: '',
                password: '',
                captcha: ''
            },
            registerForm: {
                name: '',
                password: '',
                confirmPassword: '',
                userType: [], // 确保默认值是空数组
                wantJoin: false,
                inviteCode: '',
                captcha: ''
            },
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' }
                ],
                captcha: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
                ]
            },
            registerRules: {
                name: [ // 改为 name
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, validator: validatePass, trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, validator: validatePass2, trigger: 'blur' }
                ],
                userType: [
                    {
                        type: 'array',
                        required: true,
                        message: '请至少选择一种身份',
                        trigger: 'change',
                        validator: (rule, value, callback) => {
                            if (this.registerForm.wantJoin && (!value || value.length === 0)) {
                                callback(new Error('请至少选择一种身份'))
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                inviteCode: [
                    {
                        required: true,
                        message: '请输入邀请码',
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (this.registerForm.wantJoin && !value) {
                                callback(new Error('请输入邀请码'))
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                captcha: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
                ]
            },
            loginError: '', // 添加登录错误信息
            registerError: '' // 添加注册错误信息
        }
    },
    watch: {
        'registerForm.wantJoin'(newVal) {
            if (!newVal) {
                // 修改重置逻辑，确保重置为空数组而不是空字符串
                this.registerForm.userType = []
                this.registerForm.inviteCode = ''
            }
        }
    },
    methods: {
        // 生成随机验证码
        generateCaptcha() {
            const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            let captcha = ''
            for (let i = 0; i < 4; i++) {
                captcha += chars[Math.floor(Math.random() * chars.length)]
            }
            return captcha
        },

        // 绘制验证码
        drawCaptcha() {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = 120
            canvas.height = 40

            // 填充背景色
            ctx.fillStyle = '#f5f7fa'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // 生成新的验证码文本
            this.captchaText = this.generateCaptcha()

            // 绘制文字
            ctx.font = 'bold 24px Arial'
            ctx.fillStyle = '#666'
            ctx.textBaseline = 'middle'

            // 随机旋转每个字符
            for (let i = 0; i < this.captchaText.length; i++) {
                const x = 20 + i * 25
                const y = 20
                const char = this.captchaText[i]
                const rotate = (Math.random() - 0.5) * 0.3

                ctx.save()
                ctx.translate(x, y)
                ctx.rotate(rotate)
                ctx.fillText(char, 0, 0)
                ctx.restore()
            }

            // 添加干扰线
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`
                ctx.beginPath()
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
                ctx.stroke()
            }

            // 添加干扰点
            for (let i = 0; i < 30; i++) {
                ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`
                ctx.beginPath()
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
                ctx.fill()
            }

            return canvas.toDataURL()
        },

        // 刷新验证码
        refreshCaptcha() {
            this.captchaUrl = this.drawCaptcha()
        },

        // 切换登录/注册表单
        toggleForm() {
            this.isLogin = !this.isLogin
            this.$nextTick(() => {
                this.refreshCaptcha()
            })
        },

        // 处理登录
        async handleLogin() {
            this.loginError = '' // 清除之前的错误
            try {
                const valid = await this.$refs.loginForm.validate()
                if (valid) {
                    // 验证码检查
                    if (this.loginForm.captcha.toLowerCase() !== this.captchaText.toLowerCase()) {
                        this.loginError = '验证码错误'
                        this.refreshCaptcha()
                        return
                    }

                    const params = new URLSearchParams()
                    params.append('username', this.loginForm.username)
                    params.append('password', this.loginForm.password)

                    const res = await request({
                        url: '/login',
                        method: 'post',
                        data: params
                    })

                    if (res.code === 1) {
                        const [verify, myInfo] = res.data // 解构获取验证信息和用户信息
                        updateAuthInfo(verify, myInfo)

                        this.$message.success('登录成功')
                        this.$router.push('/')
                    } else {
                        // 处理具体错误类型
                        if (res.message === 'NO_EXIST_USER') {
                            this.loginError = '用户名或密码错误'
                        } else {
                            this.loginError = res.msg || '登录失败'
                        }
                        this.refreshCaptcha()
                    }
                }
            } catch (error) {
                console.error('登录失败:', error)
                this.loginError = '登录失败，请稍后重试'
                this.refreshCaptcha()
            }
        },

        // 处理注册
        async handleRegister() {
            this.registerError = '' // 清除之前的错误
            try {
                const valid = await this.$refs.registerForm.validate()
                if (valid) {
                    // 验证码检查
                    if (this.registerForm.captcha.toLowerCase() !== this.captchaText.toLowerCase()) {
                        this.registerError = '验证码错误'
                        this.refreshCaptcha()
                        return
                    }

                    const params = new URLSearchParams()
                    params.append('name', this.registerForm.name)
                    params.append('password', this.registerForm.password)

                    // 确保 userType 是数组后再进行遍历
                    const userTypes = Array.isArray(this.registerForm.userType) ? this.registerForm.userType : []
                    userTypes.forEach(type => {
                        params.append('userType', type)
                    })

                    params.append('joinOrganization', this.registerForm.wantJoin)

                    if (this.registerForm.wantJoin) {
                        params.append('inviteCode', this.registerForm.inviteCode)
                    }

                    const res = await request({
                        url: '/register',
                        method: 'post',
                        data: params,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })

                    // console.log('注册响应:', res)

                    if (res.code === 1) {
                        this.$message.success(res.data || '注册成功')
                        this.isLogin = true // 直接切换到登录页面
                    } else {
                        // 处理具体错误类型
                        switch (res.message) {
                            case 'INVALID_CODE':
                                this.registerError = res.data
                                break
                            case 'NAME_DUPLICATE':
                                this.registerError = res.data
                                break
                            default:
                                this.registerError = res.data
                        }
                        this.refreshCaptcha()
                    }
                }
            } catch (error) {
                console.error('注册失败:', error)
                this.registerError = '注册失败，请稍后重试'
                this.refreshCaptcha()
            }
        }
    },
    mounted() {
        this.refreshCaptcha()
    },
    created() {
        // 从 URL 参数中获取错误信息
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        if (error) {
            this.loginError = decodeURIComponent(error);
            this.isLogin = true; // 确保显示登录表单
        }
    }
}
</script>

<style lang="less" scoped>
.login-register {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fa;
    background-image: linear-gradient(90deg, rgba(48, 65, 86, 0.1) 3%, transparent 0),
        linear-gradient(1turn, rgba(48, 65, 86, 0.1) 3%, transparent 0);
    background-size: 20px 20px;
    background-position: center;

    .form-container {
        width: 400px;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(48, 65, 86, 0.1);
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #304156, #409EFF);
        }

        h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #304156;
            font-size: 24px;
            font-weight: 500;
        }

        .el-input {
            .el-input__inner {
                border-radius: 4px;
                border: 1px solid #dcdfe6;

                &:focus {
                    border-color: #409EFF;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                }
            }
        }

        .captcha-container {
            display: flex;
            gap: 10px;

            .el-input {
                flex: 1;
            }

            .captcha-img {
                height: 40px;
                cursor: pointer;
                border-radius: 4px;
            }

            .captcha-comp {
                cursor: pointer;
                border-radius: 4px;
                overflow: hidden;
            }
        }

        .submit-btn {
            width: 100%;
            height: 40px;
            border-radius: 4px;
            font-weight: 500;
            letter-spacing: 1px;
        }

        .join-org {
            margin: 20px 0;
            padding: 15px;
            background: #f5f7fa;
            border-radius: 4px;
            border-left: 3px solid #409EFF;
        }

        .switch-form {
            margin-top: 24px;
            text-align: center;
            color: #606266;
            font-size: 14px;

            span {
                cursor: pointer;
                transition: color 0.3s;

                &:hover {
                    color: #409EFF;
                }
            }
        }

        .el-checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .error-message {
            margin: -10px 0 20px;
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

        @media screen and (max-width: 520px) {
            width: 100%;
            height: 100%;
            padding: 20px;
            border-radius: 0;
            display: flex;
            flex-direction: column;

            h2 {
                margin: 40px 0;
            }

            .el-form-item {
                margin-bottom: 20px;
            }

            .el-input__inner {
                height: 50px;
                font-size: 16px;
            }

            .captcha-container {
                .el-input {
                    flex: 2;
                }

                .captcha-img {
                    height: 50px;
                    width: 120px;
                }
            }

            .submit-btn {
                height: 50px;
                font-size: 18px;
                margin-top: 20px;
            }

            .switch-form {
                margin-top: auto;
                padding: 20px 0;
                font-size: 16px;
            }

            .el-checkbox-group {
                gap: 15px;

                .el-checkbox {
                    margin-right: 0;
                    width: 100%;

                    /deep/ .el-checkbox__label {
                        font-size: 16px;
                    }
                }
            }

            .join-org {
                margin: 25px 0;
                padding: 20px;

                .el-checkbox {
                    width: 100%;

                    /deep/ .el-checkbox__label {
                        font-size: 16px;
                    }
                }
            }

            .error-message {
                margin: 0 0 25px;
                padding: 12px 15px;
                font-size: 15px;

                i {
                    font-size: 18px;
                }
            }
        }
    }
}
</style>
