import { DataTypeOIDs } from '../definitions.mjs';
import { parseTime, STRICT_TIME_PATTERN } from '../util/parse-time.mjs';

const timeMul = 4294967296;

export const TimeType = {
  name: 'time',
  oid: DataTypeOIDs.time,
  jsType: 'string',
  parseBinary(v, options) {
    const fetchAsString =
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.time);
    const hi = v.readInt32BE();
    const lo = v.readUInt32BE(4);
    let d = new Date((lo + hi * timeMul) / 1000);

    if (fetchAsString || !options.utcDates)
      d = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds()
      );

    return fetchAsString ? dateToTimeString(d) : d;
  },
  encodeBinary(buf, v, options) {
    if (typeof v === 'string') v = parseTime(v, false, options.utcDates);

    if (!(v instanceof Date)) v = new Date(v);

    // Postgresql ignores timezone data so we are
    let n = options.utcDates
      ? v.getTime()
      : v.getTime() - v.getTimezoneOffset() * 60 * 1000;

    n = n * 1000;

    const hi = Math.floor(n / timeMul);
    const lo = n - hi * timeMul;

    buf.writeInt32BE(hi);
    buf.writeUInt32BE(lo);
  },
  parseText(v, options) {
    if (
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.time)
    )
      return v;

    return parseTime(v, false, options.utcDates);
  },
  isType(v) {
    return (
      (v instanceof Date &&
        v.getFullYear() === 1970 &&
        v.getMonth() === 0 &&
        v.getDate() === 1) ||
      (typeof v === 'string' && STRICT_TIME_PATTERN.test(v))
    );
  }
};

function padZero(v) {
  return v < 9 ? '0' + v : '' + v;
}

function dateToTimeString(d) {
  return (
    padZero(d.getHours()) +
    ':' +
    padZero(d.getMinutes()) +
    ':' +
    padZero(d.getSeconds())
  );
}

export const ArrayTimeType = {
  ...TimeType,
  name: '_time',
  oid: DataTypeOIDs._time,
  elementsOID: DataTypeOIDs.time
};
