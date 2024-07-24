const client = new WebSocket('wss://stream.data.alpaca.markets/v2/sip');

client.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data);

  for (const m of payload) {
    if (m.msg === 'connected') {
      client.send(
        JSON.stringify({
          action: 'auth',
          key: process.env.KEY,
          secret: process.env.SECRET
        })
      );
    } else if (m.msg === 'authenticated') {
      client.send(
        JSON.stringify({
          action: 'subscribe',
          trades: ['*'],
          quotes: ['*']
        })
      );
    } else {
      const S = m.S;

      if (
        m.T === 't' &&
        S !== 'ATEST.A' &&
        S !== 'CTEST.A' &&
        S !== 'PTEST.A' &&
        S !== 'MTEST.A'
      ) {
        console.log(S, m.p, m.s);
      }
    }
  }
});
