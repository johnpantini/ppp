import { DataTypeOIDs } from '../definitions.mjs';

const GUID_PATTERN =
  /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/;

export const UuidType = {
  name: 'uuid',
  oid: DataTypeOIDs.uuid,
  jsType: 'String',
  parseBinary(v) {
    return (
      v.toString('hex', 0, 4) +
      '-' +
      v.toString('hex', 4, 6) +
      '-' +
      v.toString('hex', 6, 8) +
      '-' +
      v.toString('hex', 8, 10) +
      '-' +
      v.toString('hex', 10, 16)
    );
  },
  encodeBinary(buf, v) {
    if (!GUID_PATTERN.test(v))
      throw new Error(`"${v}" is not a valid guid value`);

    const b = Buffer.from(v.replace(/-/g, ''), 'hex');

    buf.writeBuffer(b);
  },
  parseText(v) {
    return v;
  },
  isType(v) {
    return typeof v === 'string' && GUID_PATTERN.test(v);
  }
};
export const ArrayUuidType = {
  ...UuidType,
  name: '_uuid',
  oid: DataTypeOIDs._uuid,
  elementsOID: DataTypeOIDs.uuid
};
