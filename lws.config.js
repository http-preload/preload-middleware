export default {
  port: 8443,
  directory: './public',
  // https: true,
  http2: true,
  key: './config/ssl/localhost.key',
  cert: './config/ssl/localhost.crt',
  stack: [
    'lws-request-monitor',
    'lws-compress',
    'lws-mime',
    'lws-range',
    './src/index.js', // preload-middleware
    'lws-static',
    'lws-index',
  ],
  // options for preload-middleware
  preload: {
    manifestFile: './config/preload.json',
    watch: true,
  },
};
