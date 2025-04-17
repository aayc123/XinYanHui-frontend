<!-- /src/components/CountdownTimer.vue -->
<template>
  <div class="countdown-timer" :class="{ 'blink': shouldBlink }">
    {{ formattedTime }}
  </div>
</template>

<script>
export default {
  props: {
    initialTime: {
      type: Number, // 分钟数
      default: 60
    }
  },
  data() {
    return {
      remainingTime: this.initialTime * 60, // 转换为秒
      shouldBlink: false
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
      if (newVal === 5 * 60 || newVal === 60) {
        this.triggerBlink()
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--
      } else {
        clearInterval(this.timer)
        this.$emit('time-up')
      }
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
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
</style>