import { DataTypeOIDs } from '../definitions.mjs';
import { fastParseInt } from '../util/fast-parseint.mjs';

export const OidType = {
  name: 'oid',
  oid: DataTypeOIDs.oid,
  jsType: 'number',
  parseBinary(v) {
    return v.readUInt32BE(0);
  },
  encodeBinary(buf, v) {
    buf.writeUInt32BE(fastParseInt(v));
  },
  parseText: fastParseInt,
  isType(v) {
    return typeof v === 'number' && Number.isInteger(v) && v >= 0;
  }
};
export const ArrayOidType = {
  ...OidType,
  name: '_oid',
  oid: DataTypeOIDs._oid,
  elementsOID: DataTypeOIDs.oid
};
