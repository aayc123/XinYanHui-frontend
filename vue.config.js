module.exports = {
  devServer: {
    host: '0.0.0.0', //可以忽略不写
    port: 8081,//它是用来修改你打开后的端口号的
    open: true,//值为 true的话，项目启动时自动打开到浏览器里边， false不会打开
    proxy: {
      '/api': {
        target: ' http://localhost:8080',//换成你自己项目的开发或者生产地址
        ws: false, //也可以忽略不写，不写不会影响跨域
        changeOrigin: true, //是否开启跨域，值为 true 就是开启， false 不开启
        pathRewrite: {
          '^/api': ''//注册全局路径， 但是在你请求的时候前面需要加上 /api  
        }
      }
    }
  }
}
    // configureWebpack: {},
    // devServer: { // 环境配置
    //   host: 'localhost',
    //   public: '192.168.199.38:5006', // 此处是自己电脑IP地址！
    //   port: '5006',
    //   https: false,
    //   disableHostCheck: true,
    //   open: false, // 配置自动启动浏览器
    //   proxy: {
    //         "/proxy_url":{           // /proxy_url 这个用来和根路径 baseURL 进行匹配
    //           target: 'http://127.0.0.1:5006',  // 这个是填写跨域的请求域名+端口号，也就是要请求的URL(不包含URL路径)
    //           changeOrigin: true,  // 是否允许跨域请求，在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
    //           pathRewrite: {   // 路径重写
    //               '^/proxy_url': '/' // 替换target中的请求地址，原请求为 http://127.0.0.1:8000/kuayu 实际请求为 http://127.0.0.1:8000/proxy_url/kuayu  
    //           }
    //         }
      // proxy: {
      //   '/myfilm': {
      //     target: 'https://localhost:5006',
      //     changeOrigin: true,
      //     secure: false // 可能需要设置为false以忽略SSL证书验证
      //   }
      //}
    //}
    // devServer: {
    //   
    //   }
    // }
  
//}


