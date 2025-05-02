<template>
  <div class="message-bubble" 
       :class="{
         'user-message': message.from === 'user',
         'system-message': message.System  // 新增系统消息样式
       }">
    <div class="content">{{ message.text }}</div>
    <div class="timestamp">{{ message.time }}</div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

/* 用户消息样式 */
.user-message {
  background: #409EFF;
  color: white;
  border-radius: 15px 5px 15px 15px;
}

/* 系统消息修正 */
.system-message {
  background: #e8e8e8;
  color: #666;
  max-width: 80%;  /* 调整为更宽的比例 */
  text-align: center;
  border-radius: 20px;
  display: block;  /* 关键属性 */
  margin: 0 auto !important;  /* 强制居中 */
}
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 15px;
  background: #f1f0f0;
  margin: 5px 0;
  word-break: break-word;
}

/* 非用户消息样式 */
.message-bubble:not(.user-message):not(.system-message) {
  border-radius: 5px 15px 15px 15px;
}

.timestamp {
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.system-message .timestamp {
  text-align: center;  /* 系统消息时间居中 */
  color: #999;
}

.user-message .timestamp {
  color: rgba(255,255,255,0.8);
}
</style>