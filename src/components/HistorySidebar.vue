<!-- /src/components/HistorySidebar.vue -->
<template>
  <div class="history-sidebar" :class="{ 'open': value }">
    <div class="sidebar-header">
      <h3>历史会话记录</h3>
      <button @click="$emit('input', false)">×</button>
    </div>
    <div class="history-list">
      <div v-for="(item, index) in history" :key="index" class="history-item">
        <div class="therapist">{{ item.therapist }}</div>
        <div class="date">{{ item.date }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean, // 控制侧边栏开关
    history: Array
  }
}
</script>

<style scoped>
.history-sidebar {
  background: #fff;
  width: 300px;
  height: 100%;
  position: fixed;
  right: -300px;
  top: 0;
  transition: right 0.3s ease;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
}

.history-sidebar.open {
  right: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.history-list {
  padding: 15px;
}

.history-item {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background: #f8f9fa;
  cursor: pointer;
}

.history-item:hover {
  background: #e9ecef;
}
</style>