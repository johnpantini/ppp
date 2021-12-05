import { WebSocket } from '../salt/states/ppp/lib/websocket/websocket.mjs';
import { default as UWS } from '../salt/states/ppp/lib/uWebSockets.js/uws.js';

UWS.App({})
  .ws('/*', {
    message: (ws, message, isBinary) => {
      ws.send(
        new TextDecoder()
          .decode(message)
          .toString()
          .split('')
          .reverse()
          .join('')
      );
    }
  })
  .listen(9003, (listenSocket) => {
    if (listenSocket) {
      console.log('Listening to port 9003');
    }
  });

function connect() {
  const ws = new WebSocket('ws://localhost:9003');

  ws.onopen = function () {
    ws.send('OK');
  };

  ws.onmessage = function (e) {
    console.log(e.data);
  };

  ws.onclose = function (e) {
    setTimeout(function () {
      connect();
    }, 1000);
  };

  ws.onerror = function (err) {
    console.error(err);
    ws.close();
  };
}

connect();
