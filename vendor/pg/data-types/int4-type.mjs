import { DataTypeOIDs } from '../definitions.mjs';
import { fastParseInt } from '../util/fast-parseint.mjs';

export const Int4Type = {
  name: 'int4',
  oid: DataTypeOIDs.int4,
  jsType: 'number',
  parseBinary(v) {
    return v.readInt32BE(0);
  },
  encodeBinary(buf, v) {
    buf.writeInt32BE(fastParseInt(v));
  },
  parseText: fastParseInt,
  isType(v) {
    return typeof v === 'number' && Number.isInteger(v);
  }
};
export const ArrayInt4Type = {
  ...Int4Type,
  name: '_int4',
  oid: DataTypeOIDs._int4,
  elementsOID: DataTypeOIDs.int4
};
