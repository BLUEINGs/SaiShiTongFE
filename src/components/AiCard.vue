<template>
  <div class="card" :class="{ 'disabled': !isActive }" @click="handleCardClick" :data-id="this.spId">
    <!-- 比赛ID显示 -->
    <div class="match-id">
      #{{ idDisplay }}
    </div>

    <!-- 可点击提示（仅状态为1时显示） -->
    <div v-if="isActive" class="click-hint">
      <i class="fas fa-hand-pointer"></i> 点击观看直播
    </div>

    <!-- 卡片顶部装饰 -->
    <div class="card-decoration">
      <div class="decoration-circle c1"></div>
      <div class="decoration-circle c2"></div>
      <div class="decoration-circle c3"></div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 赛事名称 -->
      <h2 class="match-name">{{ name }}</h2>

      <!-- 时间信息 -->
      <div class="time-info">
        <div class="time-row">
          <div class="time-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="time-text">
            <div class="time-label">开始时间</div>
            <div class="time-value">{{ formatDateTime(startTime) }}</div>
          </div>
        </div>

        <div class="divider-line"></div>

        <div class="time-row">
          <div class="time-icon">
            <i class="el-icon-timer"></i>
          </div>
          <div class="time-text">
            <div class="time-label">结束时间</div>
            <div class="time-value">{{ formatDateTime(endTime) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="status-indicator" :class="'status-' + state">
      {{ getStatusText(state) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchCard',
  props: {
    spId: {
      type: [String, Number],
      required: true
    },
    name: {
      type: String,
      default: '未命名比赛'
    },
    startTime: {
      type: String,
      default: ''
    },
    endTime: {
      type: String,
      default: ''
    },
    state: {
      type: [String, Number],
      default: 0,
      validator: value => [0, 1, 2, '0', '1', '2'].includes(value)
    }
  },
  computed: {
    idDisplay() {
      // 直接返回ID，因为后端返回的就是数字ID
      return this.spId;
    },
    isActive() {
      // 同时支持字符串和数字类型的状态判断
      return String(this.state) === '1' || this.state === 1;
    }
  },
  methods: {
    handleCardClick() {
      if (!this.isActive) return;

      // 直接导航到 AiJudge 页面
      this.$router.push(`/ai-judge/${this.spId}`);
    },
    formatDateTime(datetime) {
      if (!datetime) return '未指定';
      const date = new Date(datetime);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
    },
    getStatusText(stateCode) {
      // 将状态码转为字符串进行统一处理
      const code = String(stateCode);
      const statusMap = {
        '0': '未开始',
        '1': '进行中',
        '2': '已完成'
      };
      return statusMap[code] || '未知状态';
    }
  }
}
</script>

<style scoped>
/* AiCard - tightened visuals, smaller radius, subtler hover */
.card {
  width: 100%;
  height: 260px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);
  transition: transform 0.25s cubic-bezier(.2, .9, .3, 1), box-shadow 0.25s ease, opacity 0.2s ease;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.card.disabled {
  cursor: not-allowed;
  opacity: 0.78;
}

.match-id {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 0.85em;
  font-weight: 600;
  color: #4c51bf;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  z-index: 2;
}

.card-decoration {
  height: 50px;
  background: linear-gradient(135deg, #5260d6 0%, #4c51bf 100%);
  position: relative;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.decoration-circle.c1 {
  width: 80px;
  height: 80px;
  top: -30px;
  left: -10px;
  opacity: 0.95;
}

.decoration-circle.c2 {
  width: 60px;
  height: 60px;
  bottom: -20px;
  right: 22px;
  opacity: 0.9;
}

.decoration-circle.c3 {
  width: 40px;
  height: 40px;
  top: 12px;
  right: -8px;
  opacity: 0.95;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.match-name {
  color: #1f2d3d;
  margin-bottom: 18px;
  font-size: 1.45em;
  text-align: center;
  font-weight: 700;
  line-height: 1.25;
  padding: 0 12px;
}

.time-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.card.disabled .time-info {
  background: #f7f9fc;
}

.time-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.divider-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 6px 0;
}

.time-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(90, 103, 216, 0.08);
  border-radius: 8px;
  color: #4f5bd6;
  font-size: 16px;
  margin-right: 12px;
}

.time-label {
  color: #718096;
  font-size: 0.85em;
  font-weight: 600;
  margin-bottom: 2px;
}

.time-value {
  color: #2d3748;
  font-weight: 600;
  font-size: 1.05em;
  letter-spacing: 0.3px;
}

.status-indicator {
  position: absolute;
  bottom: 18px;
  right: 20px;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 0.9em;
  font-weight: 700;
  letter-spacing: 0.6px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.status-0 {
  color: #718096;
  background: rgba(113, 128, 150, 0.08);
}

.status-1 {
  color: #48bb78;
  background: rgba(72, 187, 120, 0.08);
}

.status-2 {
  color: #4299e1;
  background: rgba(66, 153, 225, 0.08);
}

.card:hover .status-indicator {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);
}

.click-hint {
  position: absolute;
  bottom: 18px;
  left: 18px;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 16px;
  color: #48bb78;
  background: rgba(72, 187, 120, 0.12);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s, transform 0.25s;
}

.card:hover .click-hint {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width:1080px) {
  .match-name {
    font-size: 1.35em;
  }

  .card {
    height: 250px;
  }
}

@media (max-width:768px) {
  .card {
    width: 95%;
    margin: 0 auto;
    height: 240px;
  }

  .match-name {
    font-size: 1.3em;
  }
}

@media (max-width:480px) {
  .status-indicator {
    right: 15px;
    bottom: 15px;
    padding: 6px 15px;
    font-size: 0.85em;
  }

  .card-content {
    padding: 15px;
  }

  .time-info {
    padding: 10px;
  }

  .card {
    height: 230px;
  }

  .click-hint {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}
</style>