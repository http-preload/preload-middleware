import fs from 'fs';
import http from 'http';
import https from 'https';
import http2 from 'http2';
import {fileURLToPath} from 'url';

import {createApp} from './server/express-app.js';
// import {createApp} from './server/koa-app.js';

function createServer() {
  let server = http.createServer({
  }, createApp({http2: false}));
  server.listen(8080, () => {
    console.log('server started. http://127.0.0.1:8080');
  });
  // let secureServer = https.createServer({
  //   key: fs.readFileSync('./server/ssl/localhost.key'),
  //   cert: fs.readFileSync('./server/ssl/localhost.crt'),
  // }, createApp({http2: false}));
  let secureServer = http2.createSecureServer({
    allowHTTP1: true,
    key: fs.readFileSync('./config/ssl/localhost.key'),
    cert: fs.readFileSync('./config/ssl/localhost.crt'),
  }, createApp({http2: true}));
  secureServer.listen(8443, () => {
    console.log('server started. https://127.0.0.1:8443');
  });
  return secureServer;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer();
}

export {createServer};
