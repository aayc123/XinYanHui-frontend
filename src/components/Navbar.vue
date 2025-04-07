<template>
    <div class="navbar">
    <div class="logo">
        <img src="@/assets/icon.png" alt="Logo" class="icon" />
        <span class="title">心研汇</span>
    </div>
    </div>
  </template>
  
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
  