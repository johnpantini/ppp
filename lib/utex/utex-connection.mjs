import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { inspect } from 'util';
import { EventEmitter } from 'events';
import { MessageType } from './message-type.mjs';

const ROOT = process.env.DOCKERIZED ? '../..' : '/ppp';
const { fetchWithTimeout } = await import(
  `${ROOT}/lib/aspirant-worker/utils.mjs`
);
const { default: lzma } = await import(`${ROOT}/vendor/lzma/index.js`);
const { default: protobuf } = await import(`${ROOT}/vendor/protobuf.min.js`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messages = protobuf.loadSync(path.join(__dirname, 'utex.proto'));

function isJWTTokenExpired(jwtToken) {
  if (jwtToken) {
    try {
      const [, payload] = jwtToken.split('.');
      const { exp: expires } = JSON.parse(
        Buffer.from(payload, 'base64').toString()
      );

      if (typeof expires === 'number') {
        return Date.now() + 1000 >= expires * 1000;
      }
    } catch {
      return true;
    }
  }

  return true;
}

async function fetchViaProxy(url, options = {}, allowedHeaders = []) {
  const globalProxy = process.env.GLOBAL_PROXY_URL;

  options.timeot = 30000;

  if (globalProxy) {
    process.env.DEBUG === 'true' &&
      console.log('Fetching via proxy:', globalProxy);

    const urlObject = new URL(url);

    options.headers ??= {};
    options.headers['X-Host'] = urlObject.hostname;

    for (const h of Object.keys(options.headers)) {
      const lower = h.toLowerCase();

      if (lower === 'x-host') {
        continue;
      }

      if (!allowedHeaders.includes(lower)) {
        allowedHeaders.push(h);
      }
    }

    options.headers['X-Allowed-Headers'] = allowedHeaders.join(',');
    urlObject.hostname = new URL(globalProxy).hostname;

    return fetchWithTimeout(urlObject.toString(), options);
  } else {
    return fetchWithTimeout(url, options);
  }
}

export class UtexConnection extends EventEmitter {
  #reconnectionTime = parseInt(process.env.UTEX_RECONNECTION_TIME ?? '1000');

  #keepAliveDelay = parseInt(process.env.UTEX_KEEP_ALIVE_DELAY ?? '0');

  #host;

  #port;

  #messageTypes = Object.keys(MessageType);

  #length = 0;

  #accessToken;

  #refreshToken;

  #key;

  #secret;

  #buffer = Buffer.from([]);

  #socket;

  authenticated = false;

  #pendingConnection;

  #reconnectTimeout;

  #refTrades = new Map();

  #refQuotes = new Map();

  clients = new Set();

  async #authenticate() {
    const accessToken = this.#accessToken;

    if (
      accessToken instanceof Promise ||
      (typeof accessToken === 'string' && !isJWTTokenExpired(accessToken))
    ) {
      return accessToken;
    } else {
      this.#accessToken = new Promise(async (resolve, reject) => {
        try {
          let tokensData;
          const refreshToken =
            process.env.UTEX_DEBUG_REFRESH_TOKEN ?? this.#refreshToken;

          if (isJWTTokenExpired(refreshToken)) {
            const tokensResponse = await fetchViaProxy(
              'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
              {
                method: 'POST',
                headers: {
                  'User-Agent':
                    process.env.UTEX_USER_AGENT ??
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  realm: 'aurora',
                  clientId: 'utexweb',
                  loginOrEmail: this.#key,
                  password: this.#secret,
                  product: 'UTEX',
                  locale: 'ru'
                })
              }
            );

            tokensData = await tokensResponse.json();
          } else {
            // Refresh token is OK - try to refresh the access token.
            const refreshAuthResponse = await fetchViaProxy(
              'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.refreshAuthorization',
              {
                method: 'POST',
                headers: {
                  'User-Agent':
                    process.env.UTEX_USER_AGENT ??
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  realm: 'aurora',
                  clientId: 'utexweb',
                  refreshToken
                })
              }
            );

            tokensData = await refreshAuthResponse.json();

            if (tokensData.accessToken && tokensData.refreshToken) {
              tokensData.tokens = {
                accessToken: tokensData.accessToken,
                refreshToken: tokensData.refreshToken
              };
            }
          }

          if (tokensData.tokens?.accessToken) {
            this.#accessToken = tokensData.tokens.accessToken;
            this.#refreshToken = tokensData.tokens.refreshToken;

            resolve(this.#accessToken);
          } else {
            this.#accessToken = void 0;
            this.#refreshToken = void 0;

            if (
              !tokensData?.tokens ||
              /NoActiveSessionException|InvalidCredentialsException/i.test(
                tokensData?.type
              )
            ) {
              // Unrecoverable error.
              this.#accessToken = false;

              this.emit('AuthorizationError', [
                { T: 'error', code: 402, msg: 'auth failed' }
              ]);
            } else if (/BlockingException/i.test(tokensData?.type)) {
              console.log(tokensData);

              this.#accessToken = false;

              this.emit('AuthorizationError', [
                { T: 'error', code: 429, msg: 'auth failed' }
              ]);
            } else if (!tokensData.tokens && tokensData.secondFactorRequestId) {
              this.#accessToken = false;

              this.emit('AuthorizationError', [
                { T: 'error', code: 404, msg: 'auth timeout' }
              ]);
            }

            resolve();
          }
        } catch (e) {
          this.#accessToken = void 0;
          this.#refreshToken = void 0;

          reject(e);
        }
      }).catch((e) => {
        console.error(e);

        this.#accessToken = void 0;
        this.#refreshToken = void 0;
      });

      return this.#accessToken;
    }
  }

  #onDataReceived(data) {
    // XX XX XX XX YY YY ZZ ZZ ...
    // 49 00 00 00 C9 00 0A 12 ...
    // XX - length (49 00 00 00) without these 4 bytes
    // YY - type (C9 00)
    // ZZ = payload (0A 12)

    try {
      this.#handleData(data);
    } catch (e) {
      console.error(e);
    }
  }

  #handleData(data) {
    this.#buffer = Buffer.concat([this.#buffer, data]);

    if (this.#buffer.length >= 4) {
      if (this.#length === 0) {
        this.#length = this.#buffer.readInt32LE(0);
      }

      if (this.#length + 4 === this.#buffer.length) {
        this.#handleMessage(this.#buffer);
      } else if (this.#buffer.length > this.#length + 4) {
        const message = Buffer.alloc(this.#length + 4);

        this.#buffer.copy(message, 0, 0, this.#length + 4);

        const rest = Buffer.alloc(this.#buffer.length - (this.#length + 4));

        this.#buffer.copy(rest, 0, this.#length + 4);

        this.#handleMessage(message);
        this.#onDataReceived(rest);
      }
    }
  }

  #handleMessage(data) {
    this.#length = 0;
    this.#buffer = Buffer.from([]);

    this.#readProtoMessage(data);
  }

  #isPackableMessage(messageType) {
    if (messageType === 'PrintsHistoryResponse') return true;

    if (messageType === 'AllSymbolsResponse') return true;

    if (messageType === 'AllSymbolsSnapshot') return true;

    if (messageType === 'TradingSnapshot') return true;

    if (messageType === 'HistoryChartResponse') return true;

    return messageType === 'ImbalanceSnapShot';
  }

  #readProtoMessage(buffer) {
    const messageTypeId = buffer.readInt16LE(4);
    const protoBody = Buffer.alloc(buffer.length - 6);

    buffer.copy(protoBody, 0, 6);

    const messageType = this.#messageTypes.find(
      (t) => MessageType[t] === messageTypeId
    );

    if (typeof messageType !== 'undefined') {
      const type = messages.lookupType('utex.' + messageType);

      if (!type) {
        this.debug('Unknown message type: ' + messageType);

        return;
      }

      try {
        if (this.#isPackableMessage(messageType)) {
          const result = Buffer.from(lzma.decompress(protoBody));
          const decompressedPayload = type.decode(result);

          if (typeof this[messageType] === 'function') {
            this[messageType](decompressedPayload);
          }

          this.emit(messageType, decompressedPayload, buffer, result);
        } else {
          const payload = type.decode(protoBody);

          if (typeof this[messageType] === 'function') {
            this[messageType](payload);
          }

          this.emit(messageType, payload, buffer, protoBody);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  #createReqId() {
    // Example: <Buffer 09 55 a4 d3 f7 46 26 82 47 11 b9 ac be c9 f2 0e a2 8f>
    // Example: <Buffer 09 00 00 00 00 00 00 00 00 11 00 00 00 00 00 00 00 00>
    // return Buffer.from(`09 00 00 00 00 00 00 00 00 11 00 00 00 00 00 00 00 00`.split(' ').map(i => parseInt(i, 16)));

    const result = Buffer.from(
      new Array(18).fill(0).map((i) => (Math.random() * 255) | 0)
    );

    result[0] = 0x09;
    result[9] = 0x11;

    return result;
  }

  #makeProtoMessage(messageType, payload) {
    const messageTypeId = MessageType[messageType];
    const type = messages.lookupType('utex.' + messageType);

    if (!type) {
      this.debug('Unknown message type: ' + messageType);

      return;
    }

    const message = type.create(payload);
    const protoBuffer = type.encode(message).finish();
    const result = Buffer.alloc(protoBuffer.length + 6);

    result.writeInt32LE(protoBuffer.length + 2, 0);
    result.writeInt16LE(messageTypeId, 4);
    protoBuffer.copy(result, 6, 0);

    return result;
  }

  debug(message) {
    process.env.DEBUG === 'true' &&
      console.log(
        `[${this.#key ?? 'UTEXConnection'}] ` + inspect(message, { depth: 10 })
      );
  }

  async connect(reconnect) {
    this.debug(
      `reconnect arg: ${!!reconnect}, this.authenticated: ${
        this.authenticated
      }, this.#pendingConnection: ${this.#pendingConnection}`
    );

    clearTimeout(this.#reconnectTimeout);

    if (reconnect) {
      this.#pendingConnection = void 0;
      this.authenticated = false;
    }

    if (this.authenticated) {
      return this.#socket;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise(async (resolve, reject) => {
        try {
          if (this.#socket) {
            this.debug('Calling removeAllListeners() on this.#socket...');
            this.#socket.removeAllListeners();
          }

          this.debug('Authenticating...');
          await this.#authenticate();

          if (this.#accessToken) {
            this.debug('Authenticated. Creating new socket...');

            this.#socket = new net.Socket();

            this.#socket.on('connect', () => {
              this.debug(`${this.#host}:${this.#port} connection established.`);
              this.#socket.setKeepAlive(
                true,
                Math.max(this.#keepAliveDelay ?? 0, 1000)
              );

              this.#pendingConnection = void 0;
              this.authenticated = false;

              const tokenLoginMessage = this.#makeProtoMessage('TokenLogin', {
                Mode: 1,
                JwtToken: this.#accessToken
              });

              this.once('ConnectionPermit', () => {
                this.#pendingConnection = void 0;
                this.authenticated = true;

                resolve(this.#socket);
              });

              this.debug('TokenLoginMessage sent.');
              this.#socket.write(tokenLoginMessage);
            });

            this.#socket.on('end', () => {
              // Emitted when the other end of the socket signals the end of transmission,
              // thus ending the readable side of the socket.
              this.debug(
                `${this.#host}:${this.#port} connection ended by the server.`
              );

              this.#pendingConnection = void 0;
              this.authenticated = false;

              this.emit('end');
            });

            this.#socket.on('close', () => {
              // Emitted once the socket is fully closed.
              this.debug(`${this.#host}:${this.#port} connection closed.`);

              this.#pendingConnection = void 0;
              this.authenticated = false;

              this.#refTrades.clear();
              this.#refQuotes.clear();
              this.emit('close');
              this.#socket.destroy();

              this.clients.forEach((ws) => {
                if (!ws.closed) {
                  ws.close();
                }

                this.clients.delete(ws);
              });

              this.debug(
                `Reconnecting on close in ${this.#reconnectionTime / 1000}s...`
              );

              this.#reconnectTimeout = setTimeout(
                () => this.connect(true),
                this.#reconnectionTime
              );
            });

            this.#socket.on('error', () => {
              this.debug(`${this.#host}:${this.#port} connection error.`);
            });

            this.#socket.on('data', (data) => this.#onDataReceived(data));

            this.debug(`Connecting to ${this.#host}:${this.#port}...`);
            this.#socket.connect({
              host: this.#host,
              port: this.#port,
              family: 4
            });
          } else {
            this.debug('Authentication failed.');

            this.#pendingConnection = void 0;
            this.authenticated = false;

            const unrecoverableError = this.#accessToken === false;

            let reconnectionTime = unrecoverableError
              ? Math.max(this.#reconnectionTime, 3600000)
              : this.#reconnectionTime;

            this.debug(
              `Reconnecting on failed authorization in ${
                reconnectionTime / 1000
              }s...`
            );

            this.#reconnectTimeout = setTimeout(() => {
              this.connect(true);
            }, reconnectionTime);
          }
        } catch (e) {
          console.error(e);
          reject(e);
        }
      }));
    }
  }

  async subscribe({ trades = [], quotes = [] } = {}) {
    if (!this.authenticated) {
      await this.connect();
    }

    const L1List = [];
    const L2List = [];

    trades.forEach((t) => {
      const tRefCount = this.#refTrades.get(t);

      if (typeof tRefCount === 'undefined') {
        this.#refTrades.set(t, 1);
        L1List.push(t);
      } else {
        this.#refTrades.set(t, tRefCount + 1);
      }
    });

    quotes.forEach((q) => {
      const qRefCount = this.#refQuotes.get(q);

      if (typeof qRefCount === 'undefined') {
        this.#refQuotes.set(q, 1);
        L2List.push(q);
      } else {
        this.#refQuotes.set(q, qRefCount + 1);
      }
    });

    const batchDataSubscriptionRequestMessage = this.#makeProtoMessage(
      'BatchDataSubscriptionRequest',
      {
        L2List,
        L1List,
        requestId: this.#createReqId()
      }
    );

    this.debug(
      `BatchDataSubscriptionRequest sent, trades: ${JSON.stringify(
        L1List
      )}, quotes: ${JSON.stringify(L2List)}`
    );
    this.#socket.write(batchDataSubscriptionRequestMessage);
  }

  unsubscribe({ trades, quotes } = {}) {
    const L1List = [];
    const L2List = [];

    trades.forEach((t) => {
      const tRefCount = this.#refTrades.get(t);

      if (typeof tRefCount === 'number') {
        if (tRefCount === 1) {
          this.#refTrades.delete(t);
          L1List.push(t);
        } else {
          this.#refTrades.set(t, tRefCount - 1);
        }
      }
    });

    quotes.forEach((q) => {
      const qRefCount = this.#refQuotes.get(q);

      if (typeof qRefCount === 'number') {
        if (qRefCount === 1) {
          this.#refQuotes.delete(q);
          L2List.push(q);
        } else {
          this.#refQuotes.set(q, qRefCount - 1);
        }
      }
    });

    for (const ticker of L1List) {
      const dataSubscriptionRequestMessage = this.#makeProtoMessage(
        'DataSubscriptionRequest',
        {
          Symbol: ticker,
          Subscribe: false,
          DataType: 0,
          RequestId: this.#createReqId()
        }
      );

      this.debug(
        `DataSubscriptionRequest sent (L1 unsubscribe), ticker: ${ticker}`
      );
      this.#socket.write(dataSubscriptionRequestMessage);
    }

    for (const ticker of L2List) {
      const dataSubscriptionRequestMessage = this.#makeProtoMessage(
        'DataSubscriptionRequest',
        {
          Symbol: ticker,
          Subscribe: false,
          DataType: 1,
          RequestId: this.#createReqId()
        }
      );

      this.debug(
        `DataSubscriptionRequest sent (L2 unsubscribe), ticker: ${ticker}`
      );
      this.#socket.write(dataSubscriptionRequestMessage);
    }
  }

  constructor(key, secret) {
    super();

    this.#key = key;
    this.#secret = secret;

    const serverList =
      process.env.UTEX_US_DATA_SERVER_LIST ??
      'us-ds-lyra.auroraplatform.com:34002';
    const servers = serverList.split(',').map((s) => {
      const [host, port] = s.split(':');

      return {
        host,
        port
      };
    });
    const server = servers[Math.floor(Math.random() * servers.length)];

    this.#host = server.host;
    this.#port = server.port;

    if (isNaN(this.#reconnectionTime)) {
      this.#reconnectionTime = 1000;
    }

    if (isNaN(this.#keepAliveDelay)) {
      this.#keepAliveDelay = 0;
    }
  }
}
