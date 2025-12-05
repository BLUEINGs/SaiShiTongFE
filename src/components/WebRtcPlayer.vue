<template>
  <div class="webrtc-container">
    <video ref="videoPlayer" autoplay playsinline class="video-element"></video>
    
    <!-- 推流状态显示（右下角） -->
    <div class="stream-status" v-if="isStreaming">
      推流中: {{ streamDuration }}
    </div>
    
    <!-- 隐藏的推流控制按钮（测试时使用） -->
    <div class="hidden-controls" v-show="showControls">
      <button @click="toggleStream" :disabled="loading">
        {{ isStreaming ? '停止推流' : '开始推流' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebRtcPlayer',
  props: {
    streamUrl: {
      type: String,
      required: true
    },
    autoStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      peerConnection: null,
      dataChannel: null,
      isStreaming: false,
      loading: false,
      streamDuration: '00:00:00',
      mediaStream: null,
      startTime: null,
      durationInterval: null,
      showControls: false // 隐藏控制按钮，在测试时可以打开
    };
  },
  watch: {
    autoStart(newVal) {
      if (newVal && !this.isStreaming) {
        this.startStream();
      } else if (!newVal && this.isStreaming) {
        this.stopStream();
      }
    }
  },
  mounted() {
    // 添加键盘监听，用于测试时显示控制按钮
    window.addEventListener('keydown', this.handleKeyDown);
    
    if (this.autoStart) {
      this.startStream();
    }
  },
  beforeUnmount() {
    this.stopStream();
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    async startStream() {
      if (this.isStreaming) return;
      
      this.loading = true;
      
      try {
        // 获取媒体流
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
        
        // 创建PeerConnection
        this.createPeerConnection();
        
        // 添加本地流
        this.mediaStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.mediaStream);
        });
        
        // 创建offer
        const offer = await this.peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true
        });
        await this.peerConnection.setLocalDescription(offer);
        
        // 发送offer到信令服务器
        await this.sendToSignalingServer(offer);
        
        this.isStreaming = true;
        this.startTime = new Date();
        this.startDurationTimer();
        this.$emit('stream-started');
      } catch (error) {
        console.error('启动推流失败:', error);
        this.$emit('stream-error', error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async stopStream() {
      if (!this.isStreaming) return;
      
      try {
        if (this.dataChannel) {
          this.dataChannel.close();
          this.dataChannel = null;
        }
        
        if (this.peerConnection) {
          this.peerConnection.close();
          this.peerConnection = null;
        }
        
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(track => track.stop());
          this.mediaStream = null;
        }
        
        this.isStreaming = false;
        this.stopDurationTimer();
        this.$emit('stream-ended');
      } catch (error) {
        console.error('停止推流失败:', error);
        this.$emit('stream-error', error.message);
      }
    },
    
    toggleStream() {
      if (this.isStreaming) {
        this.stopStream();
      } else {
        this.startStream();
      }
    },
    
    createPeerConnection() {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // 可以添加TURN服务器配置
        ]
      };
      
      this.peerConnection = new RTCPeerConnection(configuration);
      
      // 监听ICE候选
      this.peerConnection.onicecandidate = event => {
        if (event.candidate) {
          this.sendToSignalingServer({
            type: 'candidate',
            candidate: event.candidate
          });
        }
      };
      
      // 监听远程流
      this.peerConnection.ontrack = event => {
        if (event.streams && event.streams[0]) {
          this.$refs.videoPlayer.srcObject = event.streams[0];
        }
      };
      
      // 监听连接状态变化
      this.peerConnection.onconnectionstatechange = () => {
        console.log('连接状态:', this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === 'disconnected') {
          this.$emit('stream-error', '连接断开');
        }
      };
      
      // 创建数据通道
      this.dataChannel = this.peerConnection.createDataChannel('matchData');
      this.dataChannel.onopen = () => console.log('数据通道已打开');
      this.dataChannel.onmessage = event => console.log('收到消息:', event.data);
    },
    
    async sendToSignalingServer(message) {
      try {
        const response = await fetch(this.streamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        const data = await response.json();
        
        if (data.type === 'answer') {
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data)
          );
        } else if (data.type === 'candidate') {
          await this.peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (error) {
        console.error('信令服务器通信失败:', error);
        this.$emit('stream-error', '信令服务器通信失败');
      }
    },
    
    // 开始计时器显示推流时长
    startDurationTimer() {
      this.updateDuration();
      this.durationInterval = setInterval(() => {
        this.updateDuration();
      }, 1000);
    },
    
    // 停止计时器
    stopDurationTimer() {
      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }
      this.streamDuration = '00:00:00';
    },
    
    // 更新推流时长显示
    updateDuration() {
      if (!this.startTime) return;
      
      const now = new Date();
      const diff = Math.floor((now - this.startTime) / 1000); // 秒数
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      this.streamDuration = 
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
    },
    
    // 键盘事件处理（用于测试）
    handleKeyDown(event) {
      // Ctrl+Alt+C 显示/隐藏控制按钮
      if (event.ctrlKey && event.altKey && event.key === 'c') {
        this.showControls = !this.showControls;
        event.preventDefault();
      }
    }
  }
};
</script>

<style scoped>
.webrtc-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
}

/* 推流状态显示（右下角） */
.stream-status {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #00ff00; /* 绿色文字，更醒目 */
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  font-family: monospace; /* 等宽字体，显示时间更清晰 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

/* 隐藏的控制按钮 */
.hidden-controls {
  position: absolute;
  bottom: 60px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  border-radius: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.hidden-controls button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.hidden-controls button:hover {
  background: #2980b9;
}

.hidden-controls button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
</style>