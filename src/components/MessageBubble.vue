<template>
  <div class="message-container" 
       :class="{
         'user-container': message.from === 'user',
         'system-container': message.from === 'system'
       }">
    <!-- 非系统消息显示头像 -->
    <div class="avatar" v-if="message.from !== 'system'">
      <span v-if="!message.avatar">{{ messageAvatar }}</span>
      <img v-else :src="src/assets/head2.jpg" alt="avatar">
    </div>

    <div class="message-bubble" 
         :class="{
           'user-message': message.from === 'user',
           'system-message': message.from === 'system'
         }">
      <div class="content">{{ message.text }}</div>
      <div class="timestamp">{{ message.time }}</div>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    sessiontype: {
      type: Number,
      required:true
    }
  },
  computed: {
    // 生成头像占位文字（取发送者首字母）
    messageAvatar() {
      //alert(this.sessiontype)
      // if(this.sessiontype===0) return this.message.from==='user'?'C':'U';
      // else return this.message.from==='user'?'C':'S';
      return this.message.from==='user'?'A':'Q';
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  gap: 12px;
  max-width: 85%;
  margin: 8px 0;
  align-items: flex-start;
}

/* 用户消息容器（头像在右侧） */
.user-container {
  flex-direction: row-reverse;
  margin-left: auto;
}

/* 系统消息容器 */
.system-container {
  margin: 8px auto;
  max-width: 100%;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble {
  /* 原有样式保持不变 */
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 15px;
  word-break: break-word;
  position: relative;
}

/* 调整消息最大宽度 */
.user-message {
  max-width: calc(100% - 60px); /* 留出头像空间 */
}

/* 系统消息隐藏头像 */
.system-container .avatar {
  display: none;
}

/* 原有消息颜色样式保持不变 */
.user-message {
  background: #409EFF;
  color: white;
  border-radius: 15px 5px 15px 15px;
}

.system-message {
  background: #f7f3f3;
  color: #666;
  border-radius: 20px;
}

/* 其他消息样式调整 */
.message-bubble:not(.user-message):not(.system-message) {
  border-radius: 5px 15px 15px 15px;
  background-color: aliceblue;
  max-width: calc(100% - 60px); /* 留出头像空间 */
}

/* 时间戳样式保持不变 */
.timestamp {
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.system-message .timestamp {
  text-align: center;
  color: #999;
}

.user-message .timestamp {
  color: rgba(255,255,255,0.8);
}
</style>