import Vue from 'vue'
import Layout from '../views/Layout.vue'
import VueRouter from 'vue-router'
import ConsultantDetail from "@/components/ConsultantDetail.vue"; 
import MySchedule from '../components/MySchedule.vue';


Vue.use(VueRouter)


const routes=[
    {
        path:"/",
        name:"Layout",
        component:Layout,
        children:[
            {
                path:'',
                name:'Home',
                component:()=>import("../views/main/Home.vue"),
                // meta:{
                //     isLogin:true
                // }
            },
        ]
    },
    {
        path: "/userHome",
        name: "Personal",
        component: () => import("../views/userHome.vue"), // 加载主组件
        children: [
          {
            path: 'schedule', // 我的咨询
            name: 'Schedule',
            component:MySchedule,
            //redirect:'/consultantHome/schedule',
            // meta: {
            //     isLogin: true
            // }
          },
        ],
      },

    {
        path:'/login',
        name:'Login',
        component:()=>import("../views/Login.vue")
     },
     {
        path:'/chat',
        name:'Chat',
        component:()=>import("../views/Chat.vue")
     },
     {
        path:'/consultant/:id',
        name:'consultantDetail',
        component: ConsultantDetail,
     },
    
];


const router = new VueRouter({
    mode: 'history', // 使用历史模式或哈希模式，根据你的需求选择
    base: process.env.BASE_URL, // 基本 URL
    routes
 })
 

 export default router

 