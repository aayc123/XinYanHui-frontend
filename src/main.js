import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import './plugins/element.js'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);
import router from './router/index.js'
import "./assets/css/common.css"
import "./router/permession.js"
import store from './store'

// 使用 Vue CLI 代理，避免手动设置后端 URL
axios.defaults.baseURL = '/api'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true; // 如果后端允许跨域携带 Cookie

Vue.prototype.$axios = axios;

Vue.config.productionTip = false

new Vue({
 router,
 store,
 render: h => h(App),
}).$mount('#app')