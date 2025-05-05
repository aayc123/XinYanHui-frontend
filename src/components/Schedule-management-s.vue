<template>
  <div class="schedule-container">
    <h2>督导排班管理</h2>
    <div class="grid">
      <button
        v-for="(slot, index) in timeSlots"
        :key="index"
        @click="openScheduleDialog(slot)
        ">
        {{ slot.label }}
      </button>
    </div>

    <!-- 弹窗：展示已排班督导 + 可添加列表 -->
    <div v-if="showDialog" class="dialog">

      <h3>增加排班</h3>
      <div v-for="sup in availableSupervisors" :key="sup.supervisorId" class="checkbox-line">
        <input
          type="checkbox"
          :value="sup.supervisorId"
          v-model="selectedSupervisors"
        />
        <span>{{ sup.name }}</span>
      </div>

      <button @click="submitSchedule">确定排班</button>
      <button @click="closeDialog">取消</button>
    </div>

    <!-- 背景飘浮效果 -->
    <div class="background-effects">
      <div
        v-for="n in 10"
        :key="n"
        class="warm-block"
        :style="blockStyle(n)
        ">
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      token: localStorage.getItem("token"),
      timeSlots: [
        { label: "周一上午", day: "Monday", time: "AM" },
        { label: "周二上午", day: "Tuesday", time: "AM" },
        { label: "周三上午", day: "Wednesday", time: "AM" },
        { label: "周四上午", day: "Thursday", time: "AM" },
        { label: "周五上午", day: "Friday", time: "AM" },
        { label: "周六上午", day: "Saturday", time: "AM" },
        { label: "周日上午", day: "Sunday", time: "AM" },
        { label: "周一下午", day: "Monday", time: "PM" },
        { label: "周二下午", day: "Tuesday", time: "PM" },
        { label: "周三下午", day: "Wednesday", time: "PM" },
        { label: "周四下午", day: "Thursday", time: "PM" },
        { label: "周五下午", day: "Friday", time: "PM" },
        { label: "周六下午", day: "Saturday", time: "PM" },
        { label: "周日下午", day: "Sunday", time: "PM" },
      ],
      showDialog: false,
      currentSlot: null,
      allSupervisors: [],
      scheduledSupervisors: [],
      selectedSupervisors: [],
    };
  },
  computed: {
    availableSupervisors() {
      const scheduledIds = this.scheduledSupervisors.map((s) => s.supervisorId);
      return this.allSupervisors.filter((sup) => !scheduledIds.includes(sup.supervisorId));
    },
  },
  methods: {
    openScheduleDialog(slot) {
      this.currentSlot = slot;
      this.showDialog = true;
      this.selectedSupervisors = [];
      // 获取所有督导
      axios
        .get("http://localhost:8080/internal/admin/all-supervisors", {
          headers: { token: this.token },
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.allSupervisors = res.data.data;
          }
        });
      // TODO: 获取该时段已排班督导
      this.scheduledSupervisors = [];
    },
    submitSchedule() {
      if (!this.selectedSupervisors.length) return;
      const schedulePayload = this.selectedSupervisors.map((id) => ({
        supervisorId: id,
        day: this.currentSlot.day,
        time: this.currentSlot.time,
      }));
      axios
        .post(
          "http://localhost:8080/internal/admin/schedule/supervisor",
          { schedule: schedulePayload },
          { headers: { token: this.token } }
        )
        .then((res) => {
          if (res.data.code === "1") {
            alert("排班成功！");
            this.closeDialog();
          } else {
            alert("排班失败：" + res.data.msg);
          }
        });
    },
    closeDialog() {
      this.showDialog = false;
      this.currentSlot = null;
      this.scheduledSupervisors = [];
    },
    blockStyle(seed) {
      const size = Math.random() * 200 + 100;
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.random() * 50}%`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
        clipPath: `polygon(${this.randomShape()})`,
      };
    },
    randomShape() {
      return Array(6)
        .fill()
        .map(() => `${Math.random() * 100}% ${Math.random() * 100}%`)
        .join(", ");
    },
  },
};
</script>

<style scoped>
.schedule-container {
  max-width: 900px;
  margin: 100px auto 0 auto;
  padding: 24px;
  background-color: rgba(255, 250, 240, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 214, 153, 0.3);
}

.schedule-container h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #444;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 16px;
}

button {
  padding: 8px 10px;
  background: linear-gradient(145deg, #FFE4B5, #FFD495);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.1);
}
button:hover {
  transform: translateY(-2px);
  background-color: #f4c88b;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

.dialog {
  position: fixed;
  top: 80%;
  left: 50%;
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  transform: translate(-50%, -50%);
  background: linear-gradient(145deg, #fff, #fff8ee);
  border: 1px solid #FFE4B5;
  box-shadow: 0 8px 32px rgba(255, 193, 97, 0.2);
  border-radius: 12px;
  padding: 24px;
  z-index: 1000;
}

.dialog h3 {
  margin-bottom: 12px;
  font-size: 18px;
  color: #333;
}

.dialog ul {
  margin-bottom: 20px;
  list-style: none;
  padding-left: 0;
}
.dialog ul li {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.checkbox-line {
  display: flex;
  align-items: center;
  margin: 6px 0;
}

.checkbox-line input {
  margin-right: 8px;
}

.dialog button {
  margin-top: 12px;
  margin-right: 12px;
  background-color: #ffa07a;
  color: white;
}
.dialog button:hover {
  background-color: #f47c57;
}

.background-effects {
  position: absolute;
  top: -200px;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 200%;
  pointer-events: none;
  transform: scale(1.5);
  opacity: 0.8;
}

.warm-block {
  position: absolute;
  background: rgba(255, 240, 174, 0.3);
  animation: float 12s infinite linear;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-200vh) rotate(360deg); }
}
</style>
