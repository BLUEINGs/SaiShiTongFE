<template>
  <div class="ai-score-book-card" :class="{ 'highlight': isLatest }">
    <div class="card-main">
      <div class="team-score-row">
        <span class="team-tag" :style="teamColorStyle">{{ record.team }}</span>
        <span class="score-text">+{{ record.score }}分</span>
        <!-- 新增时间显示 -->
        <span class="time-text">{{ record.time }}</span>
      </div>
      
      <!-- 语音播报组件 -->
      <ai-score-broadcast
        :score="record.score"
        :trigger-broadcast="showBroadcast"
      />
    </div>
  </div>
</template>

<script>
import AiScoreBroadcast from './AiScoreBroadcast.vue';

export default {
  name: 'AiScoreBookCard',
  components: { 
    AiScoreBroadcast 
  },
  props: {
    // 计分记录对象
    record: {
      type: Object,
      required: true,
      validator: (value) => {
        // 验证对象必须包含team、score和time字段
        return 'team' in value && 'score' in value && 'time' in value;
      }
    },
    // 是否是最新记录（需要高亮显示）
    isLatest: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 根据队伍设置不同的颜色样式
    teamColorStyle() {
      return {
        color: this.record.team === 'A队' ? '#2196F3' : '#f44336'
      };
    },
    // 触发播报的条件：仅当分数为1、2或3分时
    showBroadcast() {
      // 只触发1、2、3分的播报
      return [1, 2, 3].includes(this.record.score);
    }
  }
};
</script>

<style scoped>
.ai-score-book-card {
  background: white;
  padding: 12px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  min-height: 60px;
  margin-bottom: 10px;
}

/* 最新记录高亮样式 */
.ai-score-book-card.highlight {
  background: #fff8e1;
  border-left: 4px solid #ffb300;
}

.card-main {
  width: 100%;
}

.team-score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.team-tag {
  font-weight: bold;
  font-size: 1em;
  white-space: nowrap;
}

.score-text {
  font-size: 1.2em;
  color: #2c3e50;
  font-weight: 600;
  white-space: nowrap;
}

/* 新增时间样式 */
.time-text {
  margin-left: auto; /* 右对齐 */
  font-size: 0.9em;
  color: #7e8c9a;
  white-space: nowrap;
}
</style>