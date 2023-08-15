import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { inspect } from 'util';
import { EventEmitter } from 'events';
import { MessageType } from './message-type.mjs';
import lzma from '../vendor/lzma/index.js';
import protobuf from '../vendor/protobuf.min.js';

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

export class UtexConnection extends EventEmitter {
  #reconnectTimeout = parseInt(process.env.UTEX_RECONNECT_TIMEOUT ?? '1000');

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

  #pendingConnection;

  #refTrades = new Map();

  #refQuotes = new Map();

  authenticated = false;

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
          let tokensResponse;
          const refreshToken =
            process.env.UTEX_DEBUG_REFRESH_TOKEN ?? this.#refreshToken;

          if (isJWTTokenExpired(refreshToken)) {
            const tokensRequest = await fetch(
              'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
              {
                method: 'POST',
                headers: {
                  Origin: 'https://utex.io',
                  Referer: 'https://utex.io/',
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

            tokensResponse = await tokensRequest.json();
          } else {
            // Refresh token is OK - try to refresh the access token.
            const refreshAuthRequest = await fetch(
              'https://api.utex.io/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.refreshAuthorization',
              {
                method: 'POST',
                headers: {
                  Origin: 'https://utex.io',
                  Referer: 'https://utex.io/',
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

            tokensResponse = await refreshAuthRequest.json();

            if (tokensResponse.accessToken && tokensResponse.refreshToken) {
              tokensResponse.tokens = {
                accessToken: tokensResponse.accessToken,
                refreshToken: tokensResponse.refreshToken
              };
            }
          }

          if (tokensResponse.tokens?.accessToken) {
            this.#accessToken = tokensResponse.tokens.accessToken;
            this.#refreshToken = tokensResponse.tokens.refreshToken;

            resolve(this.#accessToken);
          } else {
            this.#accessToken = void 0;
            this.#refreshToken = void 0;

            if (
              !tokensResponse?.tokens ||
              /NoActiveSessionException|InvalidCredentialsException/i.test(
                tokensResponse?.type
              )
            ) {
              this.emit('AuthorizationError', [
                { T: 'error', code: 402, msg: 'auth failed' }
              ]);
            } else if (/BlockingException/i.test(tokensResponse?.type)) {
              console.log(tokensResponse);

              this.emit('AuthorizationError', [
                { T: 'error', code: 429, msg: 'auth failed' }
              ]);
            } else if (
              !tokensResponse.tokens &&
              tokensResponse.secondFactorRequestId
            ) {
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
    this.debug(`Connecting to ${this.#host}:${this.#port}...`);

    if (this.#socket?.pppConnected) {
      this.#pendingConnection = void 0;

      return this.#socket;
    } else if (this.#pendingConnection) {
      return this.#pendingConnection;
    } else {
      return (this.#pendingConnection = new Promise((resolve) => {
        if (!reconnect && this.#socket) {
          resolve(this.#socket);
        } else {
          this.#socket = new net.Socket();

          this.#socket.on('connect', async () => {
            this.debug(`${this.#host}:${this.#port} connection established.`);
            this.#socket.setKeepAlive(
              true,
              Math.max(this.#keepAliveDelay ?? 0, 1000)
            );
            this.emit('connect');

            await this.#authenticate();

            if (this.#accessToken) {
              const tokenLoginMessage = this.#makeProtoMessage('TokenLogin', {
                Mode: 1,
                JwtToken: this.#accessToken
              });

              this.debug('TokenLoginMessage sent.');
              this.#socket.write(tokenLoginMessage);
            } else {
              this.#socket.destroy();
            }

            this.#socket.pppConnected = true;

            resolve(this.#socket);
          });

          this.#socket.on('end', () => {
            this.#socket.pppConnected = false;
            this.#pendingConnection = void 0;
            this.authenticated = false;

            // Emitted when the other end of the socket signals the end of transmission,
            // thus ending the readable side of the socket.
            this.debug(
              `${this.host}:${this.port} connection ended by the server.`
            );
            this.emit('end');
            this.#socket.destroy();
          });

          this.#socket.on('close', () => {
            this.#socket.pppConnected = false;
            this.#pendingConnection = void 0;
            this.authenticated = false;

            this.#refTrades.clear();
            this.#refQuotes.clear();

            // Emitted once the socket is fully closed.
            this.debug(`${this.#host}:${this.#port} connection closed.`);
            this.emit('close');
            this.#socket.destroy();

            setTimeout(() => this.connect(true), this.#reconnectTimeout);
          });

          this.#socket.on('error', (e) => {
            console.error(e);

            this.authenticated = false;

            this.debug(`${this.#host}:${this.#port} connection error.`);
            this.emit('error', e);

            this.#socket.pppConnected = false;

            this.#socket.destroy();
          });

          this.#socket.on('data', (data) => this.#onDataReceived(data));

          this.#socket.connect({
            host: this.#host,
            port: this.#port
          });
        }
      }));
    }
  }

  ConnectionPermit() {
    this.authenticated = true;
  }

  PrintsHistoryResponse(payload) {
    this.emit(
      'PrintsHistoryResponse.' + payload.RequestId.toString('base64'),
      JSON.stringify(payload)
    );
  }

  async printsHistoryRequest(ticker) {
    const reqId = this.#createReqId();
    const listenerName = `PrintsHistoryResponse.${reqId.toString('base64')}`;
    const printsHistoryRequestMessage = this.#makeProtoMessage(
      'PrintsHistoryRequest',
      {
        Symbol: ticker,
        RequestId: reqId
      }
    );

    this.debug(`PrintsHistoryRequest sent, ticker: ${ticker}.`);
    this.#socket.write(printsHistoryRequestMessage);

    return new Promise((resolve) => {
      try {
        let badSituation = false;

        const badSituationTimer = setTimeout(() => {
          badSituation = true;

          this.removeAllListeners(listenerName);

          resolve([]);
        }, 5000);

        this.once(listenerName, (payload) => {
          clearTimeout(badSituationTimer);

          if (badSituation) {
            return;
          }

          if (!payload) {
            resolve([]);
          } else {
            resolve((JSON.parse(payload).Prints || []).reverse());
          }
        });
      } catch (e) {
        console.error(e);

        resolve([]);
      }
    });
  }

  async subscribe({ trades = [], quotes = [] } = {}) {
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

    // for (const ticker of L1List) {
    //   const prints = await this.printsHistoryRequest(ticker);
    //
    //   prints.forEach((print) => this.emit('MarketPrint', print));
    // }

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

    if (isNaN(this.#reconnectTimeout)) {
      this.#reconnectTimeout = 1000;
    }

    if (isNaN(this.#keepAliveDelay)) {
      this.#keepAliveDelay = 0;
    }

    process.nextTick(() => void this.connect());
  }
}
