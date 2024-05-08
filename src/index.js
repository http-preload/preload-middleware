import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {http.HttpServerResponse|http2.Http2ServerResponse} res
 * @param {Object} headers
 * @returns {boolean} sent or not
 */
function sendEarlyHints(res, headers) {
  let req = res.req;
  if (req.httpVersion < 2) {
    if (!res.headersSent && !res.socket._writableState.closed) {
      let msg = 'HTTP/' + req.httpVersion + ' 103 Early Hints\r\n';
      for (let name in headers) {
        let value = headers[name];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; ++i) {
            msg += name + ': ' + value[i] + '\r\n';
          }
        } else if (value) {
          msg += name + ': ' + value + '\r\n';
        }
      }
      msg += '\r\n';
      res._writeRaw(msg, 'ascii');
      return true;
    }
  } else {
    let stream = res.stream;
    if (!stream)
      return false;
    if (!stream.headersSent && !stream.state.closed) {
      console.log('send http2 early hints');
      stream.additionalHeaders({':status': 103, ...headers});
      return true;
    }
  }
  return false;
}
function supportsEarlyHints(req) {
  let ua;
  let m;
  if ((ua = req.headers['sec-ch-ua'])) {
    let mobile = req.headers['sec-ch-ua-mobile'] === '?1';
    if ((m = ua.match(/"Chromium";v="(\d+\.)",/)) !== null) {
      let ver = +m[1];
      return mobile ? (ver >= 124) : (ver >= 103);
    }
  }
  if ((ua = req.headers['user-agent'])) {
    let mobile = ua.includes('Mobile');
    if ((m = ua.match(/(Chrome|Firefox)\/(\d+)/))) {
      switch (m[1]) {
        case 'Chrome': return +m[2] >= 103;
        case 'Firefox': return +m[2] >= 123 && !mobile;
      }
    } else if ((m = ua.match(/(Version)\/(\d+\.\d+) (?:Safari|Mobile)/)) || (m = ua.match(/(AppleWebKit)\/(\d+\.\d+)/))) {
      switch (m[1]) {
        case 'Version': return +m[2] >= 17 && !mobile;
        case 'AppleWebKit': return +m[2] >= 616 && !mobile;
      }
    }
  }
  return false;
}

/**
 * serve-static preload middleware
 * @param {Object} options
 * @returns {Function}
 * @example serveStatic('.', {setHeaders: serveStaticPreload({manifestFile:'config/preload.json'}))
 * @example express.static('.', {setHeaders: serveStaticPreload({manifestFile:'config/preload.json'}))
 * @example koaStatic('.', {setHeaders: serveStaticPreload({manifestFile:'config/preload.json'}))
 */
function serveStaticPreload(options) {
  let {manifestFile, watch, prefersEarlyHints, setHeaders} = Object.assign({
    manifestFile: undefined,
    watch: false,
    prefersEarlyHints: false,
    setHeaders: undefined,
  }, options);
  if (!manifestFile) {
    throw new Error('expressStaticPreload options.manifestFile must be specified');
  }
  let manifest = JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'}));
  if (watch) {
    fs.watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
      if (!curr)
        return;
      let d = new Date(curr.mtime.valueOf());
      d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
      console.info('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
      manifest = JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'}));
    });
  }
  return (res, filePath, stat) => {
    let req = res.req;
    if ((req.headers['accept'] || '').startsWith('text/html') && req.method === 'GET') {
      let reqPath = req._parsedUrl.pathname;
      if (reqPath.endsWith('/')) {
        reqPath += path.basename(filePath);
      }
      let headers =  manifest.resources[reqPath];
      sendHeader: if (headers) {
        if (prefersEarlyHints && supportsEarlyHints(req)) {
          console.log('sending EarlyHints');
          if (sendEarlyHints(res, headers)) {
            console.log('sent EarlyHints');
            break sendHeader;
          }
        }
        console.log('Failed to sendEarlyHints');
        for (let name in headers) {
          res.setHeader(name, '' + headers[name]);
        }
      }
    }
    if (setHeaders) {
      setHeaders(res, filePath, stat);
    }
  };
}
/**
 * local-web-server preload middleware
 */
class Preload {
  /**
   * @param {Object} config - config defined in lws.config.js
   * @example {preload:{manifestFile:'./config/preload.json',watch:true}}
   * @returns
   */
  middleware(config) {
    let {manifestFile, watch, index: indexFile, prefersEarlyHints} = Object.assign({
      manifestFile: undefined,
      watch: false,
      index: 'index.html',
      prefersEarlyHints: false,
    }, config.preload);
    if (!manifestFile) {
      throw new Error('lws config preload.manifestFile must be specified');
    }
    let manifest = JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'}));
    if (watch) {
      fs.watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
        if (!curr) {
          return;
        }
        let d = new Date(curr.mtime.valueOf());
        d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
        console.info('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
        manifest = JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'}));
      });
    }
    return async ({request: req, response: res}, next) => {
      if ((req.headers['accept'] || '').startsWith('text/html') && req.method === 'GET') {
        let reqPath = req.path || req._parsedUrl.pathname;
        if (reqPath.endsWith('/')) {
          reqPath += indexFile;
        }
        let headers =  manifest.resources[reqPath];
        sendHeader: if (headers) {
          if (prefersEarlyHints && supportsEarlyHints(req)) {
            if (sendEarlyHints(res, headers)) {
              break sendHeader;
            }
          }
          for (let name in headers) {
            res.setHeader(name, headers[name]);
          }
        }
      }
      await next();
    };
  }
}

export {
  serveStaticPreload,
  Preload as default,
};
