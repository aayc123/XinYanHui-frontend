<template>
  <div class="messages-container">
    <el-dialog
      :visible.sync="deleteConfirmVisible"
      title="确认删除"
      width="30%"
      :show-close="false"
    >
      <span>确定要删除所有已读消息吗？此操作不可撤销！</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteConfirmVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDeleteRead">确 定</el-button>
      </span>
    </el-dialog>
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
      deleteConfirmVisible: false,  
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
    // 修改删除方法
    deleteReadMessages() {
      const readCount = this.messages.filter(m => m.status === "Read").length;
      if (readCount === 0) {
        this.$message.warning("当前没有可删除的已读消息");
        return;
      }
      this.deleteConfirmVisible = true;
    },

    // 新增确认删除方法
    confirmDeleteRead() {
      const readMsgs = this.messages.filter((m) => m.status === "Read");
      const requests = readMsgs.map((msg) =>
        axios.delete("http://localhost:8080/internal/notification", {
          params: { notfId: msg.notfId },
          headers: { token: this.token },
        })
      );

      Promise.all(requests)
        .then(() => {
          this.messages = this.messages.filter((m) => m.status !== "Read");
          this.$message.success(`成功删除${readMsgs.length}条消息`);
        })
        .catch(() => {
          this.$message.error("删除操作失败");
        })
        .finally(() => {
          this.deleteConfirmVisible = false;
        });
    },
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
              this.$set(msg, 'status', 'Read'); // 使用 $set 来保证响应式
              this.messages = [...this.messages]; // 通过重新赋值来触发渲染
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
  },
  mounted() {
    this.fetchMessages();
  },
};
</script>

<style scoped>
.messages-container {
  padding: 20px;
  height: calc(100vh - 40px); /* 确保容器不被遮挡，减去padding */
  overflow-y: auto;
  box-sizing: border-box;
  background-color: white;
  text-align: left;
  width: 100%;
  bottom: 20px;
}

.message-card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 一行显示两个卡片 */
  gap: 24px; /* 可稍微增大间距 */
  grid-auto-rows: minmax(150px, auto);
  overflow-y: auto;
  height: calc(100vh - 140px); /* 除去头部和底部的部分，确保底部有足够空间 */
  padding-bottom: 20px; /* 给底部加一些空间，避免遮挡 */
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
.message-card {
  display: flex;
  flex-direction: column; /* 改为纵向布局 */
  justify-content: space-between; /* 内容上下分布 */
  align-items: flex-start;
  background-color: white;
  border: 1px solid #FFE4B5;
  border-radius: 12px;
  padding: 16px;
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
  height: 170px; /* 设置固定高度 */
  overflow: hidden; /* 隐藏溢出的内容 */
}

.message-left {
  flex: 1;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 上下均匀分布内容 */
}

.message-content {
  font-size: 16px;
  color: #333;
  margin-bottom: 6px;
  white-space: pre-wrap;
  line-height: 1.5;
  overflow-y: auto; /* 允许内容溢出时滚动 */
  max-height: 100px; /* 限制消息内容的最大高度 */
}

.message-time {
  font-size: 14px;
  color: #999;
  margin-top: auto;
}

.message-right {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px; /* 调整间距，使未读标识和时间更接近 */
}

.no-messages {
  text-align: center;
  font-size: 20px;
  color: #999;
  margin-top: 100px;
}

.message-card:hover {
  background-color: #f4e7d3;
}



.no-messages {
  text-align: center;
  font-size: 20px;
  color: #999;
  margin-top: 100px;
}
.dialog-footer {
  text-align: right;
}


.el-button--primary:hover,
.el-button--danger:hover {
  background-color: #ffd699;
}
/* 修改后样式 */

</style>
