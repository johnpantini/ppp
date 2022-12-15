const childProcess = require('child_process');

const isLinux = () => process.platform === 'linux';
const command =
  'getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true';
let commandOut = '';

let report = null;
const getReport = () => {
  if (!report) {
    report = isLinux() && process.report ? process.report.getReport() : {};
  }

  return report;
};

const safeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: 'utf8' });
    } catch (_err) {
      commandOut = ' ';
    }
  }

  return commandOut;
};

/**
 * A String constant containing the value `glibc`.
 * @type {string}
 * @public
 */
const GLIBC = 'glibc';

/**
 * A String constant containing the value `musl`.
 * @type {string}
 * @public
 */
const MUSL = 'musl';

const familyFromReport = () => {
  const report = getReport();

  if (report.header && report.header.glibcVersionRuntime) {
    return GLIBC;
  }

  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) {
      return MUSL;
    }
  }

  return null;
};

const familyFromCommand = (out) => {
  const [getconf, ldd1] = out.split(/[\r\n]+/);

  if (getconf && getconf.includes(GLIBC)) {
    return GLIBC;
  }

  if (ldd1 && ldd1.includes(MUSL)) {
    return MUSL;
  }

  return null;
};

/**
 * Returns the libc family when it can be determined, `null` otherwise.
 * @returns {?string}
 */
const familySync = () => {
  let family = null;

  if (isLinux()) {
    family = familyFromReport();

    if (!family) {
      const out = safeCommandSync();

      family = familyFromCommand(out);
    }
  }

  return family;
};

if (isLinux()) {
  if (familySync() === MUSL) {
    module.exports = require('../' +
      process.platform +
      '-' +
      process.arch +
      '-' +
      process.versions.modules +
      '/musl-libc/canvas.node');
  } else {
    module.exports = require('../' +
      process.platform +
      '-' +
      process.arch +
      '-' +
      process.versions.modules +
      '/canvas.node');
  }
} else
  module.exports = require('../' +
    process.platform +
    '-' +
    process.arch +
    '-' +
    process.versions.modules +
    '/canvas.node');
