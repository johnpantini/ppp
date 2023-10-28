import { DataTypeOIDs } from '../definitions.mjs';

export const BoolType = {
  name: 'bool',
  oid: DataTypeOIDs.bool,
  jsType: 'boolean',
  parseBinary(v) {
    return !!v.readUInt8();
  },
  encodeBinary(buf, v) {
    buf.writeInt8(v ? 1 : 0);
  },
  parseText(v) {
    return (
      v === 'TRUE' ||
      v === 't' ||
      v === 'true' ||
      v === 'y' ||
      v === 'yes' ||
      v === 'on' ||
      v === '1'
    );
  },
  isType(v) {
    return typeof v === 'boolean';
  }
};
export const ArrayBoolType = {
  ...BoolType,
  name: '_bool',
  oid: DataTypeOIDs._bool,
  elementsOID: DataTypeOIDs.bool
};
