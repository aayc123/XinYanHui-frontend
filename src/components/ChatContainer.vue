<!-- /src/components/ChatContainer.vue -->
<template>
    <div class="chat-container">
      <div v-for="(msg, index) in messages" :key="index" class="message-row">
        <message-bubble :message="msg" />
      </div>
    </div>
  </template>
  
  <script>
  import MessageBubble from '@/components/MessageBubble'
  
  export default {
    components: { MessageBubble },
    props: {
      messages: {
        type: Array,
        default: () => []
      }
    }
  }
  </script>
  
  <style scoped>
  .chat-container {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .message-row {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-start;
  }
  
  .message-row.user {
    justify-content: flex-end;
  }
  </style>