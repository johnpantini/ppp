const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

function isError(value) {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function parse(str) {
  if (typeof str !== 'string' || str.length === 0 || str.length > 100) {
    throw new Error(
      'Value provided to ms.parse() must be a string with length between 1 and 99.'
    );
  }

  const match =
    /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
  const groups = match === null || match === void 0 ? void 0 : match.groups;

  if (!groups) {
    return NaN;
  }

  const n = parseFloat(groups.value);
  const type = (groups.type || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      // This should never occur.
      throw new Error(
        `The unit ${type} was matched, but no matching case exists.`
      );
  }
}

function fmtShort(ms) {
  const msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return `${Math.round(ms / d)}d`;
  }

  if (msAbs >= h) {
    return `${Math.round(ms / h)}h`;
  }

  if (msAbs >= m) {
    return `${Math.round(ms / m)}m`;
  }

  if (msAbs >= s) {
    return `${Math.round(ms / s)}s`;
  }

  return `${ms}ms`;
}

function fmtLong(ms) {
  const msAbs = Math.abs(ms);

  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }

  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }

  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }

  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }

  return `${ms} ms`;
}

function format(ms, options) {
  if (typeof ms !== 'number' || !isFinite(ms)) {
    throw new TypeError(
      'Value provided to ms.format() must be of type number.'
    );
  }

  return (options === null || options === void 0 ? void 0 : options.long)
    ? fmtLong(ms)
    : fmtShort(ms);
}

function humanize(value, options) {
  try {
    if (typeof value === 'string') {
      return parse(value);
    } else if (typeof value === 'number') {
      return format(value, options);
    }

    throw new TypeError('Value provided to ms() must be a string or number.');
  } catch (error) {
    const message = isError(error)
      ? `${error.message}. value=${JSON.stringify(value)}`
      : 'An unknown error has occurred.';

    throw new Error(message);
  }
}

const formatters = {
  j: function (v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return '[UnexpectedJSONParseError]: ' + error.message;
    }
  }
};

function $setup(env = {}) {
  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   */
  function createDebug(namespace) {
    let prevTime;
    let enableOverride = null;
    let namespacesCache;
    let enabledCache;

    function debug(...args) {
      if (!debug.enabled) {
        return;
      }

      const self = debug;
      const curr = Number(new Date());
      const ms = curr - (prevTime || curr);

      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        args.unshift('%O');
      }

      let index = 0;

      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index.
        if (match === '%%') {
          return '%';
        }

        index++;

        const formatter = formatters[format];

        if (typeof formatter === 'function') {
          const val = args[index];

          match = formatter.call(self, val);

          // Now we need to remove `args[index]` since it's inlined in the `format`.
          args.splice(index, 1);
          index--;
        }

        return match;
      });

      // Apply env-specific formatting (colors, etc.).
      createDebug.formatArgs.call(self, args);

      const logFn = self.log ?? createDebug.log;

      return logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.useColors = createDebug.useColors();
    debug.color = createDebug.selectColor(namespace);
    debug.extend = extend;

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride;
        }

        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces;
          enabledCache = createDebug.enabled(namespace);
        }

        return enabledCache;
      },
      set: (v) => {
        enableOverride = v;
      }
    });

    // Env-specific initialization logic for debug instances.
    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    return debug;
  }

  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = humanize;

  Object.keys(env).forEach((key) => {
    createDebug[key] = env[key];
  });

  // The currently active debug mode names, and names to skip.
  createDebug.names = [];
  createDebug.skips = [];

  /**
   * Selects a color for a debug namespace
   * @param {String} namespace The namespace string for the debug instance to be colored
   * @return {Number|String} An ANSI color code for the given namespace
   */
  function selectColor(namespace) {
    let hash = 0;

    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      // Convert to 32-bit integer.
      hash |= 0;
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;

  function extend(namespace, delimiter) {
    const newDebug = createDebug(
      this.namespace +
        (typeof delimiter === 'undefined' ? ':' : delimiter) +
        namespace
    );

    newDebug.log = this.log;

    return newDebug;
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   */
  function enable(namespaces) {
    createDebug.namespaces = namespaces;
    createDebug.names = [];
    createDebug.skips = [];

    let i;
    const split = (typeof namespaces === 'string' ? namespaces : '').split(
      /[\s,]+/
    );
    const len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }
  }

  /**
   * Disable debug output.
   *
   * @return {String} namespaces
   */
  function disable() {
    const namespaces = [
      ...createDebug.names.map(toNamespace),
      ...createDebug.skips.map(toNamespace).map((namespace) => '-' + namespace)
    ].join(',');

    createDebug.enable('');

    return namespaces;
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   */
  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    let i;
    let len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert regexp to namespace
   *
   * @param {RegExp} regxep
   * @return {String} namespace
   */
  function toNamespace(regexp) {
    return regexp
      .toString()
      .substring(2, regexp.toString().length - 2)
      .replace(/\.\*\?$/, '*');
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   */
  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());

  return createDebug;
}

function $browser(e) {
  e.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
  ];
  e.formatArgs = formatArgs;
  e.useColors = () => {
    return globalThis.ppp.settings.get('useDebugColors') ?? true;
  };
  e.log = console.debug ?? console.log ?? (() => {});
  e.load = () => {
    let r = ppp.settings.get('debugEnvVar');

    if (!r && typeof process !== 'undefined' && 'env' in process) {
      r = process.env.DEBUG;
    }

    return r;
  };

  function formatArgs(args) {
    args[0] =
      (this.useColors ? '%c' : '') +
      this.namespace +
      (this.useColors ? ' %c' : ' ') +
      args[0] +
      (this.useColors ? '%c ' : ' ') +
      '+' +
      humanize(this.diff);

    if (!this.useColors) {
      return;
    }

    const c = 'color: ' + this.color;

    args.splice(1, 0, c, 'color: inherit');

    let index = 0;
    let lastC = 0;

    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === '%%') {
        return;
      }

      index++;

      if (match === '%c') {
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
  }

  return e;
}

function $node(e) {
  const util = require('util');

  e.colors = [6, 2, 3, 4, 5, 1];
  e.log = log;
  e.useColors = () => true;
  e.load = () => {
    return process.env.DEBUG;
  };
  e.inspectOpts = Object.keys(process.env)
    .filter((key) => {
      return /^debug_/i.test(key);
    })
    .reduce((obj, key) => {
      const prop = key
        .substring(6)
        .toLowerCase()
        .replace(/_([a-z])/g, (_, k) => {
          return k.toUpperCase();
        });

      // Coerce string value into JS value.
      let val = process.env[key];

      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === 'null') {
        val = null;
      } else {
        val = Number(val);
      }

      obj[prop] = val;

      return obj;
    }, {});

  function getDate() {
    if (e.inspectOpts.hideDate) {
      return '';
    }

    return new Date().toISOString() + ' ';
  }

  /**
   * Adds ANSI color escape codes if enabled.
   *
   */
  function formatArgs(args) {
    const { namespace: name, useColors } = this;

    if (useColors) {
      const c = this.color;
      const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
      const prefix = `  ${colorCode};1m${name} \u001B[0m`;

      args[0] = prefix + args[0].split('\n').join('\n' + prefix);
      args.push(colorCode + 'm+' + humanize(this.diff) + '\u001B[0m');
    } else {
      args[0] = getDate() + name + ' ' + args[0];
    }
  }

  e.formatArgs = formatArgs;

  function log(...args) {
    return process.stderr.write(
      util.formatWithOptions(e.inspectOpts, ...args) + '\n'
    );
  }

  function init(debug) {
    debug.inspectOpts = {};

    const keys = Object.keys(e.inspectOpts);

    for (let i = 0; i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = e.inspectOpts[keys[i]];
    }
  }

  e.init = init;

  return e;
}

globalThis.ppp ??= {};
globalThis.ppp.$debugData ??= {};

if (
  typeof process === 'undefined' ||
  process.type === 'renderer' ||
  process.browser === true ||
  process.__nwjs
) {
  globalThis.ppp.$debug = $setup($browser(globalThis.ppp.$debugData));
} else {
  const util = require('util');

  // Map %o to `util.inspect()`, all on a single line.
  formatters.o = function (v) {
    this.inspectOpts.colors = this.useColors;

    return util
      .inspect(v, this.inspectOpts)
      .split('\n')
      .map((str) => str.trim())
      .join(' ');
  };

  // Map %O to `util.inspect()`, allowing multiple lines if needed.
  formatters.O = function (v) {
    this.inspectOpts.colors = this.useColors;

    return util.inspect(v, this.inspectOpts);
  };

  globalThis.ppp.$debug = $setup($node(globalThis.ppp.$debugData));
}
