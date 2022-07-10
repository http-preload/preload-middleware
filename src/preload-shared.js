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

export {
  PreloadManifest,
  getUserAgentData,
  getUserAgentDataByClientHints
};
