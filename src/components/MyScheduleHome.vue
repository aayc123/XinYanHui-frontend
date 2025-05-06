<template>
  <div class="schedule-container">
    <div class="header">
      <h2>{{ currentMonth }}月预约记录</h2>
      <button @click="toggleView">
        切换至 {{ isCalendarView ? "列表" : "日历" }} 视图
      </button>
    </div>

    <!-- 日历视图 -->
    <div v-if="isCalendarView" class="calendar-view">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      <div v-for="n in firstDayOffset" :key="'empty' + n" class="day empty"></div>
      <div
        v-for="day in monthDays"
        :key="day.date"
        :class="['day', { past: day.isPast }]"
        @click="showSchedule(day.date)"
      >
        <div>{{  formatDisplayDate(day.date) }}</div>

        <!-- 展示当天的预约信息 -->
        <div
          v-for="(appointment) in getDayAppointments(day.date)"
          :key="appointment.appointmentId"
          class="appointment-slot"
        >
          <div v-if="appointment.status === 'booked'" class="appointment-item-booked">
            预约
          </div>
          <div v-else-if="appointment.status === 'completed'" class="appointment-item">
            已完成
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in select(appointments)" :key="appointment.appointmentId">
            <td>{{ formatDate(appointment.appointmentDate) }}</td>
            <td>{{ appointment.appointmentTime }}</td>
            <td>
              <span v-if="appointment.status === 'completed'" class="completed">已完成</span>
              <span v-else-if="appointment.status === 'booked'" class="pending">未完成</span>
            </td>
            <td>
              <button
                v-if="appointment.status === 'booked'"
                @click="openCancelModal(appointment.appointmentId)"
              >
                取消预约
              </button>
              <button
                v-else-if="appointment.status === 'completed'"
                @click="viewRecord()"
              >
                查看记录
              </button>
            </td>
          </tr>
        </tbody>
       
      </table>
      <div>
          
          <button class="navTohome" @click="Tohome"> >>>前往个人主页查看更多</button>
        </div>
    </div>

    <div v-if="showLeaveModal" class="modal">
      <h3>取消预约</h3>
      <textarea v-model="leaveReason" placeholder="请填写取消理由"></textarea>
      <button @click="submitCancel">提交</button>
      <button @click="closeCancelModal">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    appointments:{
      type: Array,
      required:true,
    }
  },
  data() {
    return {
      userId: localStorage.getItem("userId"),
      token: localStorage.getItem("token"),
      isCalendarView: true,
      currentMonth: new Date().getMonth() + 1,
      currentMonthName: new Intl.DateTimeFormat("en", { month: "long" }).format(new Date()),
      weekdays: ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"],
      monthDays: [],
      firstDayOffset: 0,
      scheduleList: [],
      showLeaveModal: false, // 控制模态框显示
      leaveReason: "", // 用户填写的取消理由
      currentAppointmentId: null, // 当前要取消的预约 ID

    };
  },
  mounted() {
    this.fetchAppointments();
  },
  methods: {
    async fetchAppointments() {
      try {
        const response = await this.$axios.get("/user/appointments", {
          headers: {
            token:this.token, // 获取 JWT Token
          },
          params: { userId: parseInt(this.userId, 10) },
        });
        if (response.data.code === "1") {
          this.appointments = response.data.data.filter(
            (app) => app.status !== "canceled"
            
          ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
          
        } else {
          this.appointments = []; // 确保清空数据
        }
      } catch (error) {
        this.$message.error("获取预约数据失败");
        this.appointments = [];
      } finally {
        this.generateMonthData(); // 确保无论成功失败都生成月份
      }
    },
    Tohome(){
      this.$router.push({ path: "/userHome" });
    },
    toggleView() {
      this.isCalendarView = !this.isCalendarView;
    },
    showSchedule(date) {
      this.isCalendarView = false;
      this.$nextTick(() => {
        const target = this.scheduleList.find((item) => item.date === date);
        if (target) {
          document.querySelector(`tr[data-date="${date}"]`).scrollIntoView();
        }
      });
    },
    formatDisplayDate(date){
      const [, d] = date.split(/[-/]/);
     
      // const month = m.padStart(2, '0');
      const day = d.padStart(2, '0');
      return Number(day);
    },
    
    cancelAppointment(appointmentId, cancellationReason) {
      this.$axios
        .post("/user/cancel", {
          headers: {
            token:this.token, // 获取 JWT Token
          },
          appointmentId: parseInt(appointmentId, 10),
          cancellationReason: cancellationReason,
        })
        .then(() => {
          this.$message.success("预约已取消");
          this.fetchAppointments(); // 刷新数据
        })
        .catch(() => {
          this.$message.error("取消预约失败，请稍后重试");
        });
    },
    openCancelModal(appointmentId) {
      this.currentAppointmentId = appointmentId; // 设置当前预约 ID
      this.showLeaveModal = true; // 显示模态框
    },
    closeCancelModal() {
      this.showLeaveModal = false; // 关闭模态框
      this.leaveReason = ""; // 清空取消理由
      this.currentAppointmentId = null; // 清空当前预约 ID
    },
    submitCancel() {
      if (!this.leaveReason.trim()) {
        alert("请填写取消理由");
        return;
      }
      this.cancelAppointment(this.currentAppointmentId, this.leaveReason); // 提交取消请求
      this.closeCancelModal(); // 关闭模态框
    },
    viewRecord() {
      alert("请前往个人主页查看记录！");
    },
    generateMonthData() {
      const year = 2025; // 固定为2025年
      const month = this.currentMonth - 1; // 转换为0-11
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 计算首日偏移
      const firstDay = new Date(year, month, 1).getDay();
      this.firstDayOffset = firstDay === 0 ? 6 : firstDay - 1;

      // 生成日期数组
      this.monthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
          date: `${this.currentMonth}-${day}`,
          day: day,
          isPast: new Date(year, month, day) < new Date(), // 正确判断过去日期
        };
      });
    },
    getDayAppointments(date) {
      const [month, day] = date.split("-").map(Number);
      const fullDate = `2025-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      return this.appointments.filter(
        (app) => app.appointmentDate === fullDate
      );
    },
    formatDate(date) {
      const [year, month, day] = date.split("-");
      return `${year}-${month}-${day}`;
    },
    select(app){
      return app.filter((app) => app.appointmentDate.startsWith("2025-05")).slice(0, 5); 
    }
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.schedule-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding: 20px;
  background-color: white;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid #7a3b10; 
  border-radius: 20px;
}

.header {
  text-align: right;
  margin-bottom: 10px;
}

button {
  padding: 5px 10px;
  background-color: #8b4513;
  color: white;
  border: none;
  cursor: pointer;
}

.weekday {
  
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  text-align: center;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 5px;
}

.calendar-view {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day {
  min-height:50px;
  max-height:120px;
  border: 1px solid #ccc;
  text-align: center;
  position: relative;
  cursor: pointer;
}

.day.past {
  background: #ddd;
  max-height:120px;
}

.appointment-slot {
  position: static; /* 移除绝对定位 */
  width: 100%; /* 占满父容器宽度 */
  margin: 2px 0; /* 上下间距 */
  border-radius: 4px; /* 圆角 */
  font-size: 10px;
  text-align: center; /* 文本居中 */
}

.appointment-item {
  margin: 0px 0;
  padding: 2px 5px;
  background-color: #FFE4B5;
  border-radius: 4px;
  font-size: 10px;
}
.appointment-item-booked{
  margin: 0px 0;
  padding: 2px 5px;
  background-color: #d1f8c6;
  border-radius: 4px;
  font-size: 10px;
}
.navTohome{
  font-size: 14px;
  float:right;
  color:#999;
  background-color:white ;
}
.navTohome:hover{
  color:#333;
  cursor:pointer;
}
.list-view table {
  width: 100%;
  border-collapse: collapse;
}

.list-view th,
.list-view td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.completed {
  color: green;
}

.pending {
  color: gray;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  z-index: 1000;
}

.modal textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
}

.modal button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #8B4513;
  color: white;
  border: none;
  cursor: pointer;
}
</style>