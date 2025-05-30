import Vue from 'vue';
import VueRouter from 'vue-router';
import Layout from '../views/Layout.vue';
import ConsultantDetail from '@/components/ConsultantDetail.vue';
import MySchedule from '../components/MySchedule.vue';
import Chat from '../components/Chat.vue';
import settings from '../components/settings.vue';
//import { set } from 'core-js/core/dict';
Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/login', // 默认重定向到登录页面
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
    },
    {
        path: '/home', // 原来的根路径改为 /home
        name: 'Layout',
        component: Layout,
        children: [
            {
                path: '', // 默认子路由
                name: 'Home',
                component: () => import('../views/main/Home.vue'),
                // meta: {
                //     isLogin: true
                // }
            },
        ],
    },
    {
        path: '/userHome',
        name: 'Personal',
        component: () => import('../views/userHome.vue'), // 加载主组件
        children: [
            {
                path: 'schedule', // 我的咨询
                name: 'Schedule',
                component: MySchedule,
                // meta: {
                //     isLogin: true
                // }
            },
            {
                path: 'settings', // 我的咨询
                name: 'settings',
                component: settings,
                // meta: {
                //     isLogin: true
                // }
            },
        ],
    },
    {
        path: '/chat/:appointmentId',
        name: 'Chat',
        component:Chat,
    },
    {
        path: '/consultant/:id',
        name: 'consultantDetail',
        component: ConsultantDetail,
    },
];

const router = new VueRouter({
    mode: 'history', // 使用历史模式或哈希模式，根据你的需求选择
    base: process.env.BASE_URL, // 基本 URL
    routes,
});

export default router;