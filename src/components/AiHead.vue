<template>
  <div class="header-container">
    <div class="ai-head">
      <div class="title">智能裁判</div>
      <button @click="showForm = true" class="add-button">
        <i class="icon">+</i>
      </button>
    </div>

    <!-- 加载状态提示 -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <add-match-form :visible.sync="showForm" @submit="handleSubmit" @cancel="showForm = false" />
  </div>
</template>

<script>
import request from '@/utils/request'; // 导入封装的request
import AddMatchForm from './AddMatchForm.vue';

export default {
  components: { AddMatchForm },
  data() {
    return {
      showForm: false,
      isSubmitting: false
    }
  },
  methods: {
    async handleSubmit(formData) {
      this.isSubmitting = true;

      try {
        // 转换时间字段为JISO格式
        const convertedFormData = { ...formData };
        //此时已经将输入的数据封装在了convertedFormData中
        for (const key in convertedFormData) {
          if (key.includes('Time') && convertedFormData[key]) {
            convertedFormData[key] = new Date(convertedFormData[key]).toISOString();
          }
        }
        //此时在转换convertedFormData中格式

        const res = await request({
          method: 'post',
          url: '/saishitong/basketballGame/information',
          data: convertedFormData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        console.log('提交成功:', res);

        if (res.code === '1') {
          this.$message.success(`创建成功: ${res.message}`);
        } else {
          this.$message.error(`操作失败: ${res.message}`);
        }

        this.showForm = false;
      } catch (error) {
        console.error('提交失败:', error);
        this.$message.error(error.message || '请求失败');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.header-container {
  position: relative;
}

.ai-head {
  background: rgba(182, 203, 236, 0.68);
  color: white;
  height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 0 40px;
  width: 75%;
  margin: 0 auto;
  border-radius: 30px;
  position: relative;
  z-index: 10;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.add-button {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-button:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.icon {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .ai-head {
    height: 60px;
    padding: 0 20px;
  }

  .title {
    font-size: 18px;
  }

  .add-button {
    width: 35px;
    height: 35px;
  }
}
</style>