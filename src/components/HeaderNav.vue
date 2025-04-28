<template>
    <div class="head">
        <img src="../assets/icon.png" alt="这是一个图标" class="pic">

        <el-menu 
        :default-active="activeMenu"  mode="horizontal" 
        active-text-color="#8B4513" class="nav"
        
        >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/film"  @click.native="handleClick">心理测试</el-menu-item>
            <el-menu-item index="/cinema"  @click.native="handleClick">AI对话</el-menu-item>
            <el-menu-item index="/myfilm"  @click.native="handleClick">阅读天地</el-menu-item>
            <el-submenu index="user" class="user-menu">
                <template slot="title">{{ User }}</template>
                <el-menu-item @click="personalbar">个人主页</el-menu-item>
                <el-menu-item @click="LogoutHeadle">退出</el-menu-item>
            </el-submenu>
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

.head > .nav {
    margin-top: 0px;
    margin-left: 50px;
    height: 60px;
    font-size: 70px;
    display: flex;
    align-items: center;
}

.el-menu-item {
    color: black;
    margin-right: 0px;
    height: 60px;
    line-height: 60px;
}

.el-menu-item.is-active {
    color: #8B4513;
}

.user-menu {
    margin-left: 400px;
    
    /deep/ .el-submenu__title {
        height: 60px;
        line-height: 60px;
    }
}
</style>

<script>
export default {
    data(){
        return{
            activeMenu: "/",
            User:localStorage.getItem('username')
        }
    },
    methods: {
        handleClick() {
            // 提示信息
            this.$message({
                message: "正在开发，敬请期待！",
                type: "warning",
            });
        },
        LogoutHeadle(){
            localStorage.removeItem('LoginState');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            this.$router.push({ name: 'Login' });
        },
        personalbar(){
            this.$router.push({ name: 'Personal' });
        }
    }
}
</script>