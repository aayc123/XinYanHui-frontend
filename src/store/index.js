// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userId: null, // 用户 ID
    username: null, // 用户名
  },
  
  mutations: {
    SET_USER_INFO(state, payload) {
      state.userId = payload.userId;
      state.username = payload.username;
    },
    CLEAR_USER_INFO(state) {
      state.userId = null;
      state.username = null;
    },
  },
  actions: {
    setUserInfo({ commit }, userInfo) {
      commit('SET_USER_INFO', userInfo);
    },
    clearUserInfo({ commit }) {
      commit('CLEAR_USER_INFO');
    },
  },
  
});