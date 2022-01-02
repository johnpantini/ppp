import { DataTypeOIDs } from './definitions.mjs';
import { ArrayBoolType, BoolType } from './data-types/bool-type.mjs';
import { ArrayInt2Type, Int2Type } from './data-types/int2-type.mjs';
import { ArrayInt4Type, Int4Type } from './data-types/int4-type.mjs';
import { ArrayInt8Type, Int8Type } from './data-types/int8-type.mjs';
import { ArrayFloat4Type, Float4Type } from './data-types/float4-type.mjs';
import { ArrayFloat8Type, Float8Type } from './data-types/float8-type.mjs';
import { ArrayOidType, OidType } from './data-types/oid-type.mjs';
import { ArrayDateType, DateType } from './data-types/date-type.mjs';
import { ArrayTimestampType, TimestampType } from './data-types/timestamp-type.mjs';
import {
  ArrayTimestamptzType,
  TimestamptzType
} from './data-types/timestamptz-type.mjs';
import { ArrayCharType, CharType } from './data-types/char-type.mjs';
import { ArrayVarcharType, VarcharType } from './data-types/varchar-type.mjs';
import { ArrayJsonType, JsonType } from './data-types/json-type.mjs';
import { ArrayLsegType, LsegType } from './data-types/lseg-type.mjs';
import { ArrayPointType, PointType } from './data-types/point-type.mjs';
import { ArrayCircleType, CircleType } from './data-types/circle-type.mjs';
import { ArrayBoxType, BoxType } from './data-types/box-type.mjs';
import { ArrayNumericType, NumericType } from './data-types/numeric-type.mjs';
import { ArrayUuidType, UuidType } from './data-types/uuid-type.mjs';
import { ArrayTimeType, TimeType } from './data-types/time-type.mjs';

export class DataTypeMap {
  constructor(other) {
    this._itemsByOID = {};
    this._items = [];

    if (other instanceof DataTypeMap) Object.assign(this._items, other._items);
  }

  get(oid) {
    return this._itemsByOID[oid];
  }

  register(...dataTypes) {
    for (const t of dataTypes) {
      this._itemsByOID[t.oid] = t;

      const i = this._items.findIndex((tt) => tt.oid === t.oid);

      if (i >= 0) this._items[i] = t;
      else this._items.push(t);
    }
  }

  determine(value) {
    if (value == null) return DataTypeOIDs.unknown;

    const valueIsArray = Array.isArray(value);

    for (const t of this._items) {
      if (valueIsArray) {
        if (t.elementsOID && t.isType(value[0])) return t.oid;
      } else if (!t.elementsOID && t.isType(value)) return t.oid;
    }
  }
}

export const GlobalTypeMap = new DataTypeMap();
GlobalTypeMap.register(BoolType, ArrayBoolType);
GlobalTypeMap.register(
  Int4Type,
  ArrayInt4Type,
  Int8Type,
  ArrayInt8Type,
  Int2Type,
  ArrayInt2Type
);
GlobalTypeMap.register(
  Float8Type,
  ArrayFloat8Type,
  Float4Type,
  ArrayFloat4Type
);
GlobalTypeMap.register(NumericType, ArrayNumericType);
GlobalTypeMap.register(UuidType, ArrayUuidType);
GlobalTypeMap.register(TimestamptzType, ArrayTimestamptzType);
GlobalTypeMap.register(TimestampType, ArrayTimestampType);
GlobalTypeMap.register(DateType, ArrayDateType);
GlobalTypeMap.register(TimeType, ArrayTimeType);
GlobalTypeMap.register(OidType, ArrayOidType);
GlobalTypeMap.register(JsonType, ArrayJsonType);
GlobalTypeMap.register(PointType, ArrayPointType);
GlobalTypeMap.register(CircleType, ArrayCircleType);
GlobalTypeMap.register(LsegType, ArrayLsegType);
GlobalTypeMap.register(BoxType, ArrayBoxType);
GlobalTypeMap.register(VarcharType, ArrayVarcharType);
GlobalTypeMap.register(CharType, ArrayCharType);
GlobalTypeMap.register({
  ...VarcharType,
  name: 'bpchar',
  oid: DataTypeOIDs.bpchar
});
GlobalTypeMap.register({
  ...ArrayVarcharType,
  name: '_bpchar',
  oid: DataTypeOIDs._bpchar,
  elementsOID: DataTypeOIDs.bpchar
});
GlobalTypeMap.register({
  ...VarcharType,
  name: 'name',
  oid: DataTypeOIDs.name
});
GlobalTypeMap.register({
  ...ArrayVarcharType,
  name: '_name',
  oid: DataTypeOIDs._name,
  elementsOID: DataTypeOIDs.name
});
GlobalTypeMap.register({
  ...VarcharType,
  name: 'text',
  oid: DataTypeOIDs.text
});
GlobalTypeMap.register({
  ...ArrayVarcharType,
  name: '_text',
  oid: DataTypeOIDs._text,
  elementsOID: DataTypeOIDs.text
});
GlobalTypeMap.register({ ...VarcharType, name: 'xml', oid: DataTypeOIDs.xml });
GlobalTypeMap.register({
  ...ArrayVarcharType,
  name: '_xml',
  oid: DataTypeOIDs._xml,
  elementsOID: DataTypeOIDs.xml
});
