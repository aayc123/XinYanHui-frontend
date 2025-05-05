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
import Navbar from "@/components/SupervisorNavbar.vue";
import Sidebar from "@/components/SupervisorSidebar.vue";
import Content from "@/components/SupervisorContent.vue";
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
      currentTab: "schedule-view"
    };
  },
  computed:{
    ...mapGetters(['newSessionNotification'])
  },
  created(){
    document.title = '督导主页';
    this.$store.dispatch('connectWebSocket', localStorage.getItem('token'));
  },
  methods: {
    handleMenuChange(tab) {
      this.currentTab = tab;
    },
    ...mapMutations(['setNewSessionNotification']),
    closeNotification() {
      this.setNewSessionNotification(null);
    },
    goToSession(sessionId, time,obId) {
      const chatUrl = this.$router.resolve({
        path: `/chatsuper/${sessionId}`, // 路径为 /chat/recordId
            query: {
              sessionId: sessionId,           // 咨询师与来访者的会话ID
              time: time,                     // 会话时间
              obId: obId,                     // 监督的对话
            }
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
