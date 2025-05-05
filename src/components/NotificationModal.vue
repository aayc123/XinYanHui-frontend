<template>
    <div class="modal" v-if="notification">
      <div class="modal-content">
        <h3>{{ notification.msg }}</h3>
        <p>时间: {{ notification.time }}</p>
        <button @click="handleGoToSession">进入会话</button>
        <button @click="close">关闭</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      notification: {
        type: Object,
        default: () => null
      }
    },
    methods: {
      handleGoToSession() {
        this.$emit('go-to-session', this.notification.sessionId, this.notification.time,this.notification.obId);
        this.$emit('close');
    },
      close() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
  .modal-content { background: white; padding: 20px; border-radius: 8px; }
  </style>