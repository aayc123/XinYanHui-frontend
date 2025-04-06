<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>在线心理咨询</h2>
        <button @click="confirmEndSession">结束会话</button>
      </div>
    </el-header>
    <el-container>
      <div class="chat">
        <!-- 对话区域 -->
        <el-card>
          <div class="chat-area">
            <ChatMessages />
            <CountdownTimer />
          </div>
        </el-card>
      </div>
      <div class="side-panel">
        <!-- 聊天记录 -->
        <el-card>
          <div slot="header" class="clearfix">
            <span>历史聊天记录</span>
          </div>
          <ChatHistory />
        </el-card>
      </div>
    </el-container>

    <!-- 确认结束会话弹窗 -->
    <el-dialog :visible.sync="showConfirmDialog" title="确认结束会话">
      <span>是否确定要结束本次会话？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" @click="endSession">确定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<style scoped lang="less">
.chat {
  width: 70%;
  padding: 20px;
}

.side-panel {
  width: 30%;
  margin-left: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-area {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

<script>
import ChatMessages from '../components/ChatMessages.vue';
import ChatHistory from '../components/ChatHistory.vue';
import CountdownTimer from '../components/CountdownTimer.vue';

export default {
  components: {
    ChatMessages,
    ChatHistory,
    CountdownTimer
  },
  data() {
    return {
      showConfirmDialog: false
    };
  },
  methods: {
    confirmEndSession() {
      this.showConfirmDialog = true;
    },
    endSession() {
      this.showConfirmDialog = false;
      this.$router.push("/"); // 跳转回首页
    }
  }
};
</script>
