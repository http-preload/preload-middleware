import fs from 'fs';
import {PreloadManifest, getUserAgentData, getUserAgentDataByClientHints} from './preload-shared.js';

/**
 * @param {http.IncomingMessage|http2.Http2ServerRequest} req
 * @returns {string}
 */
function getRequestHeaders(req) {
  let brief = false;
  let msg;
  let headers = req.headers;
  let rawHeaders = req.rawHeaders;
  let httpVersion = req.httpVersion;
  if (httpVersion < 2) {
    let method = req.method;
    let path = req.url;
    let scheme = (req.socket.alpnProtocol ? 'https' : 'http');
    let authority = headers['host'];
    if (brief) {
      msg = method + ' ' + scheme + '://' + authority + path + ' HTTP/' + httpVersion;
    } else {
      msg = method + ' ' + path + ' ' + ' HTTP/' + req.httpVersion + '\n';
      for (let i = 0; i < rawHeaders.length; i += 2) {
        msg += rawHeaders[i] + ': ' + rawHeaders[i + 1] + '\n';
      }
    }
  } else {
    let method = req.method || headers[':method'];
    let path = req.url || headers[':path'];
    let scheme = req.scheme || headers[':scheme'];
    let authority = req.authority || headers[':authority'];
    if (brief) {
      msg = method + ' ' + scheme + '://' + authority +  path + ' HTTP/' + httpVersion;
    } else {
      msg = ':method: ' + method + '\n';
      msg += ':path: ' + path + '\n';
      msg += ':scheme: ' + scheme + '\n';
      msg += ':authority: ' + authority + '\n';
      let rawHeaders = req.rawHeaders;
      for (let i = 0, name; i < rawHeaders.length; i += 2) {
        name = rawHeaders[i];
        if (name.charAt(0) === ':') {
          continue;
        }
        msg +=  name + ': ' + rawHeaders[i + 1] + '\n';
      }
    }
  }
  return msg;
}
/**
 * @class ConditionArgsSupplier
 * @constructor
 * @param {http.IncomingMessage|http2.Http2ServerRequest} req
 */
function ConditionArgsSupplier(req) {
  let value;
  /**
   * @method get
   * @returns {Object}
   */
  this.get = () => {
    if (value === undefined) {
      let headers = req.headers;
      let userAgentData;
      let uaBrands = headers['sec-ch-ua'];
      let userAgent;
      if (uaBrands !== undefined) {
        userAgentData = getUserAgentDataByClientHints(uaBrands, headers['sec-ch-ua-mobile'], headers['sec-ch-ua-platform']);
      } else {
        userAgent = headers['user-agent'];
        userAgentData = getUserAgentData(userAgent);
      }
      // let psuedoHeaders;
      // if (req.httpVersion < 2) {
      //   psuedoHeaders = {
      //     ':method': req.method,
      //     ':path': req.url,
      //     ':scheme': (req.socket.alpnProtocol ? 'https' : 'http'),
      //     ':authority': headers['host'],
      //     ':protocol': 'http/' + req.httpVersion
      //   };
      // } else {
      //   psuedoHeaders = {
      //     ':method': req.method || headers[':method'],
      //     ':path': req.url || headers[':path'],
      //     ':scheme': req.scheme || headers[':scheme'],
      //     ':authority': req.authority || headers[':authority'],
      //     ':protocol': req.socket.alpnProtocol || (req.httpVersion === '2.0' ? 'h2' : 'h3')
      //   };
      // }
      value = [userAgentData, headers];
    }
    return value;
  };
}
/**
 *
 * @param {http.HttpServerResponse|http2.Http2ServerResponse} res
 * @param {string} name header name
 * @param {string|Array<string>} values
 * @returns {boolean} sent or not
 */
function sendEarlyHints(res, name, value) {
  let req = res.req;
  if (req.httpVersion < 2) {
    if (!res.headersSent && !res.socket._writableState.closed) {
      let msg = 'HTTP/' + req.httpVersion + ' 103 Early Hints\r\n';
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
          msg += name + ': ' + value[i] + '\n\n';
        }
      } else {
        msg += name + ': ' + value;
      }
      msg += '\n\n';
      res._writeRaw(msg, 'ascii');
      return true;
    }
  } else {
    let stream = res.stream;
    if (!stream) {
      return false;
    }
    if (!stream.headersSent && !stream.state.closed) {
      stream.additionalHeaders({':status': 103, [name.toLowerCase()]: value});
      return true;
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
  let {manifestFile, watch, index: indexFile, prefersEarlyHints, setHeaders} = Object.assign({
    manifestFile: undefined,
    watch: false,
    index: 'index.html',
    prefersEarlyHints: false,
    setHeaders: undefined,
  }, options);
  if (!manifestFile) {
    throw new Error('expressStaticPreload options.manifestFile must be specified');
  }
  let manifest = new PreloadManifest(JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'})));
  if (watch) {
    fs.watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
      if (!fs.existsSync(manifestFile)) {
        return;
      }
      let d = new Date(curr.mtime.valueOf());
      d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
      console.log('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
      manifest = new PreloadManifest(JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'})));
    });
  }
  return (res, filePath, stat) => {
    let req = res.req;
    if ((req.headers['accept'] || '').startsWith('text/html') && req.method === 'GET') {
      let reqPath = req._parsedUrl.pathname;
      if (reqPath.endsWith('/')) {
        reqPath += indexFile;
      }
      let candicates =  manifest.lookup(reqPath);
      if (candicates && candicates.length > 0) {
        let argsSupplier = new ConditionArgsSupplier(req);
        let headerValue = [];
        candicates.forEach((candidate) => {
          if (!candidate.condition || candidate.condition.apply(undefined, argsSupplier.get())) {
            headerValue.push(candidate.headerValue);
          }
        });
        sendHeader: if (headerValue.length > 0) {
          if (prefersEarlyHints && manifest.supportsEarlyHints.apply(undefined, argsSupplier.get())) {
            if (!sendEarlyHints(res, 'Link', headerValue.join(', '))) {
              break sendHeader;
            }
          }
          res.setHeader('Link', headerValue.join(', '));
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
    let manifest = new PreloadManifest(JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'})));
    if (watch) {
      fs.watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
        if (!curr) {
          return;
        }
        let d = new Date(curr.mtime.valueOf());
        d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
        console.log('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
        manifest = new PreloadManifest(JSON.parse(fs.readFileSync(manifestFile, {encoding: 'utf-8'})));
      });
    }
    return async ({request: req, response: res}, next) => {
      if ((req.headers['accept'] || '').startsWith('text/html') && req.method === 'GET') {
        let reqPath = req.path || req._parsedUrl.pathname;
        if (reqPath.endsWith('/')) {
          reqPath += indexFile;
        }
        let candicates =  manifest.lookup(reqPath);
        if (candicates) {
          let argsSupplier = new ConditionArgsSupplier(req);
          let headerValue = [];
          candicates.forEach((candidate) => {
            if (!candidate.condition || candidate.condition.apply(undefined, argsSupplier.get())) {
              headerValue.push(candidate.headerValue);
            }
          });
          sendHeader: if (headerValue.length > 0) {
            if (prefersEarlyHints && manifest.supportsEarlyHints.apply(undefined, argsSupplier.get())) {
              if (!sendEarlyHints(res, 'Link', headerValue.join(', '))) {
                break sendHeader;
              }
            }
            res.setHeader('Link', headerValue.join(', '));
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
