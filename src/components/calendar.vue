<template>
  <div class="cal" ref="calendarContainer">
    <el-calendar v-model="value"></el-calendar>
  </div>
</template>

<style scoped lang="less">
.cal {
  width: 100%;
}

</style>

<script>
import { Calendar } from 'element-ui';

export default {
  components: {
    ElCalendar: Calendar,
  },
  data() {
    return {
      value: new Date(),
    };
  }
};
</script>