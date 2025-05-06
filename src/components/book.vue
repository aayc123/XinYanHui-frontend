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
      <div>方框变红，则预约开始， 点击进入！</div>
    </el-form>

    <!-- 预约记录列表 -->
    <div class="appointment-card-container">
      <div
        class="appointment-card"
        :class="{ 'urgent-appointment': isWithinOneHourAfter(record) }"
        v-for="record in sortedAppointments"
        :key="record.appointmentId"
        @click="isWithinOneHourAfter(record) && handleCardClick(record.appointmentId,record.appointmentTime,record.appointmentDate)"
      >
        <p><strong>用户名：</strong>{{ record.userName }}</p>
        <p><strong>预约时间：</strong>{{ record.appointmentDate }} {{ record.appointmentTime }}</p>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
export default {
  data() {
    return {
      consultantId: localStorage.getItem("consultantId"),
      token: localStorage.getItem("token"),
      appointments: [],
      filterDate: null,
      WindowOpen:null,
    };
  },
  computed: {
    sortedAppointments() {
      const now = new Date();
      return [...this.appointments].sort((a, b) => {
        const aTime = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const bTime = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return Math.abs(aTime - now) - Math.abs(bTime - now); // 越靠近现在的排前面
      });
    }
  },
  methods: {
    // 修改计算剩余时间的方法
    calculateRemainingTime() {
      // 从路由参数获取日期和时间
      const dateStr = this.$route.query.appointmentDate;
      const timeStr = this.$route.query.appointmentTime;
      
      // 合并日期时间（格式：YYYY-MM-DD HH:mm）
      const appointmentDateTime = dayjs(`${dateStr} ${timeStr}`);
      
      // 计算结束时间（预约时间+1小时）
      const endTime = appointmentDateTime.add(1, 'hour');
      
      // 获取当前时间
      const now = dayjs();
      
      // 计算剩余秒数（如果已超时则显示0）
      this.remainingTime = Math.max(endTime.diff(now, 'second'), 0);
    },
    async handleCardClick(apId, time, date) {
      try {
        // 使用await等待请求完成
        const res = await axios.get("http://localhost:8080/internal/consultant/session", {
          headers: {
            token: localStorage.getItem("token") 
          },
          params: { appointmentId: apId }
        });
        
        // 根据实际响应结构调整sessionId的获取方式
        const sessionId = res.data.data.sessionId; // 假设响应结构为{ data: { sessionId: 'xxx' } }
        
        if (this.WindowOpen && !this.WindowOpen.closed) {
          this.WindowOpen.focus();
          return;
        }
        
        // 生成正确的路由路径
        const chatUrl = this.$router.resolve({
          path: `/chatnormal/${sessionId}`, // 传递sessionId作为路径参数
          query: {
            consultantId: localStorage.getItem('consultantId'),
            consultantName: localStorage.getItem('consultantname'),
            appointmentDate: date,
            appointmentTime: time,
            sessionId: sessionId,
          }
        }).href;
        
        this.WindowOpen = window.open(chatUrl, '_blank');
        this.agreeProtocol = false;
      } catch (error) {
        console.error("获取session失败:", error);
        this.$message.error("无法进入聊天，请稍后重试");
      }
    },
    isWithinOneHourAfter(record) {
      const now = new Date();
      const appointmentTime = new Date(`${record.appointmentDate}T${record.appointmentTime}`);
      const diff = now - appointmentTime;
      return diff >= 0 && diff <= 3600 * 1000; // 在之后1小时内
    },
    async fetchAppointments() {
      try {
        const params = {
          consultantId: this.consultantId,
          appointmentStatus: "BOOKED"
        };

        if (this.filterDate && this.filterDate.length === 2) {
          params.startDate = this.formatDate(this.filterDate[0]);
          params.endDate = this.formatDate(this.filterDate[1]);
        }

        const res = await axios.get("http://localhost:8080/internal/appointments", {
          headers: {
            token: localStorage.getItem("token") || ""
          },
          params
        });

        if (res.data.code === "1") {
          this.appointments = (res.data.data || []).map(item => ({
            appointmentId: item.appointmentId,
            userId: item.userId,
            userName: item.userName || "未知用户",
            consultantId: item.consultantId,
            appointmentDate: item.appointmentDate,
            appointmentTime: item.appointmentTime,
            bookingDate: item.bookingDate,
            status: item.status,
            cancellationTime: item.cancellationTime,
            cancellationReason: item.cancellationReason || "无理由"
          }));
        } else if (res.data.code === "2") {
          this.appointments = [];
          this.$message("无预约记录");
        } else {
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
  mounted() {
    axios.defaults.headers.common["token"] = localStorage.getItem("token") || "";
    this.fetchAppointments();
  }
};
</script>

<style scoped>
.urgent-appointment {
  border: 2px solid red !important;
}

.appointment-records {
  height: calc(100vh - 20px); /* 适当保留顶部空间 */
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
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
  padding-bottom: 60px; /* 防止最后一项被遮住 */
}

.appointment-card {
  background-color: white;
  border: 1px solid #FFE4B5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
}

.appointment-card p {
  margin: 6px 0;
  font-size: 14px;
}
</style>
