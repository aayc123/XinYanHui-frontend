<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <header class="chat-header">
      <div class="header-left">
        <div class="connection-status" :class="{ connected: isConnected }">
          ● {{ connectionStatusText }}
        </div>
        <countdown-timer 
          :initial-time="remainingTime"
          :session-id="sessionId"
          @time-up="handleTimeUp"
          @tick="handleTick" 
        />
      </div>
      <button class="end-session-btn" @click="showConfirm = true">
        结束会话
      </button>
    </header>

    <!-- 主聊天区域 -->
    <ChatContainer :messages="messages" class="main-chat" />
    <!-- 消息输入区 -->
    <ChatMessages @send-message="addMessage" />

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

    <!-- 评分弹窗 -->
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
import dayjs from 'dayjs'
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
      messages: [],
      chatHistory: [],
      sidebarVisible: false,
      showConfirm: false,
      showRatingDialog: false,
      rating: 0,
      feedback: '',
      //sessionId: parseInt(this.$route.params.sessionId),
      remainingTime: parseInt(localStorage.getItem(`countdown_${this.sessionId}`)) || 3600,
      ws: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      isConnected: false
    }
  },
  computed: {
    wsUrl() {
      const url=`ws://localhost:8080/chat?token=${localStorage.getItem('token')}&sessionId=${this.sessionId}&type=0`
      //alert(url)
      return url
    },
    connectionStatusText() {
      return this.isConnected ? '已连接' : '连接中...'
    }
  },
  watch: {
    sessionId() {
      this.initializeWebSocket()
    }
  },
  created() {
    this.sessionId       = parseInt(this.$route.query.sessionId,10)
    this.initializeWebSocket()
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    window.addEventListener('beforeunload', this.confirmBeforeUnload)
    this.fetchHistory()
  },
  beforeDestroy() {
    this.cleanupWebSocket()
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    window.removeEventListener('beforeunload', this.confirmBeforeUnload)
  },
  methods: {
    async initializeWebSocket() {
      this.cleanupWebSocket()
      
      try {
        this.ws = new WebSocket(this.wsUrl)
        this.setupWebSocketHandlers()
      } catch (error) {
        //console.error('WebSocket连接失败:', error)
        this.handleReconnect()
      }
    },

    setupWebSocketHandlers() {
      this.ws.onopen = () => {
        //alert('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        //alert('onmessage')
        const response = JSON.parse(event.data)
        this.handleIncomingMessage(response)
      }

      this.ws.onerror = (error) => {
        alert('WebSocket error:', error)
        this.isConnected = false
      }

      this.ws.onclose = (event) => {
        this.isConnected = false
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect()
        }
      }
    },
    confirmBeforeUnload(event) {
     event.preventDefault()
     // 赋值会触发标准确认框
     event.returnValue = '确定要离开本页面吗？'
   },
    handleReconnect() {
      const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts), 30000)
      setTimeout(() => {
        this.reconnectAttempts++
        this.initializeWebSocket()
      }, delay)
    },

    handleIncomingMessage(response) {
      const newMessage = {
        from: response.isSystem ? 'system' : 'bot',
        text: response.msg,
        time: dayjs(response.time).format('HH:mm:ss'),
        status: 'received'
      }
      this.messages.push(newMessage)
    },

    async addMessage(content) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        alert('连接尚未建立，请稍后再试')
        return
      }

      const userMessage = {
        from: 'user',
        text: content,
        time: dayjs().format('HH:mm:ss'),
        status: 'sending'
      }
      
      try {
        this.messages.push(userMessage)
        const payload = JSON.stringify({ msg: content })
        this.ws.send(payload)
        
        // 更新消息状态
        const index = this.messages.length - 1
        this.messages[index].status = 'sent'
      } catch (error) {
        //console.error('消息发送失败:', error)
        const index = this.messages.findIndex(msg => msg.status === 'sending')
        if (index !== -1) {
          this.messages[index].status = 'failed'
        }
      }
    },

    cleanupWebSocket() {
      if (this.ws) {
        this.ws.onclose = null
        this.ws.close()
        this.ws = null
      }
    },

    handleBeforeUnload() {
      this.cleanupWebSocket()
    },

    async fetchHistory() {
      try {
        // 这里假设有获取历史记录的API
        // const response = await axios.get(`/api/messages/${this.sessionId}`)
        // this.messages = response.data.map(...)
      } catch (error) {
        //console.error('加载历史消息失败:', error)
      }
    },

    handleTick(remaining) {
      localStorage.setItem(`countdown_${this.sessionId}`, remaining)
      this.remainingTime = remaining
    },

    handleTimeUp() {
      localStorage.removeItem(`countdown_${this.sessionId}`)
      alert('本次咨询时间已到，即将结束会话')
      this.confirmEndSession()
    },

    handleShowRating() {
      this.showConfirm = false
      this.showRatingDialog = true
    },

    setRating(n) {
      this.rating = n
    },

    submitRating() {
      // 这里添加提交评分到后端的逻辑
      //console.log('提交评分:', this.rating, '评价:', this.feedback)
      this.cleanupSession()
    },

    cleanupSession() {
      window.removeEventListener('beforeunload', this.confirmBeforeUnload)
      localStorage.removeItem(`countdown_${this.sessionId}`)
      this.cleanupWebSocket()
      window.close()
    },

    confirmEndSession() {
      this.cleanupSession()
    }
  }
}
</script>

<style scoped>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  font-size: 0.9rem;
  color: #909399;
}

.connection-status.connected {
  color: #67C23A;
}

.end-session-btn {
  background: #409EFF;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.end-session-btn:hover {
  background: #66b1ff;
}

/* 在父组件中调整主聊天区域 */
.main-chat {
  flex: 1;
  margin-top: 60px;
  padding: 20px;
  overflow-y: auto;
  width: calc(100% - 40px); /* 添加宽度限制 */
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
  z-index: 2000;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.dialog-content h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #303133;
}

.star-rating {
  margin: 20px 0;
  font-size: 32px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.star {
  cursor: pointer;
  color: #dcdfe6;
  transition: color 0.2s;
}

.star.filled {
  color: #f7ba2a;
}

.feedback-box {
  width: 100%;
  min-height: 100px;
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
}

.dialog-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-btns button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-btns button:first-child {
  background: #409EFF;
  color: white;
}

.dialog-btns button:last-child {
  background: #f4f4f5;
  color: #606266;
}
</style>