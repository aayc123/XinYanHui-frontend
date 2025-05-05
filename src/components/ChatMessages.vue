<template>
    <div class="chat-input">
      <!-- 修正 self-closing 标签并支持 Shift+Enter 换行 -->
      <textarea
        v-model="inputText"
        @keydown.enter.prevent="onEnter"
        placeholder="输入消息..."
      ></textarea>
      <button @click="send" :disabled="!inputText.trim()">发送</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        inputText: ''
      }
    },
    methods: {
      // 处理回车：Shift+Enter 插入换行，纯 Enter 发送
      onEnter(e) {
        if (e.shiftKey) {
          // 插入换行
          const pos = e.target.selectionStart
          this.inputText = this.inputText.slice(0, pos) + '\n' + this.inputText.slice(pos)
          this.$nextTick(() => {
            e.target.selectionStart = e.target.selectionEnd = pos + 1
          })
        } else {
          this.send()
        }
      },
      send() {
        const text = this.inputText.trim()
        if (!text) return
        this.$emit('send-message', text)
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
    resize: vertical;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 40px;
    max-height: 120px;
    padding: 6px;
    line-height: 1.4;
    font-size: 14px;
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