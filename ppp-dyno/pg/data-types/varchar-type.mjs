import { DataTypeOIDs } from '../definitions.mjs';

export const VarcharType = {
  name: 'varchar',
  oid: DataTypeOIDs.varchar,
  jsType: 'string',
  parseBinary(v) {
    return v.toString('utf8');
  },
  encodeBinary(buf, v) {
    buf.writeString('' + v, 'utf8');
  },
  parseText(v) {
    return '' + v;
  },
  isType(v) {
    return typeof v === 'string';
  }
};
export const ArrayVarcharType = {
  ...VarcharType,
  name: '_varchar',
  oid: DataTypeOIDs._varchar,
  elementsOID: DataTypeOIDs.varchar
};
