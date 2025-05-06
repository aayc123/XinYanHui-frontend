<template>
  <div class="schedule-container">
    <h2>咨询师排班管理</h2>

    <!-- 督导选择 -->
    <div class="supervisor-select">
      <label>选择督导：</label>
      <select v-model="selectedSupervisorId" @change="fetchConsultantsBySupervisor">
        <option disabled value="">请选择督导</option>
        <option v-for="sup in supervisorList" :key="sup.supervisorId" :value="sup.supervisorId">
          {{ sup.name }}
        </option>
      </select>
    </div>

    <!-- 时间段按钮 -->
    <div class="grid" v-if="selectedSupervisorId">
      <button
        v-for="(slot, index) in timeSlots"
        :key="index"
        @click="openScheduleDialog(slot)"
      >
        {{ slot.label }}
      </button>
    </div>
    
    <!-- 弹窗：展示已排班咨询师 + 可添加 -->
    <div v-if="showDialog" class="dialog">
      <h3>当前时段：{{ currentSlot.label }}</h3>
      <h4>已排班咨询师</h4>
      <ul>
        <li v-for="(sup, index) in scheduledConsultants" :key="'scheduled-' + index">
          {{ sup.name }}
          <button @click="removeSchedule(sup)">删除</button>
        </li>
      </ul>
      <h4>增加排班</h4>
      <div
        class="checkbox-line"
        v-for="sup in availableConsultants"
        :key="sup.consultantId"
      >
        <input
          type="checkbox"
          :value="sup.consultantId"
          v-model="selectedConsultants"
        />
        <span>{{ sup.name }}</span>
      </div>

      <button @click="submitSchedule">确定排班</button>
      <button @click="closeDialog">取消</button>
    </div>

    <div class="background-effects">
      <div class="warm-block" v-for="n in 10" :key="n" :style="blockStyle(n)"></div>
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
      supervisorList: [],
      selectedSupervisorId: "",
      allConsultants: [],
      scheduledConsultants: [],
      selectedConsultants: [],
    };
  },

  computed: {
    availableConsultants() {
      const scheduledIds = this.scheduledConsultants.map((s) => s.consultantId);
      return this.allConsultants.filter((sup) => !scheduledIds.includes(sup.consultantId));
    },
  },

  mounted() {
    this.fetchSupervisors();
  },

  methods: {
    fetchSupervisors() {
      axios
        .get("http://localhost:8080/internal/admin/all-supervisors", {
          headers: { token: this.token },
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.supervisorList = res.data.data;
          }
        });
    },

    fetchConsultantsBySupervisor() {
      if (!this.selectedSupervisorId) return;
      // 获取当前选择督导的咨询师
      axios
        .get("http://localhost:8080/internal/admin/all-consultants", {
          headers: { token: this.token },
          params: { supervisorId: this.selectedSupervisorId },
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.allConsultants = res.data.data;  // 只保存该督导的咨询师列表
          }
        });
    },

    openScheduleDialog(slot) {
      this.currentSlot = slot;
      this.showDialog = true;
      this.selectedConsultants = [];
      // 获取已排班的咨询师
      axios
        .get("http://localhost:8080/internal/admin/schedule/consultant", {
          headers: { token: this.token },
          params: {
            day: slot.day,
            time: slot.time,
          },
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.scheduledConsultants = res.data.data.map((entry) => {
              const [id, name] = entry.split(":");
              return { consultantId: parseInt(id), name };
            });
          }
        });
    },

    removeSchedule(sup) {
      axios
        .delete("http://localhost:8080/internal/admin/schedule/consultant", {
          headers: { token: this.token },
          data: {
            consultantId: sup.consultantId,
            name: sup.name,
            day: this.currentSlot.day,
            time: this.currentSlot.time,
          },
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.scheduledConsultants = this.scheduledConsultants.filter(
              (s) => s.consultantId !== sup.consultantId
            );
            this.$message.success("删除成功！");
          } else {
            this.$message.error("删除失败：" + res.data.msg);
          }
        });
    },

    submitSchedule() {
      if (!this.selectedConsultants.length) return;
      const schedulePayload = this.selectedConsultants.map((id) => {
        const sup = this.allConsultants.find((s) => s.consultantId === id);
        return {
          consultantId: id,
          name: sup ? sup.name : "",
          day: this.currentSlot.day,
          time: this.currentSlot.time,
        };
      });

      axios
        .post(
          "http://localhost:8080/internal/admin/schedule/consultant",
          { schedule: schedulePayload },
          { headers: { token: this.token } }
        )
        .then((res) => {
          if (res.data.code === "1") {
            this.$message.success("排班成功！");
            this.closeDialog();
          } else {
            this.$message.error("排班失败：" + res.data.msg);
          }
        });
    },

    closeDialog() {
      this.showDialog = false;
      this.currentSlot = null;
      this.scheduledConsultants = [];
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
      return Array(6).fill().map(() => `${Math.random() * 100}% ${Math.random() * 100}%`).join(", ");
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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

.supervisor-select {
  margin-bottom: 16px;
}

label {
  font-weight: 500;
  margin-right: 8px;
}

select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
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
  top: 50%;
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