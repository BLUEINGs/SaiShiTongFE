<template>
    <div class="event-management">
        // ...existing code...

        <!-- 浮动操作按钮 -->
        <div v-if="isEditMode" class="floating-buttons">
            <el-button type="primary" icon="el-icon-setting" circle @click="showConfig"></el-button>
        </div>

        <!-- 参数配置对话框 -->
        <responsive-dialog title="参数配置" :visible.sync="configDialogVisible" width="500px" @confirm="saveConfig"
            @cancel="configDialogVisible = false">
            <div class="venues-config">
                <div class="header">
                    <h3>比赛场地管理</h3>
                    <el-button type="primary" size="small" @click="addVenue">
                        添加场地
                    </el-button>
                </div>
                <div class="venues-list">
                    <el-tag v-for="(venue, index) in venues" :key="index" closable :disable-transitions="false"
                        @close="handleDeleteVenue(index)" class="venue-tag">
                        {{ venue }}
                    </el-tag>
                </div>
                <div class="venue-input" v-if="showAddVenue">
                    <el-input v-model="newVenue" ref="newVenueInput" size="small" @keyup.enter.native="handleAddVenue"
                        @blur="handleAddVenue" placeholder="请输入场地名称">
                        <template slot="append">
                            <el-button size="small" @click="handleAddVenue">确定</el-button>
                        </template>
                    </el-input>
                </div>
            </div>
        </responsive-dialog>

        // ...existing code...
    </div>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'

export default {
    name: 'EventManagement',
    components: {
        ResponsiveDialog
        // ...其他组件
    },
    data() {
        return {
            // ...existing data...

            // 场地配置相关
            configDialogVisible: false,
            venues: ['主田径场', '副田径场', '室内体育馆', '训练场'],  // 默认场地
            showAddVenue: false,
            newVenue: '',
        }
    },
    methods: {
        // ...existing methods...

        // 显示配置对话框
        showConfig() {
            this.configDialogVisible = true;
        },

        // 保存配置
        saveConfig() {
            // 这里可以调用API保存场地配置
            this.configDialogVisible = false;
            this.$message.success('保存成功');
        },

        // 添加场地相关方法
        addVenue() {
            this.showAddVenue = true;
            this.$nextTick(() => {
                this.$refs.newVenueInput.focus();
            });
        },

        handleAddVenue() {
            if (this.newVenue) {
                if (!this.venues.includes(this.newVenue)) {
                    this.venues.push(this.newVenue);
                }
                this.newVenue = '';
                this.showAddVenue = false;
            }
        },

        handleDeleteVenue(index) {
            this.$confirm('确定要删除该场地吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.venues.splice(index, 1);
            }).catch(() => { });
        }
    }
}
</script>

<style lang="less" scoped>
/* .event-management {
    // ...existing styles...
} */

/* 浮动操作按钮 */
.floating-buttons {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

/* 场地配置样式 */
.venues-config {
    padding: 20px;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
            margin: 0;
        }
    }

    .venues-list {
        margin-bottom: 15px;
        min-height: 32px;

        .venue-tag {
            margin: 0 8px 8px 0;
        }
    }

    .venue-input {
        margin-top: 10px;
    }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
    .venues-config {
        padding: 15px;

        .header {
            margin-bottom: 15px;
        }
    }
}
</style>
