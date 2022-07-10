'use strict';

// This file is auto-generated by Rollup

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

/**
 * Get ponyfilled user agent data by header 'User-Agent'
 * @param {string} userAgent
 * @returns {Object} like Client Hints `navigator.userAgentData`
 */
function getUserAgentData(userAgent) {
  let mobile, platform = '', brands = [];
  let fullVersionList = [];
  let platformInfo = userAgent;
  let found = false;
  let versionInfo = userAgent.replace(/\(([^)]+)\)?/g, ($0, $1) => {
    if (!found) {
      platformInfo = $1;
      found = true;
    }
    return '';
  });
  // detect mobile
  mobile = userAgent.indexOf('Mobile') !== -1;
  let m;
  let m2;
  // detect platform
  if ((m = /Windows NT (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
    platform = 'Windows';
  } else if ((m = /Android (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
    platform = 'Android';
  } else if ((m = /(iPhone|iPod touch); CPU iPhone OS (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
    // see special notes at https://www.whatismybrowser.com/guides/the-latest-user-agent/safari
    platform = 'iOS';
  } else if ((m = /(iPad); CPU OS (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
    platform = 'iOS';
  } else if ((m = /Macintosh; (Intel|\w+) Mac OS X (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
    platform = 'macOS';
  } else if ((m = /Linux/.exec(platformInfo)) !== null) {
    platform = 'Linux';
  } else if ((m = /CrOS (\w+) (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
    platform = 'Chrome OS';
  } else {
    platform = 'Unknown';
  }
  // detect fullVersionList / brands
  fullVersionList.push({brand: '.Not;A)Brand', version: '99.0.0.0'});
  if ((m = /Chrome\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
    if ((m2 = /(Edge?)\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
      if (parseInt(m[2]) >= 79) {
        fullVersionList.push({brand: 'Chromium', version: m[2]});
      }
      fullVersionList.push({brand: 'Microsoft Edge', version: m2[2]});
    } else {
      fullVersionList.push({brand: 'Chromium', version: m[1]});
      fullVersionList.push({brand: 'Google Chrome', version: m[1]});
    }
  } else if ((m = /AppleWebKit\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
    if (platform === 'iOS') {
      if ((m2 = /(Version)\/(\d+(\.\d+)*)/.exec(versionInfo)) != null) {
        fullVersionList.push({brand: 'Safari', version: m2[2]});
        fullVersionList.push({brand: 'Apple Safari', version: m2[1]});
      }
      if ((m2 = /(CriOS|EdgiOS|FxiOS)\/(\d+(\.\d+)*)/.exec(versionInfo)) != null) {
        // TODO detect safari version
        let identBrandMap = {
          'CriOS': 'Google Chrome',
          'EdgiOS': 'Microsoft Edge',
          'FxiOS': 'Mozilla Firefox'
        };
        let brand = identBrandMap[m2[1]];
        fullVersionList.push({brand, version: m2[2]});
      }
    } else if ((m2 = /(Version)\/(\d+(\.\d+)*)/.exec(versionInfo)) != null) {
      fullVersionList.push({brand: 'Safari', version: m2[2]});
      fullVersionList.push({brand: 'Apple Safari', version: m2[1]});
    }
  } else if ((m = /Firefox\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
    fullVersionList.push({brand: 'Firefox', version: m[1]});
    fullVersionList.push({brand: 'Mozilla Firefox', version: m[1]});
  } else if ((m = /(MSIE |rv:)(\d+\.\d+)/.exec(platformInfo)) !== null) {
    fullVersionList.push({brand: 'Internet Explorer', version: m[2]});
  }
  brands = fullVersionList.map((b) => {
    let pos = b.version.indexOf('.');
    let version = pos === -1 ? b.version : b.version.slice(0, pos);
    return {brand: b.brand, version};
  });
  return {mobile, platform, brands};
}
/**
 * Get ponyfilled user agent data by header 'Sec-CH-UA', 'Sec-CH-UA-Mobile' and 'Sec-CH-UA-Platform'
 * @param {string} uaBrands
 * @param {string} uaMobile
 * @param {string} uaPlatform
 * @returns {Object}
 */
function getUserAgentDataByClientHints(uaBrands, uaMobile, uaPlatform) {
  let mobile = uaMobile === '?1';
  let platform = uaPlatform ? uaPlatform.slice(1, -1) : 'Unknown';
  let brands = [];
  (uaBrands || '').replace(/"([^"]+)";v="(\d+(\.\d+)*)"(, |$)/g, ($0, $1, $2) => {
    brands.push({brand: $1, version: $2});
    return '';
  });
  if (brands.length === 0) {
    brands.push({brand: '.Not;A)Brand', version: '99.0.0.0'});
  }
  return {mobile, platform, brands};
}

const SIMPLE_TOKEN = /[\w-]/;
function linkToHeaderValue(link) {
  let str = '<' + link.href + '>';
  for (let k in link) {
    if (k === 'href')
      continue;
    let v = link[k];
    str += ';' + k + '=' + (SIMPLE_TOKEN.test(v) ? v : '"' + v + '"');
  }
  return str;
}

function LinkHeader(links, conditionId, condition) {
  this.headerValue = links.map(linkToHeaderValue).join(', ');
  this.conditionId = conditionId;
  this.condition = condition;
}

let rFunc = /^function\s*(?:[a-zA-Z$_][\w$]*\s*)?\(([a-zA-Z$_][\w$]*(?:,?\s*[a-zA-Z$_][\w$]*)*)?\)\s*\{\s*(.*)\}$/;
let rArrowFunc = /^\(([a-zA-Z$_][\w$]*(?:,?\s*[a-zA-Z$_][\w$]*)*)?\)\s*=>\s*(.+)$/;
let rIdentifier = /[a-zA-Z$_][\w$]*/g;
function constructFunction(args) {
  switch (args.length) {
    case 0:
      return new Function();
    case 1:
      return new Function(args[0]);
    case 2:
      return new Function(args[0], args[1]);
    case 3:
      return new Function(args[0], args[1], args[2]);
    case 4:
      return new Function(args[0], args[1], args[2], args[3]);
    default:
      throw new Error('Too many arguments for Function');
  }
}
class PreloadManifest {
  constructor(data) {
    let manifestVersion = data.manifestVersion;
    let resources = data.resources;
    let conditions = data.conditions;
    // let {manifestVersion, resources, conditions} = data;
    if (manifestVersion !== 1) {
      throw new Error('manifestVersion' + manifestVersion);
      // throw new Error('Cannot handle manifestVersion ' + manifestVersion);
    }
    if (!resources || typeof resources !== 'object') {
      throw new Error('Cannot handle resources');
    }
    let functions = {}; // Object.create(null) is safer but may be slower
    if (conditions) {
      Object.keys(conditions).forEach((name) => {
        let value = conditions[name];
        // let expr = eval('(' + value + ')');
        let expr;
        if (value.startsWith('(')) {
          let arr = rArrowFunc.exec(value);
          if (arr !== null) {
            let args = arr[1].match(rIdentifier) || [];
            args.push('return ' + arr[2]);
            expr = constructFunction(args);
          }
        } else if (value.startsWith('function')) {
          let arr = rFunc.exec(value);
          if (arr !== null) {
            let args = arr[1].match(rIdentifier) || [];
            args.push(arr[2]);
            expr = constructFunction(args);
          }
        }
        if (typeof expr === 'function') {
          functions[name] = expr;
        } else {
          throw new Error(`Value of conditions[${JSON.stringify(name)}] must be a function expression`);
        }
      });
    }
    this.functions = functions;
    let map = new Map();
    let ensureGroup = (key) => {
      let group = map.get(key);
      if (!group) {
        group = [];
        map.set(key, group);
      }
      return group;
    };
    Object.keys(resources).forEach((key) => {
      let links = resources[key];
      let entry = key.match(/\S+/g);
      if (!entry) {
        // NOOP
      } else if (entry.length === 1) {
        let resPath = key;
        let conditionId = null;
        let condition = null;
        ensureGroup(resPath).push(new LinkHeader(links, conditionId, condition));
      } else if (entry.length === 2) {
        let resPath = entry[0];
        let conditionId = entry[1];
        let condition = functions[conditionId];
        if (!condition) {
          throw new ReferenceError(`Preload condition "${conditionId}" is not defined`);
        }
        ensureGroup(resPath).push(new LinkHeader(links, conditionId, condition));
      } else {
        throw new SyntaxError('Invalid resources key: ' + key);
      }
    });
    this.map = map;
  }
  lookup(reqPath) {
    return this.map.get(reqPath);
  }
  supportsEarlyHints(userAgentData, headers) {
    return userAgentData.brands.some((e) => (e.brand === 'Chromium' && parseInt(e.version) >= 103));
  }
}

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
  let manifest = new PreloadManifest(JSON.parse(fs__default["default"].readFileSync(manifestFile, {encoding: 'utf-8'})));
  if (watch) {
    fs__default["default"].watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
      if (!fs__default["default"].existsSync(manifestFile)) {
        return;
      }
      let d = new Date(curr.mtime.valueOf());
      d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
      console.info('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
      manifest = new PreloadManifest(JSON.parse(fs__default["default"].readFileSync(manifestFile, {encoding: 'utf-8'})));
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
    let manifest = new PreloadManifest(JSON.parse(fs__default["default"].readFileSync(manifestFile, {encoding: 'utf-8'})));
    if (watch) {
      fs__default["default"].watchFile(manifestFile, {interval: 2000}, (curr, prev) => {
        if (!curr) {
          return;
        }
        let d = new Date(curr.mtime.valueOf());
        d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
        console.info('[' + d.toISOString().slice(0, 19) + '] Reloading file ' + manifestFile);
        manifest = new PreloadManifest(JSON.parse(fs__default["default"].readFileSync(manifestFile, {encoding: 'utf-8'})));
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

exports["default"] = Preload;
exports.serveStaticPreload = serveStaticPreload;
