<template>
    <div class="system-settings">
        <h2>系统设置</h2>
        <el-divider content-position="left">后端服务器设置</el-divider>
        <url-setting />
    </div>
</template>

<script>
import UrlSetting from '@/components/UrlSetting.vue'

export default {
    name: 'SystemSettings',
    components: {
        UrlSetting
    }
}
</script>

<style scoped>
.system-settings {
    padding: 20px;
    text-align: left;
}
</style>
