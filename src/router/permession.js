import router from "./index";
import store from "@/store"; // Ensure Vuex store is imported

router.beforeEach((to, from, next) => {
    if (to.meta.isLogin) {
        let loginState = localStorage.getItem('LoginState');
        
        if (loginState === 'true') {
            let token = localStorage.getItem('token');
            if (token) {
                // Check for user type (consultant or admin)
                let userType = localStorage.getItem('userType'); // We store the user type as a flag
                
                if (userType === 'consultant') {
                    let consultantId = localStorage.getItem('consultantId');
                    let consultantname = localStorage.getItem('consultantname');
                    store.commit('SET_USER_INFO', { userId: consultantId, username: consultantname, token, userType });

                } else if (userType === 'admin') {
                    let adminId = localStorage.getItem('adminId');
                    let adminname = localStorage.getItem('adminname');
                    store.commit('SET_USER_INFO', { userId: adminId, username: adminname, token, userType });
                }else if (userType === 'supervisor') {
                    let supervisorId = localStorage.getItem('supervisorId');
                    let supervisorname = localStorage.getItem('supervisorname');
                    store.commit('SET_USER_INFO', { userId: supervisorId, username: supervisorname, token, userType });
                }

                store.commit('SET_ACTIVE_MENU', to.path);
                next();
            } else {
                next({ name: 'Login' });
            }
        } else {
            next({ name: 'Login' });
        }
    } else {
        next();
    }
});