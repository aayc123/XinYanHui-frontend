<template>
  <div class="outer-container">
    <div class="monthly-total-box">
    <h3 class="title">本月总咨询时长</h3>
    <div class="total-value">
      <p class="number">{{ sum }}</p>
      <span class="unit">分钟</span>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MonthlyConsultationTotal',
  data() {
    return {
      sum: 0
    };
  },
  methods: {
    async fetchTotal() {
      try {
        const response = await axios.get('http://localhost:8080/internal/admin/data/consultation/total', {
          headers: {
            token: localStorage.getItem('token')
          }
        })
        if (response.data.code === '1') {
          this.sum = response.data.data
        } else {
          console.error('获取失败：', response.data.msg)
        }
      } catch (error) {
        console.error('请求出错：', error)
      }
    }
  },
  mounted() {
    this.fetchTotal()
  },
}
</script>

<style scoped>
.outer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.monthly-total-box {
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff8f0, #fce9d8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.outer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px; /* 你想控制的顶部空隙 */
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

.total-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number {
  font-size: 48px;
  font-weight: bold;
  color: #8B4513;
  margin: 0;
  line-height: 1;
}

.unit {
  margin-top: 6px;
  font-size: 20px;
  font-weight: bold;
  color: #8B4513;
}
</style>
