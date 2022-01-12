import { TaskQueue } from './task-queue.mjs';
import { PgSocket } from './protocol/pg-socket.mjs';
import { SafeEventEmitter } from './safe-event-emitter.mjs';
import { ConnectionState } from './definitions.mjs';
import { getConnectionConfig } from './util/connection-config.mjs';
import { Protocol } from './protocol/protocol.mjs';
import { GlobalTypeMap } from './data-type-map.mjs';
import {
  convertRowToObject,
  getParsers,
  parseRow,
  wrapRowDescription,
  coerceToBoolean
} from './common.mjs';
import { escapeLiteral } from './util/escape-literal.mjs';

const DataFormat = Protocol.DataFormat;

export class IntlConnection extends SafeEventEmitter {
  constructor(config) {
    super();
    this._refCount = 0;
    this.transactionStatus = 'I';
    this.statementQueue = new TaskQueue();
    this._config = Object.freeze(getConnectionConfig(config));
    this.socket = new PgSocket(this._config);
    this.socket.on('error', (err) => this._onError(err));
    this.socket.on('close', () => this.emit('close'));
    this.socket.on('connecting', () => this.emit('connecting'));
    this._onErrorSavePoint = 'SP_' + Math.round(Math.random() * 100000000);
  }

  get config() {
    return this._config;
  }

  get inTransaction() {
    return this.transactionStatus === 'T' || this.transactionStatus === 'E';
  }

  get state() {
    return this.socket.state;
  }

  get refCount() {
    return this._refCount;
  }

  get processID() {
    return this.socket.processID;
  }

  get secretKey() {
    return this.socket.secretKey;
  }

  get sessionParameters() {
    return this.socket.sessionParameters;
  }

  async connect() {
    if (this.socket.state === ConnectionState.READY) return;

    await new Promise((resolve, reject) => {
      const handleConnectError = (err) => reject(err);

      this.socket.once('ready', () => {
        this.socket.removeListener('error', handleConnectError);
        resolve();
      });
      this.socket.once('error', handleConnectError);
      this.socket.connect();
    });

    let startupCommand = '';

    if (this.config.schema)
      startupCommand +=
        'SET search_path = ' + escapeLiteral(this.config.schema) + ';';

    if (this.config.timezone)
      startupCommand +=
        'SET timezone TO ' + escapeLiteral(this.config.timezone) + ';';

    if (startupCommand)
      await this.execute(startupCommand, { autoCommit: true });

    this.emit('ready');
  }

  async close() {
    if (this.state === ConnectionState.CLOSED) return;

    this.statementQueue.clear();

    return new Promise((resolve) => {
      if (this.socket.state === ConnectionState.CLOSED) return;

      this.socket.once('close', resolve);
      this.socket.sendTerminateMessage(() => {
        this.socket.close();
        this.emit('close');
      });
    });
  }

  async execute(sql, options, cb) {
    this.assertConnected();

    return this.statementQueue.enqueue(async () => {
      const transactionCommand = sql.match(
        /^(\bBEGIN\b|\bCOMMIT\b|\bROLLBACK|SAVEPOINT|RELEASE\b)/i
      );
      let beginFirst = false;
      let commitLast = false;

      if (!transactionCommand) {
        if (
          !this.inTransaction &&
          (options?.autoCommit != null
            ? options?.autoCommit
            : this.config.autoCommit) === false
        ) {
          beginFirst = true;
        }

        if (this.inTransaction && options?.autoCommit) commitLast = true;
      }

      if (beginFirst) await this._execute('BEGIN');

      const onErrorRollback =
        !transactionCommand &&
        (options?.onErrorRollback != null
          ? options.onErrorRollback
          : coerceToBoolean(this.config.onErrorRollback, true));

      if (this.inTransaction && onErrorRollback)
        await this._execute('SAVEPOINT ' + this._onErrorSavePoint);

      try {
        const result = await this._execute(sql, options, cb);

        if (commitLast) await this._execute('COMMIT');
        else if (this.inTransaction && onErrorRollback)
          await this._execute('RELEASE ' + this._onErrorSavePoint + ';');

        return result;
      } catch (e) {
        if (this.inTransaction && onErrorRollback)
          await this._execute('ROLLBACK TO ' + this._onErrorSavePoint + ';');

        throw e;
      }
    });
  }

  async startTransaction() {
    if (!this.inTransaction) await this.execute('BEGIN');
  }

  async savepoint(name) {
    if (!(name && name.match(/^[a-zA-Z]\w+$/)))
      throw new Error(`Invalid savepoint "${name}`);

    await this.execute('BEGIN; SAVEPOINT ' + name);
  }

  async commit() {
    if (this.inTransaction) await this.execute('COMMIT');
  }

  async rollback() {
    if (this.inTransaction) await this.execute('ROLLBACK');
  }

  async rollbackToSavepoint(name) {
    if (!(name && name.match(/^[a-zA-Z]\w+$/)))
      throw new Error(`Invalid savepoint "${name}`);

    await this.execute('ROLLBACK TO SAVEPOINT ' + name, { autoCommit: false });
  }

  async releaseSavepoint(name) {
    if (!(name && name.match(/^[a-zA-Z]\w+$/)))
      throw new Error(`Invalid savepoint "${name}`);

    await this.execute('RELEASE SAVEPOINT ' + name, { autoCommit: false });
  }

  ref() {
    this._refCount++;
  }

  unref() {
    this._refCount--;

    return !this._refCount;
  }

  assertConnected() {
    if (this.state === ConnectionState.CLOSING)
      throw new Error('Connection is closing');

    if (this.state === ConnectionState.CLOSED)
      throw new Error('Connection closed');
  }

  async _execute(sql, options, cb) {
    this.ref();

    try {
      const startTime = Date.now();
      const result = {
        totalCommands: 0,
        totalTime: 0,
        results: []
      };
      const opts = options || {};

      this.socket.sendQueryMessage(sql);

      let currentStart = Date.now();
      let parsers;
      let current = { command: undefined };
      let fields;
      const typeMap = opts.typeMap || GlobalTypeMap;

      return await this.socket.capture(async (code, msg, done) => {
        switch (code) {
          case Protocol.BackendMessageCode.NoticeResponse:
          case Protocol.BackendMessageCode.CopyInResponse:
          case Protocol.BackendMessageCode.CopyOutResponse:
          case Protocol.BackendMessageCode.EmptyQueryResponse:
            break;
          case Protocol.BackendMessageCode.RowDescription:
            fields = msg.fields;
            parsers = getParsers(typeMap, fields);
            current.fields = wrapRowDescription(
              typeMap,
              fields,
              DataFormat.text
            );
            current.rows = [];

            break;
          case Protocol.BackendMessageCode.DataRow:
            let row = msg.columns.map((x) => {
              if (x === null) return null;

              return x.toString('utf8');
            });

            parseRow(parsers, row, opts);

            if (opts.objectRows && current.fields)
              row = convertRowToObject(current.fields, row);

            if (cb) cb('row', row);

            current.rows = current.rows || [];
            current.rows.push(row);

            break;
          case Protocol.BackendMessageCode.CommandComplete:
            // Ignore BEGIN command that we added to sql
            current.command = msg.command;

            if (
              current.command === 'DELETE' ||
              current.command === 'INSERT' ||
              current.command === 'UPDATE'
            )
              current.rowsAffected = msg.rowCount;

            current.executeTime = Date.now() - currentStart;

            if (current.rows)
              current.rowType =
                opts.objectRows && current.fields ? 'object' : 'array';

            result.results.push(current);

            if (cb) cb('command-complete', current);

            current = { command: undefined };
            currentStart = Date.now();

            break;
          case Protocol.BackendMessageCode.ReadyForQuery:
            this.transactionStatus = msg.status;
            result.totalTime = Date.now() - startTime;
            // Ignore COMMIT command that we added to sql
            result.totalCommands = result.results.length;
            done(undefined, result);
        }
      });
    } finally {
      this.unref();
    }
  }

  _onError(err) {
    if (this.socket.state !== ConnectionState.READY) return;

    this.emit('error', err);
  }
}
