<template>
  <div>
    <h1>咨询师详情</h1>
    <el-card v-if="consultantId">
      <div style="text-align: center">
        <img src="../assets/head.png" style="width: 150px; height: 150px; border-radius: 50%" />
        <h2>{{ consultantName }}</h2>
        <p>电话：{{ consultantId }}</p>
        <el-table :data="formattedConsultants" style="width: 100%" header-row-class-name="custom-header">
          <!-- 合并预约日期和时间 -->
          <el-table-column label="时间" width="180">
            <template slot-scope="scope">
              {{ scope.row.time }}
            </template>
          </el-table-column>

          <!-- 操作按钮 -->
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button 
                v-if="scope.row.status === 'available'" 
                type="text" 
                @click="createConsultation(scope.row)"
                :disabled="!isAppointmentActive(scope.row)">
                预约
              </el-button>
              <el-div
                v-if="scope.row.status === 'busy'"
                type="text"
                >
                无法预约
              </el-div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <p v-else>咨询师信息未找到。</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      consultantId: parseInt(this.$route.params.id), // 获取路径参数 id
      consultantName: this.$route.query.name, // 获取查询参数 name
      consultants: [], // 原始数据
      formattedConsultants: [], // 格式化后的数据
    };
  },
  mounted() {
    this.fetchConsultantDetails();
  },
  methods: {
    async fetchConsultantDetails() {
      try {
        const response = await this.$axios.get('/user/consultant', {
          params: { consultantID: parseInt(this.consultantId, 10) },
        });

        if (response.data.code !== "1") {
          alert('获取咨询师信息失败：' + response.data.message);
          return;
        }

        // 将原始数据格式化为表格可用的数组
        this.formatConsultants(response.data.data);
      } catch (error) {
        this.$message.error('获取咨询师信息失败，请稍后重试');
      }
    },
    formatConsultants(data) {
      // 将对象转换为数组
      this.formattedConsultants = Object.keys(data).map(key => {
        return {
          time: key === "-999999999-01-01T00:00" ? "现在在线" : key, // 替换特殊键
          status: data[key] === "AVAILABLE" ? "available" : "busy", // 设置状态
        };
      });
    },
    createConsultation(row) {
      // 构造预约对象
      const appointment = {
        userId:parseInt(localStorage.getItem('userId'),10) , // 用户ID
        consultantId: this.consultantId, 
        appointmentDate: row.time.substring(0,10), // 预约时间
        appointmentTime: row.time.substring(11,16)
      };
      //alert(row.time.substring(11,15));
      // 调用后端接口提交预约
      this.$axios.post('/user/book', appointment)
        .then(response => {
          if (response.data.code === "1") {
            //alert('预约成功！');
            this.$message.success('预约成功！');
            // 刷新数据以更新状态
            this.fetchConsultantDetails();
          } else {
            this.$message.error('预约失败：' + response.data.msg);
          }
        })
        .catch(error => {
          this.$message.error('预约失败，请稍后重试');
          alert('预约请求错误:', error);
        });
    },
    isAppointmentActive(row) {
      // 判断是否可以激活预约
      return row.status === "available";
    },
  },
};
</script>