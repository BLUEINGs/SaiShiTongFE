<template>
  <div class="sport-description">
    <!-- 显示所有比赛信息 -->
    <div v-for="match in sortedMatches" :key="match.type" class="match-container" :class="{
      'active': match.status === 'ongoing',
      'finished': match.status === 'finished',
      'upcoming': match.status === 'upcoming'
    }">
      <!-- 顶部显示比赛节次和状态 -->
      <div class="session-label">
        <span>第{{ match.type }}节比赛</span>
        <span class="match-status" :class="match.status">
          {{ getStatusText(match.status) }}
        </span>
      </div>

      <!-- 时间范围 -->
      <div class="time-range">
        <div class="time-box start-time">
          <span class="time-label">开始:</span>
          <span class="time-value">{{ formatDate(match.startTime, 'time') }}</span>
        </div>
        <div class="time-divider">-</div>
        <div class="time-box end-time">
          <span class="time-label">结束:</span>
          <span class="time-value">{{ formatDate(match.endTime, 'time') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'SportMatchDisplay',

  // 添加props接收父组件传递的回调函数
  props: {
    onMatchChange: {
      type: Function,
      default: () => { }
    },
    spId: {
      type: String,
    }
  },

  data() {
    return {
      matches: [],        // 存储所有比赛数据
      intervalId: null,   // 定时器ID
      serverTimeOffset: 0 // 服务器时间偏移量
    }
  },

  mounted() {
    this.fetchScoreData();
    this.intervalId = setInterval(() => {
      this.updateMatchesStatus(); // 每5秒更新比赛状态
    }, 5000);
  },

  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  computed: {
    // 根据状态排序的比赛列表
    sortedMatches() {
      const matches = this.matches.map(match => ({
        ...match,
        status: this.getMatchStatus(match)
      }));

      return matches.sort((a, b) => {
        // 状态权重
        const statusWeight = {
          'ongoing': 0,
          'upcoming': 1,
          'finished': 2
        };

        // 先按状态排序
        const statusDiff = statusWeight[a.status] - statusWeight[b.status];
        if (statusDiff !== 0) return statusDiff;

        // 状态相同时按节次排序
        return a.type - b.type;
      });
    },

    // 获取当前时间（考虑服务器时间偏移）
    currentTime() {
      return new Date(Date.now() + this.serverTimeOffset);
    }
  },

  methods: {
    // 获取比赛数据
    async fetchScoreData() {
      try {
        const response = await request({
          url: '/saishitong/schedule',
          method: 'get',
          params: { spId: this.spId }
        });

        this.handleResponse(response);
      } catch (error) {
        console.error('获取比赛数据失败:', error.message || '未知错误');
      }
    },

    // 处理API响应
    handleResponse(response) {
      if (response?.code === 1) {
        this.matches = response?.data?.list || [];
        this.updateMatchesStatus(); // 更新比赛状态
      } else {
        console.warn('API返回异常:', response?.message || '未知错误');
      }
    },

    // 更新所有比赛的状态
    updateMatchesStatus() {
      if (!this.matches.length) return;

      // 更新会触发计算属性重新计算
      this.matches = [...this.matches];
    },

    // 获取比赛状态
    getMatchStatus(match) {
      try {
        const now = this.currentTime;
        const startTime = new Date(match.startTime);
        const endTime = new Date(match.endTime);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return 'upcoming';
        }

        if (now < startTime) return 'upcoming';
        if (now > endTime) return 'finished';
        return 'ongoing';
      } catch (e) {
        console.error('计算比赛状态失败:', e);
        return 'upcoming';
      }
    },

    // 获取状态显示文本
    getStatusText(status) {
      const statusMap = {
        'ongoing': '正在进行',
        'upcoming': '即将开始',
        'finished': '已结束'
      };
      return statusMap[status] || '未知状态';
    },

    // 格式化日期时间
    formatDate(utcString, formatType = 'both') {
      if (!utcString) {
        return formatType === 'both' ? '--/-- --:--' :
          formatType === 'date' ? '--/--' : '--:--';
      }

      // 创建日期对象
      let dateObj;
      try {
        dateObj = new Date(utcString);
      } catch (e) {
        console.error('时间解析失败:', utcString);
        return '--:--';
      }

      // 验证日期有效性
      if (!dateObj || isNaN(dateObj.getTime())) {
        return this.extractTimeFromString(utcString, formatType);
      }

      // 格式化日期和时间
      return this.formatDateComponents(dateObj, formatType);
    },

    // 从字符串提取时间
    extractTimeFromString(utcString, formatType) {
      try {
        if (utcString.length >= 19) {
          const datePart = utcString.substr(5, 5).replace('-', '/'); // MM/DD
          const timePart = utcString.substr(11, 5); // HH:mm

          if (formatType === 'date') return datePart;
          if (formatType === 'time') return timePart;
          return `${datePart} ${timePart}`;
        }
        return formatType === 'date' ? '--/--' : '--:--';
      } catch (error) {
        return formatType === 'date' ? '--/--' : '--:--';
      }
    },

    // 格式化日期组件
    formatDateComponents(date, formatType) {
      const padZero = num => num.toString().padStart(2, '0');

      const month = padZero(date.getMonth() + 1);
      const day = padZero(date.getDate());
      const hours = padZero(date.getHours());
      const minutes = padZero(date.getMinutes());

      if (formatType === 'date') return `${month}/${day}`;
      if (formatType === 'time') return `${hours}:${minutes}`;
      return `${month}/${day} ${hours}:${minutes}`;
    }
  }
};
</script>

<style scoped>
.sport-description {
  background: #ffffff;
  color: #333;
  font-family: 'Segoe UI', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.match-container {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  gap: 12px;
  height: 32px;
}

.session-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.session-label span:first-child {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d8cf0;
}

.time-range {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.85rem;
}

.time-box {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-label {
  color: #999;
  font-size: 0.85rem;
}

.time-value,
.date-value {
  display: inline;
  color: #666;
  font-size: 0.85rem;
}

.time-divider {
  color: #ccc;
  margin: 0 4px;
  font-size: 0.85rem;
}

.time-divider {
  padding: 0 15px;
  font-weight: 600;
  opacity: 0.6;
  color: #999;
  align-self: center;
}

.match-container {
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.match-container.active {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
}

.match-container.finished {
  border-color: #d9d9d9;
  background-color: rgba(0, 0, 0, 0.02);
}

.match-container.upcoming {
  border-color: #52c41a;
  background-color: rgba(82, 196, 26, 0.05);
}

.match-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  line-height: 1.2;
}

.match-status.ongoing {
  background-color: #1890ff;
  color: white;
}

.match-status.finished {
  background-color: #d9d9d9;
  color: rgba(0, 0, 0, 0.65);
}

.match-status.upcoming {
  background-color: #52c41a;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-label {
    font-size: 1.4rem;
  }

  .time-value {
    font-size: 1.2rem;
  }

  .date-value {
    font-size: 0.8rem;
  }

  .no-active-match {
    font-size: 1rem;
  }
}
</style>