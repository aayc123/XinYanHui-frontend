<template>
    <div class="sidebar">
      <el-menu 
        :default-active="activeMenu" 
        class="el-menu-vertical"
        @select="handleSelect"
      >
        <el-menu-item index="schedule">我的咨询</el-menu-item>
        <el-menu-item index="reviews">我的评价</el-menu-item>
        <el-menu-item index="messages">消息中心</el-menu-item>
        <el-menu-item index="settings">个人设置</el-menu-item>
      </el-menu>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        activeMenu: 'schedule'
      };
    },
    methods: {
      handleSelect(index) {
        this.$router.push({ path: `/userHome/${index}` });
      }
    }
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 180px;
    height: 100vh;
    background-color: #FFE4B5;
    position: fixed;
    left: 0;
    top: 80px;
    padding-top: 10px;
  }
  
  /* 侧边栏菜单 */
  .el-menu-vertical {
    border-right: none;
    background-color: #FFE4B5; /* 修改背景色 */
  }
  
  /* 侧边栏菜单项 */
  .el-menu-item {
    background-color: #FFE4B5 !important; /* 强制应用背景色 */
    color: #8B4513; /* 文字颜色 */
    font-size: 16px;
  }
  
  /* 鼠标悬停效果 */
  .el-menu-item:hover {
    background-color: #FFDAB9 !important; /* 悬停时略微变浅 */
  }
  
  /* 选中状态 */
  .el-menu-item.is-active {
    background-color: #FFC87C !important; /* 选中状态更深 */
    color: #8B4513;
    font-weight: bold;
  }
  </style>
  