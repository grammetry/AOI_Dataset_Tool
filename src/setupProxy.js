const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

   
    app.use('/api', createProxyMiddleware({
        target: "http://10.204.16.110",
        changeOrigin: true,
        ws: false,
        on: {
            // proxyReq: (proxyReq, req, res) => {
            //   /* handle proxyReq */
            //   console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
            //   console.log(proxyReq);
            // },
            // proxyRes: (proxyRes, req, res) => {
            //   /* handle proxyRes */
            //   console.log('-->  proxyRes');
            // },
            // error: (err, req, res) => {
            //   /* handle error */
            //   console.log(err)
            // },
          },
       
        logLevel: 'debug',
        changeOrigin: true,
    }));

   


    

    app.use('/ws', createProxyMiddleware({
        target: "http://10.204.16.110",
        changeOrigin: true,
        ws: true,
        secure: false,
        PathRewrite : {
          '^/ws' : '' // 将/api/v1 变为 ''
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
              /* handle proxyReq */
              console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
              console.log(proxyReq);
            },
            proxyRes: (proxyRes, req, res) => {
              /* handle proxyRes */
              console.log('-->  proxyRes');
            },
            error: (err, req, res) => {
              /* handle error */
              console.log(err)
            },
          },
          logLevel: 'debug',
    }));  

};

