<!-- VideoPlayer.vue 视频播放器组件 -->
<template>
  <div class="player-container">
    <video 
      ref="videoPlayer"
      controls
      :src="src"
      :poster="poster"
      class="responsive-video"
      @loadedmetadata="handleMetaLoaded"
    ></video>
  </div>
</template>

<script>
export default {
  props: {
    src: String,
    poster: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleMetaLoaded() {
      // 可根据视频元数据做调整
    }
  }
}
</script>

<style scoped>
.player-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.responsive-video {
  max-width: 100%;
  max-height: 100%;
  background: #000;
  aspect-ratio: 16/9; /* 16:9比例 */
}
</style>