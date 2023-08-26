// ==PPPScript==
// @version 3
// ==/PPPScript==

import uWS from '/salt/states/ppp/lib/uWebSockets.js/uws.js';

const PPP_LIB_DIR = process.env.PPP_LIB_DIR ?? '.';
const { UtexConnection } = await import(`${PPP_LIB_DIR}/utex/utex-connection.mjs`);

const tickerToUTEXTicker = (ticker) => {
  if (/@/i.test(ticker)) ticker = ticker.split('@')[0];

  return ticker.replace(' ', '/').replace('.', '/') + '~US';
};

const UTEXTickerToTicker = (ticker) => {
  return ticker.replace('/', ' ').split('~')[0];
};

const isDST = () => {
  const cd = new Date();
  const cy = cd.getFullYear();
  const firstOfMarch = new Date(cy, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(cy, 2, secondSundayInMarch);
  const firstOfNovember = new Date(cy, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(cy, 10, firstSundayInNovember);

  return cd.getTime() <= end.getTime() && cd.getTime() >= start.getTime();
};

const UTEXExchangeToAlpacaExchange = (exchangeId) => {
  switch (exchangeId) {
    // PA
    case 108:
      return 'P';
    // Q
    case 112:
      return 'Q';
    // DA
    case 33:
      return 'J';
    // DX
    case 36:
      return 'K';
    // A
    case 1:
      return 'A';
    // BT
    case 14:
      return 'Z';
    // MW
    case 87:
      return 'M';
    // N
    case 88:
      return 'N';
    // QD
    case 114:
      return 'D';
    // X
    case 137:
      return 'X';
    // BY
    case 15:
      return 'Y';
    // B
    case 6:
      return 'B';
    // C
    case 16:
      return 'C';
    // W
    case 135:
      return 'W';
  }

  // Dark Pool
  return 'D';
};

class UtexAlpaca {
  #app = uWS.App({});

  #connections = new Map();

  main() {
    this.#app
      .ws('/*', {
        maxBackpressure: 128 * 1024 * 1024,
        drain: (ws) => {
          if (!ws.closed)
            return ws.send(
              JSON.stringify([{ T: 'error', code: 407, msg: 'slow client' }])
            );
        },
        open: (ws) => {
          ws.trades = new Set();
          ws.quotes = new Set();

          ws.send(JSON.stringify([{ T: 'success', msg: 'connected' }]));
        },
        close: (ws) => {
          ws.closed = true;
          ws.authenticated = false;

          if (ws.connection) {
            ws.connection.off('ConnectionPermit', ws.onConnectionPermit);
            ws.connection.off('AuthorizationError', ws.onAuthorizationError);
            ws.connection.off('Level2', ws.onLevel2);
            ws.connection.off('MarketPrint', ws.onMarketPrint);
            ws.connection.unsubscribe({
              trades: Array.from(ws.trades.keys()),
              quotes: Array.from(ws.quotes.keys())
            });
          }
        },
        message: this.onMessage.bind(this)
      })
      .get('/ping', async (res) => {
        res
          .writeStatus('200 OK')
          .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
          .end('pong', true);
      })
      .listen(
        '0.0.0.0',
        process.env.NOMAD_PORT_HTTP ?? 24567,
        (listenSocket) => {
          if (listenSocket) {
            console.log(
              `UTEX Alpaca worker is listening to port ${uWS.us_socket_local_port(
                listenSocket
              )}`
            );
          } else {
            process.exit(1);
          }
        }
      );
  }

  async onMessage(ws, message) {
    try {
      const payload = JSON.parse(Buffer.from(message).toString());

      if (payload.action === 'auth') {
        if (ws.authenticated) {
          return ws.send(
            JSON.stringify([
              { T: 'error', code: 403, msg: 'already authenticated' }
            ])
          );
        } else {
          if (!payload.key || !payload.secret) {
            return ws.send(
              JSON.stringify([{ T: 'error', code: 422, msg: 'auth failed' }])
            );
          }

          ws.connection = this.#connections.get(payload.key);

          if (typeof ws.connection === 'undefined') {
            this.#connections.set(
              payload.key,
              new UtexConnection(payload.key, payload.secret)
            );

            ws.connection = this.#connections.get(payload.key);
          } else if (ws.connection.authenticated) {
            ws.authenticated = true;

            ws.send(JSON.stringify([{ T: 'success', msg: 'authenticated' }]));
          }

          ws.onConnectionPermit = function () {
            if (!ws.closed && !ws.authenticated) {
              ws.authenticated = true;

              ws.send(JSON.stringify([{ T: 'success', msg: 'authenticated' }]));
            }
          };

          const worker = this;

          ws.onAuthorizationError = function (alpacaError) {
            if (!ws.closed) {
              ws.authenticated = false;
              ws.connection = void 0;

              worker.#connections.delete(payload.key);
              ws.send(JSON.stringify(alpacaError));
              ws.close();
            }
          };

          ws.onLevel2 = function (level2) {
            if (!ws.closed) {
              ws.send(
                JSON.stringify(
                  level2.Quote?.map((quoteLine) => {
                    return {
                      T: 'q',
                      S: UTEXTickerToTicker(level2.Symbol),
                      ax: UTEXExchangeToAlpacaExchange(level2.Feed),
                      ap: quoteLine.Ask?.Price ?? 0,
                      as: (quoteLine.Ask?.Size ?? 0) / 100,
                      bx: UTEXExchangeToAlpacaExchange(level2.Feed),
                      bp: quoteLine.Bid?.Price ?? 0,
                      bs: (quoteLine.Bid?.Size ?? 0) / 100,
                      s: 0,
                      t: new Date().toISOString(),
                      c: [],
                      z: '-'
                    };
                  }) ?? []
                )
              );
            }
          };

          ws.onMarketPrint = function (print) {
            if (!ws.closed) {
              const date = new Date(print?.Time?.Timestamp);

              date.setTime(date.getTime() + (isDST() ? 4 : 5) * 3600 * 1000);

              ws.send(
                JSON.stringify([
                  {
                    T: 't',
                    i: 0,
                    S: UTEXTickerToTicker(print.Symbol),
                    x: UTEXExchangeToAlpacaExchange(print.Exchange),
                    p: print.Price,
                    s: print.Size,
                    h: print.Hit,
                    t: new Date(date).toISOString(),
                    c: print.Condition?.trim()
                      ?.replace('\u0000', '')
                      .split(/\s/),
                    z: '-',
                    U: print.DoesUpdateLastPrice
                  }
                ])
              );
            }
          };

          ws.connection.on('ConnectionPermit', ws.onConnectionPermit);
          ws.connection.on('AuthorizationError', ws.onAuthorizationError);
          ws.connection.on('Level2', ws.onLevel2);
          ws.connection.on('MarketPrint', ws.onMarketPrint);
        }
      } else if (
        payload.action === 'subscribe' ||
        payload.action === 'unsubscribe'
      ) {
        if (!ws.authenticated) {
          return ws.send(
            JSON.stringify([
              { T: 'error', code: 401, msg: 'not authenticated' }
            ])
          );
        }

        const rawTrades =
          payload.trades?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];
        const rawQuotes =
          payload.quotes?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];

        const trades = [];
        const quotes = [];

        if (payload.action === 'subscribe') {
          for (const ticker of rawTrades) {
            // Not supported
            if (ticker === '*') {
              continue;
            }

            if (!ws.trades.has(ticker)) {
              ws.trades.add(ticker);
              trades.push(ticker);
            }
          }

          for (const ticker of rawQuotes) {
            if (ticker === '*') {
              continue;
            }

            if (!ws.quotes.has(ticker)) {
              ws.quotes.add(ticker);
              quotes.push(ticker);
            }
          }

          if (trades.length || quotes.length) {
            ws.connection.subscribe({ trades, quotes });
          }
        } else {
          for (const ticker of rawTrades) {
            // Not supported
            if (ticker === '*') {
              continue;
            }

            if (ws.trades.has(ticker)) {
              ws.trades.delete(ticker);
              trades.push(ticker);
            }
          }

          for (const ticker of rawQuotes) {
            if (ticker === '*') {
              continue;
            }

            if (ws.quotes.has(ticker)) {
              ws.quotes.delete(ticker);
              quotes.push(ticker);
            }
          }

          if (trades.length || quotes.length) {
            ws.connection.unsubscribe({ trades, quotes });
          }
        }

        return ws.send(
          JSON.stringify([
            {
              T: 'subscription',
              trades: Array.from(ws.trades.keys()),
              quotes: Array.from(ws.quotes.keys())
            }
          ])
        );
      } else {
        ws.send(
          JSON.stringify([{ T: 'error', code: 400, msg: 'invalid syntax' }])
        );
      }
    } catch (e) {
      console.error(e);

      !ws.closed &&
        ws.send(
          JSON.stringify([{ T: 'error', code: 400, msg: 'invalid syntax' }])
        );
    }
  }
}

new UtexAlpaca().main();
