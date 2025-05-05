<template>
  <div class="appointment-records">
    <div class="filters">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
      />
      <el-button type="primary" @click="fetchAppointments">查询</el-button>
    </div>

    <el-table v-if="appointments.length" :data="appointments" border style="margin-top: 20px">
      <el-table-column prop="appointmentDate" label="咨询日期" width="120" />
      <el-table-column prop="appointmentTime" label="时间" width="100" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="bookingDate" label="预约时间" width="180" />
      <el-table-column
        label="是否实时咨询"
        width="130"
        :formatter="isRealtimeConsult"
      />
      <el-table-column prop="userId" label="来访者ID" width="100" />
    </el-table>

    <div v-else style="margin-top: 20px; color: gray">暂无记录</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      dateRange: [],
      appointments: [],
      consultantId: localStorage.getItem('consultantId') || '' // 登录时存储的
    }
  },
  methods: {
    async fetchAppointments() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        this.$message.warning('请选择起止日期');
        return;
      }

      const [startDate, endDate] = this.dateRange;

      try {
        const res = await axios.get('http://localhost:8080/internal/appointments', {
          params: {
            consultantId: this.consultantId,
            startDate,
            endDate,
            appointmentStatus: 'BOOKED'
          }
        });

        if (res.data.code === 1) {
          this.appointments = res.data.Data;
        } else {
          this.$message.error(res.data.msg || '获取数据失败');
        }
      } catch (error) {
        //console.error(error);
        this.$message.error('请求出错');
      }
    },
    isRealtimeConsult(row) {
      const bookingDateTime = new Date(row.bookingDate).toISOString().slice(0, 16);
      const appointmentDateTime = `${row.appointmentDate}T${row.appointmentTime}`.slice(0, 16);
      return bookingDateTime === appointmentDateTime ? '是' : '否';
    }
  }
}
</script>

<style scoped>
.appointment-records {
  padding: 20px;
}
.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
