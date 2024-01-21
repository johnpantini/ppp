import { WebSocket } from '/ppp/vendor/websocket/websocket.mjs';
import https from 'https';

const client = new WebSocket('wss://data-stream.binance.com/stream', {
  followRedirects: true,
  agent: new https.Agent({
    keepAlive: true,
    family: 4
  })
});

client.onopen = () => {
  console.log('open');
};
