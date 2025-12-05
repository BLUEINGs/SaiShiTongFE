<template>
    <div class="flv-player-container">
        <video ref="videoElement" class="flv-video" :style="videoStyle" controls autoplay muted playsinline
            @play="handlePlay" @pause="handlePause" @error="handleVideoError"></video>
        <div v-if="reconnecting" class="reconnect-mask">
            <div class="reconnect-message">
                <i class="el-icon-loading"></i>
                <span>正在尝试重新连接... ({{ reconnectCount }})</span>
            </div>
        </div>
    </div>
</template>

<script>
import flvjs from 'flv.js'

export default {
    name: 'FlvPlayer',
    props: {
        streamUrl: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            flvPlayer: null,
            playing: false,
            reconnecting: false,
            reconnectCount: 0,
            maxReconnectAttempts: 999999,
            reconnectTimer: null,
            videoWidth: 0,
            videoHeight: 0,
            // 用于解决 AbortError 问题的状态锁
            pendingPlay: false,
            lastPlayTime: 0
        }
    },
    computed: {
        videoStyle() {
            return {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000'
            }
        }
    },
    watch: {
        streamUrl(newUrl) {
            if (newUrl) {
                this.reconnectCount = 0
                this.destroyPlayer()
                this.initPlayer(newUrl)
            }
        }
    },
    mounted() {
        this.initPlayer(this.streamUrl)
    },
    beforeDestroy() {
        this.destroyPlayer()
    },
    methods: {
        initPlayer(url) {
            if (!url) return

            // 确保之前的播放器已销毁
            this.destroyPlayer()

            if (flvjs.isSupported()) {
                const videoElement = this.$refs.videoElement
                if (!videoElement) return

                try {
                    this.flvPlayer = flvjs.createPlayer({
                        type: 'flv',
                        url: url,
                        isLive: true,
                        hasAudio: false,
                        stashInitialSize: 128,
                        enableWorker: true,
                        enableStashBuffer: true
                    })

                    this.flvPlayer.attachMediaElement(videoElement)
                    this.flvPlayer.load()

                    // 监听媒体信息
                    this.flvPlayer.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
                        this.videoWidth = mediaInfo.width
                        this.videoHeight = mediaInfo.height
                        this.$emit('resolution-change', {
                            width: mediaInfo.width,
                            height: mediaInfo.height
                        })
                    })

                    // 监听错误
                    this.flvPlayer.on(flvjs.Events.ERROR, (errType, errDetail) => {
                        console.error('FLV播放错误:', errType, errDetail)
                        this.handlePlayerError()
                    })

                    // 开始播放
                    this.safePlay().catch(err => {
                        console.warn('初始播放失败:', err)
                        this.handlePlayerError()
                    })

                } catch (err) {
                    console.error('FLV播放器初始化失败:', err)
                    this.handlePlayerError()
                }
            } else {
                console.error('浏览器不支持flv.js')
                this.$emit('error', new Error('浏览器不支持flv.js'))
            }
        },

        async safePlay() {
            // 防止频繁调用 play() 导致的 AbortError
            if (this.pendingPlay) return
            if (Date.now() - this.lastPlayTime < 1000) return

            this.pendingPlay = true
            this.lastPlayTime = Date.now()

            try {
                const videoElement = this.$refs.videoElement
                if (videoElement) {
                    await videoElement.play()
                    this.playing = true
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.warn('播放请求被中断，忽略错误')
                } else {
                    console.error('播放错误:', err)
                    throw err
                }
            } finally {
                this.pendingPlay = false
            }
        },

        pause() {
            const videoElement = this.$refs.videoElement
            if (videoElement) {
                videoElement.pause()
                this.playing = false
            }
        },

        handlePlay() {
            this.playing = true
        },

        handlePause() {
            this.playing = false
        },

        handleVideoError() {
            const videoElement = this.$refs.videoElement
            if (videoElement) {
                console.error('视频元素错误:', videoElement.error)
            }
            this.handlePlayerError()
        },

        handlePlayerError() {
            if (this.reconnecting) return

            this.reconnecting = true
            this.reconnectCount++

            if (this.reconnectCount > this.maxReconnectAttempts) {
                this.$emit('error', new Error(`重连超过最大次数 (${this.maxReconnectAttempts})`))
                this.reconnecting = false
                return
            }

            this.destroyPlayer()

            // 延迟重连
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = setTimeout(() => {
                if (this.streamUrl) {
                    this.initPlayer(this.streamUrl)
                }
                this.reconnecting = false
            }, 3000)
        },

        destroyPlayer() {
            if (this.flvPlayer) {
                try {
                    this.flvPlayer.pause()
                    this.flvPlayer.unload()
                    this.flvPlayer.detachMediaElement()
                    this.flvPlayer.destroy()
                } catch (err) {
                    console.warn('销毁播放器时出错:', err)
                }
                this.flvPlayer = null
            }
            this.playing = false
            clearTimeout(this.reconnectTimer)
        }
    }
}
</script>

<style scoped>
.flv-player-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #000;
}

.flv-video {
    display: block;
    width: 100%;
    height: 100%;
}

.reconnect-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.reconnect-message {
    color: #fff;
    font-size: 16px;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    display: flex;
    align-items: center;
}

.reconnect-message i {
    margin-right: 10px;
    font-size: 20px;
}
</style>