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
                <span @click="personalbar()">{{User}}</span>
                <el-button @click="LogoutHeadle()" >退出</el-button>
            </el-menu-item>
        </el-menu>

    </div>
</template>
<style scoped lang="less">

.pic {
    margin-left: 200px;
    height:60px;
}

.head {
    display: flex;
    width: 100%;
    height:10%;
    background-color: #fff;
}
.gaphead{
    width:30%;
}
.head > .nav {
    margin-top: 0px;
    margin-left: 50px;
    height: 60px;
    font-size: 70px;
}

/* 修改 el-menu-item 的默认样式 */
.el-menu-item {
    color: black; /* 正常状态下的文字颜色 */
    margin-right: 0px; /* 调整间距 */
}

/* 修改 active 状态的样式 */
.el-menu-item.is-active {
    color: #8B4513 !important; /* active 状态的文字颜色 */
}

.head > .nav > .user {
    margin-left: 400px;

    span {
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
            User:localStorage.getItem('username')
        }
    },
    methods:{
            LogoutHeadle(){
                /*LoginState=false;
                this.$router.push('/')*/
                // 清除本地存储中的登录状态
                localStorage.removeItem('LoginState');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                // 重定向到登录页面
                this.$router.push({ name: 'Login' });
            },
            personalbar(){
                this.$router.push({ name: 'Personal' });
            }
    }

}
</script>

