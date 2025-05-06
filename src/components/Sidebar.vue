<template>
  <div class="sidebar">
    <el-menu 
      :default-active="activeMenu" 
      class="el-menu-vertical"
      @select="handleSelect"
    >
      <el-menu-item index="book">我的预约</el-menu-item>
      <el-menu-item index="schedule">我的咨询</el-menu-item>

      <!-- 用 el-badge 包裹“消息中心” -->
      <el-menu-item index="messages">
        <el-badge :value="unread" class="badge-dot" :hidden="unread === 0">
          <span>消息中心</span>
        </el-badge>
      </el-menu-item>

      <el-menu-item index="settings">个人设置</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeMenu: 'book',
      unread: 0,           // 未读消息数量
      token: ''            // 从 somewhere 获取你的 token
    };
  },
  mounted() {
    this.token = localStorage.getItem('token') || '';
    this.count();
  },
  methods: {
    handleSelect(index) {
      this.$router.push({ path: `/userHome/${index}` });
    },
    count() {
      axios
        .get("http://localhost:8080/user/notification/newnum", {
          headers: { token: this.token },
          params: { userId: localStorage.getItem('userId') }
        })
        .then((res) => {
          if (res.data.code === "1") {
            this.unread = res.data.data;
          }
        })
        .catch((err) => {
          this.$message("获取未读消息数失败：", err);
        });
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
  background-color: #FFE4B5;
}

/* 侧边栏菜单项 */
.el-menu-item {
  background-color: #FFE4B5 !important;
  color: #8B4513;
  font-size: 16px;
}

/* 鼠标悬停效果 */
.el-menu-item:hover {
  background-color: #FFDAB9 !important;
}

/* 选中状态 */
.el-menu-item.is-active {
  background-color: #FFC87C !important;
  color: #8B4513;
  font-weight: bold;
}

/* Badge 样式：红点加数字 */
.badge-dot .el-badge__badge {
  background-color: #f56c6c;
  color: white;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  border: none;
}
</style>
