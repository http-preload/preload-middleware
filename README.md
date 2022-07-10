# preload-middleware

HTTP Preload / Resource Hints / Early Hints support for Node.js server frameworks like [express](https://npmjs.com/package/express), [koa](https://www.npmjs.com/package/koa) and [local-web-server](https://www.npmjs.com/package/local-web-server).

## Install

```sh
npm install --save-dev preload-middleware
```

## Usage

Prepare a preload manifest file, e.g.

```json
{
  "$schema": "https://github.com/fuweichin/http-preload/manifest/preload-v1.schema.json",
  "manifestVersion": 1,
  "conditions": {
    "supportsModulepreload": "(userAgentData, headers) => userAgentData.brands.some((e)=>e.brand==='Chromium'&&parseInt(e.version)>=66)"
  },
  "resources": {
    "/index.html": [
      {"rel": "preload", "href": "/assets/index.css", "as": "style"}
    ],
    "/index.html supportsModulepreload": [
      {"rel": "modulepreload", "href": "/src/foobar.js"},
      {"rel": "modulepreload", "href": "/lib/foo.js"},
      {"rel": "modulepreload", "href": "/lib/bar.js"},
      {"rel": "modulepreload", "href": "/src/qux.js"}
    ]
  }
}
```

### Express Usage

```sh
npm install --save-dev express
```

```js
import express from 'express';
import {serveStaticPreload} from 'preload-middleware';

let app = express();
app.use('/', express.static('./public', {
  setHeaders: serveStaticPreload({
    manifestFile: './config/preload.json',
    watch: true,
    joinHeaderValues: false,
    prefersEarlyHints: true,
  }),
}));
```

### Koa Usage

```sh
npm install --save-dev koa koa-static
```

```js
import Koa from 'koa';
import koaStatic from 'koa-static';
import {serveStaticPreload} from 'preload-middleware';

let app = new Koa();
app.use(koaStatic('./public', {
  setHeaders: serveStaticPreload({
    manifestFile: './config/preload.json'
  }),
}));
```

### Local Web Server Usage

Edit lws.config.js

```js
export default {
  port: 443,
  directory: './public',
  stack: [
    'lws-request-monitor',
    'lws-compress',
    'lws-mime',
    'lws-range',
    'preload-middleware', // put preload-middleware before lws-static
    'lws-static',
    'lws-index',
  ],
  // options for preload-middleware
  preload: {
    manifestFile: './config/preload.json',
    watch: true,
    prefersEarlyHints: true,
  },
};

```



## Examples

You can find a complete example application in preload-middleware [source repo](https://github.com/fuweichin/http-preload/preload-middleware)

## License

[Apache License 2.0](./LICENSE)