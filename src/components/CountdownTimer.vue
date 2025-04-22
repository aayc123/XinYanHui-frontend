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
      default: 60
    }
  },
  data() {
    return {
      remainingTime: 0,
      shouldBlink: false,
      warningThreshold: 10 * 60, // 10分钟
      timer: null,
      endTimeKey: 'chatEndTime'
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.remainingTime / 60)
      const seconds = this.remainingTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  },
  watch: {
    remainingTime(newVal) {
      // 小于等于1分钟或5分钟时闪烁
      if (newVal === 5 * 60 || newVal === 60) {
        this.triggerBlink()
      }
    }
  },
  mounted() {
    // 初始化结束时间
    let endTime = localStorage.getItem(this.endTimeKey)
    if (!endTime) {
      const now = Date.now()
      endTime = now + this.initialTime * 60 * 1000
      localStorage.setItem(this.endTimeKey, endTime)
    }
    this.updateRemaining(+endTime)
    this.timer = setInterval(() => {
      this.updateRemaining(+endTime)
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    updateRemaining(endTime) {
      const seconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      this.remainingTime = seconds
      if (seconds === 0) {
        clearInterval(this.timer)
        this.$emit('time-up')
      }
    },
    triggerBlink() {
      this.shouldBlink = true
      setTimeout(() => {
        this.shouldBlink = false
      }, 2000)
    }
  }
}
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