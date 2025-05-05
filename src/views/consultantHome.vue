<template>
  <div class="container">
    <Navbar />
    <div class="main">
      <Sidebar @menu-change="handleMenuChange" />
      <div class="content-wrapper">
        <Content :activeTab="currentTab"/>
      </div>
    </div>
    <NotificationModal
      :notification="newSessionNotification"
      @go-to-session="goToSession"
      @close="closeNotification"
    />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import Content from "@/components/Content.vue";
import NotificationModal from "@/components/NotificationModal.vue";
import { mapGetters, mapMutations } from 'vuex';

export default {
  components: {
    Navbar,
    Sidebar,
    Content,
    NotificationModal
  },
  data() {
    return {
      token:localStorage.getItem("token"),
      currentTab: "schedule"
    };
  },
  computed:{
    ...mapGetters(['newSessionNotification'])
  },
  created(){
    this.$store.dispatch('connectWebSocket', localStorage.getItem('token'));
    document.title = '咨询师主页';
  },
  methods: {
    handleMenuChange(tab) {
      this.currentTab = tab;
    },
    ...mapMutations(['setNewSessionNotification']),
    closeNotification() {
      this.setNewSessionNotification(null);
    },
    goToSession(sessionId, time) {
      const chatUrl = this.$router.resolve({
        path: `/chat/${sessionId}`,
        query: {
          consultantId: this.consultantId, // 确保该值在组件中已定义
          consultantName: this.consultantName,
          appointmentDate: time,
          sessionId: sessionId,
        },
      }).href;

      window.open(chatUrl, '_blank');
      this.agreeProtocol = false; // 假设 agreeProtocol 是组件内的状态
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
