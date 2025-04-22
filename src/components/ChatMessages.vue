<template>
  <div class="chat-input">
    <textarea v-model="inputText" @keydown.enter.exact.prevent="send" placeholder="输入消息..." />
    <button @click="send" :disabled="!inputText.trim()">发送</button>
  </div>
</template>

<script>
export default {
  data() {
    return { inputText: '' }
  },
  methods: {
    send() {
      if (!this.inputText.trim()) return
      this.$emit('send-message', this.inputText.trim())
      this.inputText = ''
    }
  }
}
</script>

<style scoped>
.chat-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 10px 20px;
  background: #f5f5f5;
  box-shadow: 0 -1px 5px rgba(0,0,0,0.1);
}

.chat-input textarea {
  flex: 1;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 40px;
  padding: 6px;
}

.chat-input button {
  margin-left: 10px;
  background: #409EFF;
  color: #fff;
  border: none;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
}
.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>