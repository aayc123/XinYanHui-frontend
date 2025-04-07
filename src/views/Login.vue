<template>
    <div class="login">
        <div class="left" ref="vantaRef" style="height: 100vh">
            <h1 style="color: #8B4513;width: 20%;">心研汇</h1>
        </div>
        <div class="right">
            <div v-if="activeTab === 'login'" style="margin-top:230px;width:80%">
                <!-- 登录表单 -->
                <el-form :model="loginForm" :rules="rules" ref="loginForm" status-icon label-width="90px">
                    <el-form-item label="用户名" prop="account">
                        <el-input type="text" v-model="loginForm.account" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="loginForm.password"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="btn" @click="submitForm('loginForm')">提交</el-button>
                        <!-- <el-button  type="primary" @click="submitForm('loginForm')">提交</el-button> -->
                        <!-- <el-button type="primary" @click="jump">提交</el-button> -->
                    </el-form-item>
                </el-form>
            </div>
            <div v-else-if="activeTab === 'register'" style="margin-top:230px; width:80%">
                <!-- 注册表单 -->
                <el-form :model="registerForm" :rules="rules" ref="registerForm" status-icon label-width="90px">
                    <el-form-item label="用户名" prop="username">
                        <el-input type="text" v-model="registerForm.username" placeholder="只能输入数字或字母，长度不少于4位"/>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input type="text" v-model="registerForm.email"/>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input type="text" v-model="registerForm.phone" placeholder="长度为11位"/>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="registerForm.password" placeholder="只能输入数字或字母，长度不少于6位"/>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input type="password" v-model="registerForm.confirmPassword"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="btn" @click="submitForm('registerForm')">提交</el-button>
                        <!-- <el-button type="primary" @click="submitForm('registerForm')">提交</el-button> -->
                    </el-form-item>
                </el-form>
            </div>
            <div v-else>
                <h1 style="margin-top:230px;">开始使用</h1>
                <div class="choice">
                    <button class="btn1" @click="switchToLogin">登录</button>
                    <button class="btn2" @click="switchToRegister">注册</button>
                </div>
                <div class="pic" style="width:80%">
                    <img src="../assets/icon.png" alt="icon" style="position:fixed;bottom:0;margin-right:10px;width:150px; height: 100px;"/> 
                </div>
            </div>
            
        </div>
    </div>
</template>

<style scoped lang="less">

.login{
    margin: 0 auto;
    .left {
        top: 0;
        left: 0;
        width: 50%;
        height: 100vh;
        z-index: -1;
    }
    .right{
        width: 50%;
        background-color: #fff;
        height: 100vh;
    }
    .left {
        float: left;
    }
    .right{
        float:right;
    }
    .box-card{
        width: 80%;
        margin: 100px auto;
    }
    .choice{
        margin-left: 160px;
        margin-top:40px;
        display: table;
        .btn1{
            width: 200px;
            height:40px;
            background-color:#293ce7;
            color: white;
            border:none;
            border-radius: 25px;
            margin-right: 30px;
            display: table-cell;
        }
        .btn2{
            width: 200px;
            height:40px;
            background-color:#293ce7;
            color: white;
            border:none;
            border-radius: 25px;
            margin-right: 20px;
            display: table-cell;
        }
    }
}

.btn{
            padding: 0 30px;
            height:40px;
            background-color:#293ce7;
            color: white;
            border:none;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
        }

        .btn:hover{
            background-color: #5263f4;
        }

</style>

<script src="three.r134.min.js"></script>
<script src="vanta.birds.min.js"></script>

<script>
//const dstway="https://run.mocky.io/v3/241f827c-125d-45d6-b2d2-b49a57590886";
//const dstway2="https://run.mocky.io/v3/241f827c-125d-45d6-b2d2-b49a57590886";
//const dstway="http://localhost:5006/login";//连接登录后端
//const dstway2="http://localhost:5006/register";//连接注册后端
const dstway = "/user/login"; // 修正后的登录接口路径
const dstway2 = "/user/register"; // 修正后的注册接口路径

//export var LoginState = false;
export var Username = null;
import * as THREE from "three";
import BIRDS from "vanta/src/vanta.birds";

export default {
    data() {
        // 用户名验证规则
        var validateUserName = (rule, value, callback) => {
            const reg = /^[a-zA-Z0-9]+$/; // 只允许字母和数字
            if (value === '') {
                callback(new Error('请输入用户名'));
            } else if (value.length < 4) {
                callback(new Error('用户名长度不少于4位'));
            }  else {
                callback();
            }
        };

        // 密码验证规则
        var validatePassword = (rule, value, callback) => {
            const reg = /^[a-zA-Z0-9]+$/; // 只允许字母和数字
            if (value.length === 0) {
                callback(new Error('请输入密码'));
            } else if (value.length < 6) {
                callback(new Error('密码长度不少于6位'));
            } else {
                callback();
            }
        };

        // 确认密码验证规则
        var validateConfirmPassword = (rule, value, callback) => {
            if (value.length === 0) {
                callback(new Error('请输入确认密码'));
            } else if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        // 手机号验证规则
        var validatePhoneNumber = (rule, value, callback) => {
            const reg = /^1[3456789]\d{9}$/;
            if (value.length === 0) {
                callback(new Error('请输入手机号'));
            } else if (!reg.test(value)) {
                callback(new Error('手机号格式错误'));
            } else {
                callback();
            }
        };

        return {
            currentIndex: "login",
            activeTab: "",
            loginForm: {
                type:0,
                account: "",
                password: ""
            },
            registerForm: {
                username: "",
                password: "",
                phone: "" ,
                email:"",
                confirmPassword:""
            },
            rules: {
                username: [{
                    validator: validateUserName,
                    trigger: "blur"
                }],
                password: [{
                    validator: validatePassword,
                    trigger: "blur"
                }],
                confirmPassword: [{
                    validator: validateConfirmPassword,
                    trigger: "blur"
                }],
                phonenum: [{ // 新增手机号验证规则
                    validator: validatePhoneNumber,
                    trigger: "blur"
                }]
            }
        }
    },
    mounted() {
        this.vantaEffect = BIRDS({
        el: this.$refs.vantaRef,
        THREE: THREE,
        });
        // 修改颜色时 cells 需要全大写字母 可生效
        VANTA.BIRDS({
        el: this.$refs.vantaRef,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0xf2f1e4,
        color1: 0x53260c,
        color2: 0xd1b621
        })
    },
    beforeDestroy() {
        if (this.vantaEffect) {
        this.vantaEffect.destroy();
        }
    },
    methods:{
        switchToLogin() {
            this.activeTab = 'login';
        },
        switchToRegister() {
            this.activeTab = 'register';
        },
        submitForm(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if(this.activeTab==='login'){//这里可以写接口把数据提交给后台
                        this.$axios.post(dstway,this.loginForm)
                        .then(response => {
                            if(response.data.code==="1"){
                                //console.log('Response data:', response.data);
                                const user = response.data.data; // 获取用户数据
                                const userId=user.userId;
                                const username=user.username;
                                localStorage.setItem('LoginState', 'true'); // 设置登录状态
                                this.$store.dispatch('setUserInfo', { userId, username });
                                localStorage.setItem('userId', userId);
                                localStorage.setItem('username', username);
                                //console.log('Username:',user.username);
                                // 跳转到首页
                                this.$router.push('/');
                            }
                            else{
                                alert(response.data.msg); // 显示后端返回的错误消息
                            }
                        })
                        .catch(error => {
                        // 请求失败时的处理逻辑
                            alert('登录失败!');
                        });
                        console.log(this.loginForm);
                    }
                    else if(this.activeTab==='register'){//这里是注册的逻辑
                        console.log(this.registerForm);
                        this.$axios.post(dstway2,this.registerForm)
                        .then(response => {
                        
                        console.log(response);
                        if(response.data.code==="1"){
                            console.log('Response data:', response.data);
                           // 登录成功逻辑
                            const user = response.data.data; // 获取用户数据
                            const userId=user.userId;
                            const username=user.username;
                            localStorage.setItem('LoginState', 'true'); // 设置登录状态
                            this.$store.dispatch('setUserInfo', { userId, username });
                            localStorage.setItem('userId', userId);
                            localStorage.setItem('username', username);
                            console.log('Username:',user.username);
                            //alert(user.username);
                            // 跳转到首页
                            this.$router.push('/');
                        }
                        else{
                            alert(response.data.msg); // 显示后端返回的错误消息
                        }
                        })
                        .catch(error => {
                            // 请求失败时的处理逻辑
                            alert('注册失败!');
                        });

                    }
                } else {
                    alert('输入数据不合法!');
                    return ;
                }
            })
        },
        handleTabsClick(tab){
            this.activeTab=tab.name;
        }
    }
}
</script>

