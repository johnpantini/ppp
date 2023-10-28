import { DataTypeOIDs } from '../definitions.mjs';
import { fastParseInt } from '../util/fast-parseint.mjs';

export const Int2Type = {
  name: 'int2',
  oid: DataTypeOIDs.int2,
  jsType: 'number',
  parseBinary(v) {
    return v.readInt16BE(0);
  },
  encodeBinary(buf, v) {
    buf.writeInt16BE(fastParseInt(v));
  },
  parseText: fastParseInt,
  isType(v) {
    return (
      typeof v === 'number' && Number.isInteger(v) && v >= -32768 && v <= 32767
    );
  }
};
export const ArrayInt2Type = {
  ...Int2Type,
  name: '_int2',
  oid: DataTypeOIDs._int2,
  elementsOID: DataTypeOIDs.int2
};
