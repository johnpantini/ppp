import { DEFAULT_COLUMN_FORMAT } from './definitions.mjs';
import { SafeEventEmitter } from './safe-event-emitter.mjs';
import { Protocol } from './protocol/protocol.mjs';
import { Portal } from './portal.mjs';
import {
  convertRowToObject,
  getIntlConnection,
  getParsers,
  parseRow,
  wrapRowDescription,
  coerceToBoolean
} from './common.mjs';
import { GlobalTypeMap } from './data-type-map.mjs';

let statementCounter = 0;
let portalCounter = 0;

export class PreparedStatement extends SafeEventEmitter {
  constructor(connection, sql, paramTypes) {
    super();
    this._sql = '';
    this._name = '';
    this._refCount = 0;
    this._connection = connection;
    this._name = 'S_' + ++statementCounter;
    this._sql = sql;
    this._paramTypes = paramTypes;
    this._onErrorSavePoint = 'SP_' + Math.round(Math.random() * 100000000);
  }

  static async prepare(connection, sql, options) {
    const intoCon = getIntlConnection(connection);

    intoCon.assertConnected();

    const socket = intoCon.socket;
    const statement = new PreparedStatement(
      connection,
      sql,
      options?.paramTypes
    );

    await intoCon.statementQueue.enqueue(async () => {
      intoCon.ref();

      try {
        socket.sendParseMessage({
          statement: statement.name,
          sql: statement.sql,
          paramTypes: statement.paramTypes
        });
        socket.sendFlushMessage();

        try {
          await socket.capture(async (code, msg, done) => {
            switch (code) {
              case Protocol.BackendMessageCode.NoticeResponse:
                break;
              case Protocol.BackendMessageCode.ParseComplete:
                done();

                break;
              default:
                done(
                  new Error(
                    `Server returned unexpected response message (0x${code.toString(
                      16
                    )}).`
                  )
                );
            }
          });
        } finally {
          socket.sendSyncMessage();
          await socket.capture(async (code, msg, done) => {
            switch (code) {
              case Protocol.BackendMessageCode.NoticeResponse:
                break;
              case Protocol.BackendMessageCode.ReadyForQuery:
                done();

                break;
              default:
                done(
                  new Error(
                    `Server returned unexpected response message (0x${code.toString(
                      16
                    )}).`
                  )
                );
            }
          });
        }
      } finally {
        intoCon.unref();
      }
    });
    statement._refCount = 1;

    return statement;
  }

  get connection() {
    return this._connection;
  }

  get name() {
    return this._name;
  }

  get sql() {
    return this._sql;
  }

  get paramTypes() {
    return this._paramTypes;
  }

  async execute(options = {}) {
    const intlCon = getIntlConnection(this.connection);
    const transactionCommand = this.sql.match(
      /^(\bBEGIN\b|\bCOMMIT\b|\bROLLBACK|SAVEPOINT|RELEASE\b)/i
    );
    let beginFirst = false;
    let commitLast = false;

    if (!transactionCommand) {
      if (
        !intlCon.inTransaction &&
        (options?.autoCommit != null
          ? options?.autoCommit
          : intlCon.config.autoCommit) === false
      ) {
        beginFirst = true;
      }

      if (intlCon.inTransaction && options?.autoCommit) commitLast = true;
    }

    if (beginFirst) await intlCon.execute('BEGIN');

    const onErrorRollback =
      !transactionCommand &&
      (options?.onErrorRollback != null
        ? options.onErrorRollback
        : coerceToBoolean(intlCon.config.onErrorRollback, true));

    if (intlCon.inTransaction && onErrorRollback)
      await intlCon.execute('SAVEPOINT ' + this._onErrorSavePoint);

    try {
      const result = await intlCon.statementQueue.enqueue(() =>
        this._execute(options)
      );

      if (commitLast) await intlCon.execute('COMMIT');
      else if (intlCon.inTransaction && onErrorRollback)
        await intlCon.execute('RELEASE ' + this._onErrorSavePoint + ';');

      return result;
    } catch (e) {
      if (intlCon.inTransaction && onErrorRollback)
        await intlCon.execute('ROLLBACK TO ' + this._onErrorSavePoint + ';');

      throw e;
    }
  }

  async close() {
    --this._refCount;

    if (this._refCount > 0) return;

    const intoCon = getIntlConnection(this.connection);

    await intoCon.statementQueue.enqueue(() => this._close());
  }

  async cancel() {
    throw new Error('Not implemented yet.');
  }

  async _execute(options = {}) {
    let portal;
    const intlCon = getIntlConnection(this.connection);

    intlCon.ref();

    try {
      const result = { command: undefined };
      const startTime = Date.now();
      const t = Date.now();
      // Create portal
      const portalName = 'P_' + ++portalCounter;

      portal = new Portal(this, portalName);
      await portal.bind(options.params, options);

      const fields = await portal.retrieveFields();
      const typeMap = options.typeMap || GlobalTypeMap;
      let parsers;
      let resultFields;

      if (fields) {
        parsers = getParsers(typeMap, fields);
        resultFields = wrapRowDescription(
          typeMap,
          fields,
          options.columnFormat || DEFAULT_COLUMN_FORMAT
        );
        result.fields = resultFields;
        result.rowType = options.objectRows ? 'object' : 'array';

        if (options.cursor) {
          throw new Error('Not implemented yet.');
        }
      }

      const executeResult = await portal.execute(options.fetchCount);

      result.executeTime = Date.now() - t;

      if (executeResult.command) result.command = executeResult.command;

      if (resultFields && parsers && executeResult.rows) {
        if (!result.command) result.command = 'SELECT';

        const rows = (result.rows = executeResult.rows);
        const l = rows.length;
        let row;

        for (let i = 0; i < l; i++) {
          row = rows[i];
          parseRow(parsers, row, options);

          if (options.objectRows) {
            rows[i] = convertRowToObject(resultFields, row);
          }
        }
      }

      if (
        result.command === 'DELETE' ||
        result.command === 'INSERT' ||
        result.command === 'UPDATE'
      )
        result.rowsAffected = executeResult.rowCount;

      result.executeTime = Date.now() - startTime;

      return result;
    } finally {
      intlCon.unref();

      if (portal) await portal.close();
    }
  }

  async _close() {
    if (--this._refCount > 0) return;

    const intoCon = getIntlConnection(this.connection);

    intoCon.ref();

    try {
      const socket = intoCon.socket;

      socket.sendCloseMessage({ type: 'S', name: this.name });
      socket.sendSyncMessage();
      await socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.NoticeResponse:
            this.emit('notice', msg);

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
                `Server returned unexpected response message (0x${code.toString(
                  16
                )}).`
              )
            );
        }
      });
    } finally {
      intoCon.unref();
    }

    this.emit('close');
  }
}
