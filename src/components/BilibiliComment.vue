<!-- BilibiliComment.vue -->
<template>
  <div class="comments-container">
    <!-- 评论数量头部 -->
    <div class="comments-header">
      <span><i class="fas fa-comments"></i> 评论 ({{ comments.length }})</span>
    </div>
    
    <!-- 输入区域（尺寸减小） -->
    <div class="input-area">
      <div class="user-avatar">
        <img :src="currentUser.avatar" alt="我的头像">
      </div>
      <div class="comment-input-container">
        <textarea 
          v-model="newComment" 
          class="comment-input" 
          placeholder="发个友好的评论吧~"
        ></textarea>
        <div class="comment-buttons">
          <button class="comment-btn" @click="addComment">发表评论</button>
        </div>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="comments.length === 0" class="empty-comments">
        <i class="fas fa-comment-slash"></i>
        <p>还没有评论，快来抢沙发~</p>
      </div>
      
      <div v-for="(comment, index) in comments" :key="index" class="comment">
        <div class="comment-header">
          <div class="comment-avatar">
            <img :src="comment.avatar" :alt="comment.author">
          </div>
          <div class="comment-meta">
            <div class="comment-author">{{ comment.author }}</div>
            <div class="comment-time">{{ formatTime(comment.time) }}</div>
          </div>
        </div>
        
        <div class="comment-content">
          {{ comment.content }}
        </div>
        
        <div class="comment-actions">
          <button class="action-btn"><i class="fas fa-thumbs-up"></i>{{ comment.likes }}</button>
          <button class="action-btn"><i class="fas fa-comment-dots"></i>回复</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BilibiliComment',
  props: {
    currentUser: {
      type: Object,
      default: () => ({
        id: 'me',
        name: '当前用户',
        avatar: 'https://picsum.photos/id/1027/200/200'
      })
    },
    initialComments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newComment: '',
      comments: [...this.initialComments]
    }
  },
  methods: {
    addComment() {
      if (!this.newComment.trim()) return
      
      const newComment = {
        id: Date.now(),
        author: this.currentUser.name,
        avatar: this.currentUser.avatar,
        content: this.newComment,
        time: new Date(),
        likes: 0
      }
      
      this.comments.unshift(newComment)
      this.newComment = ''
      this.$emit('comment-added', newComment)
    },
    
    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000)
      
      if (diff < 60) return '刚刚'
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
      if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${month}月${day}日 ${hours}:${minutes}`
    }
  },
  watch: {
    initialComments(newVal) {
      this.comments = [...newVal]
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', sans-serif;
}

.comments-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
}

/* 头部计数器 - 尺寸减小 */
.comments-header {
  padding: 10px 20px; /* 上下内边距从12px减小到10px */
  background-color: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px; /* 字体大小从16px减小到15px */
  color: #00a1d6;
  font-weight: bold;
}

/* 输入区域 - 尺寸减小 */
.input-area {
  display: flex;
  padding: 12px 20px; /* 上下内边距从20px减小到12px */
  border-bottom: 1px solid #f0f0f0;
}

.user-avatar {
  width: 40px; /* 头像尺寸从50px减小到40px */
  height: 40px; /* 头像尺寸从50px减小到40px */
  border-radius: 50%;
  background-color: #e6e6e6;
  margin-right: 12px; /* 右边距从15px减小到12px */
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-input-container {
  flex-grow: 1;
}

.comment-input {
  width: 100%;
  min-height: 60px; /* 最小高度从80px减小到60px */
  padding: 10px; /* 内边距从12px减小到10px */
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  transition: border 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #00a1d6;
}

.comment-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px; /* 上边距从10px减小到8px */
}

.comment-btn {
  background-color: #00a1d6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px; /* 内边距从8px 16px减小到6px 12px */
  font-size: 13px; /* 字体大小从14px减小到13px */
  cursor: pointer;
  transition: background 0.2s;
}

.comment-btn:hover {
  background-color: #0084b0;
}

/* 评论列表 */
.comments-list {
  padding: 15px 20px; /* 内边距从20px减小到15px 20px */
}

.comment {
  padding: 12px 0; /* 上下内边距从15px减小到12px */
  border-bottom: 1px solid #f0f0f0;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* 下边距从15px减小到12px */
}

.comment-avatar {
  width: 36px; /* 头像尺寸从40px减小到36px */
  height: 36px; /* 头像尺寸从40px减小到36px */
  border-radius: 50%;
  background-color: #e6e6e6;
  margin-right: 10px; /* 右边距从12px减小到10px */
  overflow: hidden;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-meta {
  flex-grow: 1;
}

.comment-author {
  font-weight: bold;
  font-size: 14px; /* 字体大小从15px减小到14px */
  color: #666;
  margin-bottom: 2px;
}

.comment-time {
  font-size: 11px; /* 字体大小从12px减小到11px */
  color: #999;
}

.comment-content {
  margin-left: 46px; /* 左边距从52px减小到46px */
  line-height: 1.5; /* 行高从1.6减小到1.5 */
  font-size: 14px; /* 字体大小从15px减小到14px */
  color: #333;
}

/* 操作按钮 */
.comment-actions {
  margin-top: 8px; /* 上边距从10px减小到8px */
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  color: #757575;
  font-size: 13px; /* 字体大小从14px减小到13px */
  margin-left: 12px; /* 左边距从15px减小到12px */
  cursor: pointer;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #00a1d6;
}

/* 空状态 */
.empty-comments {
  text-align: center;
  padding: 30px 20px; /* 内边距从40px 20px减小到30px 20px */
  color: #999;
}

.empty-comments i {
  font-size: 28px; /* 图标大小从32px减小到28px */
  margin-bottom: 8px; /* 下边距从10px减小到8px */
  display: block;
}
</style>