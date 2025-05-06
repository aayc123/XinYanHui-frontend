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
      <div>
      <button class="end-session-btn" @click="showhelp = true">
        督导求助
      </button>
      <button class="end-session-btn" @click="showConfirm = true">
        结束会话
      </button>
    </div>
    </header>

    <!-- 主聊天区域 -->
    <ChatContainer :messages="messages" class="main-chat" />
    <!-- 消息输入区 -->
    <ChatMessages @send-message="addMessage" />

    <!-- 历史记录侧边栏 -->
    
   
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
    <div v-if="showhelp" class="confirm-dialog">
      <div class="dialog-content">
        <p>向督导求助？</p>
        <div class="dialog-btns">
          <button @click="gotohelp">确定</button>
          <button @click="showhelp = false">取消</button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ChatContainer from '@/components/ChatContainer'
import ChatMessages from '@/components/ChatMessages'

export default {
  components: {
    ChatContainer,
    ChatMessages,
  },
  data() {
    return {
      messages: [],
      chatHistory: [],
      sidebarVisible: false,
      showConfirm: false,
      showhelp:false,
      showRatingDialog: false,
      feedback: '',
      //sessionId: parseInt(this.$route.params.sessionId),
      //remainingTime: parseInt(localStorage.getItem(`countdown_${this.sessionId}`)) || 3600,
      ws: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      isConnected: false,
      starttime:this.$route.query.appointmentDate,
      remainingTime: 0,
      countdownInterval: null,
      type:0,
      helpWindow: null,
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
    isConsultant(){
      return localStorage.getItem('userType') === 'consultant'
    },
    formattedRemainingTime() {
      // 将剩余时间转换为小时和分钟格式
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  },
  watch: {
    sessionId() {
      this.initializeWebSocket()
    }
  },
  created() {
    document.title = '来访者咨询';
    this.sessionId       = parseInt(this.$route.query.sessionId,10)
    this.initializeWebSocket()
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    window.addEventListener('beforeunload', this.confirmBeforeUnload)
    this.fetchHistory(),
    this.calculateRemainingTime();
    this.startCountdown();
  },
  beforeDestroy() {
    alert('来访者结束咨询！')
    this.cleanupWebSocket()
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    window.removeEventListener('beforeunload', this.confirmBeforeUnload)
    clearInterval(this.countdownInterval);  // 清除倒计时
  },
  methods: {
    async gotohelp(){
      if (this.helpWindow && !this.helpWindow.closed) {
        this.helpWindow.focus(); // 聚焦已有窗口
        this.showhelp = false;
        return;
      }
      const id=this.sessionId;
      const params = new URLSearchParams();
      
      params.append('consultantId', localStorage.getItem('consultantId'));
      params.append('sessionId', id);

      try {
        const response =await this.$axios.post('/internal/consultant/supervise', params, {
          headers: {
            'token': localStorage.getItem('token'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
       
        if (response.data && response.data.code === '1') {
          const data = response.data.data;
          //这里是咨询师跳转到求助界面
          //alert(data.recordId);
          const chatUrl = this.$router.resolve({
            path: `/chatsc/${data.recordId}`, // 路径为 /chat/recordId
            query: {
              sessionId: data.sessionId,           // 咨询师与来访者的会话ID
              supervisorRecordId: data.recordId,   // 咨询师与督导的对话ID
              consultantId: data.consultantId,
              supervisorId: data.supervisorId,
              recordId: data.recordId,
            }
          }).href;

          this.helpWindow=window.open(chatUrl, '_blank');
          this.showhelp=false
          
        } else {
          this.$message.error(response.data.msg || '未知错误');
        }
      } catch (error) {
        //console.error(error);
        this.$message.error('请求失败');
      }
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
        from: response.system? 'system' : 'consultant',
        text: response.msg,
        time: dayjs(response.time).format('HH:mm:ss'),
        status: 'received'
      }
      //alert(response.system)

      this.messages.push(newMessage)

        if (newMessage.text === '会话已结束') {
            alert("会话已结束！")
            this.cleanupSession()
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
    calculateRemainingTime() {
      const startTime = dayjs(this.starttime);
      const endTime = startTime.add(1, 'hour');
      this.remainingTime = endTime.diff(dayjs(), 'seconds');
    },

    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.remainingTime <= 0) {
          clearInterval(this.countdownInterval);
          this.handleTimeUp();
        } else {
          this.remainingTime--;
        }
      }, 1000);
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
  background-color: #f1eaa6;
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
  margin-right: 10px;
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
.ask-for-help{
  background: #409EFF;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
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