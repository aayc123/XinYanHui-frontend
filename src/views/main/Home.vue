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
                {{  formatDisplayDate(date) }}
            </span>
        </div>
        </div>
        <el-card class="Consultant">
        <div>
          <h2 style="text-align: left; margin-top: 0px;">咨询师列表</h2>
          <p style="text-align: left; color: grey;">点击咨询师头像查看详情</p>
        </div>
        <!-- 修改滚动区域 -->
        <div style="height: 480px; overflow-y: auto; display: flex; flex-direction: column;overflow-x: hidden;">
        <el-row 
          :gutter="9" 
          style="flex: 1; min-height: min-content; display: flex; flex-wrap: wrap; "
        >
          <el-col 
            :span="8" 
            v-for="consultant in consultants" 
            :key="consultant.consultantId"
            @click.native="goToConsultant(consultant.consultantId, consultant.name)"
            style="margin-bottom: 15px; box-sizing: border-box;" 
          >
            <el-card 
              style="cursor: pointer; border-width:1px; 
                    border-radius: 20px; 
                    height: 100%;  
                    border-color: #7a3b10; 
                    --el-card-border-color: #7a3b10;"
            >
              <div style="text-align: center">
                <img src="../../assets/head.png" style="width: 100px; height: 100px; border-radius: 50%">
                <p>{{ consultant.name }}</p>
                <p>{{ consultant.professionalInfo }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      </el-card>
        
      </div>
      <div class="gap"></div>
      <div class="right">
        <!-- 使用一个包裹容器来确保子元素垂直排列 -->
        <div class="content-wrapper">
          
          <div class="latest-meeting">
            <el-card style="border-color: #7a3b10; --el-card-border-color: #7a3b10;border-radius: 20px;">
              <div slot="header" class="clearfix" style="background: #8B4513; border-radius: 4px; padding: 10px 20px;">
                <span style="color: #fff; font-weight: 600;">最近预约</span>
              </div>
              <div class="meeting-roll" style="height: 480px; overflow-y: auto; display: flex; flex-direction: column;overflow-x: hidden;">
              <el-table :data="tableData.filter(item => item.status !== 'completed'&& item.status !== 'canceled')" style="width: 100%;flex:1" header-row-class-name="custom-header" height="100%">
                <!-- 合并预约日期和时间 -->
                <el-table-column label="预约时间" width="170">
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
                      @click="openCancelModal(scope.row.appointmentId)">
                      取消预约
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div style="height:100px;"></div>
              </div>
            </el-card>
          </div>
          <div v-if="showLeaveModal" class="modal">
            <h3>取消预约</h3>
            <textarea v-model="leaveReason" placeholder="请填写取消理由"></textarea>
            <button @click="submitCancel">提交</button>
            <button @click="closeCancelModal">取消</button>
          </div>
        </div>
          <div class="rili">
            <!-- <calendar /> -->
            <MySchedule/>
          </div>
        </div>
    
    </el-container>
  
  </el-container>
</template>

<script>
//import calendar from '../../components/calendar.vue';
//import { DepthTexture } from 'three';
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
      token: localStorage.getItem('token'), // 获取 JWT Token
      showLeaveModal: false, // 控制模态框显示
      leaveReason: "", // 用户填写的取消理由
      currentAppointmentId: null, // 当前要取消的预约 ID
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
      this.dateOptions.push('现在在线');
      for (let i = 1; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          this.dateOptions.push(this.formatDate(date));
      }
      //alert('Generated dateOptions:', this.dateOptions);
    },
    TransDate(date){
      if(date==='现在在线'){
        return this.formatDate(new Date());
      }
    },
    async fetchConsultants(availableDate) {
      try {
        availableDate=this.TransDate(availableDate);
        this.$axios.get('/user/consultantlist',{
        headers: {
          token:this.token, // 获取 JWT Token
        },
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
        this.$axios.get('/user/appointments', {
          headers: {
            token:this.token, // 获取 JWT Token
          },
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
    formatDisplayDate(date) {
      if (date === '现在在线') return date;
      
      // 解析日期格式（支持YYYY-MM-DD和后端可能返回的其他格式）
      const [y, m, d] = date.split(/[-/]/);
      const year = y.slice(-2);  // 取年份后两位
      const month = m.padStart(2, '0');
      const day = d.padStart(2, '0');
      return `${year}/${month}/${day}`;
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

     
    cancelAppointment(appointmentId, cancellationReason) {
      this.$axios
        .post("/user/cancel", {
          headers: {
            token:this.token, // 获取 JWT Token
          },
          appointmentId: parseInt(appointmentId, 10),
          cancellationReason: cancellationReason,
        })
        .then(() => {
          this.$message.success("预约已取消");
          this.fetchAppointments(); // 刷新数据
        })
        .catch(() => {
          this.$message.error("取消预约失败，请稍后重试");
        });
    },
    openCancelModal(appointmentId) {
      this.currentAppointmentId = appointmentId; // 设置当前预约 ID
      this.showLeaveModal = true; // 显示模态框
    },
    closeCancelModal() {
      this.showLeaveModal = false; // 关闭模态框
      this.leaveReason = ""; // 清空取消理由
      this.currentAppointmentId = null; // 清空当前预约 ID
    },
    submitCancel() {
      if (!this.leaveReason.trim()) {
        alert("请填写取消理由");
        return;
      }
      this.cancelAppointment(this.currentAppointmentId, this.leaveReason); // 提交取消请求
      this.closeCancelModal(); // 关闭模态框
    },
  
  goToConsultant(id, name) {
    this.$router.push({
      path: `/consultant/${id}`,
      query: { name: name ,appselectedTime:this.selectedDate} // 通过查询参数传递 name
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
  border:2px solid #5c3317;
}
.date-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}
.date-item {
  font-size: 16px;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #f0f0f0;
}
.date-item.selected {
    background-color: #5c3317;
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
  height: 500px;
  display: flex;
  flex-direction: column;
}
.latest-meeting .el-card__body {
  flex: 1;
  overflow: hidden;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.latest-meeting .el-table {
  flex: 1;
  overflow-y: auto;
}

/* 保证表格头固定 */
.el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f5e7da;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  z-index: 1000;
}

.modal textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
}

.modal button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #8B4513;
  color: white;
  border: none;
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f5e7da;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #8B4513;
  border-radius: 4px;
}
.meeting-roll ::-webkit-scrollbar {
  width: 8px;
}

.meeting-roll ::-webkit-scrollbar-track {
  background: #f5e7da;
  border-radius: 4px;
}

.meeting-roll ::-webkit-scrollbar-thumb {
  background: #8B4513;
  border-radius: 4px;
}
</style>