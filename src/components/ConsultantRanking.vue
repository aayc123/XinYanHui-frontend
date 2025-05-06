<template>
  <div class="ranking-box">
    <div class="header">
      <h3>本月咨询师咨询时长排名</h3>
      <div class="controls">
        <button @click="prevPage" :disabled="currentPage === 1">⬅</button>
        <span>第 {{ currentPage }} 页</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages">➡</button>
      </div>
    </div>
    <div ref="chartContainer" class="chart" style="width: 100%; height: 300px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import * as echarts from 'echarts'

export default {
  name: 'ConsultantRanking',
  data() {
    return {
      rawData: [],
      currentPage: 1,
      pageSize: 10,
      token: '', 
      chartInstance: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.rawData.length / this.pageSize)
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.rawData.slice(start, start + this.pageSize)
    }
  },
  mounted() {
    this.chartInstance = echarts.init(this.$refs.chartContainer)
    this.fetchData()
  },
  watch: {
    paginatedData() {
      this.renderChart()
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:8080/internal/admin/data/consultant/time', {
          headers: {
            token: localStorage.getItem('token')
          }
        })
        if (response.data.code === '1') {
          this.rawData = response.data.data
          this.renderChart()
        } else {
          alert('数据获取失败：', response.data.msg)
        }
      } catch (err) {
        alert('请求错误：', err)
      }
    },
    renderChart() {
      const names = this.paginatedData.map(item => item.name)
      const times = this.paginatedData.map(item => (item.total_time).toFixed(1)) // 换算成小时

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return params
              .map(p => `${p.name}<br/>${p.seriesName}：${p.value} 小时`)
              .join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            rotate: 30,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '小时'
        },
        series: [{
          data: times,
          type: 'bar',
          itemStyle: {
            color: '#8B4513'
          },
          name: '咨询时长'
        }]
      }
      this.chartInstance.setOption(option)
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  }
}
</script>

<style scoped>
.ranking-box {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.controls {
  display: flex;
  align-items: center;
  height: 40px;
}

.controls button {
  background-color: #8B4513;
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls span {
  margin: 0 12px;
  font-size: 18px;
  font-weight:700;
  color: #8B4513;
  display: flex;
  align-items: center;
  height: 40px;
}

</style>
