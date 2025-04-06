<template>
  <div>
    <h1>咨询师详情</h1>
    <el-card v-if="consultantId">
      <div style="text-align: center">
        <img src="../assets/head.png" style="width: 150px; height: 150px; border-radius: 50%" />
        <h2>{{ this.consultantName }}</h2>
        <p>电话：{{ this.consultantId }}</p>
      </div>
    </el-card>
    <p v-else>咨询师信息未找到。</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      consultantId : parseInt(this.$route.params.id), // 获取路径参数 id
      consultantName : this.$route.query.name, // 获取查询参数 name
      consultants: [],
    };
  },
  mounted() {
    this.fetchConsultantDetails();

    // // 根据 id 查找对应的咨询师
    // this.consultant = consultants.find((c) => c.id === consultantId);

    // // 如果没有找到，尝试用 name 匹配
    // if (!this.consultant && consultantName) {
    //   this.consultant = consultants.find((c) => c.name === consultantName);
    // }
  },
  methods:{
    async fetchConsultantDetails() {
      try {
        this.$axios.get('/user/consultant',{
          params:{consultantID:parseInt(this.consultantId, 10)},
        }).then(response=>{
          if (response.data.code !== "1") {
            alert('获取咨询师信息失败：' + response.data.message);
            return;
          } 
          this.consultants = response.data.data
        });
      } catch (error) {
        this.$message.error('获取咨询师信息失败，请稍后重试');
      }
    }
  },
};
</script>