import { DataTypeOIDs } from '../definitions.mjs';
import { parseDateTime } from '../util/parse-datetime.mjs';

const timeShift = 946684800000;

export const DateType = {
  name: 'date',
  oid: DataTypeOIDs.date,
  jsType: 'Date',
  parseBinary(v, options) {
    const fetchAsString =
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.date);
    const t = v.readInt32BE();

    if (t === 0x7fffffff) return fetchAsString ? 'infinity' : Infinity;

    if (t === -0x80000000) return fetchAsString ? '-infinity' : -Infinity;

    // Shift from 2000 to 1970
    let d = new Date(t * 1000 * 86400 + timeShift);

    if (fetchAsString || !options.utcDates)
      d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

    return fetchAsString ? dateToDateString(d) : d;
  },
  encodeBinary(buf, v, options) {
    if (typeof v === 'string')
      v = parseDateTime(v, false, false, options.utcDates);

    if (v === Infinity) {
      buf.writeInt32BE(0x7fffffff);

      return;
    }

    if (v === -Infinity) {
      buf.writeInt32BE(-0x80000000);

      return;
    }

    if (!(v instanceof Date)) v = new Date(v);

    let n = options.utcDates
      ? v.getTime()
      : v.getTime() - v.getTimezoneOffset() * 60 * 1000;

    n = (n - timeShift) / 1000 / 86400;

    const t = Math.trunc(n + Number.EPSILON);

    buf.writeInt32BE(t);
  },
  parseText(v, options) {
    const fetchAsString =
      options.fetchAsString &&
      options.fetchAsString.includes(DataTypeOIDs.date);

    if (fetchAsString) return v;

    return parseDateTime(v, false, false, options.utcDates);
  },
  isType(v) {
    return v instanceof Date;
  }
};

function padZero(v) {
  return v < 9 ? '0' + v : '' + v;
}

function dateToDateString(d) {
  return (
    d.getFullYear() +
    '-' +
    padZero(d.getMonth() + 1) +
    '-' +
    padZero(d.getDate())
  );
}

export const ArrayDateType = {
  ...DateType,
  name: '_date',
  oid: DataTypeOIDs._date,
  elementsOID: DataTypeOIDs.date
};
