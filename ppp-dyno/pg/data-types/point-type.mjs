import { DataTypeOIDs } from '../definitions.mjs';

const POINT_PATTERN1 = /^\( *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\)$/;
const POINT_PATTERN2 = /^(-?\d+\.?\d*) *, *(-?\d+\.?\d*)$/;

export const PointType = {
  name: 'point',
  oid: DataTypeOIDs.point,
  jsType: 'object',
  parseBinary(v) {
    return {
      x: v.readDoubleBE(0),
      y: v.readDoubleBE(8)
    };
  },
  encodeBinary(buf, v) {
    buf.writeDoubleBE(v.x);
    buf.writeDoubleBE(v.y);
  },
  parseText(v) {
    const m = v.match(POINT_PATTERN1) || v.match(POINT_PATTERN2);

    if (!m) return undefined;

    return {
      x: parseFloat(m[1]),
      y: parseFloat(m[2])
    };
  },
  isType(v) {
    return (
      typeof v === 'object' &&
      typeof v.x === 'number' &&
      typeof v.y === 'number'
    );
  }
};
export const ArrayPointType = {
  ...PointType,
  name: '_point',
  oid: DataTypeOIDs._point,
  elementsOID: DataTypeOIDs.point
};
