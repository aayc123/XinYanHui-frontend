<template>
    <div class="head">
        <img src="../assets/icon.png" alt="这是一个图标" class="pic">

        <el-menu 
        :default-active="$store.state.activeMenu" mode="horizontal" 
        active-text-color="#B886F8" class="nav"
        router
        >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/film">心理测试</el-menu-item>
            <el-menu-item index="/cinema">AI对话</el-menu-item>
            <el-menu-item index="/myfilm">阅读天地</el-menu-item>
            <el-menu-item class="user">
                <span>{{User}}</span>
                <el-button @click="LogoutHeadle()" >退出</el-button>
            </el-menu-item>
        </el-menu>

    </div>


</template>
<style scoped lang="less" >
.pic{
    width: 10%;
    margin-left: 30px;
}
.head{
    display: flex;
    width:90%;
}
.head>.nav{
    margin-top: 40px;
    margin-left: 90px;
    height: 60px;
    font-size: 50px;
}
.el-menu-item {
    margin-right: 90px; /* 调整此值以增加或减少间距 */
}
.head>.nav>.user{
    margin-left: 100px;
    span{
        margin-right: 50px;
    }
}

</style>
<script>
//const dstway="http://192.168.199.38:5006/city";
//import { mapState } from 'vuex';
export default {
    data(){
        return{
            active:"/",
            User:localStorage.getItem('Username')
        }
    },
    methods:{
            LogoutHeadle(){
                /*LoginState=false;
                this.$router.push('/')*/
                // 清除本地存储中的登录状态
                localStorage.removeItem('LoginState');
                localStorage.removeItem('Username');
                // 重定向到登录页面
                this.$router.push({ name: 'Login' });
            }
    }

}
</script>