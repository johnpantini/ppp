import { DataTypeOIDs } from '../definitions.mjs';
import { parseDateTime } from '../util/parse-datetime.mjs';

const timeShift = 946684800000;
const timeMul = 4294967296;

export const TimestampType = {
  name: 'timestamp',
  oid: DataTypeOIDs.timestamp,
  jsType: 'Date',
  parseBinary(v, options) {
    const fetchAsString =
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.timestamp);
    const hi = v.readInt32BE();
    const lo = v.readUInt32BE(4);

    if (lo === 0xffffffff && hi === 0x7fffffff)
      return fetchAsString ? 'infinity' : Infinity;

    if (lo === 0x00000000 && hi === -0x80000000)
      return fetchAsString ? '-infinity' : -Infinity;

    // Shift from 2000 to 1970
    let d = new Date((lo + hi * timeMul) / 1000 + timeShift);

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

    return fetchAsString ? dateToTimestampString(d) : d;
  },
  encodeBinary(buf, v, options) {
    if (typeof v === 'string')
      v = parseDateTime(v, true, false, options.utcDates);

    if (v === Infinity) {
      buf.writeInt32BE(0x7fffffff); // hi
      buf.writeUInt32BE(0xffffffff); // lo

      return;
    }

    if (v === -Infinity) {
      buf.writeInt32BE(-0x80000000); // hi
      buf.writeUInt32BE(0x00000000); // lo

      return;
    }

    if (!(v instanceof Date)) v = new Date(v);

    // Postgresql ignores timezone data so we are
    let n = options.utcDates
      ? v.getTime()
      : v.getTime() - v.getTimezoneOffset() * 60 * 1000;

    n = (n - timeShift) * 1000;

    const hi = Math.floor(n / timeMul);
    const lo = n - hi * timeMul;

    buf.writeInt32BE(hi);
    buf.writeUInt32BE(lo);
  },
  parseText(v, options) {
    if (
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.timestamp)
    )
      return v;

    return parseDateTime(v, true, false, options.utcDates);
  },
  isType(v) {
    return v instanceof Date;
  }
};

function padZero(v) {
  return v < 9 ? '0' + v : '' + v;
}

function dateToTimestampString(d) {
  return (
    d.getFullYear() +
    '-' +
    padZero(d.getMonth() + 1) +
    '-' +
    padZero(d.getDate()) +
    ' ' +
    padZero(d.getHours()) +
    ':' +
    padZero(d.getMinutes()) +
    ':' +
    padZero(d.getSeconds())
  );
}

export const ArrayTimestampType = {
  ...TimestampType,
  name: '_timestamp',
  oid: DataTypeOIDs._timestamp,
  elementsOID: DataTypeOIDs.timestamp
};
