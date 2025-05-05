<template>
    <div class="content-container">
      <Scheduleview v-if="activeTab === 'schedule-view'" />
      <Messagecenter v-if="activeTab === 'message-center'"/>
      <Conversationrecords v-if="activeTab === 'conversation-records'"/>
    </div>
  </template>
  
  <script>
  import Scheduleview from "@/components/Schedule-view.vue";
  import Messagecenter from "@/components/Message-center.vue";
  import Conversationrecords from "@/components/Conversation-records.vue";
  
  
  export default {
    props: {
      activeTab: String
    },
    components: {
      Scheduleview,
      Messagecenter,
      Conversationrecords,
    }
  };
  </script>
  
  <style scoped>
  .content-container {
    position:absolute;
    top:80px;
    left: 180px;
    right:0;
    bottom:0;
    padding: 20px;
    overflow: hidden;
    background-color: #fff; /* 确保内容区有背景，不会透到底层 */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  </style>