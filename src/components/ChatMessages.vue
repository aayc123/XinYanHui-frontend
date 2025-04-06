<template>
    <div class="messages-container">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.sender">
        <p>{{ msg.text }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        messages: [
          { sender: "user", text: "您好，请问您能帮助我吗？" },
          { sender: "consultant", text: "当然，您可以向我描述您的情况。" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .messages-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .message {
    max-width: 60%;
    padding: 8px;
    border-radius: 8px;
  }
  
  .user {
    align-self: flex-end;
    background-color: #dff0d8;
  }
  
  .consultant {
    align-self: flex-start;
    background-color: #f0f0f0;
  }
  </style>
  