<template>
    <div>
      <HeaderNav />
       <router-view></router-view>
    </div>
  </template>
  
  <script>
  import HeaderNav from '../components/HeaderNav.vue'
  export default {
    components:{
      HeaderNav
    }
  }
  </script>
  
  <style>
  
  </style>