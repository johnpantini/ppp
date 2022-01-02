import { Protocol } from './protocol.mjs';
import { BufferReader } from './buffer-reader.mjs';

// 1 byte message type, 4 byte frame length
const HEADER_LENGTH = 5;
const ErrorFieldTypes = {
  M: 'message',
  S: 'severity',
  V: 'severity',
  C: 'code',
  D: 'detail',
  H: 'hint',
  P: 'position',
  p: 'internalPosition',
  q: 'internalQuery',
  W: 'where',
  s: 'schema',
  t: 'table',
  c: 'column',
  d: 'dataType',
  n: 'constraint',
  F: 'file',
  L: 'line',
  R: 'routine'
};

export class Backend {
  reset() {
    this._buf = undefined;
  }

  parse(data, callback) {
    if (this._buf) {
      data = Buffer.concat([this._buf, data]);
      this._buf = undefined;
    }

    const io = new BufferReader(data);
    let offsetBookmark;

    while (io.length - io.offset >= HEADER_LENGTH) {
      offsetBookmark = io.offset;

      const code = io.readUInt8();
      const len = io.readUInt32BE();

      // Check if frame data not received yet
      if (io.length - io.offset < len - 4) {
        io.offset = offsetBookmark;
        this._buf = io.readBuffer();

        return;
      }

      const parser = MessageParsers[code];
      const v = parser && parser(io, code, len);

      callback(code, v);
      // Set offset to next message
      io.offset = offsetBookmark + len + 1;
    }

    if (io.offset < io.length) this._buf = io.readBuffer(io.length - io.offset);
  }
}

const MessageParsers = {
  [Protocol.BackendMessageCode.Authentication]: parseAuthentication,
  [Protocol.BackendMessageCode.BackendKeyData]: parseBackendKeyData,
  [Protocol.BackendMessageCode.CommandComplete]: parseCommandComplete,
  [Protocol.BackendMessageCode.CopyData]: parseCopyData,
  [Protocol.BackendMessageCode.CopyInResponse]: parseCopyResponse,
  [Protocol.BackendMessageCode.CopyOutResponse]: parseCopyResponse,
  [Protocol.BackendMessageCode.CopyBothResponse]: parseCopyResponse,
  [Protocol.BackendMessageCode.DataRow]: parseDataRow,
  [Protocol.BackendMessageCode.ErrorResponse]: parseErrorResponse,
  [Protocol.BackendMessageCode.NoticeResponse]: parseErrorResponse,
  [Protocol.BackendMessageCode.FunctionCallResponse]: parseFunctionCallResponse,
  [Protocol.BackendMessageCode.NegotiateProtocolVersion]:
    parseNegotiateProtocolVersion,
  [Protocol.BackendMessageCode.ParameterDescription]: parseParameterDescription,
  [Protocol.BackendMessageCode.ParameterStatus]: parseParameterStatus,
  [Protocol.BackendMessageCode.ReadyForQuery]: parseReadyForQuery,
  [Protocol.BackendMessageCode.RowDescription]: parseRowDescription
};

function parseAuthentication(io, code, len) {
  const kind = io.readUInt32BE();

  switch (kind) {
    case 0:
      return; // AuthenticationOk
    case 2:
      return {
        kind: 'KerberosV5'
      };
    case 3:
      return {
        kind: 'CleartextPassword'
      };
    case 5:
      return {
        kind: 'MD5Password',
        salt: io.readBuffer(len - 8)
      };
    case 6:
      return {
        kind: 'SCMCredential'
      };
    case 7:
      return {
        kind: 'GSS'
      };
    case 9:
      return {
        kind: 'SSPI'
      };
    case 8:
      return {
        kind: 'GSSContinue',
        data: io.readBuffer(len - 8)
      };
    case 10: {
      const out = {
        kind: 'SASL',
        mechanisms: []
      };
      let mechanism;

      while ((mechanism = io.readCString())) {
        out.mechanisms.push(mechanism);
      }

      return out;
    }
    case 11:
      return {
        kind: 'SASLContinue',
        data: io.readLString(len - 8, 'utf8')
      };
    case 12:
      return {
        kind: 'SASLFinal',
        data: io.readLString(len - 8, 'utf8')
      };
    default:
      throw new Error(`Unknown authentication kind (${kind}).`);
  }
}

function parseBackendKeyData(io) {
  return {
    processID: io.readUInt32BE(),
    secretKey: io.readUInt32BE()
  };
}

function parseCommandComplete(io) {
  return {
    command: io.readCString('utf8')
  };
}

function parseCopyData(io, code, len) {
  return {
    data: io.readBuffer(len - 4)
  };
}

function parseCopyResponse(io) {
  const out = {
    overallFormat:
      io.readUInt8() === 0
        ? Protocol.DataFormat.text
        : Protocol.DataFormat.binary,
    columnCount: io.readUInt16BE()
  };

  if (out.columnCount) {
    out.columnFormats = [];

    for (let i = 0; i < out.columnCount; i++) {
      out.columnFormats.push(
        io.readUInt16BE() === 0
          ? Protocol.DataFormat.text
          : Protocol.DataFormat.binary
      );
    }
  }

  return out;
}

function parseDataRow(io) {
  const out = {
    columnCount: io.readUInt16BE()
  };

  if (out.columnCount) {
    out.columns = [];

    for (let i = 0; i < out.columnCount; i++) {
      // The length of the column value, in bytes (this count does not include itself).
      // Can be zero. As a special case, -1 indicates a NULL column value.
      // No value bytes follow in the NULL case.
      const l = io.readInt32BE();

      if (l < 0) out.columns.push(null);
      else out.columns.push(io.readBuffer(l));
    }
  }

  return out;
}

function parseErrorResponse(io) {
  const out = {};
  let fieldType;

  while ((fieldType = io.readLString(1)) !== '\0') {
    const value = io.readCString('utf8');
    const key = ErrorFieldTypes[fieldType];

    if (key) out[key] = value;
  }

  return out;
}

function parseFunctionCallResponse(io, code, len) {
  return {
    result: io.readBuffer(len - 4)
  };
}

function parseNegotiateProtocolVersion(io) {
  return {
    supportedVersionMinor: io.readUInt32BE(),
    numberOfNotSupportedVersions: io.readUInt32BE(),
    option: io.readCString('utf8')
  };
}

function parseParameterDescription(io) {
  const out = {
    parameterCount: io.readUInt32BE(),
    parameterIds: []
  };

  for (let i = 0; i < out.parameterCount; i++) {
    out.parameterIds.push(io.readUInt32BE());
  }

  return out;
}

function parseParameterStatus(io) {
  return {
    name: io.readCString('utf8'),
    value: io.readCString('utf8')
  };
}

function parseReadyForQuery(io) {
  return {
    status: io.readLString(1)
  };
}

function parseRowDescription(io) {
  const fieldCount = io.readUInt16BE();
  const out = {
    fields: []
  };

  for (let i = 0; i < fieldCount; i++) {
    const field = {
      fieldName: io.readCString('utf8'),
      tableId: io.readInt32BE(),
      columnId: io.readInt16BE(),
      dataTypeId: io.readInt32BE(),
      fixedSize: io.readInt16BE(),
      modifier: io.readInt32BE(),
      format:
        io.readInt16BE() === 0
          ? Protocol.DataFormat.text
          : Protocol.DataFormat.binary
    };

    out.fields.push(field);
  }

  return out;
}
