import { DataTypeOIDs } from '../definitions.mjs';

export const CharType = {
  name: 'char',
  oid: DataTypeOIDs.char,
  jsType: 'string',
  parseBinary(v) {
    return v.toString('utf8');
  },
  encodeBinary(buf, v) {
    buf.writeString((v ? '' + v : ' ')[0], 'utf8');
  },
  parseText(v) {
    return '' + v;
  },
  isType(v) {
    return typeof v === 'string' && v.length === 1;
  }
};
export const ArrayCharType = {
  ...CharType,
  name: '_char',
  oid: DataTypeOIDs._char,
  elementsOID: DataTypeOIDs.char
};
