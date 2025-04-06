<template>
    <transition name="slide">
      <aside v-if="modelValue" class="chat-history">
        <h3>历史聊天记录</h3>
        <ul>
          <li v-for="(session, index) in history" :key="index">
            {{ session.date }} - {{ session.consultant }}
          </li>
        </ul>
        <button @click="$emit('update:modelValue', false)">关闭</button>
      </aside>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      modelValue: Boolean,
    },
    data() {
      return {
        history: [
          { date: "2025-03-10", consultant: "张医生" },
          { date: "2025-03-12", consultant: "李医生" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .chat-history {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
    padding: 20px;
  }
  
  .slide-enter-active, .slide-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-enter-from, .slide-leave-to {
    transform: translateX(100%);
  }
  </style>
  