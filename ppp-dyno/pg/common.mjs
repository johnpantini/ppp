import { Protocol } from './protocol/protocol.mjs';
import { parsePostgresArray } from './util/parse-array.mjs';
import { decodeBinaryArray } from './util/decode-binaryarray.mjs';

const DataFormat = Protocol.DataFormat;

import { DataTypeNames } from './definitions.mjs';

const DefaultColumnParser = (v) => v;

const BOOLEAN_PATTERN = /^true|t|1|yes|y$/i;

function toBoolean(v) {
  if (v == null) return;

  if (typeof v === 'string') return BOOLEAN_PATTERN.test(v);

  return !!v;
}

export function coerceToBoolean(v, d) {
  return v != null ? toBoolean(v) : toBoolean(d);
}

export function getParsers(typeMap, fields) {
  const parsers = new Array(fields.length);
  const l = fields.length;
  let f;
  let i;

  for (i = 0; i < l; i++) {
    f = fields[i];

    const dataTypeReg = typeMap.get(f.dataTypeId);

    if (dataTypeReg) {
      const isArray = !!dataTypeReg.elementsOID;

      if (f.format === DataFormat.binary) {
        const decode = dataTypeReg.parseBinary;

        if (decode) {
          parsers[i] = !isArray
            ? decode
            : (v, options) => decodeBinaryArray(v, decode, options);
        }
      } else if (f.format === DataFormat.text) {
        const parse = dataTypeReg.parseText;

        if (parse) {
          parsers[i] = !isArray
            ? parse
            : (v, options) =>
                parsePostgresArray(v, {
                  transform: (x) => parse(x, options),
                  separator: dataTypeReg.arraySeparator
                });
        }
      }
    }

    parsers[i] = parsers[i] || DefaultColumnParser;
  }

  return parsers;
}

export function parseRow(parsers, row, options) {
  const l = row.length;
  let i;

  for (i = 0; i < l; i++) {
    row[i] =
      row[i] == null ? null : parsers[i].call(undefined, row[i], options);
  }
}

export function convertRowToObject(fields, row) {
  const out = {};
  const l = row.length;
  let i;

  for (i = 0; i < l; i++) {
    out[fields[i].fieldName] = row[i];
  }

  return out;
}

export function getIntlConnection(connection) {
  return connection._intlCon;
}

export function wrapRowDescription(typeMap, fields, columnFormat) {
  return fields.map((f, idx) => {
    const cf = Array.isArray(columnFormat) ? columnFormat[idx] : columnFormat;
    const x = {
      fieldName: f.fieldName,
      tableId: f.tableId,
      columnId: f.columnId,
      dataTypeId: f.dataTypeId,
      dataTypeName: DataTypeNames[f.dataTypeId] || '',
      jsType: cf === DataFormat.binary ? 'Buffer' : 'string'
    };

    x.isArray = x.dataTypeName.startsWith('_');

    if (x.isArray) {
      x.elementDataTypeName = x.dataTypeName.substring(1);

      for (const oid of Object.keys(DataTypeNames)) {
        if (DataTypeNames[oid] === x.elementDataTypeName)
          x.elementDataTypeId = parseInt(oid, 10);
      }
    }

    if (f.fixedSize && f.fixedSize > 0) x.fixedSize = f.fixedSize;

    if (f.modifier && f.modifier > 0) x.modifier = f.modifier;

    const reg = typeMap.get(x.dataTypeId);

    if (reg) {
      x.jsType = reg.jsType;
    }

    return x;
  });
}
