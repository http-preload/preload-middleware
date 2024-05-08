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
  "manifestVersion": 1,
  "resources": {
    "/index.html": {
      "Link": [
        "<./assets/index.css>;rel=preload;as=style",
        "<./src/foobar.js>;rel=modulepreload",
        "</lib/foo.js>;rel=modulepreload",
        "</lib/bar.js>;rel=modulepreload",
        "<./src/qux.js>;rel=modulepreload;fetchpriority=low"
      ]
    },
    "/alternate.xhtml": {
      "Link": "<./src/foobar.js>;rel=modulepreload, </lib/foo.js>;rel=modulepreload, </lib/bar.js>;rel=modulepreload, <./src/qux.js>;rel=modulepreload;fetchpriority=low"
    }
  }
}
```

### For express

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
  }),
}));
```

### For koa

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
    manifestFile: './config/preload.json',
    watch: true,
  }),
}));
```

### For local-web-server

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
    manifestFile: './config/preload.json'
  },
};

```

### Middleware Options

+ `manifestFile`:string

  path to preload manifest file

+ `watch`:boolean default `false`

  whether to watch the manifest file and hot reload

+ `index`:string default `"index.html"` (only for local-web-server)

  should be same as serve-index, or koa-static

+ `prefersEarlyHints`:boolean default `false`

  if configured to be `true`, and user-agent supports 103 Early Hints, then links will be sent with status 103. 
  Note: Chrome doesn't yet support 103 Early Hints over HTTP/2, see https://issues.chromium.org/issues/40496584



## Examples

You can find a complete example application in [preload-middleware GitHub repo](https://github.com/http-preload/preload-middleware).



## License

[MIT](./LICENSE)
