<template>
    <div class="navbar">
    <div class="logo">
        <img src="@/assets/icon.png" alt="Logo" class="icon" />
        <span class="title">心研汇</span>
    </div>
    <button @click="gotoHome" class="return">回到首页</button>
    </div>
  </template>
 <script>
 export default {
     data(){
         return{
             activeMenu: "/",
             User:localStorage.getItem('username')
         }
     },
     methods: {
         gotoHome() {
             this.$router.push('/home'); // 跳转到首页
         }
     },
 }
 </script>
  <style scoped>
  .navbar {
    width: 100%;
    height: 80px;
    background-color: #FFE4B5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* 添加阴影 */
    position: fixed; /* 让导航栏固定在顶部 */
    top: 0;
    left: 0;
    z-index: 1000; /* 确保导航栏位于最上层 */
  }
  .logo {
    display: flex;
    align-items: center;
  }
  .return{
    background-color: #8B4513; /* 设置按钮背景色 */
    color: white; /* 设置按钮文字颜色 */
    border: none; /* 去掉边框 */
    padding: 10px 10px; /* 设置内边距 */
    border-radius: 5px; /* 设置圆角 */
    cursor: pointer; /* 鼠标悬停时显示手型光标 */
    font-size: 13px; /* 设置字体大小 */
    margin-right: 50px;
  }
  .icon {
    width: 40px; /* 设置图标宽度 */
    height: 40px; /* 设置图标高度 */
    margin-right: 10px; /* 图标与文字之间的间距 */
  }

  .title {
    font-size: 24px;
    font-weight: bold;
    color:#8B4513;
  }
 
  </style>
  