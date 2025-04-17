<!-- /src/components/MessageBubble.vue -->
<template>
    <div class="message-bubble" :class="{'user-message': message.isUser}">
      <div class="content">{{ message.content }}</div>
      <div class="timestamp">{{ message.timestamp }}</div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 15px;
    background: #f1f0f0;
    margin: 5px 0;
  }
  
  .user-message {
    background: #007bff;
    color: white;
  }
  
  .timestamp {
    font-size: 0.75rem;
    color: #666;
    margin-top: 4px;
  }
  
  .user-message .timestamp {
    color: rgba(255,255,255,0.8);
  }
  </style>