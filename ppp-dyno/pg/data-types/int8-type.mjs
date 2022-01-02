import { DataTypeOIDs } from '../definitions.mjs';
import { readBigInt64BE } from '../util/bigint-methods.mjs';

const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

export const Int8Type = {
  name: 'int8',
  oid: DataTypeOIDs.int8,
  jsType: 'BigInt',
  parseBinary(buf) {
    const v =
      typeof buf.readBigInt64BE === 'function'
        ? buf.readBigInt64BE(0)
        : readBigInt64BE(buf);

    return v >= -maxSafeInteger && v <= maxSafeInteger ? Number(v) : v;
  },
  encodeBinary(buf, v) {
    buf.writeBigInt64BE(v);
  },
  parseText(s) {
    const v = BigInt(s);

    return v >= -maxSafeInteger && v <= maxSafeInteger ? Number(v) : v;
  },
  isType(v) {
    return (
      typeof v === 'bigint' || (typeof v === 'number' && Number.isInteger(v))
    );
  }
};
export const ArrayInt8Type = {
  ...Int8Type,
  name: '_int8',
  oid: DataTypeOIDs._int8,
  elementsOID: DataTypeOIDs.int8
};
