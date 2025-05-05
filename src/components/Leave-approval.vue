<template>
  <div class="leave-management">
    <h2>请假记录管理</h2>

    <!-- 筛选条件 -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="申请时间">
        <el-date-picker
          v-model="filterDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="background-color: #FFE4B5; color: #8B4513;" @click="filterRecords">
          筛选
        </el-button>
      </el-form-item>
    </el-form>


    <!-- 请假记录列表 -->
    <div class="leave-card-container">
      <div class="leave-card" v-for="record in filteredLeaves" :key="record.scheduleId">
        <p><strong>咨询师ID：</strong>{{ record.consultantId }}</p>
        <p><strong>用户名：</strong>{{ record.username }}</p>
        <p><strong>请假日期：</strong>{{ record.date }}</p>
        <p><strong>时间段：</strong>{{ record.time }}</p>
        <p><strong>请假理由：</strong>
          <el-button type="text" @click="showReason(record.cancellationReason)">查看</el-button>
        </p>
        <p><strong>状态：</strong>{{ getStatusText(record.status) }}</p>

        <el-button
          type="primary"
          size="small"
          @click="openApprovalDialog(record)"
          v-if="record.status === 'pending'"
          style="background-color: #FFE4B5; border-color: #FFE4B5; color: #8B4513;">
          审批
        </el-button>
      </div>
    </div>

    <!-- 请假理由弹窗 -->
    <el-dialog title="请假理由" :visible.sync="reasonDialogVisible" center>
      <p>{{ selectedReason }}</p>
      <div style="text-align: right; margin-top: 20px;">
        <el-button type="primary" @click="reasonDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog title="审批请假申请" :visible.sync="approvalDialogVisible" center>
      <p>请审批该咨询师的请假申请：</p>
      <el-radio-group v-model="approvalStatus">
        <el-radio label="approved">通过</el-radio>
        <el-radio label="rejected">驳回</el-radio>
      </el-radio-group>
      <div style="margin-top: 20px; text-align: right;">
        <el-button 
          type="primary" 
          @click="submitApproval" 
          style="background-color: #FFE4B5; border-color: #FFE4B5; color: #8B4513;">
          确认
        </el-button>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      leaveRecords: [],
      filterDate: null,
      reasonDialogVisible: false,
      selectedReason: "",
      approvalDialogVisible: false,
      selectedLeave: null,
      approvalStatus: ""
    };
  },
  computed: {
    filteredLeaves() {
      return this.leaveRecords.filter((record) => {
        if (this.filterDate) {
          const [start, end] = this.filterDate;
          const recordDate = new Date(record.date);
          if (recordDate < start || recordDate > end) return false;
        }
        return true;
      });
    }
  },
  methods: {
    async fetchLeaves() {
      try {
        const response = await axios.get("http://localhost:8080/internal/admin/getLeaveList");
        if (response.data.code === "1") {
          this.leaveRecords = response.data.data.map((item) => {
            const reasonMatch = item.note && item.note.match(/Reason:\s*(.*)$/);
            return {
              scheduleId: item.scheduleId,
              consultantId: item.consultantId,
              username: item.username,
              date: item.availableDate,
              time: `${item.startTime}:00 - ${item.endTime}:00`,
              cancellationReason: reasonMatch ? reasonMatch[1] : "无理由",
              status: "pending" // 默认状态
            };
          });
        } else {
          this.$message.error("请假数据获取失败：" + response.data.msg);
        }
      } catch (error) {
        this.$message.error("请求失败：" + error);
      }
    },
    filterRecords() {
      // 自动过滤，由 computed 处理
    },
    showReason(reason) {
      this.selectedReason = reason;
      this.reasonDialogVisible = true;
    },
    openApprovalDialog(record) {
      this.selectedLeave = record;
      this.approvalStatus = "";
      this.approvalDialogVisible = true;
    },
    async submitApproval() {
      if (!this.selectedLeave || !this.approvalStatus) return;
      try {
        const res = await axios.post(
          "http://localhost:8080/internal/admin/approveLeave",
          {
            scheduleId: this.selectedLeave.scheduleId,
            isApproved: this.approvalStatus === "approved"
          }
        );
        if (res.data.code === "1") {
          this.$message.success("审批成功");
          this.selectedLeave.status = this.approvalStatus;
          this.approvalDialogVisible = false;
        } else {
          this.$message.error("审批失败：" + res.data.msg);
        }
      } catch (err) {
        this.$message.error("网络错误：" + err);
      }
    },
    getStatusText(status) {
      const statusMap = {
        pending: "未审批",
        approved: "已通过",
        rejected: "已驳回"
      };
      return statusMap[status] || "未知状态";
    }
  },
  created() {
    axios.defaults.headers.common["token"] = localStorage.getItem("token") || "";
  },
  mounted() {
    this.fetchLeaves();
  }
};
</script>

<style scoped>
.leave-management {
  padding: 20px;
}

/* 筛选区域整体 */
.filter-form {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 保持 el-form-item 的高度一致 */
.filter-form .el-form-item {
  margin-bottom: 0;
}

/* 日期选择器去掉蓝色边框 */
.el-date-editor {
  box-shadow: none !important;
  border-color: #dcdfe6 !important;
}
.el-date-editor:focus,
.el-date-editor.is-active,
.el-date-editor input:focus {
  outline: none;
  border-color: #dcdfe6 !important;
  box-shadow: none !important;
}

/* 筛选按钮样式统一高度 */
.filter-form .el-button {
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

/* 卡片区域 */
.leave-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.leave-card {
  background-color: white;
  border: 1px solid #FFE4B5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease;
}

.leave-card:hover {
  transform: translateY(-2px);
}

.leave-card p {
  margin: 6px 0;
  font-size: 14px;
}

.el-button {
  margin-top: 10px;
}

.el-dialog {
  width: 500px;
}
</style>
