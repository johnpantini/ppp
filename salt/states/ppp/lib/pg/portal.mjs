import { DEFAULT_COLUMN_FORMAT } from './definitions.mjs';
import { Protocol } from './protocol/protocol.mjs';
import { GlobalTypeMap } from './data-type-map.mjs';
import { getIntlConnection } from './common.mjs';

export class Portal {
  constructor(statement, name) {
    this._columnFormat = DEFAULT_COLUMN_FORMAT;
    this._statement = statement;
    this._name = name;
  }

  get connection() {
    return this._statement.connection;
  }

  get name() {
    return this._name;
  }

  async bind(params, queryOptions) {
    const intoCon = getIntlConnection(this.connection);

    intoCon.ref();

    try {
      const socket = intoCon.socket;

      this._columnFormat =
        queryOptions.columnFormat != null
          ? queryOptions.columnFormat
          : Protocol.DataFormat.binary;

      socket.sendBindMessage({
        typeMap: queryOptions.typeMap || GlobalTypeMap,
        statement: this._statement.name,
        portal: this.name,
        paramTypes: this._statement.paramTypes,
        params,
        queryOptions
      });
      socket.sendFlushMessage();

      return await socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.BindComplete:
            done();

            break;
          case Protocol.BackendMessageCode.NoticeResponse:
            break;
          default:
            done(
              new Error(
                `Server returned unexpected response message (${String.fromCharCode(
                  code
                )}).`
              )
            );
        }
      });
    } finally {
      intoCon.unref();
    }
  }

  async retrieveFields() {
    const intoCon = getIntlConnection(this.connection);

    intoCon.ref();

    try {
      const socket = intoCon.socket;

      socket.sendDescribeMessage({ type: 'P', name: this.name });
      socket.sendFlushMessage();

      return await socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.NoticeResponse:
            break;
          case Protocol.BackendMessageCode.NoData:
            done();

            break;
          case Protocol.BackendMessageCode.RowDescription:
            done(undefined, msg.fields);

            break;
          default:
            done(
              new Error(
                `Server returned unexpected response message (${String.fromCharCode(
                  code
                )}).`
              )
            );
        }
      });
    } finally {
      intoCon.unref();
    }
  }

  async execute(fetchCount) {
    const intoCon = getIntlConnection(this.connection);

    intoCon.ref();

    try {
      const socket = intoCon.socket;

      socket.sendExecuteMessage({
        portal: this.name,
        fetchCount: fetchCount || 100
      });
      socket.sendFlushMessage();

      const rows = [];

      return await socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.NoticeResponse:
            break;
          case Protocol.BackendMessageCode.NoData:
            done(undefined, { code });

            break;
          case Protocol.BackendMessageCode.DataRow:
            if (Array.isArray(this._columnFormat)) {
              rows.push(
                msg.columns.map((buf, i) =>
                  this._columnFormat[i] === Protocol.DataFormat.text
                    ? buf.toString('utf8')
                    : buf
                )
              );
            } else if (this._columnFormat === Protocol.DataFormat.binary)
              rows.push(msg.columns);
            else rows.push(msg.columns.map((buf) => buf.toString('utf8')));

            break;
          case Protocol.BackendMessageCode.PortalSuspended:
            done(undefined, { code, rows });

            break;
          case Protocol.BackendMessageCode.CommandComplete:
            done(undefined, {
              code,
              rows,
              command: msg.command,
              rowCount: msg.rowCount
            });

            break;
          default:
            done(
              new Error(
                `Server returned unexpected response message (${String.fromCharCode(
                  code
                )}).`
              )
            );
        }
      });
    } finally {
      intoCon.unref();
    }
  }

  async close() {
    const intoCon = getIntlConnection(this.connection);

    intoCon.ref();

    try {
      const socket = intoCon.socket;

      socket.sendCloseMessage({ type: 'P', name: this.name });
      socket.sendSyncMessage();

      return await socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.NoticeResponse:
            break;
          case Protocol.BackendMessageCode.CloseComplete:
            break;
          case Protocol.BackendMessageCode.ReadyForQuery:
            intoCon.transactionStatus = msg.status;
            done();

            break;
          default:
            done(
              new Error(
                `Server returned unexpected response message (${String.fromCharCode(
                  code
                )}).`
              )
            );
        }
      });
    } finally {
      intoCon.unref();
    }
  }
}
