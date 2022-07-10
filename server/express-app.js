import express from 'express';
import http2Express from 'http2-express-bridge';
import {serveStaticPreload} from '../src/index.js';
// import {serveStaticPreload} from 'preload-middleware';

function createApp({http2} = {}) {
  let app = http2 ? http2Express(express) : express();
  app.use('/', express.static('./public', {
    etag: false,
    cacheControl: false,
    setHeaders: serveStaticPreload({
      manifestFile: './config/preload.json',
      watch: true,
      joinHeaderValues: false,
      prefersEarlyHints: true,
    }),
  }));
  return app;
}

export {createApp};
