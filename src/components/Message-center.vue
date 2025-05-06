<template>
    <div class="messages-container">
      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="markAllAsRead" class="custom-btn">全部标记为已读</el-button>
        <el-button type="danger" @click="deleteReadMessages" class="custom-btn">删除所有已读消息</el-button>
      </div>
  
      <!-- 无消息提示 -->
      <div v-if="messages.length === 0" class="no-messages">暂无消息</div>
  
      <!-- 消息卡片列表 -->
      <div class="message-card-container">
        <div class="message-card" v-for="msg in sortedMessages" :key="msg.notfId" @click="handleRead(msg)">
          <div class="message-left">
            <p class="message-content" v-html="formatContent(msg.content)"></p>
            <p class="message-time">{{ formatTime(msg.createTime) }}</p>
          </div>
          <div class="message-right">
            <el-tag v-if="msg.status === 'New'" type="danger">未读</el-tag>
            <el-tag v-else type="success">已读</el-tag>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        token: localStorage.getItem("token"),
        messages: [],
      };
    },
    computed: {
      sortedMessages() {
        return this.messages
          .filter((msg) => msg.status !== "Deleted")
          .sort((a, b) => {
            if (a.status !== b.status) {
              return a.status === "New" ? -1 : 1; // 未读优先
            }
            return new Date(b.createTime) - new Date(a.createTime); // 时间倒序
          });
      },
    },
    methods: {
      fetchMessages() {
        axios
          .get("http://localhost:8080/internal/notification/list", {
            headers: { token: this.token },
          })
          .then((res) => {
            if (res.data.code === "1") {
              this.messages = res.data.data;
            }
          });
      },
      formatTime(datetime) {
        const date = new Date(datetime);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const h = date.getHours().toString().padStart(2, "0");
        const min = date.getMinutes().toString().padStart(2, "0");
        return `${y}-${m}-${d} ${h}:${min}`;
      },
      formatContent(content) {
        if (!content) return '';
        return content
          .split(",")
          .map((str) => str.trim())
          .join("<br>");
      },
      handleRead(msg) {
        if (msg.status === "New") {
          axios
            .put(
              "http://localhost:8080/internal/notification",
              {},
              {
                params: { notfId: msg.notfId },
                headers: { token: this.token },
              }
            )
            .then((res) => {
              if (res.data.code === "1") {
                msg.status = "Read";
              }
            });
        }
      },
      markAllAsRead() {
        const unread = this.messages.filter((m) => m.status === "New");
        const requests = unread.map((msg) =>
          axios.put(
            "http://localhost:8080/internal/notification",
            {},
            {
              params: { notfId: msg.notfId },
              headers: { token: this.token },
            }
          )
        );
  
        Promise.all(requests).then(() => {
          this.messages.forEach((msg) => {
            if (msg.status === "New") msg.status = "Read";
          });
        });
      },
      deleteReadMessages() {
        const readMsgs = this.messages.filter((m) => m.status === "Read");
        const requests = readMsgs.map((msg) =>
          axios.delete("http://localhost:8080/internal/notification", {
            params: { notfId: msg.notfId },
            headers: { token: this.token },
          })
        );
  
        Promise.all(requests).then(() => {
          this.messages = this.messages.filter((m) => m.status !== "Read");
        });
      },
    },
    mounted() {
      this.fetchMessages();
    },
  };
  </script>
  
  <style scoped>
  .messages-container {
    padding: 20px;
    height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
    background-color: white;
    text-align: left;
    width:100%;
    bottom:20px;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    gap: 12px;
  }
  
  .custom-btn {
    background-color: #ffe4b5;
    color: #8b4513;
    border: 1px solid #ffe4b5;
  }
  
  .message-card-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 一行显示两个卡片 */
    gap: 24px; /* 可稍微增大间距 */
    grid-auto-rows: minmax(150px, auto);
    overflow-y: auto;
    height: 100vh;
  }
  
  .message-card {
    display: flex;
    flex-direction: column; /* Make the card layout vertically stacked */
    justify-content: flex-start;
    align-items: flex-start;
    background-color: white;
    border: 1px solid #FFE4B5;
    border-radius: 12px;
    padding: 16px;
  
    transition: background-color 0.2s ease-in-out;
    cursor: pointer;
    min-height: 150px; /* Ensure uniform height for cards */
  }
  
  .message-card:hover {
    background-color: #f4e7d3;
  }
  
  .message-left {
    flex: 1;
    padding-right: 10px;
  }
  
  .message-content {
    font-size: 16px;
    color: #333;
    margin-bottom: 6px;
    white-space: pre-wrap;
    line-height: 1.5;
  }
  
  .message-time {
    font-size: 14px;
    color: #999;
    margin-top: auto;
  }
  
  .message-right {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding-top: 4px;
  }
  
  .no-messages {
    text-align: center;
    font-size: 20px;
    color: #999;
    margin-top: 100px;
  }
  </style>
  