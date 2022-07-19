import { DataTypeOIDs } from '../definitions.mjs';

const CIRCLE_PATTERN1 =
  /^< *\( *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\) *, *(-?\d+\.?\d*) *>$/;
const CIRCLE_PATTERN2 =
  /^\( *\( *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\) *, *(-?\d+\.?\d*) *\)$/;
const CIRCLE_PATTERN3 =
  /^\( *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\) *, *(-?\d+\.?\d*)$/;
const CIRCLE_PATTERN4 = /^(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*)$/;

export const CircleType = {
  name: 'circle',
  oid: DataTypeOIDs.circle,
  jsType: 'object',
  parseBinary(v) {
    return {
      x: v.readDoubleBE(0),
      y: v.readDoubleBE(8),
      r: v.readDoubleBE(16)
    };
  },
  encodeBinary(buf, v) {
    buf.writeDoubleBE(v.x);
    buf.writeDoubleBE(v.y);
    buf.writeDoubleBE(v.r);
  },
  parseText(v) {
    const m =
      v.match(CIRCLE_PATTERN1) ||
      v.match(CIRCLE_PATTERN2) ||
      v.match(CIRCLE_PATTERN3) ||
      v.match(CIRCLE_PATTERN4);

    if (!m) return undefined;

    return {
      x: parseFloat(m[1]),
      y: parseFloat(m[2]),
      r: parseFloat(m[3])
    };
  },
  isType(v) {
    return (
      typeof v === 'object' &&
      typeof v.x === 'number' &&
      typeof v.y === 'number' &&
      typeof v.r === 'number'
    );
  }
};
export const ArrayCircleType = {
  ...CircleType,
  name: '_circle',
  oid: DataTypeOIDs._circle,
  elementsOID: DataTypeOIDs.circle
};
