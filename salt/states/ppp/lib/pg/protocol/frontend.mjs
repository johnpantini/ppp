import { Protocol } from './protocol.mjs';
import { SmartBuffer } from './smart-buffer.mjs';
import { DEFAULT_COLUMN_FORMAT } from '../definitions.mjs';
import { encodeBinaryArray } from '../util/encode-binaryarray.mjs';
import { stringifyArrayLiteral } from '../util/stringify-arrayliteral.mjs';

const DataFormat = Protocol.DataFormat;
const StaticFlushBuffer = Buffer.from([
  Protocol.FrontendMessageCode.Flush,
  0x00,
  0x00,
  0x00,
  0x04
]);
const StaticTerminateBuffer = Buffer.from([
  Protocol.FrontendMessageCode.Terminate,
  0x00,
  0x00,
  0x00,
  0x04
]);
const StaticSyncBuffer = Buffer.from([
  Protocol.FrontendMessageCode.Sync,
  0x00,
  0x00,
  0x00,
  0x04
]);

export class Frontend {
  constructor() {
    this._io = new SmartBuffer();
  }

  getSSLRequestMessage() {
    return this._io
      .start()
      .writeUInt32BE(8) // Length of message contents in bytes, including self.
      .writeUInt16BE(1234)
      .writeUInt16BE(5679)
      .flush();
  }

  getStartupMessage(args) {
    const io = this._io
      .start()
      .writeInt32BE(0) // Preserve length
      .writeInt16BE(Protocol.VERSION_MAJOR)
      .writeInt16BE(Protocol.VERSION_MINOR);

    for (const [k, v] of Object.entries(args)) {
      if (k !== 'client_encoding')
        io.writeCString(k, 'utf8').writeCString(v, 'utf8');
    }

    io.writeCString('client_encoding', 'utf8')
      .writeCString('UTF8', 'utf8')
      .writeUInt8(0);

    return setLengthAndFlush(io, 0);
  }

  getPasswordMessage(password) {
    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.PasswordMessage)
      .writeInt32BE(0) // Preserve header
      .writeCString(password, 'utf8');

    return setLengthAndFlush(io, 1);
  }

  getSASLMessage(sasl) {
    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.PasswordMessage)
      .writeInt32BE(0) // Preserve header
      .writeCString(sasl.mechanism, 'utf8')
      .writeLString(sasl.clientFirstMessage);

    return setLengthAndFlush(io, 1);
  }

  getSASLFinalMessage(session) {
    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.PasswordMessage)
      .writeInt32BE(0) // Preserve header
      .writeString(session.clientFinalMessage);

    return setLengthAndFlush(io, 1);
  }

  getParseMessage(args) {
    if (args.statement && args.statement.length > 63)
      throw new Error('Query name length must be lower than 63');

    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Parse)
      .writeInt32BE(0) // Preserve header
      .writeCString(args.statement || '', 'utf8')
      .writeCString(args.sql, 'utf8')
      .writeUInt16BE(args.paramTypes ? args.paramTypes.length : 0);

    if (args.paramTypes) {
      for (const t of args.paramTypes) {
        io.writeUInt32BE(t || 0);
      }
    }

    return setLengthAndFlush(io, 1);
  }

  getBindMessage(args) {
    if (args.portal && args.portal.length > 63)
      throw new Error('Portal name length must be lower than 63');

    if (args.statement && args.statement.length > 63)
      throw new Error('Query name length must be lower than 63');

    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Bind)
      .writeInt32BE(0) // Preserve header
      .writeCString(args.portal || '', 'utf8')
      .writeCString(args.statement || '', 'utf8');
    const { params, paramTypes, queryOptions } = args;
    const columnFormat =
      queryOptions.columnFormat != null
        ? queryOptions.columnFormat
        : DEFAULT_COLUMN_FORMAT;

    if (params && params.length) {
      io.writeInt16BE(params.length);

      const formatOffset = io.offset;

      for (let i = 0; i < params.length; i++) {
        io.writeInt16BE(0); // Preserve
      }

      // Write parameter values
      io.writeUInt16BE(params.length);

      for (
        let i = 0;
        i < (params === null || params === void 0 ? void 0 : params.length);
        i++
      ) {
        let v = params[i];

        if (v == null) {
          io.writeInt32BE(-1);
          continue;
        }

        const dataTypeOid = paramTypes ? paramTypes[i] : undefined;
        const dt = dataTypeOid ? args.typeMap.get(dataTypeOid) : undefined;

        if (dt) {
          if (typeof dt.encodeBinary === 'function') {
            // Set param format to binary
            io.buffer.writeInt16BE(
              Protocol.DataFormat.binary,
              formatOffset + i * 2
            );
            // Preserve data length
            io.writeInt32BE(0);

            const dataOffset = io.offset;

            if (dt.elementsOID) {
              // If data type is array
              v = Array.isArray(v) ? v : [v];
              encodeBinaryArray(
                io,
                v,
                dt.elementsOID,
                queryOptions,
                dt.encodeBinary
              );
            } else {
              dt.encodeBinary(io, v, queryOptions);
            }

            io.buffer.writeInt32BE(io.length - dataOffset, dataOffset - 4); // Update length
          } else if (typeof dt.encodeText === 'function') {
            v = dt.elementsOID
              ? stringifyArrayLiteral(v, queryOptions, dt.encodeText)
              : dt.encodeText(v, queryOptions);
            io.writeLString(v, 'utf8');
          }
        } else if (Buffer.isBuffer(v)) {
          // Set param format to binary
          io.buffer.writeInt16BE(
            Protocol.DataFormat.binary,
            formatOffset + i * 2
          );
          // Preserve data length
          io.writeInt32BE(0);

          const dataOffset = io.offset;

          io.writeBuffer(v);
          io.buffer.writeInt32BE(io.length - dataOffset, dataOffset - 4); // Update length
        } else {
          io.writeLString('' + v, 'utf8');
        }
      }
    } else {
      io.writeUInt16BE(0);
      io.writeUInt16BE(0);
    }

    if (Array.isArray(columnFormat)) {
      io.writeUInt16BE(columnFormat.length);

      for (let i = 0; i < columnFormat.length; i++) {
        io.writeUInt16BE(columnFormat[i]);
      }
    } else if (columnFormat === DataFormat.binary) {
      io.writeUInt16BE(1);
      io.writeUInt16BE(DataFormat.binary);
    } else io.writeUInt16BE(0);

    return setLengthAndFlush(io, 1);
  }

  getDescribeMessage(args) {
    if (args.name && args.name.length > 63)
      throw new Error(
        args.type === 'P'
          ? 'Portal'
          : 'Statement' + 'name length must be lower than 63'
      );

    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Describe)
      .writeInt32BE(0) // Preserve header
      .writeUInt8(args.type.charCodeAt(0))
      .writeCString(args.name || '', 'utf8');

    return setLengthAndFlush(io, 1);
  }

  getExecuteMessage(args) {
    if (
      args.fetchCount &&
      (args.fetchCount < 0 || args.fetchCount > 4294967295)
    )
      throw new Error('fetchCount can be between 0 and 4294967295');

    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Execute)
      .writeInt32BE(0) // Preserve header
      .writeCString(args.portal || '', 'utf8')
      .writeUInt32BE(args.fetchCount || 0);

    return setLengthAndFlush(io, 1);
  }

  getCloseMessage(args) {
    if (args.name && args.name.length > 63)
      throw new Error(
        args.type === 'P'
          ? 'Portal'
          : 'Statement' + 'name length must be lower than 63'
      );

    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Close)
      .writeInt32BE(0) // Preserve header
      .writeUInt8(args.type.charCodeAt(0))
      .writeCString(args.name || '', 'utf8');

    return setLengthAndFlush(io, 1);
  }

  getQueryMessage(sql) {
    const io = this._io
      .start()
      .writeInt8(Protocol.FrontendMessageCode.Query)
      .writeInt32BE(0) // Preserve header
      .writeCString(sql || '', 'utf8');

    return setLengthAndFlush(io, 1);
  }

  getFlushMessage() {
    return StaticFlushBuffer;
  }

  getTerminateMessage() {
    return StaticTerminateBuffer;
  }

  getSyncMessage() {
    return StaticSyncBuffer;
  }
}

function setLengthAndFlush(io, lengthOffset) {
  io.buffer.writeUInt32BE(io.length - lengthOffset, lengthOffset);

  return io.flush();
}
