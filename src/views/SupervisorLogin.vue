<template>
    <div class="login">
        <div class="left" ref="vantaRef" style="height: 100vh">
            <h1 style="color: #8B4513;width: 20%;">心研汇</h1>
        </div>
        <div class="right" @keydown.enter="submitForm('loginForm')">
                <!-- 登录表单 -->
                <el-form :model="loginForm" :rules="rules" ref="loginForm" status-icon label-width="90px">
                    <el-form-item label="ID" prop="account">
                        <el-input type="text" v-model="loginForm.account" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="loginForm.password" show-password/>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="btn" @click="submitForm('loginForm')" type="submit">登录</el-button>
                    </el-form-item>
                </el-form>
                <div class="pic" >
                    <img src="../assets/icon.png" alt="icon" style="position:fixed;bottom:0;margin-right:50px;width:150px; height: 100px;"/> 
                </div>
        </div>
    </div>
</template>



<script src="three.r134.min.js"></script>
<script src="vanta.birds.min.js"></script>

<script>
const dstway = "/internal/login/supervisor"; 
export var Username = null;
import * as THREE from "three";
import BIRDS from "vanta/src/vanta.birds";

export default {
    data() {
        // id验证
        var validateUserName = (rule, value, callback) => {
        const reg = /^[Z0-9]+$/; // 只允许数字
        if (value === '') {
            callback(new Error('请输入ID'));
        } else if (value.length <1) {
            callback(new Error('ID不少于1位'));
        } else if (!reg.test(value)) {
            callback(new Error('ID只包含数字'));
        } else {
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
            } else if (!reg.test(value)) {
                callback(new Error('格式错误'));
            }else {
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
        submitForm(formName){
    this.$refs[formName].validate((valid) => {
        if (valid) {
            // 构造 x-www-form-urlencoded 格式的参数
            const params = new URLSearchParams();
            params.append('id', parseInt(this.loginForm.account,10));
            params.append('password', this.loginForm.password);

            this.$axios.post(dstway, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => {
                if(response.data.code === "1"){
                    const supervisor = response.data.data;
                    const supervisorId = supervisor.supervisorId;
                    const supervisorname = supervisor.name;
                    const token = supervisor.token;
                    const userType = 'supervisor';
                    localStorage.setItem('userType', userType);
                    localStorage.setItem('LoginState', 'true');
                    this.$store.dispatch('setUserInfo', { userId: supervisorId, username: supervisorname, token, userType });
                    localStorage.setItem('supervisorId', supervisorId);
                    localStorage.setItem('supervisorname', supervisorname);
                    localStorage.setItem('token', token);
                    this.$router.push('/SupervisorHome');
                } else {
                    alert(response.data.msg);
                }
            })
            .catch(error => {
                alert('登录失败!');
            });
        } else {
            alert('输入数据不合法!');
        }
    });
},

        handleTabsClick(tab){
            this.activeTab=tab.name;
        },
        clearRegisterForm() {
            // 清空注册表单数据
            this.registerForm = {
            username: "",
            password: "",
            phone: "",
            email: "",
            confirmPassword: ""
            };
        }
    }
}
</script>


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
        display:flex;
        align-items:center;
        justify-content: center;
        text-align: center;
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
        .btn1:hover{
            background-color: #5263f4;
        }
        .btn2:hover{
            background-color: #5263f4;
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
.remind{
    justify-content: center;
    display:flex;
    color:#999;
    margin-left: 90px;
    font-size: 14px;
    margin-top:10px;
}
.remind:hover{
    color: #333;
    cursor: pointer;
}
.remind2{
    justify-content: center;
    display:flex;
    color:#999;
}
.remind2:hover{
    color: #333;
    cursor: pointer;
}

</style>