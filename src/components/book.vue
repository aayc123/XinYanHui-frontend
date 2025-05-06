<template>
  <div class="appointment-records">
    <!-- 筛选条件 -->
    <el-form :inline="true" class="filter-form">
      <el-form-item label="预约时间">
        <el-date-picker
          v-model="filterDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button style="background-color: #FFE4B5; color: #8B4513;" @click="fetchAppointments">
          筛选
        </el-button>
        
      </el-form-item>
      <div style="color:#333">点击可取消预约</div>
    </el-form>

    <!-- 预约记录列表 -->
    <div class="appointment-card-container">
      <div 
        class="appointment-card" 
        v-for="record in sortedAppointments" 
        :key="record.appointmentId"
        @click="handleCancel(record.appointmentId)"
      >
        <p><strong>咨询师：</strong>{{ record.consultantName }}</p>
        <p><strong>预约时间：</strong>{{ record.appointmentDate }} {{ record.appointmentTime }}</p>
      </div>
    </div>

    <!-- 取消预约弹窗 -->
    <el-dialog
    title="取消预约"
    :visible.sync="showCancelModal"
    width="400px"
    border-radius="20px"
    class="custom-cancel-dialog"
  >
    <div>
      <p>确定要取消该预约吗？</p>
      <el-input
        type="textarea"
        v-model="leaveReason"
        placeholder="请输入取消理由"
        :rows="4"
        style="margin-top: 15px;"
      />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showCancelModal = false">取 消</el-button>
      <el-button
        class="el-button--confirm"
        @click="submitCancel"
      >
        确 定
      </el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      userId: localStorage.getItem("userId"), 
      token: localStorage.getItem("token"),
      appointments: [],
      filterDate: null,
      showCancelModal: false,
      currentAppointmentId: null,
      leaveReason: ""
    };
  },
  computed: {
    sortedAppointments() {
      return [...this.appointments].sort((a, b) => {
        const aTime = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const bTime = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return bTime - aTime;
      });
    }
  },
  methods: {
    handleCancel(appointmentId) {
      this.currentAppointmentId = appointmentId;
      this.showCancelModal = true;
      this.leaveReason = "";
    },

    async submitCancel() {
      if (!this.leaveReason.trim()) {
        this.$message.warning("请输入取消理由");
        return;
      }

      try {
        const res = await axios.post("/user/cancel", {
          appointmentId: this.currentAppointmentId,
          cancellationReason: this.leaveReason
        }, {
          headers: { token: this.token }
        });

        if (res.data.code === '1') {
          this.$message("取消预约成功");
          this.showCancelModal = false;
          await this.fetchAppointments();
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (err) {
        this.$message.error("取消预约失败：" + err.message);
      }
    },
    async fetchAppointments() {
      try {
        const params = {
          userId: this.userId,
          appointmentStatus: "BOOKED"
        };

        if (this.filterDate && this.filterDate.length === 2) {
          params.startDate = this.formatDate(this.filterDate[0]);
          params.endDate = this.formatDate(this.filterDate[1]);
        }

        const res = await axios.get("http://localhost:8080/user/appointments", {
          headers: {
            token: localStorage.getItem("token") || ""
          },
          params
        });

        if (res.data.code === 1 || res.data.code === "1") {
          this.appointments = (res.data.data || []).map(item => {
            return {
              appointmentId: item.appointmentId,
              userId: item.userId,
              consultantName: item.consultantName || "未知用户",
              consultantId: item.consultantId,
              appointmentDate: item.appointmentDate,
              appointmentTime: item.appointmentTime,
              bookingDate: item.bookingDate,
              status: item.status,
              cancellationTime: item.cancellationTime,
              cancellationReason: item.cancellationReason || "无理由"
            };
          });
          if(res.data.data.length === 0) {
            this.$message("没有预约记录");
          }
        }else if (res.data.code === "2") {
          this.appointments = [];
          this.$message("没有预约记录");
        } 
        else {
          this.$message.error("获取预约记录失败：" + res.data.msg);
        }
      } catch (err) {
        this.$message.error("请求失败：" + err);
      }
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    }
  },
  created() {
    axios.defaults.headers.common["token"] = localStorage.getItem("token") || "";
  },
  mounted() {
    this.fetchAppointments();
  }
};
</script>

<style scoped>
.appointment-records {
  padding: 20px;
  overflow-y: auto;
}
/* 取消预约对话框自定义 */
.custom-cancel-dialog .el-dialog__header,
.custom-cancel-dialog .el-dialog__body,
.custom-cancel-dialog .el-dialog__footer {
  border-radius: 20px;
}
.custom-cancel-dialog .el-dialog__headerbtn {
  display: none;
}

/* 底部按钮圆角 */
.custom-cancel-dialog .dialog-footer .el-button {
  border-radius: 10px;
  margin-right:10px;
}
/* 确定按钮配色 */
.custom-cancel-dialog .dialog-footer .el-button--confirm {
  background-color: #FFE4B5;
  border-color: #FFE4B5;
  color: #8B4513;
}

/* 筛选区域 */
.filter-form {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
}

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

.filter-form .el-button {
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

/* 卡片样式 */
.appointment-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.appointment-card {
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

.appointment-card:hover {
  transform: translateY(-2px);
}

.appointment-card p {
  margin: 6px 0;
  font-size: 14px;
}
.el-dialog__header {
  background-color: #f5e7da;
}

.el-dialog__title {
  color: #8B4513;
}

.el-textarea__inner {
  border-color: #FFE4B5;
}

.el-textarea__inner:focus {
  border-color: #8B4513;
}
</style>
