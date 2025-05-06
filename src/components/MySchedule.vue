<template>
  <div class="schedule-container">
    <div class="header">
      <div v-if="isCalendarView">
      <span 
      v-for="date in monthRange" 
      :key="date" 
      @click="onDateClick(date)"
      :class="['date-item', { 'selected': selectedMonth === date }]"
      >
      {{ date }}月
    </span>
    </div>
    <div style="width:20%;height:10px;"> </div>
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
        <div>{{  day.date}}</div>

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
    <div v-else  class="list-view">
      <h2>会话记录</h2>
       <!-- 筛选表单 -->
    <el-form :inline="true" class="filter-form" style="margin-bottom: 16px;">
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
          style="background-color: #FFE4B5; 
          color: #8B4513;"
          @click="fetchSessions"
        >
          筛选
        </el-button>
      </el-form-item>
    </el-form>
      <div class="session-records">
      <div class="session-card-container">
        <div class="session-card" v-for="session in filteredSessions" :key="session.sessionId">
          <div class="session-left">
            <p><strong>{{session.startTime}}</strong></p>
            <p>{{ session.consultantName}}</p>
          </div>
          <div class="session-right">
            <div class="rating">
              <el-rate
                v-if="session.rating !== null"
                :value="session.rating"
                disabled
               
              />

            </div>
            <p class="feedback">{{ session.feedback || "未填写评价" }}</p>
          </div>
          <div class="session-actions">
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
    </div>

    
  </div>
</template>

<script>
export default {
  data() {
    return {
      hoverCloseButton: false,
      userId: localStorage.getItem("userId"),
      username: localStorage.getItem("username"),
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
      appointments: [],
      monthRange: [], // 用于存储过去三个月的日期数据
      selectedMonth: new Date().getMonth() + 1, // 当前月份
      sessions:[],
      sessionHistory: [], // 用于存储会话记录
      detailDialogVisible: false,
      filterDate: null,
    };
  },
  mounted() {
    this.generateMonth(); // 生成月份数据
    this.fetchAppointments();
    this.fetchSessions();
  },
  computed:{
    filteredSessions() {
      return [...this.sessions].sort((a, b) => {
        const aTime = new Date(`${a.startTime}`);
        const bTime = new Date(`${b.startTime}`);
        return bTime - aTime;
      });
    }
  },
  methods: {
    async fetchSessions() {
      try {
        const params={ userId: localStorage.getItem("userId") };
        if (this.filterDate && this.filterDate.length === 2) {
          params.startDate = this.formatDate(this.filterDate[0]);
          params.endDate = this.formatDate(this.filterDate[1]);
        }
        const res = await this.$axios.get("http://localhost:8080/user/session/list", {
          headers: {
            token:this.token, // 获取 JWT Token
          },
          params
        });
        if (res.data.code === "1") {
          this.sessions = res.data.data;
          this.sessions.sort((a, b) => {
            // 假设字段名为 a.time，如果是别的名称改成对应字段
            return new Date(b.startTime) - new Date(a.startTime);
          });
          
        } else {
          this.$message.error("获取会话列表失败：" + res.data.msg);
        }
      } catch (err) {
        this.$message.error("请求错误：" + err);
      }
    },
    openDetailDialog(sessionId) {
      this.$axios.get("http://localhost:8080/user/session/history", {
        headers: { token: this.token },
        params: { sessionId: sessionId },
      }).then(res => {
        if (res.data.code === "1") {
          this.sessionHistory = res.data.data;
          this.detailDialogVisible = true;
        }
        else if (res.data.code === "2") {
          this.$message(res.data.msg);
        }
        else {
          this.$message.error("获取会话列表失败：" + res.data.msg);
        }
      }).catch(err => {
        this.$message.error("请求错误：" + err);
      });
    },

    async fetchAppointments() {
      try {
        const response = await this.$axios.get("/user/appointments", {
          headers: { token: this.token },
          params: { userId: parseInt(this.userId, 10) },
        });
        if (response.data.code === "1") {
          // 先过滤，再根据 appointmentDate 降序排序（最近的在前）
          this.appointments = response.data.data
            .filter(app => app.status !== "canceled")
            .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        } else {
          this.appointments = [];
        }
      } catch (error) {
        this.$message.error("获取预约数据失败");
        this.appointments = [];
      } finally {
        this.generateMonthData(this.selectedMonth);
      }
    },
    formatTime(time) {
      const date = new Date(time);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    },

    async generateMonth(){
      const monthRange = [];
      monthRange[0] = new Date().getMonth() + 1;
      for (let i = 1; i < 3; i++) {
        const month=new Date().getMonth() + 1-i;
        monthRange.push(month);
      }
      const monn=new Date().getMonth()+2;
      this.monthRange = monthRange.reverse(); // 反转数组以显示从当前月份到过去三个月的顺序
      this.monthRange.push(monn);  
    },
    onDateClick(date){
      this.selectedMonth=date;
      this.generateMonthData(this.selectedMonth);
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
    generateMonthData(date) {
      const year = 2025; // 固定为2025年
      const month = date-1; // 转换为0-11
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 计算首日偏移
      const firstDay = new Date(year, month, 1).getDay();
      this.firstDayOffset = firstDay === 0 ? 6 : firstDay - 1;

      // 生成日期数组
      this.monthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
          date: `${this.selectedMonth}-${day}`,
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
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (`0${d.getMonth() + 1}`).slice(-2);
      const day = (`0${d.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
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
/* 如果你仅想让内容区不滚动穿透，可以这样写 */
.custom-dialog /deep/ .el-dialog__body {
  overflow: hidden;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header {
  text-align: right;
  margin-bottom: 10px;
}
.el-button:hover {
  background-color: #fff5e0 !important; /* 比#FFE4B5更浅 */
  color: #8B4513 !important;
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
.list-view {
  max-height: 520px; /* 根据需求调整高度 */
  overflow-y: auto;
  display: block;
}
.list-view thead {
  position: sticky;
  top: 0;
  background: white; /* 避免透明背景 */
  z-index: 1;
}
.list-view table {
  width: 100%;
  border-collapse: collapse;
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

.el-dialog__body {
  padding-top: 10px;
}

.custom-dialog .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}
.list-view th,
.list-view td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}
.date-item {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: white;
  margin-right:5px;
  border:solid 1px #5c3317;
  flex-shrink: 0;
}
.date-item.selected {
    background-color: #5c3317;
    color: #f2f1e4;
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
.session-records {
    padding: 20px;
  }
  
  .session-card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 10px 0;
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
    padding: 10px;
    background-color: #fafafa;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  
  .msg-user,
  .msg-consultant {
    margin: 10px 0;
    padding: 8px;
    border-radius: 6px;
    background-color: #fef6e0;
  }
  
  .msg-consultant {
    background-color: #e0f7fa;
  }
  
  .time {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
</style>