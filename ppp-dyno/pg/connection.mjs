import { SafeEventEmitter } from './safe-event-emitter.mjs';
import { ConnectionState, DataTypeOIDs } from './definitions.mjs';
import { PreparedStatement } from './prepared-statement.mjs';
import { IntlConnection } from './intl-connection.mjs';
import { GlobalTypeMap } from './data-type-map.mjs';
import { BindParam } from './bind-param.mjs';

export class Connection extends SafeEventEmitter {
  constructor(arg0, arg1) {
    super();
    this._closing = false;

    if (arg0 && typeof arg0.acquire === 'function') {
      if (!(arg1 instanceof IntlConnection))
        throw new TypeError('Invalid argument.');

      this._pool = arg0;
      this._intlCon = arg1;
    } else this._intlCon = new IntlConnection(arg0);

    this._intlCon.on('ready', (...args) => this.emit('ready', ...args));
    this._intlCon.on('error', (...args) => this.emit('error', ...args));
    this._intlCon.on('close', (...args) => this.emit('close', ...args));
    this._intlCon.on('connecting', (...args) =>
      this.emit('connecting', ...args)
    );
    this._intlCon.on('ready', (...args) => this.emit('ready', ...args));
    this._intlCon.on('terminate', (...args) => this.emit('terminate', ...args));
  }

  /**
   * Returns configuration object
   */
  get config() {
    return this._intlCon.config;
  }

  /**
   * Returns true if connection is in a transaction
   */
  get inTransaction() {
    return this._intlCon.inTransaction;
  }

  /**
   * Returns current state of the connection
   */
  get state() {
    return this._intlCon.state;
  }

  /**
   * Returns processId of current session
   */
  get processID() {
    return this._intlCon.processID;
  }

  /**
   * Returns information parameters for current session
   */
  get sessionParameters() {
    return this._intlCon.sessionParameters;
  }

  /**
   * Returns secret key of current session
   */
  get secretKey() {
    return this._intlCon.secretKey;
  }

  /**
   * Connects to the server
   */
  async connect() {
    await this._intlCon.connect();

    if (this.state === ConnectionState.READY) this._closing = false;
  }

  /**
   * Closes connection. You can define how long time the connection will
   * wait for active queries before terminating the connection.
   * On the end of the given time, it forces to close the socket and than emits `terminate` event.
   *
   * @param terminateWait {number} - Determines how long the connection will wait for active queries before terminating.
   */
  async close(terminateWait) {
    this._intlCon.statementQueue.clear();

    if (this.state === ConnectionState.CLOSED || this._closing) return;

    this._closing = true;

    if (
      this._intlCon.refCount > 0 &&
      typeof terminateWait === 'number' &&
      terminateWait > 0
    ) {
      const startTime = Date.now();

      return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
          if (
            this._intlCon.refCount <= 0 ||
            Date.now() > startTime + terminateWait
          ) {
            clearInterval(timer);

            if (this._intlCon.refCount > 0) {
              this.emit('terminate');
            }

            this._close().then(resolve).catch(reject);
          }
        }, 50);
      });
    }

    await this._close();
  }

  /**
   * Executes single or multiple SQL scripts using Simple Query protocol.
   *
   * @param sql {string} - SQL script that will be executed
   * @param options - Execution options
   */
  execute(sql, options) {
    return this._intlCon.execute(sql, options).catch((e) => {
      throw this._handleError(e, sql);
    });
  }

  async query(sql, options) {
    this._intlCon.assertConnected();

    const typeMap = options?.typeMap || GlobalTypeMap;
    const paramTypes = options?.params?.map((prm) =>
      prm instanceof BindParam
        ? prm.oid
        : typeMap.determine(prm) || DataTypeOIDs.varchar
    );
    const statement = await this.prepare(sql, { paramTypes, typeMap }).catch(
      (e) => {
        throw this._handleError(e, sql);
      }
    );

    try {
      const params = options?.params?.map((prm) =>
        prm instanceof BindParam ? prm.value : prm
      );

      return await statement.execute({ ...options, params });
    } finally {
      await statement.close();
    }
  }

  /**
   * Creates a PreparedStatement instance
   * @param sql {string} - SQL script that will be executed
   * @param options - Options
   */
  async prepare(sql, options) {
    return await PreparedStatement.prepare(this, sql, options);
  }

  /**
   * Starts a transaction
   */
  startTransaction() {
    return this._intlCon.startTransaction();
  }

  /**
   * Commits current transaction
   */
  commit() {
    return this._intlCon.commit();
  }

  /**
   * Rolls back current transaction
   */
  rollback() {
    return this._intlCon.rollback();
  }

  /**
   * Starts transaction and creates a savepoint
   * @param name {string} - Name of the savepoint
   */
  async savepoint(name) {
    if (!this._intlCon.inTransaction) await this._intlCon.startTransaction();

    return this._intlCon.savepoint(name);
  }

  /**
   * Rolls back current transaction to given savepoint
   * @param name {string} - Name of the savepoint
   */
  rollbackToSavepoint(name) {
    return this._intlCon.rollbackToSavepoint(name);
  }

  /**
   * Releases savepoint
   * @param name {string} - Name of the savepoint
   */
  releaseSavepoint(name) {
    return this._intlCon.releaseSavepoint(name);
  }

  async _close() {
    if (this._pool) {
      await this._pool.release(this);
      this.emit('release');
    } else await this._intlCon.close();

    this._closing = false;
  }

  _handleError(err, script) {
    if (err.position) {
      let s = script.substring(0, err.position - 1);

      err.lineNr = s ? (s.match(/\n/g) || []).length : 0;

      const lineStart = s.lastIndexOf('\n') + 1;
      const lineEnd = script.indexOf('\n', lineStart);

      s = script.substring(0, lineStart);
      err.colNr = err.position - s.length;
      err.line =
        lineEnd > 0
          ? script.substring(lineStart, lineEnd)
          : script.substring(lineStart);
    }

    return err;
  }
}
