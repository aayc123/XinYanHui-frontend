<template>
    <div class="schedule-container">
      <div class="header">
    <button @click="changeMonth(-1)">⬅</button>
    <span class="month-label">{{ currentMonth }}月</span>
    <button @click="changeMonth(1)">➡</button>
  </div>
  <div class="togglebutton">
    <button @click="toggleView">
      切换至 {{ isCalendarView ? "列表" : "日历" }} 视图
    </button>
  </div>
      
      <!-- 日历视图 -->
  
      <div v-if="isCalendarView" class="calendar-view">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        <div v-for="n in firstDayOffset" :key="'empty' + n" class="day empty"></div>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredScheduleList" :key="index">
              <td>{{ item.date }}</td>
              <td>
                <span v-if="item.time==='8'">上午</span>
                <span v-if="item.time==='13'">下午</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isCalendarView: true,
        currentMonthName: new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(new Date()),
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        monthDays: [],
        firstDayOffset: 0,
        scheduleList: [],
        showLeaveModal: false,
        leaveReason: "",
        currentLeaveItem: null,
        supervisorId: '', // 这里一开始是空
        token:localStorage.getItem('token'),
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1, // 注意：1~12 月
  
      };
    },
    computed: {
    filteredScheduleList() {
      return this.scheduleList.filter(item => {
        const date = new Date(item.date);
        return (
          date.getFullYear() === this.currentYear &&
          date.getMonth() + 1 === this.currentMonth
        );
      });
    }
  },
  
    created() {
      this.supervisorId = localStorage.getItem('supervisorId');
      if (!this.supervisorId) {
        alert("未找到登录信息，请重新登录！");
        this.$router.push("/login"); 
      } else {
        this.loadSchedule();
      }
    },
    methods: {
      changeMonth(offset) {
      let newMonth = this.currentMonth + offset;
      if (newMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      } else if (newMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else {
        this.currentMonth = newMonth;
      }
      this.generateMonthDays(); // 重新生成日历
    },
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
        this.supervisorId = localStorage.getItem('supervisorId');
        this.$axios.get('http://localhost:8080/internal/supervisor/schedules', {
          params: { supervisorId: this.supervisorId },
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
            this.$message.error("获取排班失败：" + response.data.msg);
          }
        });
      },
  
  
      generateMonthDays() {
    const year = this.currentYear;
    const month = this.currentMonth - 1; // 注意 JavaScript 中月份是 0 开始的
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    const firstDay = new Date(year, month, 1).getDay();
    this.firstDayOffset = (firstDay + 6) % 7; // 周一为第一天
  
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
  .weekday {
    
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    text-align: center;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 5px;
  }
  
  .month-label{
    font-size: 24px; /* 你可以根据需要调整，比如 18px、32px 等 */
    font-weight: bold;
    margin: 0 10px;
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