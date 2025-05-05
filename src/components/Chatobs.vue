<template>
  <div class="schedule-container">
    <h2>咨询师与来访者对话</h2>
    <div class="chat-history">
      <div
        v-for="msg in superviseMessages"
        :key="msg.time"
        :class="['chat-bubble', msg.senderType ? 'consultant' : 'user']"
      >
        <div class="chat-meta">
          <span class="sender">{{ msg.senderType ? '咨询师' : '来访者' }}</span>
          <span class="time">{{ formatTime(msg.time) }}</span>
        </div>
        <div class="chat-msg">{{ msg.msg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import axios from 'axios'

export default {
  data() {
    return {
      superviseMessages: [],
      token: localStorage.getItem('token'),
    }
  },
  created() {
    this.fetchSuperviseHistory()
    this.initSuperviseWs()
  },
  methods: {
    async fetchSuperviseHistory() {
      const { data } = await axios.get(
        `http://localhost:8080/internal/session/history`,
        {
          params: { sessionId: parseInt(this.$route.query.obId, 10) },
          headers: { token: this.token },
        }
      )
      if (data.code === "1") {
        this.superviseMessages = data.data
      }
    },
    initSuperviseWs() {
      const ws = new WebSocket(`ws://localhost:8080/observe?token=${this.token}&sessionId=${this.$route.query.obId}`)
      ws.onmessage = e => {
        const msg = JSON.parse(e.data)
        this.superviseMessages.push(msg)
      }
    },
    formatTime(t) {
      return dayjs(t).format('YYYY-MM-DD HH:mm:ss')
    },
  },
}
</script>

<style scoped>
.schedule-container {
  padding: 16px;
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  border: 1px solid #7a3b10;
  border-radius: 20px;
  box-sizing: border-box;
  padding-bottom:30px;
}

h2 {
  margin-bottom: 12px;
  color: #8b4513;
  font-size: 18px;
}

.chat-history {
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.chat-bubble {
  max-width: 75%;
  margin-bottom: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.consultant {
  background-color: #fffbe6;
  align-self: flex-start;
  border: 1px solid #ffecb3;
  border-top-left-radius: 0;
}

.user {
  background-color: #e6f7ff;
  align-self: flex-end;
  margin-left: auto;
  border: 1px solid #b3e5fc;
  border-top-right-radius: 0;
}

.chat-meta {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
}

.chat-msg {
  white-space: pre-wrap;
}
</style>
