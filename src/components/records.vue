<template>
  <div class="session-records">
    <!-- 筛选条件 -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="会话时间">
        <el-date-picker
          v-model="filterDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button 
          style="background-color: #FFE4B5; color: #8B4513;"
          @click="fetchSessions"
        >
          筛选
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 原有会话卡片列表部分继续保留 -->
    <div class="session-card-container">
      <div class="session-card" v-for="session in sessions" :key="session.sessionId">
        <div class="session-left">
          <p><strong>{{ formatDate(session.startTime) }}</strong></p>
          <p>{{ session.username }}</p>
        </div>
        <div class="session-right">
          <div class="rating">
            <template v-if="session.rating !== null">
              <el-rate :value="session.rating" disabled />
              <p class="feedback">{{ session.feedback || "无评价" }}</p>
            </template>
            <template v-else>
              <p class="feedback">无评价</p>
            </template>
          </div>
        </div>
        <div class="session-actions">
          <!-- 导出按钮 -->
          <el-button size="small" type="primary" 
                     style="background-color: #FFE4B5; color: #8B4513; border-color: #FFE4B5; margin-right: 10px;"
                     @click="exportSession(session.sessionId)">
            导出会话
          </el-button>
          <el-button size="small" type="primary" 
                     style="background-color: #FFE4B5; color: #8B4513; border-color: #FFE4B5;"
                     @click="openDetailDialog(session.sessionId)">
            咨询详情
          </el-button>
        </div>
      </div>
    </div>

    <!-- 咨询详情弹窗 -->
    <el-dialog
        :visible.sync="detailDialogVisible"
        :show-close="false"
        title="咨询详情"
        width="50%"
        class="custom-dialog"
      >
      <div class="chat-history">
        <div 
          v-for="msg in sessionHistory" 
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
      <div style="text-align: right; margin-top: 20px;">
        <el-button
          type="primary"
          @click="detailDialogVisible = false"
          style="background-color: #FFE4B5; color: #8B4513; border-color: #FFE4B5; border-radius: 6px;"
        >
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>



<script>
import axios from "axios";

export default {
  data() {
    return {
      sessions: [],
      detailDialogVisible: false,
      sessionHistory: [],
      filterDate: null,
      token: localStorage.getItem("token") || "",
      consultantId: localStorage.getItem("consultantId")
    };
  },
  methods: {
    async fetchSessions() {
      try {
        const params = { consultantId: this.consultantId };

        if (this.filterDate && this.filterDate.length === 2) {
          params.startDate = this.formatPDate(this.filterDate[0]);
          params.endDate = this.formatPDate(this.filterDate[1]);
        }

        const res = await axios.get("http://localhost:8080/internal/session/list", {
          headers: { token: this.token },
          params
        });

        if (res.data.code === "1") {
          this.sessions = res.data.data;
          this.sessions.sort((a,b)=>{
            return new Date(b.startTime) - new Date(a.startTime)
          })
        } else {
          this.$message.error("获取会话列表失败：" + res.data.msg);
        }
      } catch (err) {
        this.$message.error("请求错误：" + err);
      }
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      const hours = (`0${d.getHours()}`).slice(-2);
      const minutes = (`0${d.getMinutes()}`).slice(-2);
      const seconds = (`0${d.getSeconds()}`).slice(-2);
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    formatPDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    },

    openDetailDialog(sessionId) {
      this.$axios.get("http://localhost:8080/internal/session/history", {
        headers: { token: this.token },
        params: { sessionId: sessionId },
      }).then(res => {
        if (res.data.code === "1") {
          this.sessionHistory = res.data.data;
          this.detailDialogVisible = true;
        } else if (res.data.code === "2") {
          this.$message(res.data.msg);
        } else {
          this.$message.error("获取会话列表失败：" + res.data.msg);
        }
      }).catch(err => {
        this.$message.error("请求错误：" + err);
      });
    },

    formatTime(timeStr) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString();
    },
    exportSession(sessionId) {
  this.$axios.get("http://localhost:8080/internal/session/export", {
    headers: { token: this.token },
    params: { sessionId: sessionId },
    responseType: 'blob',  // 非常重要
  }).then(response => {
    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });

    // 获取文件名（从响应头或自定义）
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'session_export.xlsx'; // 默认文件名
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    // 创建临时下载链接
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);

    this.$message.success("导出成功！");
  }).catch(error => {
    this.$message.error("导出失败：" + error);
  });
}
,
  },

  created() {
    axios.defaults.headers.common["token"] = localStorage.getItem("token") || "";
    this.fetchSessions();
  }
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.session-records {
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 20px 40px 20px; /* 底部多加点 padding，确保滑到底时最后一个卡片不会被遮住 */
  display: flex;
  flex-direction: column;
}

.session-card-container {
  max-height: calc(100vh - 120px); /* 视窗高度减去顶部筛选区域 + padding */
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding-bottom: 50px; /* 防止最后一项被遮住 */
}



.session-card {
  background-color: white;
  border: 1px solid #FFE4B5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.session-left, .session-right {
  width: 45%;
}

.session-left p {
  margin: 6px 0;
  font-size: 14px;
}

.session-right .rating {
  margin-bottom: 8px;
}

.feedback {
  font-size: 13px;
  color: #666;
}

.session-actions {
  width: 100%;
  margin-top: 10px;
  text-align: right;
}

.chat-history {
  max-height: 400px;
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
  position: relative;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.user {
  background-color: #fffbe6;
  align-self: flex-start;
  border: 1px solid #ffecb3;
  border-top-left-radius: 0;
}

.consultant {
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

.el-dialog__body {
  padding-top: 10px;
}

.custom-dialog .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.filter-form {
  justify-content: flex-start;
  display: flex;
}
</style>