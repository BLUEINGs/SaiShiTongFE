<template>
    <div class="url-setting">
        <el-form :model="form" ref="form" label-width="120px">
            <el-form-item label="后端地址" prop="baseURL">
                <el-input v-model="form.baseURL" placeholder="例如: http://localhost:8080">
                    <el-button slot="append" @click="testConnection">测试连接</el-button>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'UrlSetting',
    data() {
        return {
            form: {
                baseURL: localStorage.getItem('baseURL') || 'http://http://8.140.62.7:8080'
            }
        }
    },
    methods: {
        async testConnection() {
            try {
                const res = await axios.get(`${this.form.baseURL}/ping`)
                if (res.status === 200) {
                    this.$message.success('连接成功')
                }
            } catch (error) {
                this.$message.error('连接失败')
            }
        },
        async handleSave() {
            try {
                localStorage.setItem('baseURL', this.form.baseURL)
                this.$message.success('保存成功')
            } catch (error) {
                this.$message.error('保存失败')
                console.error('保存失败:', error)
            }
        }
    }
}
</script>

<style scoped>
.url-setting {
    max-width: 600px;
}
</style>
