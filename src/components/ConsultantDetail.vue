<template>
  <div>
    <h1>咨询师详情</h1>
    <div>
      <img src="../assets/head.jpg" style="width: 150px; height: 150px; border-radius: 50%" />
            <h2>{{ consultantName }}</h2>
            <p>咨询师简介：{{ consultantInfo }}</p>
            
    </div>
    <el-card v-if="consultantId"> 
      <el-row :gutter="20">
        <!-- 左侧日期列 -->
        <el-col :span="6">
          <div class="date-list">
            <el-button 
              v-for="date in dateGroups" 
              :key="date.date"
              @click="selectedDate = date.date"
              :type="selectedDate === date.date ? 'primary' : ''"
              style="margin-bottom: 10px; width: 100%"
            >
              {{ date.date === 'now' ? '现在在线' : date.date }}
            </el-button>
          </div>
        </el-col>

        <!-- 右侧时间段 -->
        <el-col :span="18">
          <div style="text-align: center">
            
            <el-table 
              :data="currentTimes" 
              style="width: 100%" 
              header-row-class-name="custom-header"
              empty-text="该日期没有可用时间段"
            >
              <el-table-column label="时间" width="180">
                <template slot-scope="scope">
                  {{ scope.row.time }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                  <template v-if="selectedDate === 'now'">
                    <el-button 
                      type="text"
                      @click="GotoChat(scope.row,1)"
                    >
                      进入对话
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button 
                      v-if="scope.row.status === 'available'"
                      type="text"
                      @click="createConsultation(scope.row)"
                      :disabled="!isAppointmentActive(scope.row)"
                    >
                      预约
                    </el-button>
                    <span v-else style="color: #999">已满员</span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <p v-else>咨询师信息未找到。</p>
    <el-dialog
      title="心理咨询保密协议书"
      :visible.sync="showProtocolDialog"
      width="600px"
    >
      <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px">
        <h3>一、保密内容</h3>
        <p>心理咨询师本着尊重、保护来访者个人隐私的态度，对心理咨询过程中的有关信息，包括个案记录、测验资料、信件、录音和其他资料，均属专业信息，都将在严格保密的情况下进行保存。同时，心理咨询师还必须严格遵守职业道德中保密原则的有关规定，严守咨询个案的相关资料。</p>
        
        <h3>二、查阅权限</h3>
        <p>上述保密资料，除华东师范大学心理研究院，任何人均不得查阅。</p>
        
        <h3>三、录音授权</h3>
        <p>心理咨询师只有在征得来访者同意的情况下才能对咨询过程进行笔录、录音。</p>
      </div>

      <div style="display: flex; align-items: center; margin-top: 20px">
        <el-checkbox v-model="agreeProtocol">我已阅读并同意此协议</el-checkbox>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showProtocolDialog = false">取 消</el-button>
        <el-button 
          type="primary" 
          @click="confirmGotoChat"
          :disabled="!agreeProtocol"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      consultantId: parseInt(this.$route.params.id),
      token: localStorage.getItem('token'),
      consultantName: '',
      appselectedTime: '',
      consultantInfo:'',
      dateGroups: [],  // 分组后的日期数据
      selectedDate: '', // 当前选中的日期
      showProtocolDialog: false,
      agreeProtocol: false,
      selectedRow: null, // 保存当前选中的时间段
    };
  },
  computed: {
    // 当前选中日期的时间段
    currentTimes() {
      const group = this.dateGroups.find(d => d.date === this.selectedDate);
      return group ? group.times : [];
    }
  },
  mounted() {
    this.fetchConsultantDetails();
    const consultantData = JSON.parse(sessionStorage.getItem('consultantData'));
    if (consultantData) {
      this.consultantName = consultantData.name;
      this.appselectedTime = consultantData.appselectedTime;
      this.consultantInfo = consultantData.info;
      // 清除存储（可选）
      sessionStorage.removeItem('consultantData');
    }
  },
  
  methods: {
    async fetchConsultantDetails() {
      try {
        const response = await this.$axios.get('/user/consultant', {
          headers: {
            token:this.token, // 获取 JWT Token
          },
          params: { consultantID: this.consultantId }
        });

        if (response.data.code !== "1") {
          this.$message.error('获取信息失败：' + response.data.message);
          return;
        }

        this.formatConsultants(response.data.data);
      } catch (error) {
        this.$message.error('获取信息失败');
      }
    },
    formatConsultants(data) {
      const groups = {};
      
      Object.entries(data).forEach(([key, value]) => {
        // 处理特殊键
        if (key === "-999999999-01-01T00:00") {
          groups['now'] = {
            date: 'now',
            times: [{
              time: '现在在线',
              status: 'available',
              rawTime: key
            }]
          };
          return;
        }

        // 解析正常时间
        const dateStr = key.split('T')[0];
        const timeStr = key.split('T')[1].slice(0, 5);
        
        if (!groups[dateStr]) {
          groups[dateStr] = {
            date: dateStr,
            times: []
          };
        }

        groups[dateStr].times.push({
          time: timeStr,
          status: value === "AVAILABLE" ? "available" : "busy",
          rawTime: key
        });
      });

      // 转换并排序日期
      this.dateGroups = Object.values(groups)
        .sort((a, b) => {
          if (a.date === 'now') return -1; // 'now' 日期排在最前面
          if (b.date === 'now') return 1; // 'now' 日期排在最前面
          b.date === 'now' ? -1 : a.date.localeCompare(b.date);
        })
      // 默认选中第一个日期
      if (this.dateGroups.length > 0) {
        this.selectedDate = this.appselectedTime==='现在在线'? this.dateGroups[0].date:this.appselectedTime;
      }
    },
    // 进入聊天
    GotoChat(row) {
      this.selectedRow = row; // 保存选中的时间段
      this.showProtocolDialog = true; // 显示协议弹窗
    },
    confirmGotoChat() {
      if (!this.agreeProtocol) {
        this.$message.warning('请先阅读并同意协议');
        return;
      }
    
      this.showProtocolDialog = false;
      const params = new URLSearchParams();
      params.append('consultantId', this.consultantId);
      params.append('userId', parseInt(localStorage.getItem('userId')));
      (async () => {
        try {
          const response = await this.$axios.post('/user/session', params, {
            headers: {
              'token': this.token,
              'Content-Type': 'application/x-www-form-urlencoded' // 明确指定内容类型
            }
          });
          
          // 检查 response 是否有 data 属性，并且 code 是否为 "1"
          if (response.data && response.data.code === "1") {
            const id = response.data.data.sessionId;
            //alert(id); // 调试信息，可以移除或替换为日志记录
            const chatUrl = this.$router.resolve({
              path: `/chat/${id}`,
              query: {
                consultantId: this.consultantId,
                consultantName: this.consultantName,
                appointmentDate: this.selectedRow.time,
                sessionId:id,
              },
            }).href;

            window.open(chatUrl, '_blank');
            this.agreeProtocol = false; // 重置协议状态
          } else {
            this.$message.error(response.data.msg || '未知错误');
          }
        } catch (error) {
          //console.error(error); // 在控制台输出详细的错误信息以便调试
          this.$message.error('预约失败');
        }
      })();
    },
    // 创建预约
    async createConsultation(row) {
      const appointment = {
        userId: parseInt(localStorage.getItem('userId')),
        consultantId: this.consultantId,
        appointmentDate: this.selectedDate,
        appointmentTime: row.time
      };

      try {
        const res = await this.$axios.post('/user/book', appointment,{
          headers: {
            token:this.token, // 获取 JWT Token
          },
        });
        if (res.data.code === "1") {
          this.$message.success('预约成功');
          this.fetchConsultantDetails(); // 刷新数据
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        this.$message.error('预约失败');
      }
    },
    isAppointmentActive(row) {
      return row.status === 'available';
    }
  }
};
</script>

<style>
.date-list {
  padding: 10px;
  border-right: 1px solid #ebeef5;
  width: 80%;
}
.el-button+.el-button {
  margin-left:0px;
}
.custom-header th {
  background-color: #f5f7fa;
}
</style>