<template>
  <div class="chat-container">
    <div 
      v-for="(msg, index) in messages" 
      :key="index" 
      class="message-row"
      :class="{
        'user-message': msg.from === 'user',
        'system-message': msg.System  // 新增系统消息样式
      }"
    >
      <message-bubble :message="msg" />
    </div>
  </div>
</template>

<script>
import MessageBubble from '@/components/MessageBubble'

export default {
  components: { MessageBubble },
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.chat-container {
  flex: 1;
  width: 100%; /* 添加这个属性 */
  /* margin: 0 auto;  注释或删除这个属性 */
  padding: 20px;
  overflow-y: auto;
}
.message-row {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start; /* 默认左侧对齐 */
}

.message-row.user-message {
  justify-content: flex-end; /* 用户消息右侧对齐 */
}

.message-row.system-message {
  justify-content: center;  /* 关键设置 */
}
</style>