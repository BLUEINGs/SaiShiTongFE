<template>
  <div class="ai-score-board" :class="{ loading: isLoading }">
    <div class="score-group">
      <!-- 主比分区域 -->
      <div class="main-score">
        <div class="team-section a-team">
          <span class="team-name">{{ teams.aTeam.name }}</span>
          <span class="team-score" :class="{ 'score-update': aTeamScoreUpdated }">{{ score.aTeam }}</span>
        </div>
        <span class="colon">:</span>
        <div class="team-section b-team">
          <span class="team-score" :class="{ 'score-update': bTeamScoreUpdated }">{{ score.bTeam }}</span>
          <span class="team-name">{{ teams.bTeam.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'; // 导入封装的request
import { EventBus } from '@/utils/eventBus';

export default {
  data() {
    return {
      score: {
        aTeam: 0, // 初始化分数为0
        bTeam: 0
      },
      teams: {
        aTeam: {
          id: 1,
          name: "加载中...", // 初始化显示加载状态
        },
        bTeam: {
          id: 2,
          name: "加载中..."
        }
      },
      intervalId: null, // 存储定时器ID
      isLoading: true, // 加载状态标志
      aTeamScoreUpdated: false, // A队分数更新标志
      bTeamScoreUpdated: false // B队分数更新标志
    };
  },
  mounted() {
    // 初始获取一次比分
    this.fetchTotalScore();

    // 监听来自 AiScoreBook 的更新事件
    EventBus.$on('updateTotalScore', this.fetchTotalScore);
  },

  beforeDestroy() {
    // 清除定时器防止内存泄漏
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 移除事件监听
    EventBus.$off('updateTotalScore', this.fetchTotalScore);
  },

  methods: {
    // 获取总分数据
    async fetchTotalScore() {
      try {
        const response = await request({
          url: '/saishitong/totalScore',
          method: 'get',
          params: {
            spId: this.$route.params.spId // 从路由参数获取比赛ID
          }
        });

        // 如果请求成功
        if (response.code === 1 && Array.isArray(response.data)) {
          // 更新分数
          const scoreData = response.data;
          if (scoreData.length >= 2) {
            // 检查分数是否发生变化
            const oldATeamScore = this.score.aTeam;
            const oldBTeamScore = this.score.bTeam;

            // 更新分数和队伍名称
            this.score.aTeam = parseInt(scoreData[0].score) || 0;
            this.score.bTeam = parseInt(scoreData[1].score) || 0;
            this.teams.aTeam.name = scoreData[0].name || "队伍A";
            this.teams.aTeam.id = scoreData[0].teId || 1;
            this.teams.bTeam.name = scoreData[1].name || "队伍A";
            this.teams.bTeam.id = scoreData[1].teId || 2;

            EventBus.$emit("updateTeamName", this.teams)

            // 检查并设置分数更新动画标志
            if (this.score.aTeam !== oldATeamScore) {
              this.aTeamScoreUpdated = true;
              setTimeout(() => {
                this.aTeamScoreUpdated = false;
              }, 1000);
            }
            if (this.score.bTeam !== oldBTeamScore) {
              this.bTeamScoreUpdated = true;
              setTimeout(() => {
                this.bTeamScoreUpdated = false;
              }, 1000);
            }
          }
          this.isLoading = false;
        }
      } catch (error) {
        console.error('获取比分失败:', error);
        this.isLoading = false;
      }
    },

    handleResponse(response) {
      // 检查响应是否有效
      if (!response) {
        this.handleFetchError('未获取到有效响应数据');
        return;
      }

      // 处理特定错误情况
      if (response.code !== '1') {
        const message = response.message || '未知错误';
        this.handleFetchError(`服务器返回错误: ${message}`);
        return;
      }

      // 检查data结构是否正确
      if (!response.data || !Array.isArray(response.data.list)) {
        this.handleFetchError('响应数据结构无效');
        return;
      }

      const teams = response.data.list;

      // 检查分数是否有更新
      const aScoreChanged = this.score.aTeam !== teams[0].score;
      const bScoreChanged = this.score.bTeam !== teams[1].score;

      // 更新A队数据
      this.teams.aTeam.name = teams[0].name || '队伍A';
      this.score.aTeam = teams[0].score || 0;

      // 更新B队数据
      this.teams.bTeam.name = teams[1].name || '队伍B';
      this.score.bTeam = teams[1].score || 0;

      // 触发分数更新动画
      if (aScoreChanged) {
        this.aTeamScoreUpdated = true;
        setTimeout(() => {
          this.aTeamScoreUpdated = false;
        }, 300);
      }

      if (bScoreChanged) {
        this.bTeamScoreUpdated = true;
        setTimeout(() => {
          this.bTeamScoreUpdated = false;
        }, 300);
      }
    },

    handleFetchError(message) {
      console.error('比分获取失败:', message);
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.ai-score-board {
  background: #e3f2fd;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: background 0.3s ease;
}

/* 加载动画效果 */
.ai-score-board.loading .team-name,
.ai-score-board.loading .team-score {
  position: relative;
  overflow: hidden;
}

.ai-score-board.loading .team-name::after,
.ai-score-board.loading .team-score::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

.ai-score-board {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 120px;
  position: relative;
  transition: opacity 0.3s ease;

  &.loading {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #4caf50, transparent);
      animation: loading 1.5s infinite;
    }
  }
}

.score-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-score {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-score {
  min-width: 60px;
  text-align: center;
  font-weight: bold;
  font-size: 2.5rem;
  transition: all 0.3s ease;
}

.score-update {
  transform: scale(1.1);
  color: #4caf50;
}

.team-name {
  font-size: 1.4rem;
  font-weight: 600;
  font-family: 'Varela Round', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.a-team .team-name {
  color: #2196f3;
}

.a-team .team-score {
  color: #2196f3;
}

.b-team .team-name {
  color: #f44336;
}

.b-team .team-score {
  color: #f44336;
}

.colon {
  color: #333;
  font-weight: normal;
  font-size: 2.2rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ai-score-board {
    padding: 12px;
    min-height: 100px;
  }

  .team-score {
    min-width: 45px;
    font-size: 2rem;
  }

  .team-name {
    font-size: 1.1rem;
  }

  .main-score {
    gap: 12px;
  }
}
</style>