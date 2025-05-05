<template>
  <div class="dashboard-container">
    <div class="row">
      <div class="panel left-top">
        <ConsultationDurationChart />
      </div>
      <div class="panel right-top">
        <MonthlyConsultationTotal />
      </div>
    </div>
    <div class="row">
      <div class="panel left-bottom">
        <ConsultantRanking />
      </div>
      <div class="panel right-bottom">
        <AbnormalSessions />
      </div>
    </div>
  </div>
</template>

<script>
import ConsultationDurationChart from '@/components/ConsultationDurationChart.vue'
import MonthlyConsultationTotal from '@/components/MonthlyConsultationTotal.vue'
import ConsultantRanking from '@/components/ConsultantRanking.vue'
import AbnormalSessions from '@/components/AbnormalSessions.vue'

export default {
  name: 'Databoard',
  components: {
    ConsultationDurationChart,
    MonthlyConsultationTotal,
    ConsultantRanking,
    AbnormalSessions
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction:column;
  gap: 16px;
  padding: 16px;
  background-color: rgb(239, 239, 239);
}

.row {
  display: flex;
  gap: 16px;
}

.panel {
  background-color: #fff;
  padding: 16px;
  border-radius: 10px;
  flex: 1;
  min-height: 300px;
}

.left-top, .left-bottom {
  flex: 2;
}
.right-top, .right-bottom {
  flex: 1;
}
.divider {
  border: none;
  border-top: 2px solid #ddd;
  margin: 16px 0;
}
</style>
