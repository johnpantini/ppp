import { DataTypeOIDs } from '../definitions.mjs';

export const JsonType = {
  name: 'json',
  oid: DataTypeOIDs.json,
  jsType: 'string',
  parseBinary(v) {
    return v.toString('utf8');
  },
  encodeText(v) {
    if (typeof v === 'object' || typeof v === 'bigint')
      return JSON.stringify(v);

    if (typeof v === 'boolean') return v ? 'true' : 'false';

    return '' + v;
  },
  parseText(v) {
    return '' + v;
  },
  isType(v) {
    return typeof v === 'object';
  }
};
export const ArrayJsonType = {
  ...JsonType,
  name: '_json',
  oid: DataTypeOIDs._json,
  elementsOID: DataTypeOIDs.json
};
