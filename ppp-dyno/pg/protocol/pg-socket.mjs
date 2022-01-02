import net from 'net';
import tls from 'tls';
import crypto from 'crypto';
import { SafeEventEmitter } from '../safe-event-emitter.mjs';
import { Backend } from './backend.mjs';
import { Frontend } from './frontend.mjs';
import { Protocol } from './protocol.mjs';
import { ConnectionState } from '../definitions.mjs';
import { DatabaseError } from './database-error.mjs';
import { SASL } from './sasl.mjs';

const isPromise = function (o) {
  return (
    o &&
    (o instanceof global.Promise ||
      (typeof o === 'object' &&
        typeof o.then === 'function' &&
        typeof o.catch === 'function'))
  );
};

const DEFAULT_PORT_NUMBER = 5432;
const COMMAND_RESULT_PATTERN = /^([^\d]+)(?: (\d+)(?: (\d+))?)?$/;

export class PgSocket extends SafeEventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this._state = ConnectionState.CLOSED;
    this._backend = new Backend();
    this._frontend = new Frontend();
    this._sessionParameters = {};
    this.setMaxListeners(99);
  }

  get state() {
    if (!this._socket || this._socket.destroyed)
      this._state = ConnectionState.CLOSED;

    return this._state;
  }

  get processID() {
    return this._processID;
  }

  get secretKey() {
    return this._secretKey;
  }

  get sessionParameters() {
    return this._sessionParameters;
  }

  connect() {
    if (this._socket) return;

    this._state = ConnectionState.CONNECTING;

    const options = this.options;
    const socket = (this._socket = new net.Socket());
    const errorHandler = (err) => {
      this._state = ConnectionState.CLOSED;
      this._removeListeners();
      this._reset();
      socket.destroy();
      this._socket = undefined;
      this.emit('error', err);
    };
    const connectHandler = () => {
      socket.setTimeout(0);

      if (this.options.keepAlive || this.options.keepAlive == null)
        socket.setKeepAlive(true);

      if (options.ssl) {
        socket.write(this._frontend.getSSLRequestMessage());
        socket.once('data', (x) => {
          this._removeListeners();

          if (x.toString() === 'S') {
            const tslOptions = { ...options.ssl, socket };

            if (options.host && net.isIP(options.host) === 0)
              tslOptions.servername = options.host;

            const tlsSocket = (this._socket = tls.connect(tslOptions));

            tlsSocket.once('error', errorHandler);
            tlsSocket.once('secureConnect', () => {
              this._removeListeners();
              this._handleConnect();
            });

            return;
          }

          if (x.toString() === 'N')
            return errorHandler(
              new Error('Server does not support SSL connections')
            );

          return errorHandler(
            new Error('There was an error establishing an SSL connection')
          );
        });
      } else {
        this._handleConnect();
      }
    };

    socket.setNoDelay(true);
    socket.setTimeout(options.connectTimeoutMs || 30000, () =>
      errorHandler(new Error('Connection timed out'))
    );
    socket.once('error', errorHandler);
    socket.once('connect', connectHandler);
    this.emit('connecting');

    if (options.host && options.host.startsWith('/'))
      socket.connect(options.host);
    else
      socket.connect(
        options.port || DEFAULT_PORT_NUMBER,
        options.host || 'localhost'
      );
  }

  close() {
    if (!this._socket || this._socket.destroyed) {
      this._state = ConnectionState.CLOSED;
      this._socket = undefined;
      this._reset();

      return;
    }

    if (this._state === ConnectionState.CLOSING) return;

    const socket = this._socket;

    this._state = ConnectionState.CLOSING;
    this._removeListeners();
    socket.once('close', () => this._handleClose());
    socket.destroy();
  }

  sendParseMessage(args, cb) {
    this._send(this._frontend.getParseMessage(args), cb);
  }

  sendBindMessage(args, cb) {
    this._send(this._frontend.getBindMessage(args), cb);
  }

  sendDescribeMessage(args, cb) {
    this._send(this._frontend.getDescribeMessage(args), cb);
  }

  sendExecuteMessage(args, cb) {
    this._send(this._frontend.getExecuteMessage(args), cb);
  }

  sendCloseMessage(args, cb) {
    this._send(this._frontend.getCloseMessage(args), cb);
  }

  sendQueryMessage(sql, cb) {
    this._send(this._frontend.getQueryMessage(sql), cb);
  }

  sendFlushMessage(cb) {
    this._send(this._frontend.getFlushMessage(), cb);
  }

  sendTerminateMessage(cb) {
    this._send(this._frontend.getTerminateMessage(), cb);
  }

  sendSyncMessage() {
    this._send(this._frontend.getSyncMessage());
  }

  capture(callback) {
    return new Promise((resolve, reject) => {
      const done = (err, result) => {
        this.removeListener('error', errorHandler);
        this.removeListener('message', msgHandler);

        if (err) reject(err);
        else resolve(result);
      };
      const errorHandler = (err) => {
        this.removeListener('message', msgHandler);
        reject(err);
      };
      const msgHandler = (code, msg) => {
        const x = callback(code, msg, done);

        if (isPromise(x)) x.catch((err) => done(err));
      };

      this.once('error', errorHandler);
      this.on('message', msgHandler);
    });
  }

  _removeListeners() {
    if (!this._socket) return;

    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('data');
    this._socket.removeAllListeners('close');
  }

  _reset() {
    this._backend.reset();
    this._sessionParameters = {};
    this._processID = undefined;
    this._secretKey = undefined;
    this._saslSession = undefined;
  }

  _handleConnect() {
    const socket = this._socket;

    if (!socket) return;

    this._state = ConnectionState.AUTHORIZING;
    this._reset();
    socket.on('data', (data) => this._handleData(data));
    socket.on('error', (err) => this._handleError(err));
    socket.on('close', () => this._handleClose());
    this._send(
      this._frontend.getStartupMessage({
        user: this.options.user || 'postgres',
        database: this.options.database || ''
      })
    );
  }

  _handleClose() {
    this._reset();
    this._socket = undefined;
    this._state = ConnectionState.CLOSED;
    this.emit('close');
  }

  _handleError(err) {
    if (this._state !== ConnectionState.READY) {
      this._socket?.end();
    }

    this.emit('error', err);
  }

  _handleData(data) {
    this._backend.parse(data, (code, payload) => {
      try {
        switch (code) {
          case Protocol.BackendMessageCode.Authentication:
            this._handleAuthenticationMessage(payload);

            break;
          case Protocol.BackendMessageCode.ErrorResponse:
            this.emit('error', new DatabaseError(payload));

            break;
          case Protocol.BackendMessageCode.NoticeResponse:
            this.emit('notice', payload);

            break;
          case Protocol.BackendMessageCode.ParameterStatus:
            this._handleParameterStatus(payload);

            break;
          case Protocol.BackendMessageCode.BackendKeyData:
            this._handleBackendKeyData(payload);

            break;
          case Protocol.BackendMessageCode.ReadyForQuery:
            if (this._state !== ConnectionState.READY) {
              this._state = ConnectionState.READY;
              this.emit('ready');
            } else this.emit('message', code, payload);

            break;
          case Protocol.BackendMessageCode.CommandComplete: {
            const msg = this._handleCommandComplete(payload);

            this.emit('message', code, msg);

            break;
          }
          default:
            this.emit('message', code, payload);
        }
      } catch (e) {
        this._handleError(e);
      }
    });
  }

  _resolvePassword(cb) {
    (async () => {
      const pass =
        typeof this.options.password === 'function'
          ? await this.options.password()
          : this.options.password;

      cb(pass || '');
    })().catch((err) => this._handleError(err));
  }

  _handleAuthenticationMessage(msg) {
    if (!msg) {
      this.emit('authenticate');

      return;
    }

    switch (msg.kind) {
      case Protocol.AuthenticationMessageKind.CleartextPassword:
        this._resolvePassword((password) => {
          this._send(this._frontend.getPasswordMessage(password));
        });

        break;
      case Protocol.AuthenticationMessageKind.MD5Password:
        this._resolvePassword((password) => {
          const md5 = (x) =>
            crypto.createHash('md5').update(x, 'utf8').digest('hex');
          const l = md5(password + this.options.user);
          const r = md5(Buffer.concat([Buffer.from(l), msg.salt]));
          const pass = 'md5' + r;

          this._send(this._frontend.getPasswordMessage(pass));
        });

        break;
      case Protocol.AuthenticationMessageKind.SASL: {
        if (!msg.mechanisms.includes('SCRAM-SHA-256'))
          throw new Error(
            'SASL: Only mechanism SCRAM-SHA-256 is currently supported'
          );

        const saslSession = (this._saslSession = SASL.createSession(
          this.options.user || '',
          'SCRAM-SHA-256'
        ));

        this._send(this._frontend.getSASLMessage(saslSession));

        break;
      }
      case Protocol.AuthenticationMessageKind.SASLContinue: {
        const saslSession = this._saslSession;

        if (!saslSession) throw new Error('SASL: Session not started yet');

        this._resolvePassword((password) => {
          SASL.continueSession(saslSession, password, msg.data);

          const buf = this._frontend.getSASLFinalMessage(saslSession);

          this._send(buf);
        });

        break;
      }
      case Protocol.AuthenticationMessageKind.SASLFinal: {
        const session = this._saslSession;

        if (!session) throw new Error('SASL: Session not started yet');

        SASL.finalizeSession(session, msg.data);
        this._saslSession = undefined;

        break;
      }
    }
  }

  _handleParameterStatus(msg) {
    this._sessionParameters[msg.name] = msg.value;
  }

  _handleBackendKeyData(msg) {
    this._processID = msg.processID;
    this._secretKey = msg.secretKey;
  }

  _handleCommandComplete(msg) {
    const m = msg.command && msg.command.match(COMMAND_RESULT_PATTERN);
    const result = {
      command: m[1]
    };

    if (m[3] != null) {
      result.oid = parseInt(m[2], 10);
      result.rowCount = parseInt(m[3], 10);
    } else if (m[2]) result.rowCount = parseInt(m[2], 10);

    return result;
  }

  _send(data, cb) {
    if (this._socket && this._socket.writable) {
      this._socket.write(data, cb);
    }
  }
}
