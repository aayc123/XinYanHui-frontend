<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <header class="chat-header">
      <div class="header-left">
        <div class="connection-status" :class="{ connected: isConnected }">
          ● {{ connectionStatusText }}
        </div>
        <div class="timer">{{ formattedRemainingTime }}</div>
      </div>
      <button class="end-session-btn" @click="showConfirm = true">
        结束会话
      </button>
    </header>

    <!-- 主聊天区域 -->
    <ChatContainer ref="chatScroll"  :messages="messages" class="main-chat" />
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ChatContainer from '@/components/ChatContainer'
import ChatMessages from '@/components/ChatMessages'
import HistorySidebar from '@/components/HistorySidebar'

export default {
  components: {
    ChatContainer,
    ChatMessages,
    HistorySidebar
  },
  data() {
    return {
      sessionStarted: false,
      sessionEnded: false,
      messages: [],
      chatHistory: [],
      sidebarVisible: false,
      showConfirm: false,
      showRatingDialog: false,
      rating: 0,
      feedback: '',
      //sessionId: parseInt(this.$route.params.sessionId),
      remainingTime: 0,
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
    },
    formattedRemainingTime() {
      if (isNaN(this.remainingTime)) return '00:00'
      
      const absSeconds = Math.abs(this.remainingTime)
      const minutes = Math.floor(absSeconds / 60)
      const seconds = absSeconds % 60
      
      // 添加剩余时间状态指示
      const prefix = this.remainingTime < 0 ? '-' : ''
      
      return `${prefix}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  },
  watch: {
    sessionId() {
      this.initializeWebSocket()
    },
    messages() {
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  }
  },
  created() {
    this.$message('路由参数:', this.$route.query) // 调试参数
    this.sessionId = parseInt(this.$route.query.sessionId, 10)
    
    // 验证必要参数存在
    if (!this.$route.query.appointmentDate || !this.$route.query.appointmentTime) {
      this.$message.error('缺少时间参数！')
      this.remainingTime = 0
      return
    }

    // 验证时间格式
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timePattern.test(this.$route.query.appointmentTime)) {
      this.$message.error('时间格式错误，应为HH:mm')
      this.remainingTime = 0
      return
    }

    this.calculateRemainingTime();
    this.startCountdown();
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
    scrollToBottom: function () {
      // 兼容不支持可选链的写法
      var chatScroll = this.$refs.chatScroll;
      var container = chatScroll && chatScroll.$el ? chatScroll.$el : chatScroll;
      if (container) {
        // 如果 ChatContainer 最外层就是滚动元素
        container.scrollTop = container.scrollHeight;
      }
    },
    calculateRemainingTime() {
      try {
        const dateStr = this.$route.query.appointmentDate
        const timeStr = this.$route.query.appointmentTime
        
        // 创建带有时区信息的日期对象（假设系统使用本地时区）
        const appointmentDateTime = dayjs(`${dateStr}T${timeStr}:00`) // ISO 8601格式
        
        // 调试输出
        console.log('解析的预约时间:', appointmentDateTime.format())
        
        if (!appointmentDateTime.isValid()) {
          throw new Error('Invalid date/time format')
        }

        // 计算当前时间（使用相同时区）
        const now = dayjs()
        console.log('当前时间:', now.format())
        
        // 计算结束时间（预约时间+60分钟）
        const endTime = appointmentDateTime.add(60, 'minute')
        console.log('计算结束时间:', endTime.format())

        // 计算剩余秒数（确保不小于0）
        let diffSeconds = endTime.diff(now, 'second')
        this.remainingTime = Math.max(diffSeconds, 0)
        
        console.log('剩余秒数:', this.remainingTime)
      } catch (error) {
        console.error('时间计算错误:', error)
        this.remainingTime = 0
      }
    },
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        this.calculateRemainingTime();
        if (this.remainingTime <= 0) {
          clearInterval(this.countdownInterval);
          this.handleTimeUp();
        } else {
          this.remainingTime--;
        }
      }, 1000);
    },
    
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
        from: response.system ? 'system' : 'consultant',
        text: response.msg,
        time: dayjs(response.time).format('HH:mm:ss'),
        status: 'received'
      }

      this.messages.push(newMessage)

      if (newMessage.text === '会话已开始') {
        this.sessionStarted = true
      } else if (newMessage.text === '会话已结束') {
        alert("咨询师已结束会话！")
        this.sessionEnded = true
        // 自动显示评分弹窗
        this.showRatingDialog = true
      }
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
      //localStorage.removeItem(`countdown_${this.sessionId}`)
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
      const token = localStorage.getItem('token');
      const payload = {
        sessionId: this.sessionId,
        rate: this.rating||0,
        feedback: (this.feedback||"").trim()
      };
      //alert(this.rating);
      if(this.rating>0){
        fetch('http://localhost:8080/user/session/evaluate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())                // ← 把响应体解析成 JSON
      .then(data => {
        //alert('后端返回', data)
        if (data.code !== '1') {
          this.$message.error('提交评分失败')
        } else {
          this.$message.success('评分提交成功')
          this.showRatingDialog = false
          this.sessionEnded = true
        }
      })
      .catch(err => {
        this.$message.error('提交评分失败，请稍后再试',err)
      })

      .catch(error => {
        this.$message.error('提交评分失败，请稍后再试',error)
        //console.error(error)
      })
      }
      this.cleanupSession()
    },

    cleanupSession() {
      window.removeEventListener('beforeunload', this.confirmBeforeUnload)
      localStorage.removeItem(`countdown_${this.sessionId}`)
      this.cleanupWebSocket()
      setTimeout(() => {
        window.close()
      }, 500)
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
  padding-bottom:30px;
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