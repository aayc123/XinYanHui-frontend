<template>
    <div class="cal">
      <el-calendar v-model="value">
      </el-calendar>
    </div>
  </template>
  
  <style scoped lang="less">
  .cal {
    width: 100%;
    height: 600px;
  }
  </style>
  
  <script>
  import { Calendar } from 'element-ui'
  
  export default {
    components: {
      ElCalendar: Calendar
    },
    data() {
      return {
        value: new Date()
      }
    }
  }
  </script>