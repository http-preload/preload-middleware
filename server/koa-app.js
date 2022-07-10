import Koa from 'koa';
import koaStatic from 'koa-static';
import {serveStaticPreload} from '../src/index.js';
// import {serveStaticPreload} from 'preload-middleware';

function createApp() {
  let app = new Koa();
  app.use(koaStatic('./public', {
    maxage: 3,
    gzip: false,
    setHeaders: serveStaticPreload({
      manifestFile: './config/preload.json'
    }),
  }));
  return app.callback();
}

export {createApp};
