<template>
  <div class="content-container">
    <MySchedule v-if="activeTab === 'schedule'" />
    <Book v-if="activeTab === 'book'"/>
    <Records v-if="activeTab === 'records'"/>
    <Messages v-if="activeTab === 'messages'"/>
    <Reviews v-if="activeTab === 'reviews'"/>
  </div>
</template>

<script>
import MySchedule from "@/components/MySchedule.vue";
import Book from "@/components/book.vue";
import Records from "@/components/records.vue";
import Messages from "@/components/Messages.vue";


export default {
  props: {
    activeTab: String
  },
  components: {
    MySchedule,
    Book,
    Records,
    Messages
  }
};
</script>

<style scoped>
.content-container {
  position:absolute;
  top:60px;
  left: 180px;
  right:0;
  bottom:0px;
  padding: 20px;
  overflow: hidden;
  background-color: #fff; /* 确保内容区有背景，不会透到底层 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>