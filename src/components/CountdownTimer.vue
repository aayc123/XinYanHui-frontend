<template>
    <div :class="{ 'warning': timeLeft <= 300 }">
      {{ formattedTime }}
    </div>
  </template>
  
  <script>
  export default {
    props: {
      initialTime: Number,
    },
    data() {
      return {
        timeLeft: this.initialTime,
      };
    },
    computed: {
      formattedTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      },
    },
    mounted() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          if (this.timeLeft === 300 || this.timeLeft === 60) {
            this.$emit("time-critical", this.timeLeft);
          }
        } else {
          clearInterval(this.timer);
        }
      }, 1000);
    },
    beforeUnmount() {
      clearInterval(this.timer);
    },
  };
  </script>
  
  <style scoped>
  .warning {
    color: red;
    font-weight: bold;
    animation: blink 2s infinite alternate;
  }
  
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  </style>
  