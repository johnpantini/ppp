import { WebSocket } from '../salt/states/ppp/lib/websocket/websocket.mjs';

const client = new WebSocket('ws://localhost:24567');

client.on('message', (data) => {
  const payload = JSON.parse(data);

  console.log(payload);

  if (payload[0]?.msg === 'connected') {
    client.send(
      JSON.stringify({
        action: 'auth',
        key: process.env.KEY,
        secret: process.env.SECRET
      })
    );
  } else if (payload[0]?.msg === 'authenticated') {
    client.send(
      JSON.stringify({
        action: 'subscribe',
        trades: ['AAPL'],
        quotes: ['AAPL']
      })
    );
  }
});
