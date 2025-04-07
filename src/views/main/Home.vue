<template>
  <el-container style="background-color:#f2f1e4;">
    <el-container class="container">
      <div class="conseler">
        <!-- 类别选择区域 -->
        <div class="category-selector">
          <div class="date-selector">
            <span v-for="date in dateOptions" :key="date" @click="onDateClick(date)" 
                  :class="['date-item', { 'selected': selectedDate === date }]" 
                  style="cursor:pointer;">
                {{ date }}
            </span>
        </div>
        </div>
        <el-card class="Consultant">
        <div>
          <h2 style="text-align: left; margin-top: 0px;">在线咨询师列表</h2>
          <p style="text-align: left; color: grey;">点击咨询师头像查看详情</p>
        </div>
          <el-row :gutter="20">
            <el-col :span="12" v-for="consultant in consultants" :key="consultant.consultantId" 
            @click.native="goToConsultant(consultant.consultantId, consultant.name)">
              <el-card style="cursor: pointer; border-width:2px; border-radius: 20px; margin-bottom: 15px; border-color: #7a3b10; --el-card-border-color: #7a3b10;">
                <div style="text-align: center">
                  <img src="../../assets/head.png" style="width: 100px; height: 100px; border-radius: 50%">
                  <p>{{ consultant.name }}</p>
                  <p>{{ consultant.professionalInfo }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </div>
      <div class="gap"></div>
      <div class="right">
        <!-- 使用一个包裹容器来确保子元素垂直排列 -->
        <div class="content-wrapper">
          
          <div class="latest-meeting">
            <el-card style="border-color: #7a3b10; --el-card-border-color: #7a3b10;">
              <div slot="header" class="clearfix" style="background: #8B4513; border-radius: 4px; padding: 10px 20px;">
                <span style="color: #fff; font-weight: 600;">最近预约</span>
              </div>
              <el-table :data="tableData.filter(item => item.status !== 'completed'&& item.status !== 'canceled')" style="width: 100%" header-row-class-name="custom-header">
                <!-- 合并预约日期和时间 -->
                <el-table-column label="预约时间" width="180">
                  <template slot-scope="scope">
                    {{ scope.row.appointmentDate }}   {{ scope.row.appointmentTime }}   
                    
                  </template>
                </el-table-column>

                <!-- 咨询师信息 -->
                <el-table-column label="咨询师" width="120">
                  <template slot-scope="scope">
                    {{ scope.row.consultantName }}
                  </template>
                </el-table-column>

                <!-- 操作按钮 -->
                <el-table-column label="状态" width="80">
                  <template slot-scope="scope">
                    <el-button 
                      v-if="scope.row.status === 'ready'" 
                      type="text" 
                      @click="startConsultation(scope.row)"
                      :disabled="!isAppointmentActive(scope.row)">
                      开始咨询
                    </el-button>
                    <el-button
                      v-if="scope.row.status === 'booked'"
                      type="text"
                      @click="cancelAppointment(scope.row.appointmentId)">
                      取消预约
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
          <div class="rili">
            <!-- <calendar /> -->
            <MySchedule/>
          </div>
        </div>
      </div>
    </el-container>
  
  </el-container>
</template>

<script>
//import calendar from '../../components/calendar.vue';
import MySchedule from '../../components/MySchedule.vue';

export default {
  filters: {
    statusText(status) {
      const map = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
      };
      return map[status.toLowerCase()] || '未知状态';
    }
  },
  components: {
    //calendar // 注册组件
    MySchedule
  },
  data() {
    return {
      userId: localStorage.getItem('userId'), 
      selectedDate: '', // 当前选中的日期
      dateOptions: [], // 七天的日期列表
      consultants: [],
      tableData: [],
      filters: {
        startDate: null,
        endDate: null,
        status: null
      }
    };
  },
  mounted() { 
    this.generateDateOptions();
    this.selectedDate = this.dateOptions[0]; 
    this.fetchConsultants(this.dateOptions[0]);
    this.fetchAppointments();
  },
  methods: {
    async generateDateOptions() {
      
      const today = new Date(); // 固定为题目中的日期
      for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          this.dateOptions.push(this.formatDate(date));
      }
      //alert('Generated dateOptions:', this.dateOptions);
    },
    async fetchConsultants(availableDate) {
      try {
        this.$axios.get('/user/consultantlist',{
        params:{availableDate:availableDate},
        }).then(res => {
          if (res.data.code === "1") { // 根据你的后端接口实际结构调整
            this.consultants = res.data.data
          } else {
            this.$message.error('获取咨询师数据失败：' + res.data.message)
          }
        });
       
      } catch (error) {
        this.$message.error('获取咨询师数据失败，请检查网络')
      }
    },
    async fetchAppointments() {
      try {
        //alert(this.userId);
        this.$axios.get('/user/appointments', {
          params:{userId:parseInt(this.userId, 10)},
          }).then(response=>{
          if (response.data.code !== "1") {
            //alert('获取预约数据失败：' + response.data.message);
            return;
          } 
          // 获取原始数据
        let rawData = response.data.data;
        // 过滤掉 appointmentDate 早于今天的记录
        const today = new Date().toISOString().split('T')[0]; // 获取今天的日期（格式：YYYY-MM-DD）
        this.tableData = rawData.filter(item => {
          return item.appointmentDate >= today; // 只保留 appointmentDate 大于等于今天的记录
        });
        });
      } catch (error) {
        this.$message.error('获取预约数据失败')
      }
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    // 时间格式化
    formatDateTime(date, time) {
      if (!date || !time) return '未知时间';
      return this.$moment(`${date} ${time}`).format('YYYY-MM-DD HH:mm');
    },

    onDateClick(selectedDate) {
      if (this.selectedDate !== selectedDate) {
          this.selectedDate = selectedDate;
          this.fetchConsultants(selectedDate);
      }
    },
    // 状态标签样式
    statusTagType(status) {
      const map = {
        PENDING: 'warning',
        CONFIRMED: 'success',
        COMPLETED: 'info',
        CANCELLED: 'danger'
      };
      return map[status] || 'info';
    },
    // 判断是否可开始咨询
    isAppointmentActive(row) {
      const now = new Date();
      const start = new Date(`${row.appointmentDate}T${row.appointmentTime}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 默认一小时后结束
      return now >= start && now <= end;
    },
    handleCommand(command) {
      this.categories.forEach(item => {
        item.active = item.command === command; // 将当前项标记为 active，其他项取消 active
      });
    },
    startConsultation(row) {
      if (!this.isAppointmentActive(row)) {
        this.$message.warning('当前时间不在预约时间内，无法开始咨询');
        return;
      }

      // 跳转到咨询页面或执行其他逻辑
      this.$router.push({
        path: '/chat',
        query: {
          appointmentId: row.appointmentId,
          consultantId: row.consultantId,
          startTime: `${row.appointmentDate} ${row.appointmentTime}`
        }
      });
    },

  // 取消预约
  cancelAppointment(appointmentId) {
    //alert(appointmentId);
    this.$axios.post('/user/cancel', {
          appointmentId:parseInt(appointmentId, 10),
          cancellationReason: '用户主动取消预约',
        }).then(() => {
      this.$message.success('预约已取消');
      this.fetchAppointments(); // 刷新数据
    }).catch(() => {
      this.$message.error('取消预约失败，请稍后重试');
    });
  },
  goToConsultant(id, name) {
    this.$router.push({
      path: `/consultant/${id}`,
      query: { name: name } // 通过查询参数传递 name
    });
  }
  },
};
</script>

<style scoped>
.custom-header th {
  background-color: #f5e7da !important;
  color: #5c3317 !important;
}

/* 调整按钮颜色 */
.el-button--text {
  color: #8B4513;
}
.el-button--text:focus,
.el-button--text:hover {
  color: #ad6d3b;
}

/* 标签颜色调整 */
.el-tag {
  color: #5c3317;
}
.el-tag--primary {
  background-color: #f5e7da;
  border-color: #d4b59e;
}
.Consultant{
  margin-top: 30px;
  border-radius: 20px;
  background-color: transparent;
  border-color: #5c3317;
}
.date-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}
.date-item {
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #f0f0f0;
}
.date-item.selected {
    background-color: #293ce7;
    color: white;
}
.category-selector {
  display: flex;
  align-items: center;
  border-radius: 20px;
  background-color: white;
  padding: 20px;
  border: 2px solid #7a3b10; /* 宽度、样式、颜色 */
}
.container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: flex-start; /* 垂直对齐顶部 */
  margin: 0 auto; /* 自动左右外边距 */
  max-width: 1200px; /* 设置最大宽度，避免过宽 */
  padding: 20px 0; /* 添加上下内边距 */
  width: 100%; /* 占满父容器宽度 */
}
.conseler{
  margin-top: 10px;
  width:70%;
}

.label {
  margin-right: 10px;
  font-size:20px;
  width: 10%;
}

.selected-item {
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border-bottom 0.3s;
  white-space: nowrap;
}
.gap{
  width:5%;
}

.selected-list {
  list-style-type: none;
  padding: 0px;
  margin: 0px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: grey;
  margin-left: 20px;
}

/* 默认未选中状态 */
.selected-list li {
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border-bottom 0.3s, color 0.3s; /* 添加平滑过渡效果 */
  white-space: nowrap;
}

/* 鼠标悬停时的效果 */
.selected-list li:hover {
  border-bottom: 2px solid #7a3b10; /* 棕色下划线 */
  color: #7a3b10; /* 文本变为棕色 */
}

/* 被选中时的效果 */
.selected-list li.active {
  border-bottom: 2px solid #7a3b10; /* 棕色下划线 */
  color: #7a3b10; /* 文本变为棕色 */
}
.right {
  width: 35%;
  height: 600px;
}
.latest-meeting{
  padding-bottom: 10px;
  border-radius: 20px;
  height: auto; /* 确保高度自适应 */
  min-height: 300px; /* 最小高度 */
  margin-top:10px;
  
}

</style>