<template>
  <div>
    <div class="countdown-timer" :class="{ 'blink': shouldBlink }">
      {{ formattedTime }}
    </div>
    <div v-if="remainingTime <= warningThreshold && remainingTime > 0" class="warning-text">
      咨询马上结束，请注意时间
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialTime: {
      type: Number,
      required: true
    },
    sessionId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      remainingTime: this.initialTime, // 使用传入的 initialTime 初始化
      shouldBlink: false,
      warningThreshold: 10 * 60, // 10分钟
      timer: null,
      currentEndTime: Date.now() + this.initialTime * 1000 // 初始结束时间
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    endTimeKey() {
      return `countdown_${this.sessionId}`;
    }
  },
  watch: {
    remainingTime(newVal) {
      if (newVal === 5 * 60 || newVal === 60) {
        this.triggerBlink();
      }
    },
    sessionId() {
      this.initializeTimer();
    }
  },
  mounted() {
    this.initializeTimer();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    initializeTimer() {
      clearInterval(this.timer);

      let endTime = localStorage.getItem(this.endTimeKey);

      if (!endTime) {
        endTime = Date.now() + this.initialTime * 1000;
        localStorage.setItem(this.endTimeKey, endTime);
      }

      this.currentEndTime = parseInt(endTime, 10);
      this.updateRemaining();
      this.timer = setInterval(this.updateRemaining, 1000);
    },
    updateRemaining() {
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((this.currentEndTime - now) / 1000));
      this.remainingTime = seconds;

      if (seconds === 0) {
        this.handleTimeExpired();
      }
    },
    handleTimeExpired() {
      clearInterval(this.timer);
      localStorage.removeItem(this.endTimeKey);
      this.$emit('time-up');
    },
    triggerBlink() {
      this.shouldBlink = true;
      setTimeout(() => {
        this.shouldBlink = false;
      }, 2000);
    }
  }
};
</script>

<style scoped>
.countdown-timer {
  font-size: 1.2rem;
  font-weight: bold;
}

.blink {
  animation: blink 1s linear infinite;
  color: #ff4444;
}

@keyframes blink {
  50% { opacity: 0; }
}

.warning-text {
  margin-top: 4px;
  font-size: 0.9rem;
  color: #e6a23c;
}
</style>