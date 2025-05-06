import Vue from 'vue'

import VueRouter from 'vue-router'




Vue.use(VueRouter)


const routes=[
    {
        path:'/consultanthome',
        name:'consultantHome',
        component:()=>import("../views/consultantHome.vue")
    },
    {
        path:'/adminhome',
        name:'adminHome',
        component:()=>import("../views/AdminHome.vue")
    },
    {
        path:'/supervisorhome',
        name:'supervisorHome',
        component:()=>import("../views/SupervisorHome.vue")
    },
    {
        path:'/Adminlogin',
        name:'AdminLogin',
        component:()=>import("../views/AdminLogin.vue")
     },
     {
        path:'/Supervisorlogin',
        name:'SupervisorLogin',
        component:()=>import("../views/SupervisorLogin.vue")
     },
     {
        path:'/Consultantlogin',
        name:'ConsultantLogin',
        component:()=>import("../views/ConsultantLogin.vue")
     }, {
        path: '/chat/:appointmentId',
        name: 'Chat',
        component:()=>import("../components/Chat.vue")
    },{
        path: '/chatsc/:appointmentId',
        name: 'Chatsc',
        component:()=>import("../components/Chatsc.vue")
    },{
        path: '/chatsuper/:appointmentId',
        name: 'Chatsuper',
        component:()=>import("../components/Chatsuper.vue")
    },{
        path: '/chatobs/:appointmentId',
        name: 'chatobs',
        component:()=>import("../components/Chatobs.vue")
    },{
        path: '/chatnormal/:sessionId',
        name: 'chatnormal',
        component:()=>import("../components/Chatnormal.vue")
    },
    
];


const router = new VueRouter({
    mode: 'history', // 使用历史模式或哈希模式，根据你的需求选择
    base: process.env.BASE_URL, // 基本 URL
    routes
 })
 

 export default router

 