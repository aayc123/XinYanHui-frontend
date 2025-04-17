<!-- /src/views/Chat.vue -->
<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <header class="chat-header">
      <countdown-timer 
        :initial-time="60"
        @time-up="handleTimeUp"
        class="countdown"
      />
      <button class="end-session-btn" @click="showConfirm = true">
        结束会话
      </button>
    </header>

    <!-- 主聊天区域 -->
    <chat-container :messages="messages" class="main-chat" />
    <ChatMessages />
    <!-- 历史记录侧边栏 -->
    <history-sidebar 
      v-model="sidebarVisible"
      :history="chatHistory"
      class="history-sidebar"
    />

    <!-- 结束会话确认对话框 -->
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="dialog-content">
        <p>是否确定要结束本次会话？</p>
        <div class="dialog-btns">
          <button @click="confirmEndSession">确定</button>
          <button @click="showConfirm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatContainer from '@/components/ChatContainer'
import ChatMessages from '@/components/ChatMessages'
import CountdownTimer from '@/components/CountdownTimer'
import HistorySidebar from '@/components/HistorySidebar'

export default {
  components: {
    ChatContainer,
    CountdownTimer,
    HistorySidebar,
    ChatMessages
  },
  data() {
    return {
      messages: [], // 当前会话消息
      chatHistory: [], // 历史会话记录
      sidebarVisible: false,
      showConfirm: false
    }
  },
  methods: {
    handleTimeUp() {
      // 时间用完的处理逻辑
      alert('本次咨询时间已到，即将结束会话')
    },
    confirmEndSession() {
      // 结束会话逻辑
      this.showConfirm = false
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  position: relative;
}

.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.main-chat {
  flex: 1;
  margin-top: 60px;
  padding: 20px;
  overflow-y: auto;
}

.history-sidebar {
  width: 300px;
  height: 100vh;
  position: fixed;
  right: 0;
  top: 60px;
  background: #fff;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.history-sidebar.open {
  transform: translateX(0);
}

.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.dialog-btns {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>