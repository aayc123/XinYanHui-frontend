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
    <!-- 消息输入区 -->
    <chat-messages @send-message="addMessage" />

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
          <button @click="handleShowRating">确定</button>
          <button @click="showConfirm = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ⭐ 评分弹窗 START -->
    <div v-if="showRatingDialog" class="confirm-dialog">
      <div class="dialog-content">
        <h3>请为本次会话打分</h3>
        <div class="star-rating">
          <span 
            v-for="n in 5" 
            :key="n" 
            class="star" 
            :class="{ filled: n <= rating }" 
            @click="setRating(n)"
          >★</span>
        </div>
        <textarea 
          v-model="feedback" 
          placeholder="留下你的评价（可选）" 
          class="feedback-box"
        ></textarea>
        <div class="dialog-btns">
          <button @click="submitRating">提交</button>
          <button @click="showRatingDialog = false">取消</button>
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
    ChatMessages,
    CountdownTimer,
    HistorySidebar
  },
  data() {
    return {
      messages: [],        // 当前会话消息
      chatHistory: [],     // 历史会话记录
      sidebarVisible: false,
      showConfirm: false,
      showRatingDialog: false,
      rating: 0,
      feedback: ''
    }
  },
  methods: {
    addMessage(content) {
      this.messages.push({ from: 'user', text: content });
      // TODO: 后续可添加机器人回复逻辑
    },
    handleTimeUp() {
      alert('本次咨询时间已到，即将结束会话');
      this.confirmEndSession();
    },
    handleShowRating() {
      this.showConfirm = false;
      this.showRatingDialog = true;
    },
    setRating(n) {
      this.rating = n;
    },
    submitRating() {
      //console.log('评分:', this.rating);
      //console.log('评价:', this.feedback);
      localStorage.removeItem('chatEndTime');
      this.$router.push('/');
    },
    confirmEndSession() {
      // 清理 localStorage 中的结束时间
      localStorage.removeItem('chatEndTime');
      this.showConfirm = false;
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.star-rating {
  margin: 10px 0;
  font-size: 24px;
  display: flex;
  justify-content: center;
}
.star {
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
  margin: 0 4px;
}
.star.filled {
  color: #f7ba2a;
}
.feedback-box {
  width: 100%;
  min-height: 80px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  resize: vertical;
  font-size: 14px;
}
.chat-container {
  display: flex;
  flex-direction: column;
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

.end-session-btn {
  background: #409EFF;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.main-chat {
  flex: 1;
  margin-top: 60px;
  padding: 20px;
  overflow-y: auto;
}

.history-sidebar {
  top: 60px;
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