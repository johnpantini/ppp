import { DataTypeOIDs } from '../definitions.mjs';

export const Float8Type = {
  name: 'float8',
  oid: DataTypeOIDs.float8,
  jsType: 'number',
  parseBinary(v) {
    return v.readDoubleBE(0);
  },
  encodeBinary(buf, v) {
    buf.writeDoubleBE(typeof v === 'number' ? v : parseFloat(v));
  },
  parseText: parseFloat,
  isType(v) {
    return typeof v === 'number';
  }
};
export const ArrayFloat8Type = {
  ...Float8Type,
  name: '_float8',
  oid: DataTypeOIDs._float8,
  elementsOID: DataTypeOIDs.float8
};
