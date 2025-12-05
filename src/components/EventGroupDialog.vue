<template>
    <el-form :model="formData" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="比赛场地" prop="venue">
            <el-select v-model="formData.venue" placeholder="请选择比赛场地">
                <el-option v-for="venue in venues" :key="venue" :label="venue" :value="venue">
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    props: {
        venues: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            formData: {
                venue: ''
            },
            rules: {
                venue: [
                    { required: true, message: '请选择比赛场地', trigger: 'change' }
                ]
            }
        }
    }
}
</script>
