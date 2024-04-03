const createProxyMiddleware = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/inmfft/", {
      target: "http://10.204.16.52/inmfft/",
      ws: true,
    })
  );
};