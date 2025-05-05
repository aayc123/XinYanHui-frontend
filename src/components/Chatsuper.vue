<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <header class="chat-header">
      <div class="header-left">
        <div class="connection-status" :class="{ connected: isConnected }">
          ● {{ connectionStatusText }}
        </div>
      </div>
      <div>
        <button class="end-session-btn" @click="observe">
          查看咨询对话
        </button>
        <button class="end-session-btn" @click="showConfirm = true">
          结束会话
        </button>
      </div>
    </header>

    <!-- 主聊天区域 -->
    <ChatContainer :sessionType="type" :messages="messages" class="main-chat" />
    <!-- 消息输入区 -->
    <ChatMessages @send-message="addMessage" />

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
      showhelp: false,
      showRatingDialog: false,
      feedback: '',
      ws: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      isConnected: false,
      starttime: this.$route.query.appointmentDate,
      remainingTime: 0,
      countdownInterval: null,
      token: localStorage.getItem('token'),
      type: 1,
      chatWindow: null,
      checkerTimer: null
    }
  },
  computed: {
    wsUrl() {
      return `ws://localhost:8080/chat?token=${localStorage.getItem('token')}&sessionId=${this.sessionId}&type=1`;
    },
    connectionStatusText() {
      return this.isConnected ? '已连接' : '连接中...';
    },
    isConsultant() {
      return localStorage.getItem('userType') === 'consultant';
    }
  },
  watch: {
    sessionId() {
      this.initializeWebSocket();
    }
  },
  created() {
    document.title = '咨询师求助';
    this.sessionId = parseInt(this.$route.query.sessionId, 10);
    this.obId = parseInt(this.$route.query.obId, 10);
    this.initializeWebSocket();
    this.fetchHistory();
    this.calculateRemainingTime();
    this.startCountdown();
    window.addEventListener('beforeunload', this.handleMainUnload);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.handleMainUnload);
    this._closeChatWindow();
    if (this.checkerTimer) {
      clearInterval(this.checkerTimer);
      this.checkerTimer = null;
    }
    clearInterval(this.countdownInterval);
    this.cleanupWebSocket();
  },
  methods: {
    async initializeWebSocket() {
      this.cleanupWebSocket();
      try {
        this.ws = new WebSocket(this.wsUrl);
        this.setupWebSocketHandlers();
      } catch (error) {
        this.handleReconnect();
      }
    },
    observe() {
      if (this.chatWindow && !this.chatWindow.closed) {
        this.chatWindow.focus();
        return;
      }
      const chatUrl = this.$router.resolve({
        path: `/chatobs/${this.obId}`,
        query: { obId: this.obId, sessionId: this.sessionId }
      }).href;
      this.chatWindow = window.open(chatUrl, '_blank');
      if (this.checkerTimer) clearInterval(this.checkerTimer);
      this.checkerTimer = setInterval(() => {
        if (this.chatWindow && this.chatWindow.closed) {
          clearInterval(this.checkerTimer);
          this.checkerTimer = null;
          this.chatWindow = null;
        }
      }, 1000);
    },
    _closeChatWindow() {
      if (this.chatWindow && !this.chatWindow.closed) {
        this.chatWindow.close();
        this.chatWindow = null;
      }
    },
    handleMainUnload() {
      this._closeChatWindow();
    },
    setupWebSocketHandlers() {
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };
      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        this.handleIncomingMessage(response);
      };
      this.ws.onerror = () => {
        this.isConnected = false;
      };
      this.ws.onclose = (event) => {
        this.isConnected = false;
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect();
        }
      };
    },
    handleReconnect() {
      const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeWebSocket();
      }, delay);
    },
    handleIncomingMessage(response) {
      const newMessage = {
        from: response.system ? 'system' : 'consultant',
        text: response.msg,
        time: dayjs(response.time).format('HH:mm:ss'),
        status: 'received'
      };
      this.messages.push(newMessage);
      if (newMessage.text === '会话已结束') {
        window.close();
      }
    },
    addMessage(content) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        alert('连接尚未建立，请稍后再试');
        return;
      }
      const userMessage = { from: 'user', text: content, time: dayjs().format('HH:mm:ss'), status: 'sending' };
      this.messages.push(userMessage);
      try {
        this.ws.send(JSON.stringify({ msg: content }));
        this.messages[this.messages.length - 1].status = 'sent';
      } catch {
        const idx = this.messages.findIndex(m => m.status === 'sending');
        if (idx !== -1) this.messages[idx].status = 'failed';
      }
    },
    cleanupWebSocket() {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
      }
    },
    fetchHistory() {},
    calculateRemainingTime() {
      const start = dayjs(this.starttime);
      this.remainingTime = start.add(1, 'hour').diff(dayjs(), 'seconds');
    },
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.remainingTime <= 0) {
          clearInterval(this.countdownInterval);
          alert('本次咨询时间已到，即将结束会话');
          this._closeChatWindow();
        } else {
          this.remainingTime--;
        }
      }, 1000);
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.chat-container { display: flex; flex-direction: column; height: 100vh; position: relative; background-color: #f1eaa6; padding-bottom:30px; }
.chat-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 1000; }
.header-left { display: flex; align-items: center; gap: 20px; }
.connection-status { font-size: 0.9rem; color: #909399; }
.connection-status.connected { color: #67C23A; }
.end-session-btn { background: #409EFF; color: #fff; border: none; padding: 8px 16px; border-radius:4px; cursor:pointer; transition: background 0.3s; margin-right:10px; }
.end-session-btn:hover { background: #66b1ff; }
.main-chat { flex:1; margin-top:60px; padding:20px; overflow-y:auto; width: calc(100% - 40px); }
.confirm-dialog { position:fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; }
.dialog-content { background:white; padding:24px; border-radius:8px; min-width:400px; box-shadow:0 2px 12px rgba(0,0,0,0.1); }
.dialog-btns { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.dialog-btns button:first-child { background: #409EFF; color:white; }
.dialog-btns button:last-child { background: #f4f4f5; color:#606266; }
</style>
