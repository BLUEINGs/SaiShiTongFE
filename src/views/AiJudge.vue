<template>
  <div class="ai-judge-container">
    <div class="main-content1">
      <div class="content-wrapper">
        <!-- 左侧主要内容区域 -->
        <div class="main-section">
          <!-- 视频容器 -->
          <div class="video-section" ref="videoSection">
            <flv-player ref="flvPlayer" :stream-url="streamUrl" @resolution-change="handleResolution"
              @error="onStreamError" />
          </div>

          <!-- 比赛信息区域 -->
          <div class="info-section">
            <ai-sport-description :spId="spId" :data="descriptionData" :on-match-change="handleMatchChange" />
          </div>
        </div>

        <!-- 右侧计分面板 -->
        <div class="score-section">
          <ai-score-board class="score-board" />
          <ai-score-book :spId="spId" class="score-book" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FlvPlayer from '@/components/FlvPlayer.vue';
import AiSportDescription from '@/components/AiSportDescription.vue';
import AiScoreBoard from '@/components/AiScoreBoard.vue';
import AiScoreBook from '@/components/AiScoreBook.vue';
import request from '@/utils/request';

export default {
  name: 'AiJudge',
  components: {
    FlvPlayer,
    AiSportDescription,
    AiScoreBoard,
    AiScoreBook
  },

  props: {
    spId: {
      type: [String, Number],
      required: true
    }
  },

  data() {
    return {
      streamUrl: 'http://localhost:8080/live/test.flv',
      descriptionData: {
        title: '',
        content: ''
      },
      streamActive: false,
      matchData: null,
      wsConnection: null,
      sourceWidth: 0,
      sourceHeight: 0,
      resizeObserver: null
    };
  },

  mounted() {
    this.fetchMatchInfo();
    this.resizeObserver = new ResizeObserver(this.handleResize);
    const mainSection = this.$el.querySelector('.main-section');
    if (mainSection) {
      this.resizeObserver.observe(mainSection);
    }
  },
  watch: {
    sourceWidth() {
      this.adjustVideoContainer()
    }
  },

  beforeUnmount() {
    this.closeWebSocket();
    // 清理 observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    handleResize() {
      // 防抖处理，避免频繁触发
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.sourceWidth && this.sourceHeight) {
          this.adjustVideoContainer();
        }
      }, 200);
    },

    // 获取比赛信息
    fetchMatchInfo() {
      request({
        method: "get",
        url: "/saishitong/eventInfo",
        params: { spId: this.spId }
      }).then((res) => {
        const url = new URL(res.data.results);
        this.streamUrl = `http://${url.hostname}:8080${url.pathname}.flv`;
      });
    },

    // 处理视频分辨率变化
    handleResolution({ width, height }) {
      if (width && height) {
        this.sourceWidth = width;
        this.sourceHeight = height;
        this.adjustVideoContainer();
      }
    },

    // 调整视频容器尺寸
    adjustVideoContainer() {
      if (!this.sourceWidth || !this.sourceHeight) return;

      const videoSection = this.$refs.videoSection;
      if (!videoSection) return;

      const containerWidth = videoSection.offsetWidth;
      const aspectRatio = this.sourceHeight / this.sourceWidth;
      const newHeight = Math.round(containerWidth * aspectRatio);

      videoSection.style.height = `${newHeight}px`;
    },

    // 处理比赛信息变化
    handleMatchChange(matchInfo) {
      this.matchData = matchInfo ? {
        id: matchInfo.id,
        startTime: matchInfo.startTime,
        endTime: matchInfo.endTime,
        status: matchInfo.status,
        type: matchInfo.type
      } : null;

      this.descriptionData = matchInfo ? {
        title: `${matchInfo.type}比赛`,
        content: `比赛ID: ${matchInfo.id} | 状态: ${matchInfo.status}`
      } : { title: '', content: '' };
    },

    // 处理流错误
    onStreamError(error) {
      this.$message({
        message: error.message || '视频流出现错误，请刷新页面重试',
        type: 'error',
        duration: 3000,
        showClose: true
      });
      this.streamActive = false;
    },

    // 关闭WebSocket连接
    closeWebSocket() {
      if (this.wsConnection) {
        this.wsConnection.close();
        this.wsConnection = null;
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ai-judge-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.main-content1 {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  gap: 16px;
  height: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

.main-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-section {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
}

.info-section {
  flex: 0 0 auto;
  border-radius: 4px;
  overflow: hidden;
}

.score-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-board,
.score-book {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.score-board {
  flex: 0 0 auto;
}

.score-book {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

@media (max-width: 1200px) {
  .score-section {
    width: 320px;
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }

  .score-section {
    width: 100%;
    flex-direction: row;
    height: auto;
  }

  .score-board,
  .score-book {
    width: 50%;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .main-content1 {
    padding: 8px;
  }

  .content-wrapper {
    gap: 8px;
  }

  .score-section {
    flex-direction: column;
  }

  .score-board,
  .score-book {
    width: 100%;
    height: auto;
  }

  .score-book {
    max-height: 400px;
  }
}
</style>