const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/inmfft', { target: 'http://10.204.16.52/inmfft/' }));
};