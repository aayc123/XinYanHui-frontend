<template>
    <div class="schedule-container">
      <div class="header">
        <h2>2025年{{ currentMonth }}月{{ currentMonthName }}</h2>
        <button @click="toggleView">
          切换至 {{ isCalendarView ? "列表" : "日历" }} 视图
        </button>
      </div>
      <div v-if="isCalendarView" class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div v-if="isCalendarView" class="calendar-view">
        <div v-for="n in firstDayOffset" :key="'empty'+n" class="day empty" ></div>
        <div v-for="day in monthDays" :key="day.date"
             :class="['day', { past: day.isPast }]" 
             @click="showSchedule(day.date)">
          <div v-if="day.morning" class="morning-slot"></div>
          <div v-if="day.afternoon" class="afternoon-slot"></div>
          {{ day.date }}
        </div>
      </div>
      
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
            <tr v-for="item in scheduleList" :key="item.date">
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
        currentMonth:new Date().getMonth()+1,
        currentMonthName:new Intl.DateTimeFormat("en",{month:"long"}).format(new Date()),
        weekdays:["Mon","Tue","Wed","Thur","Fri","Sat","Sun"],
        monthDays: [],
        firstDayOffset:0,
        scheduleList: [],
        showLeaveModal: false,
        leaveReason: "",
        currentLeaveItem: null
      };
    },
    created(){
      this.generateMonthData();
    },
    methods: {
      toggleView() {
        this.isCalendarView = !this.isCalendarView;
      },
      showSchedule(date) {
        this.isCalendarView = false;
        this.$nextTick(() => {
          const target = this.scheduleList.find(item => item.date === date);
          if (target) {
            document.querySelector(`tr[data-date="${date}"]`).scrollIntoView();
          }
        });
      },
      applyLeave(item) {
        this.currentLeaveItem = item;
        this.showLeaveModal = true;
      },
      submitLeave() {
        if (!this.leaveReason.trim()) {
          alert("请填写请假理由");
          return;
        }
        this.currentLeaveItem.leaveApplied = true;
        this.showLeaveModal = false;
        this.leaveReason = "";
      },
      generateMonthData() {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const days = new Date(year,month+1,0).getDate();

        let firstDay = new Date(year,month,1).getDay();
        this.firstDayOffset = (firstDay === 0?6:firstDay-1);

        this.monthDays=Array.from({length:days},(_,i)=>({
          date:`${month+1}-${i+1}`,
          day:i+1,
          isPast:i+1<new Date().getDate(),
          morning:Math.random()>0.5,
          afternoon:Math.random()>0.5
        }));
        this.scheduleList=this.monthDays.map(day=>({
          date:'${day.day}日',
          time:day.morning&&day.afternoon?"上午/下午":day.morning?"上午":"下午",
          isCompleted:day.isPast,
          leaveApplied:false
        }));
      }
    }
  };
  </script>
  
  <style scoped>
  .schedule-container {
    width: 100%;
    height: 100%;
    flex-direction:column;
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
  
  .weekdays{
    display: grid;
    grid-template-columns: repeat(7,1fr);
    gap:5px;
    text-align: center;
    font-weight: bold;
    color: #8B4513;
    margin-bottom: 5px;
  }

  .calendar-view {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    width:90%;
  }
  
  .day {
    width: 50px;
    height: 80px;
    border: 1px solid #ccc;
    text-align: center;
    position: relative;
    cursor: pointer;
  }
  
  .day.past {
    background: #ddd;
  }
  
  .morning-slot {
    position: absolute;
    top: 27px;
    left: 50%;
    width: 30px;
    height: 5px;
    background: #FFE4B5;
    transform: translateX(-50%);
  }
  
  .afternoon-slot {
    position: absolute;
    bottom: 27px;
    left: 50%;
    width: 30px;
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
  