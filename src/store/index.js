// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import websocket from './websocket'
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userId: null,       // User ID (could be consultantId or adminId)
    username: null,     // User name (could be consultantname or adminname)
    token: null,        // User token
    userType: null,     // User type (consultant, admin, etc.)
    activeMenu: null,   // Active menu path
  },

  mutations: {
    SET_USER_INFO(state, payload) {
      state.userId = payload.userId;
      state.username = payload.username;
      state.token = payload.token;
      state.userType = payload.userType; // Store the user type
    },
    CLEAR_USER_INFO(state) {
      state.userId = null;
      state.username = null;
      state.token = null;
      state.userType = null; // Clear user type
    },
    SET_ACTIVE_MENU(state, path) {
      state.activeMenu = path;
    },
  },

  actions: {
    setUserInfo({ commit }, userInfo) {
      commit('SET_USER_INFO', userInfo);
    },
    clearUserInfo({ commit }) {
      commit('CLEAR_USER_INFO');
    },
    setActiveMenu({ commit }, path) {
      commit('SET_ACTIVE_MENU', path);
    },
  },

  getters: {
    getUserInfo(state) {
      return {
        userId: state.userId,
        username: state.username,
        token: state.token,
        userType: state.userType,
      };
    },
    getActiveMenu(state) {
      return state.activeMenu;
    },
  },
  modules: {
    websocket // 将 websocket 模块添加到 modules 中
  }
});
