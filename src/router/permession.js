// router/index.js
import router from "./index";
import store from "@/store";

router.beforeEach((to, from, next) => {
  if (to.meta.isLogin) {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (userId && username) {
      // 同步到 Vuex
      store.dispatch('setUserInfo', { userId, username,token });
      next();
    } else {
      next({
        name: 'Login',
      });
    }
  } else {
    next();
  }
});