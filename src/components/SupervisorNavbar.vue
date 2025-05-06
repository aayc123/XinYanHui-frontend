<template>
  <div class="navbar">
    <div class="logo">
      <img src="@/assets/icon.png" alt="Logo" class="icon" />
      <span class="title">心研汇</span>
    </div>

    <div class="profile">
      <el-dropdown @command="handleCommand">
        <el-button class="avatar-button">{{ supervisorname }}</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      supervisorname: '' // 督导名
    }
  },
  mounted() {
    this.supervisorname = localStorage.getItem('supervisorname') || '督导';
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要登出吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          localStorage.clear();
          this.$router.push({ path: '/Supervisorlogin' });
        }).catch(() => {
          // 用户取消登出，无需操作
        });
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 80px;
  background-color: #FFE4B5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.logo {
  display: flex;
  align-items: center;
}
.icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  color: #8B4513;
}
.profile {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.avatar-button {
  color: #8B4513 !important;
  border-color: #8B4513 !important;
  background-color: white;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 25px;
  min-width: 50px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>