import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { inspect } from 'util';
import { EventEmitter } from 'events';
import lzma from '../vendor/lzma/index.js';
import protobuf from '../vendor/protobuf.min.js';
import { MessageType } from './message-type.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messages = protobuf.loadSync(path.join(__dirname, 'aurora.proto'));

export class UTEXTCPServer extends EventEmitter {
  #messageTypes = Object.keys(MessageType);

  #length = 0;

  #buffer = Buffer.from([]);

  #options = {};

  socket = new net.Socket();

  constructor(options = {}) {
    super();

    this.#options = options;
    this.socket.on('connect', () => {
      this.log(
        `${this.#options.host}:${this.#options.port} connection established`
      );
      this.socket.setKeepAlive(
        true,
        Math.max(this.#options.keepAliveDelay ?? 0, 1000)
      );
      this.emit('connect');
    });
    this.socket.on('end', () => {
      // Emitted when the other end of the socket signals the end of transmission,
      // thus ending the readable side of the socket.
      this.log(
        `${this.#options.host}:${
          this.#options.port
        } connection ended by the server`
      );
      this.emit('end');
    });
    this.socket.on('close', () => {
      // Emitted once the socket is fully closed.
      this.log(`${this.#options.host}:${this.#options.port} connection closed`);
      this.emit('close');
    });
    this.socket.on('error', (error) => {
      this.log(
        `${this.#options.host}:${this.#options.port} connection error (${
          error.errno
        })`
      );
      this.emit('error', error);
    });
    this.socket.on('data', (data) => this.#onDataReceived(data));
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
      this.log('#handleData error:');
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

  #readProtoMessage(buffer) {
    const messageTypeId = buffer.readInt16LE(4);
    const protoBody = Buffer.alloc(buffer.length - 6);

    buffer.copy(protoBody, 0, 6);

    const messageType = this.#messageTypes.find(
      (t) => MessageType[t] === messageTypeId
    );

    if (typeof messageType === 'undefined')
      this.log('Unknown message type: ' + messageTypeId);
    else {
      const type = messages.lookupType('aurora.' + messageType);

      if (!type) {
        this.log('Unknown message type: ' + messageType);

        return;
      }

      try {
        if (this.isPackableMessage(messageType)) {
          const result = Buffer.from(lzma.decompress(protoBody));

          const decompressedPayload = type.decode(result);

          if (this[messageType]) this[messageType](decompressedPayload);

          this.emit(messageType, decompressedPayload, buffer, result);
        } else {
          const payload = type.decode(protoBody);

          if (this[messageType]) this[messageType](payload);

          this.emit(messageType, payload, buffer, protoBody);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  connect() {
    this.log(`Connecting to ${this.#options.host}:${this.#options.port}...`);

    this.socket.connect(this.#options);
  }

  reconnect() {
    let RECONNECT_COOLDOWN = parseInt(process.env.RECONNECT_COOLDOWN);

    if (RECONNECT_COOLDOWN < 1000 || isNaN(RECONNECT_COOLDOWN))
      RECONNECT_COOLDOWN = 1000;

    setTimeout(() => {
      this.log(
        `Reconnecting to ${this.#options.host}:${this.#options.port}...`
      );

      this.socket.connect(this.#options);
    }, RECONNECT_COOLDOWN);
  }

  createReqId() {
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

  makeProtoMessage(messageType, payload) {
    const messageTypeId = MessageType[messageType];
    const type = messages.lookupType('aurora.' + messageType);

    if (!type) {
      this.log('Unknown message type: ' + messageType);

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

  isPackableMessage(messageType) {
    if (messageType === 'HistoryResponse') return true;

    if (messageType === 'AllSymbolsResponse') return true;

    if (messageType === 'AllSymbolsSnapshot') return true;

    if (messageType === 'TradingSnapshot') return true;

    if (messageType === 'HistoryChartResponse') return true;

    return messageType === 'ImbalanceSnapShot';
  }

  log(message) {
    process.env.DEBUG === 'true' &&
      console.log(
        `[${this.username ?? 'UTEXTCPServer'}] ` +
          inspect(message, { depth: 10 })
      );
  }
}

export class UTEXUSDataServer extends UTEXTCPServer {
  tokenLogin(token) {
    const tokenLoginMessage = this.makeProtoMessage('TokenLogin', {
      Mode: 1,
      JwtToken: token
    });

    this.log('Sending TokenLoginMessage...');
    this.socket.write(tokenLoginMessage);
  }

  batchDataSubscriptionRequest(L1List = [], L2List = []) {
    const requestId = this.createReqId();

    const batchDataSubscriptionRequestMessage = this.makeProtoMessage(
      'BatchDataSubscriptionRequest',
      {
        L2List,
        L1List,
        requestId
      }
    );

    this.log('Sending BatchDataSubscriptionRequest...');
    this.socket.write(batchDataSubscriptionRequestMessage);

    return requestId;
  }

  dataSubscriptionRequest(ticker, subscribe, type = 'L1') {
    const requestId = this.createReqId();

    if (type === 'L1') type = 0;
    else if (type === 'L2') type = 1;

    const dataSubscriptionRequestMessage = this.makeProtoMessage(
      'DataSubscriptionRequest',
      {
        Symbol: ticker,
        Subscribe: subscribe,
        DataType: type,
        RequestId: requestId
      }
    );

    this.log('Sending DataSubscriptionRequest...');
    this.socket.write(dataSubscriptionRequestMessage);

    return requestId;
  }
}
