import { debug } from '../../debug.js';
import { encodeASCII } from '../../ChunkParser.js';

let WebsocketSignal;

(function (WebsocketSignal) {
  WebsocketSignal[(WebsocketSignal['FINISH_SEND'] = 1)] = 'FINISH_SEND';
})(WebsocketSignal || (WebsocketSignal = {}));

const finishSendFrame = new Uint8Array([1]);

export function WebsocketTransport() {
  return (opts) => {
    return websocketRequest(opts);
  };
}

function websocketRequest(options) {
  options.debug && debug('websocketRequest', options);

  let webSocketAddress = constructWebSocketAddress(options.url);
  const sendQueue = [];
  let ws;

  function sendToWebsocket(toSend) {
    if (toSend === WebsocketSignal.FINISH_SEND) {
      ws.send(finishSendFrame);
    } else {
      const byteArray = toSend;
      const c = new Int8Array(byteArray.byteLength + 1);

      c.set(new Uint8Array([0]));
      c.set(byteArray, 1);
      ws.send(c);
    }
  }

  return {
    sendMessage: (msgBytes) => {
      if (!ws || ws.readyState === ws.CONNECTING) {
        sendQueue.push(msgBytes);
      } else {
        sendToWebsocket(msgBytes);
      }
    },
    finishSend: () => {
      if (!ws || ws.readyState === ws.CONNECTING) {
        sendQueue.push(WebsocketSignal.FINISH_SEND);
      } else {
        sendToWebsocket(WebsocketSignal.FINISH_SEND);
      }
    },
    start: (metadata) => {
      ws = new WebSocket(webSocketAddress, ['grpc-websockets']);
      ws.binaryType = 'arraybuffer';
      ws.onopen = function () {
        options.debug && debug('websocketRequest.onopen');
        ws.send(headersToBytes(metadata));
        // send any messages that were passed to sendMessage before the connection was ready
        sendQueue.forEach((toSend) => {
          sendToWebsocket(toSend);
        });
      };
      ws.onclose = function (closeEvent) {
        options.debug && debug('websocketRequest.onclose', closeEvent);
        options.onEnd();
      };
      ws.onerror = function (error) {
        options.debug && debug('websocketRequest.onerror', error);
      };
      ws.onmessage = function (e) {
        options.onChunk(new Uint8Array(e.data));
      };
    },
    cancel: () => {
      options.debug && debug('websocket.abort');
      ws.close();
    }
  };
}

function constructWebSocketAddress(url) {
  if (url.startsWith('https://')) {
    return `wss://${url.substring(8)}`;
  } else if (url.startsWith('http://')) {
    return `ws://${url.substring(7)}`;
  }

  throw new Error(
    'Websocket transport constructed with non-https:// or http:// host.'
  );
}

function headersToBytes(headers) {
  let asString = '';

  headers.forEach((key, values) => {
    asString += `${key}: ${values.join(', ')}\r\n`;
  });

  return encodeASCII(asString);
}
