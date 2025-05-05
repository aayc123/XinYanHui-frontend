<template>
    <div class="consultation-chart">
      <div class="chart-header">
        <h3>系统总咨询人次（按周）</h3>
        <div class="controls">
          <button @click="changeWeeks(-1)" :disabled="weekNum <= 1">-</button>
          <span>展示 {{ weekNum }} 周</span>
          <button @click="changeWeeks(1)">+</button>
        </div>
      </div>
      <div ref="chartContainer" class="chart-container" style="width: 100%; height: 300px;"></div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import * as echarts from 'echarts'
  
  export default {
    name: 'ConsultationDurationChart',
    data() {
      return {
        chartInstance: null,
        weekNum: 3,
        chartData: [],
      }
    },
    mounted() {
      this.chartInstance = echarts.init(this.$refs.chartContainer)
      this.fetchChartData()
    },
    methods: {
      changeWeeks(amount) {
        const newVal = this.weekNum + amount
        if (newVal < 1) return
        this.weekNum = newVal
        this.fetchChartData()
      },
      async fetchChartData() {
        try {
          const response = await axios.get('http://localhost:8080/internal/admin/data/consultation/week', {
            headers: {
              token: localStorage.getItem('token')
            },
            params: {
              num: this.weekNum
            }
          })
          if (response.data.code === '1') {
            this.chartData = response.data.data
            this.renderChart()
          } else {
            console.error('获取数据失败：', response.data.msg)
          }
        } catch (error) {
          console.error('请求出错：', error)
        }
      },
      renderChart() {
        const formatDate = (dateStr) => {
          const date = new Date(dateStr)
          const month = date.getMonth() + 1
          const day = date.getDate()
          return `${month}.${day}`
        }

        // 生成横坐标标签（本周、前1周、前2周...）
        const labelMap = this.chartData.map((item, index, arr) => {
          const diff = arr.length - 1 - index
          return diff === 0 ? '本周' : `前${diff}周`
        })

        // 生成 tooltip 中的时间段 例如 4.1-4.7
        const tooltipLabels = this.chartData.map(item => {
          const startDate = new Date(item.week_start)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 6) // 推算该周结束日期

          return `${formatDate(startDate)}-${formatDate(endDate)}`
        })

        const totals = this.chartData.map(item => item.total)

        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: params => {
              const index = params[0].dataIndex
              return `${tooltipLabels[index]}<br/>${params[0].marker}${params[0].seriesName}：${params[0].data}`
            }
          },
          xAxis: {
            type: 'category',
            data: labelMap,
            axisLabel: { rotate: 0 }
          },
          yAxis: {
            type: 'value',
            name: '总咨询人次'
          },
          series: [{
            data: totals,
            type: 'line',
            smooth: true,
            name: '咨询人次',
            areaStyle: {
              color: 'rgba(255, 228, 181, 0.3)' // 浅黄色
            },
            lineStyle: {
              color: '#8B4513'
            },
            itemStyle: {
              color: '#8B4513'
            }
          }]
        }

        this.chartInstance.setOption(option)
      }

    }
  }
  </script>
  
  <style scoped>
  .consultation-chart {
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
  }
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .controls button {
    margin: 0 4px;
  }
  .controls {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  height: 32px; /* 保证文字和按钮在同一高度基准线上 */
}


.controls button {
  background-color: #8B4513;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:disabled {
  background-color: #d3c3b2;
  cursor: not-allowed;
}

.controls span {
  margin: 0 10px;
  font-weight: 700;
  font-size:18px;
  color: #8B4513;
  line-height: 32px; /* 与按钮高度一致，确保文字垂直居中 */
}

  </style>
  