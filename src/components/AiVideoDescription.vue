<!-- AiVideoDescription.vue 视频描述组件 -->
<template>
  <div class="app">
    <BilibiliComment 
      :initial-comments="comments"
      @comment-added="handleNewComment"
    />
  </div>
</template>

<script>
import BilibiliComment from './BilibiliComment.vue'
// ...existing code...

export default {
  components: { BilibiliComment },
  data() {
    return {
      comments: [
        {
          id: 1,
          author: '小可爱',
          avatar: 'https://picsum.photos/id/64/200/200',
          content: '篮球对决太精彩了！双方比分交替上升，最后时刻一记三分球将比赛拖入加时。加时赛中两队依然难分胜负，最终仅以2分之差决出胜负。这才是真正的篮球魅力！',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
          likes: 24
        },
        {
          id: 2,
          author: '知识小百科',
          avatar: 'https://picsum.photos/id/177/200/200',
          content: '感谢分享！不过我认为第三点可以再深入讲解一下，这里的技术细节很关键。',
          time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8小时前
          likes: 8
        }
      ]
    }
  },
  methods: {
    handleNewComment(comment) {
      console.log('新评论:', comment)
      // 这里可以将评论发送到服务器
    }
  }
}
</script>

<style scoped>
.video-description {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
  flex: 0 0 auto;
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
}

time {
  font-size: 0.9rem;
  color: #7f8c8d;
}

p {
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 10px;
}

.tags {
  margin-top: 8px;
}

.tag {
  display: inline-block;
  background: #ecf0f1;
  color: #3498db;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 20px;
  margin-right: 8px;
}
</style>