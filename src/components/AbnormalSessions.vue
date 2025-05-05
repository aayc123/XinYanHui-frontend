<template>
  <div class="abnormal-container">
    <div class="header">
      <h3>异常咨询信息</h3>
      <div class="type-switch">
        <button @click="switchType('consultation')" :class="{ active: type === 'consultation' }">咨询师缺勤</button>
        <button @click="switchType('supervise')" :class="{ active: type === 'supervise' }">督导异常</button>
      </div>
    </div>

    <div class="scroll-list">
      <div v-if="dataList.length === 0" class="empty-text">暂无异常咨询记录</div>
      <div v-else>
        <div
          v-for="(item, index) in dataList"
          :key="index"
          class="list-item"
          @click="toggleDetail(index)"
        >
          <!-- 简要信息 -->
          <p v-if="type === 'consultation'">
            {{ formatTime(item.start_time) }} - 咨询师：{{ item.name }}
          </p>
          <p v-else>
            {{ formatTime(item.request_time) }} - 督导：{{ item.supervisor_name }}
          </p>

          <!-- 展开详情 -->
          <div v-if="expandedIndex === index" class="detail">
            <template v-if="type === 'consultation'">
              <p>开始时间：{{ formatTime(item.start_time) }}</p>
              <p>咨询师：{{ item.name }}（ID: {{ item.consultant_id }}）</p>
              <p>来访者ID：{{ item.username }}</p>
              <p>会话ID：{{ item.session_id }}</p>
            </template>
            <template v-else>
              <p>申请时间：{{ formatTime(item.request_time) }}</p>
              <p>督导：{{ item.supervisor_name }}（ID: {{ item.supervisor_id }}）</p>
              <p>咨询师：{{ item.consultant_name }}（ID: {{ item.consultant_id }}）</p>
              <p>会话ID：{{ item.session_id }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios'

export default {
  name: 'AbnormalSessions',
  data() {
    return {
      type: 'consultation',
      dataList: [],
      expandedIndex: null // 当前展开的记录索引
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const urlMap = {
        consultation: 'http://localhost:8080/internal/admin/data/consultation/abnormal',
        supervise: 'http://localhost:8080/internal/admin/data/supervise/abnormal'
      }

      try {
        const response = await axios.get(urlMap[this.type], {
          headers: { token: localStorage.getItem('token') }
        })
        if (response.data.code === '1') {
          this.dataList = response.data.data
        } else {
          console.error('获取异常数据失败：', response.data.msg)
        }
      } catch (err) {
        console.error('请求错误：', err)
      }
    },
    switchType(newType) {
      if (this.type !== newType) {
        this.type = newType
        this.dataList = []
        this.expandedIndex = null
        this.fetchData()
      }
    },
    formatTime(datetimeStr) {
      const date = new Date(datetimeStr)
      return date.toLocaleString()
    },
    toggleDetail(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index
    }
  }
}
</script>


<style scoped>
.abnormal-container {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  overflow-y: auto;  /* 启用垂直滚动 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-switch button {
  margin-left: 8px;
  padding: 6px 12px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  color: #8B4513;
  transition: all 0.3s ease;
}
.type-switch button:hover {
  background-color: #ae907f;
}
.type-switch .active {
  background-color: #8B4513;
  color: #fff;
}

.scroll-list {
  margin-top: 12px;
}

.list-item {
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}
.list-item:hover {
  background-color: #f9f9f9;
}
.detail {
  margin-top: 8px;
  padding-left: 12px;
  color: #555;
}

.empty-text {
  text-align: center;
  color: #999;
  margin-top: 20px;
}


</style>
