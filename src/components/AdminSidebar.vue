<template>
  <div class="sidebar">
    <el-menu 
      :default-active="activeMenu" 
      class="el-menu-vertical"
      @select="handleSelect"
    >
      <el-menu-item index="databoard">数据看板</el-menu-item>
      <el-menu-item index="staff-management">内部职员管理</el-menu-item>
      <el-menu-item index="leave-approval">请假审批</el-menu-item>
      <el-menu-item index="schedule-management-c">咨询师排班</el-menu-item>
      <el-menu-item index="schedule-management-s">督导排班</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeMenu: 'databoard'
    };
  },
  methods: {
    handleSelect(index) {
      this.$emit('menu-change', index);
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
