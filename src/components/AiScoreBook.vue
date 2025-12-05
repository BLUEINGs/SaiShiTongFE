<template>
  <div ref="scoreBookContainer" class="ai-score-book">
    <!-- 模式切换按钮 -->
    <div class="mode-switcher">
      <button :class="{ active: currentMode === 'scores' }" @click="switchMode('scores')">
        得分记录
      </button>
      <button :class="{ active: currentMode === 'actions' }" @click="switchMode('actions')">
        行为日志
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 得分记录模式 -->
    <transition-group v-if="currentMode === 'scores'" name="list" tag="div" class="score-list">
      <AiScoreBookCard v-for="record in sortedScoreRecords" :key="record.id" :record="record"
        :is-latest="record.id === sortedScoreRecords[0]?.id" :team-colors="teamColors" />
    </transition-group>

    <!-- 行为日志模式 -->
    <transition-group v-if="currentMode === 'actions'" name="list" tag="div" class="action-logs">
      <div v-for="log in displayedActionLogs" :key="log.id" class="action-log-item">
        <!-- <span class="log-time">{{ log.displayTime }}s</span> -->
        <span class="log-content">{{ log.message }}</span>
        <span v-if="log.confidence" class="log-confidence">
          {{ (log.confidence * 100).toFixed(0) }}%
        </span>
      </div>
    </transition-group>
  </div>
</template>

<script>
import AiScoreBookCard from '@/components/AiScoreBookCard.vue';
import { EventBus } from '@/utils/eventBus';

export default {
  name: 'AiScoreBook',
  components: { AiScoreBookCard },
  data() {
    return {
      currentMode: 'scores', // 'scores' 或 'actions'
      rawScoreRecords: [], // 存储原始得分记录（未排序）
      actionLogs: [], // 存储原始行为日志
      displayedActionLogs: [], // 显示的行为日志（处理后）
      errorMessage: '',
      webSocket: null,
      wsConnection: null,
      gameStartTime: null, // 游戏开始时间
      // 队伍颜色配置
      teamColors: {
        'A队': '#2196F3',
        'B队': '#f44336'
      },
      aTeam: {
        id: 1,
        name: "A队伍"
      },
      bTeam: {
        id: 2,
        name: "B队"
      },
      MAX_LOG_COUNT: 30 * 30 // 最大日志数量
    };
  },
  props: ["spId"],

  computed: {
    // 计算属性：按时间降序（从新到旧）排列的记录
    sortedScoreRecords() {
      return [...this.rawScoreRecords].sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
    }
  },

  mounted() {
    // 启动WebSocket连接
    this.startAutoRequest();
    this.initializeWebSocket();
    this.gameStartTime = Date.now(); // 记录游戏开始时间
    EventBus.$on("updateTeamName", (teams) => {
      // console.log("已经传回，查看aTeam：", teams.aTeam)
      this.aTeam = teams.aTeam
      this.bTeam = teams.bTeam
    })
  },

  beforeUnmount() {
    // 清理工作
    this.clearAutoRequest();
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  },

  methods: {
    // 切换显示模式
    switchMode(mode) {
      this.currentMode = mode;
      if (mode === 'actions') {
        this.processActionLogs();
      }
    },

    // 日志记录器链接
    initializeWebSocket() {
      const baseURL = localStorage.getItem("baseURL")?.replace("http://", "") || "";
      this.wsConnection = new WebSocket(`ws://${baseURL}/gameLogs/${this.spId}`);

      this.wsConnection.onopen = () => {
        console.log('行为日志WebSocket连接已建立');
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleActionLogData(data);
        } catch (e) {
          console.error('解析WebSocket消息失败:', e);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket错误:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket连接关闭，5秒后尝试重连');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
    },

    // 处理行为日志数据
    handleActionLogData(data) {
      if (!Array.isArray(data)) {
        console.error('行为日志数据格式错误');
        return;
      }

      // 过滤掉unknown类型
      const validLogs = data.filter(log => log.eventType !== 'unknown');

      if (validLogs.length === 0) return;

      // 添加新日志（最新的在前面）
      this.actionLogs = [...validLogs.map(log => ({
        ...log,
        id: `log-${log.timestamp}-${Math.random().toString(36).substr(2, 5)}` // 生成唯一ID
      })), ...this.actionLogs];

      // 限制日志数量
      if (this.actionLogs.length > this.MAX_LOG_COUNT) {
        this.actionLogs = this.actionLogs.slice(0, this.MAX_LOG_COUNT);
      }

      // 如果当前是行为日志模式，立即更新显示
      if (this.currentMode === 'actions') {
        this.processActionLogs();
      }
    },

    // 处理行为日志为可显示格式
    processActionLogs() {
      if (this.actionLogs.length === 0) return;

      // const now = Date.now();
      // const gameDuration = (now - this.gameStartTime) / 1000; // 游戏持续时间(秒)

      this.displayedActionLogs = this.actionLogs.map(log => {
        // 计算显示时间（从游戏开始到现在的秒数）
        const logTime = (log.timestamp / 1000).toFixed(1);

        // 生成消息内容
        let message = '';
        console.log("1test", log.playerAction?.teId)
        // console.log("啥？", this.aTeam)
        console.log("2test", this.aTeam.id)
        const teamName = log.playerAction?.teId == this.aTeam.id ? `${this.aTeam.name}` : `${this.bTeam.name}`;

        switch (log.eventType) {
          case 'holding':
            message = `${teamName}队员运球`;
            break;
          case 'shooting':
            message = `${teamName}队员投篮`;
            break;
          case 'ball_flying':
            message = '球在飞行中';
            break;
          case 'score':
            message = `${teamName}得分`;
            break;
          case 'ball_in':
            message = `球进了`;
            break;
          default:
            message = log.eventType;
        }

        return {
          id: log.id,
          displayTime: logTime,
          message,
          confidence: log.playerAction?.confidence
        };
      });
    },

    // 启动 得分记录 连接
    startAutoRequest() {
      const baseURL = localStorage.getItem('baseURL').replace("http://", "");
      const webSocket = new WebSocket(`ws://${baseURL}/scoringRecords/${this.spId}`);

      webSocket.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          this.handleWebSocketData(data);
        } catch (error) {
          console.error('解析WebSocket数据失败:', error);
        }
      };

      webSocket.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        this.errorMessage = 'WebSocket连接错误，请刷新页面重试';
      };

      this.webSocket = webSocket; // 保存WebSocket实例
    },

    // 清理WebSocket连接
    clearAutoRequest() {
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
    },

    // 处理WebSocket数据
    handleWebSocketData(data) {
      if (!Array.isArray(data)) {
        console.error('得分数据格式错误');
        return;
      }
      if (data.length < 1) {
        //不处理没分数
        return
      }

      // 处理每条得分记录
      data.sort((o1, o2) => {
        console.log(o1.scoringTime)

        const time1 = new Date(o1.scoringTime.replace("[Asia/Shanghai]", ""))
        const time2 = new Date(o2.scoringTime.replace("[Asia/Shanghai]", ""))
        console.log(time1)
        if (time1 < time2) {
          return 1
        } else {
          return -1
        }
      })
      const newRecords = data.map(item => ({
        id: `${item.teId}-${item.scoringTime}-${Math.random().toString(36).substr(2, 5)}`, // 生成唯一ID
        team: item.name,
        teamId: item.teId,
        score: parseInt(item.score),
        time: this.formatTime(item.scoringTime),
        timestamp: new Date(item.scoringTime).getTime()
      }));

      // 更新记录列表（新的在前面）
      this.rawScoreRecords = newRecords;

      // 限制记录数量
      if (this.rawScoreRecords.length > this.MAX_LOG_COUNT) {
        this.rawScoreRecords = this.rawScoreRecords.slice(0, this.MAX_LOG_COUNT);
      }

      // 通知记分牌更新总分
      EventBus.$emit('updateTotalScore');
    },

    // 时间格式化方法（优化版）
    formatTime(timeString) {
      if (!timeString) return '未知时间';

      try {
        const date = new Date(timeString);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return timeString; // 返回原始字符串
        }

        // 格式化时间为 HH:mm
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false  // 24小时制
        });
      } catch (e) {
        console.warn('时间格式解析错误:', e);
        return timeString;
      }
    },

    // 错误处理方法
    handleResponseError(errorMsg) {
      this.errorMessage = errorMsg;
    }
  }
};
</script>

<style scoped>
/* 容器样式 */
.ai-score-book {
  background: #fff3e0;
  padding: 20px 15px;
  box-sizing: border-box;
  border-radius: 30px;
  max-height: 55vh;
  overflow-y: auto;
  flex: 7;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #ffb300 transparent;
}

/* Chrome/Edge滚动条样式 */
.ai-score-book::-webkit-scrollbar {
  width: 6px;
}

.ai-score-book::-webkit-scrollbar-thumb {
  background-color: #ffb300;
  border-radius: 3px;
}

/* 模式切换按钮 */
.mode-switcher {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.mode-switcher button {
  flex: 1;
  padding: 8px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.mode-switcher button.active {
  color: #ff6d00;
  border-bottom-color: #ff6d00;
  font-weight: bold;
}

/* 行为日志样式 */
.action-logs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-log-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.log-time {
  color: #ff6d00;
  font-weight: bold;
  margin-right: 10px;
  min-width: 60px;
}

.log-content {
  flex: 1;
}

.log-confidence {
  color: #666;
  font-size: 12px;
  margin-left: 10px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 错误提示样式 */
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.list-move {
  transition: transform 0.5s;
}

/* 在大屏幕上取消最大高度限制 */
@media (min-width: 769px) {
  .ai-score-book {
    max-height: none;
    padding: 25px 20px;
  }
}
</style>