<template>
  <div class="help-records">
    <!-- 原有会话卡片列表部分继续保留 -->
    <div class="help-card-container">
      <div class="help-card" v-for="help in helps" :key="help.recordId">
          <p><strong>{{ formatDate(help.requestTime) }}</strong></p>       
          <div class="consultant-row">
              <p class="consultant-name">{{ help.consultantName }}</p>
              <el-button size="small" type="primary" 
                      style="background-color: #FFE4B5; color: #8B4513; border-color: #FFE4B5;"
                      class="detail-button"
                      @click="openDetailDialog(help.recordId)">
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
          v-for="msg in helpHistory" 
          :key="msg.time" 
          :class="['chat-bubble', msg.senderType ? 'consultant' : 'supervisor']"
        >
          <div class="chat-meta">
            <span class="sender">{{ msg.senderType ? '咨询师' : '督导' }}</span>
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
      helps: [],
      detailDialogVisible: false,
      helpHistory: [],
      filterDate: null,
      token: localStorage.getItem("token") || "",
      supervisorId: localStorage.getItem("supervisorId")
    };
  },
  methods: {
    async fetchhelps() {
      try {
        const params = { supervisorId: this.supervisorId };

        if (this.filterDate && this.filterDate.length === 2) {
          params.startDate = this.formatPDate(this.filterDate[0]);
          params.endDate = this.formatPDate(this.filterDate[1]);
        }

        const res = await axios.get("http://localhost:8080/internal/supervise/list/supervisor", {
          headers: { token: this.token },
          params:{supervisorId:this.supervisorId}
        });

        if (res.data.code === "1") {
          this.helps = res.data.data;
          this.helps.sort((a,b)=>{
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

    openDetailDialog(recordId) {
      this.$axios.get("http://localhost:8080/internal/supervise/history", {
        headers: { token: this.token },
        params: { recordId: recordId },
      }).then(res => {
        if (res.data.code === "1") {
          this.helpHistory = res.data.data;
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
  },
  created() {
    axios.defaults.headers.common["token"] = localStorage.getItem("token") || "";
    this.fetchhelps();
  }
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
.consultant-row {
display: flex;
justify-content: space-between;
align-items: center;
margin-top: 8px;
}

.consultant-name {
font-size: 14px;
margin: 0;
}
.detail-button {
background-color: #FFE4B5;
color: #8B4513;
border-color: #FFE4B5;
margin-left: 140px; /* 关键：把按钮推到最右侧 */
}
.help-records {
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 20px 40px 20px; /* 底部多加点 padding，确保滑到底时最后一个卡片不会被遮住 */
  display: flex;
  flex-direction: column;
}

.help-card-container {
  max-height: calc(100vh - 120px); /* 视窗高度减去顶部筛选区域 + padding */
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding-bottom: 50px; /* 防止最后一项被遮住 */
}



.help-card {
  background-color: white;
  border: 1px solid #FFE4B5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}

.help-left, .help-right {
  width: 45%;
  justify-content: center;
}

.help-left p {
  margin: 6px 0;
  font-size: 14px;
  margin-bottom: 8px;
}

.help-right .rating {
  margin-bottom: 8px;
}

.feedback {
  font-size: 13px;
  color: #666;
}

.help-actions {
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

.supervisor {
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