import { DataTypeOIDs } from '../definitions.mjs';

export const Float4Type = {
  name: 'float4',
  oid: DataTypeOIDs.float4,
  jsType: 'number',
  parseBinary(v) {
    return Math.round((v.readFloatBE(0) + Number.EPSILON) * 100) / 100;
  },
  encodeBinary(buf, v) {
    buf.writeFloatBE(typeof v === 'number' ? v : parseFloat(v));
  },
  parseText: parseFloat,
  isType(v) {
    return typeof v === 'number';
  }
};
export const ArrayFloat4Type = {
  ...Float4Type,
  name: '_float4',
  oid: DataTypeOIDs._float4,
  elementsOID: DataTypeOIDs.float4
};
