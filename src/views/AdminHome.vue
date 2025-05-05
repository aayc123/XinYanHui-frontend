<template>
  <div class="container">
    <Navbar />
    <div class="main">
      <Sidebar @menu-change="handleMenuChange" />
      <div class="content-wrapper">
        <Content :activeTab="currentTab"/>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/AdminNavbar.vue";
import Sidebar from "@/components/AdminSidebar.vue";
import Content from "@/components/AdminContent.vue";

export default {
  components: {
    Navbar,
    Sidebar,
    Content,
  },
  created(){
    document.title = '心研汇';
  },
  data() {
    return {
      currentTab: "databoard"
    };
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
  overflow:hidden;
}
.content-wrapper {
  flex: 1;  /* 让内容区占据剩余空间 */
  height: calc(100vh - 80px);
  overflow-y: auto;
  background-color: #f8f8f8;
  padding: 20px;
}
</style>
