<template>
  <div class="container">
    <Navbar />
    <div class="main">
      <Sidebar @menu-change="handleMenuChange" />
      <Content :activeTab="currentTab" />
      <div class="main-content">
      <router-view></router-view> <!-- 渲染子路由 -->
    </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import Sidebar from "../components/Sidebar.vue";

export default {
  components: {
    Navbar,
    Sidebar,
  },
  data() {
    return {
      currentTab: "book"
    };
  },
  mounted(){
    this.handleMenuChange('book')
    this.$router.replace({ path: '/userHome/book' }) // 默认加载日程
  },
  methods: {
    handleMenuChange(tab) {
      this.currentTab = tab;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow:hidden;
}
.main {
  display: flex;
  flex: 1;
}

.main-content {
  margin-left: 180px; /* 为侧边栏留出空间 */
  margin-top:80px;
  padding: 20px;
  width: calc(100% - 180px);
  overflow-y: auto;
}
</style>
