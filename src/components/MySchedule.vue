<template>
  <div class="schedule-container">
    <div class="header">
      <h2>{{ currentMonth }}月</h2>
      <button @click="toggleView">
        切换至 {{ isCalendarView ? "列表" : "日历" }} 视图
      </button>
    </div>
    
    <!-- 日历视图 -->
    <div v-if="isCalendarView" class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <div v-if="isCalendarView" class="calendar-view">
      <div v-for="n in firstDayOffset" :key="'empty'+n" class="day empty"></div>
      <div v-for="day in monthDays" :key="day.date"
        :class="['day', { past: day.isPast }]" 
        @click="showSchedule(day.date)">
      <div v-if="day.morning" class="morning-slot"></div>
      <div v-if="day.afternoon" class="afternoon-slot"></div>
      {{ parseDayNumber(day.date) }}
    </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>是否完成</th>
            <th>请假申请</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in scheduleList" :key="index">
            <td>{{ item.date }}</td>
            <td>{{ item.time }}</td>
            <td>
              <span v-if="item.isCompleted" class="completed">✔</span>
              <span v-else class="pending">○</span>
            </td>
            <td>
              <button v-if="!item.isCompleted && !item.leaveApplied"
                      @click="applyLeave(item)">
                申请请假
              </button>
              <span v-else-if="item.leaveApplied">申请审核中</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 请假申请弹窗 -->
    <div v-if="showLeaveModal" class="modal">
      <h3>请假申请</h3>
      <textarea v-model="leaveReason" placeholder="请填写请假理由"></textarea>
      <button @click="submitLeave">提交</button>
      <button @click="showLeaveModal = false">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCalendarView: true,
      currentMonth: new Date().getMonth() + 1,
      currentMonthName: new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(new Date()),
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      monthDays: [],
      firstDayOffset: 0,
      scheduleList: [],
      showLeaveModal: false,
      leaveReason: "",
      currentLeaveItem: null,
      consultantId: '', // 这里一开始是空
      token:localStorage.getItem('token'),
    };
  },
  created() {
    this.consultantId = localStorage.getItem('consultantId');
    if (!this.consultantId) {
      alert("未找到登录信息，请重新登录！");
      this.$router.push("/login"); 
    } else {
      this.loadSchedule();
    }
  },
  methods: {
    toggleView() {
      this.isCalendarView = !this.isCalendarView;
    },
    parseDayNumber(dateStr) {
      return parseInt(dateStr.split('-')[2], 10); // 获取日期字符串中的“日”部分
    },

    showSchedule(date) {
      this.isCalendarView = false;
      this.$nextTick(() => {
        const target = this.scheduleList.find(item => item.date === date);
        if (target) {
          const el = document.querySelector(`tr[data-date="${date}"]`);
          if (el) {
            el.scrollIntoView();
          }
        }
      });
    },

    applyLeave(item) {
      this.currentLeaveItem = item;
      this.showLeaveModal = true;
    },

    loadSchedule() {
      this.consultantId = localStorage.getItem('consultantId');
      this.$axios.get('http://localhost:8080/internal/consultant/schedules', {
        params: { consultantId: this.consultantId },
        headers: {
          token: this.token
        }
      }).then(response => {
        if (response.data && response.data.code === "1") {
          const rawList = response.data.data; // 这里要取 response.data.data

          this.scheduleList = rawList.map(item => ({
            date: item.availableDate,
            time: String(item.startTime),  // 保证是字符串"8"、"13"用于判断
            isCompleted: this.isPast(item.availableDate),
            leaveApplied: false // 默认 false，如果后端未返回该字段
          }));

          this.generateMonthDays();
        } else {
          alert("获取排班失败：" + response.data.msg);
        }
      }).catch(error => {
        console.error("加载排班失败", error);
      });
    },


    submitLeave() {
      if (!this.leaveReason.trim()) {
        alert("请填写请假理由");
        return;
      }
      const timeStr = this.currentLeaveItem.time === '8' ? 'AM' : 'PM';
      this.consultantId = localStorage.getItem('consultantId');
      this.$axios.post('http://localhost:8080/internal/consultant/leave', {
        consultantId: this.consultantId,
        date: this.currentLeaveItem.date,
        time: timeStr,
        cancellationReason: this.leaveReason
      }, {
        headers: {
          token: this.token
        }
      }).then(response => {
        if (response.data.code === 1) {
          alert("请假申请已提交！");
          this.currentLeaveItem.leaveApplied = true;
        } else {
          alert(response.data.message || "请假失败，请稍后再试。");
        }
      }).catch(error => {
        console.error("请假失败", error);
        alert("请假失败，请稍后重试。");
      });

      this.showLeaveModal = false;
      this.leaveReason = "";
    },


    generateMonthDays() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const firstDay = new Date(year, month, 1).getDay();
      this.firstDayOffset = (firstDay + 6) % 7; // 让周一为第一天

      this.monthDays = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayObj = {
          date: dateStr,
          isPast: this.isPast(dateStr),
          morning: false,
          afternoon: false,
        };

        const schedules = this.scheduleList.filter(item => item.date === dateStr);
        for (const sch of schedules) {
          if (sch.time === '8') dayObj.morning = true;
          if (sch.time === '13') dayObj.afternoon = true;
        }

        this.monthDays.push(dayObj);
      }
    },


    isPast(dateStr) {
      const today = new Date();
      const date = new Date(dateStr);
      return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
  }
};
</script>

<style scoped>
.schedule-container {
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 20px;
  background-color: white;
  overflow-x: hidden;
  overflow-y: auto;
}

.header {
  text-align: right;
  margin-bottom: 10px;
}

button {
  padding: 5px 10px;
  background-color: #8B4513;
  color: white;
  border: none;
  cursor: pointer;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  text-align: center;
  font-weight: bold;
  color: #8B4513;
  margin-bottom: 5px;
  width: 100%;
}

.weekdays div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.calendar-view {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  width: 100%;
  padding: 0;
  margin: 0 auto;
}

.day {
  height: 80px;
  right: 5px;
  border: 1px solid #ccc;
  text-align: center;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.day.past {
  background: #ddd;
}

.morning-slot {
  position: absolute;
  top: 27px;
  left: 50%;
  width: 50px;
  height: 5px;
  background: #FFE4B5;
  transform: translateX(-50%);
}

.afternoon-slot {
  position: absolute;
  bottom: 27px;
  left: 50%;
  width: 50px;
  height: 5px;
  background: #8B4513;
  transform: translateX(-50%);
}

.list-view table {
  width: 100%;
  border-collapse: collapse;
}

.list-view th, .list-view td {
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
}
</style>
