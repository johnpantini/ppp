// ==PPPScript==
// @version 16
// ==/PPPScript==

/** biome-ignore-all lint/complexity/useArrowFunction: OK */

import uWS from '/ppp/vendor/uWebSockets.js/uws.js';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { UtexConnection } = await import(`${ROOT}/lib/utex/utex-connection.mjs`);
const { PPPUWSWorkerApplication, isDST } = await import(
  `${ROOT}/lib/aspirant-worker/utils.mjs`
);

await import(`${ROOT}/lib/debug.js`);

const $$utexAlpaca = globalThis.ppp.$debug('utex-alpaca');

const tickerToUTEXTicker = (ticker) => {
  if (/@/i.test(ticker)) ticker = ticker.split('@')[0];

  return ticker.replace(' ', '/').replace('.', '/') + '~US';
};

const UTEXTickerToTicker = (ticker) => {
  return ticker.replace('/', ' ').split('~')[0];
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

class UtexAlpaca extends PPPUWSWorkerApplication {
  #app = uWS.App({});

  #connections = new Map();

  // Removes the listeners of a client socket from a UTEX connection.
  // Safe to call when the client has never registered any listeners.
  #detach(ws, connection) {
    if (!connection) {
      return;
    }

    if (typeof ws.onConnectionPermit === 'function') {
      connection.off('ConnectionPermit', ws.onConnectionPermit);
      connection.off('AuthorizationError', ws.onAuthorizationError);
      connection.off('Level2', ws.onLevel2);
      connection.off('MarketPrint', ws.onMarketPrint);
    }

    connection.clients.delete(ws);
  }

  main() {
    this.#app
      .ws('/*', {
        maxBackpressure: 256 * 1024 * 1024,
        drain: (ws) => {
          if (!ws.closed)
            return ws.send(
              JSON.stringify([{ T: 'error', code: 407, msg: 'slow client' }])
            );
        },
        open: (ws) => {
          ws.trades = new Set();
          ws.quotes = new Set();

          $$utexAlpaca('client connected');
          ws.send(JSON.stringify([{ T: 'success', msg: 'connected' }]));
        },
        close: (ws) => {
          if (ws.closed) {
            return;
          }

          ws.closed = true;
          ws.authenticated = false;

          $$utexAlpaca(
            'client disconnected, trades: %d, quotes: %d',
            ws.trades.size,
            ws.quotes.size
          );

          if (ws.connection) {
            this.#detach(ws, ws.connection);
            ws.connection.unsubscribe({
              trades: Array.from(ws.trades),
              quotes: Array.from(ws.quotes)
            });
          }
        },
        message: this.onMessage.bind(this)
      })
      .get('/', (res) =>
        this.jsonResponse(res, {
          env: {
            PPP_WORKER_ID: process.env.PPP_WORKER_ID
          }
        })
      )
      .listen(
        '0.0.0.0',
        process.env.NOMAD_PORT_HTTP ?? 24567,
        (listenSocket) => {
          if (listenSocket) {
            $$utexAlpaca(
              'listening on port %d',
              uWS.us_socket_local_port(listenSocket)
            );
          } else {
            $$utexAlpaca('failed to get a port, terminating...');
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

          // A repeated auth while the first one is still pending:
          // leave the previous connection cleanly.
          this.#detach(ws, ws.connection);

          ws.connection = this.#connections.get(payload.key);

          if (typeof ws.connection === 'undefined') {
            $$utexAlpaca('creating a new UTEX connection');

            const newConnection = new UtexConnection(
              payload.key,
              payload.secret
            );

            this.#connections.set(payload.key, newConnection);

            ws.connection = newConnection;
          } else if (ws.connection.authenticated) {
            ws.authenticated = true;

            ws.send(JSON.stringify([{ T: 'success', msg: 'authenticated' }]));
          }

          ws.connection.clients.add(ws);

          const worker = this;

          $$utexAlpaca(
            'listeners before attach, ConnectionPermit: %d, AuthorizationError: %d, Level2: %d, MarketPrint: %d',
            ws.connection.listenerCount('ConnectionPermit'),
            ws.connection.listenerCount('AuthorizationError'),
            ws.connection.listenerCount('Level2'),
            ws.connection.listenerCount('MarketPrint')
          );

          ws.onConnectionPermit = function () {
            if (!ws.closed && !ws.authenticated) {
              ws.authenticated = true;

              $$utexAlpaca('client authenticated');
              ws.send(JSON.stringify([{ T: 'success', msg: 'authenticated' }]));
            }
          };

          ws.onAuthorizationError = function (alpacaError) {
            if (!ws.closed) {
              $$utexAlpaca('authorization error: %o', alpacaError);

              ws.authenticated = false;

              worker.#detach(ws, ws.connection);
              worker.#connections.delete(payload.key);

              ws.connection = void 0;

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
                      z: ''
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
                    t: date.toISOString(),
                    c: print.Condition?.trim()?.replace('0000', '').split(/\s/),
                    z: '',
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

          await ws.connection.connect();
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
            $$utexAlpaca('subscribe, trades: %o, quotes: %o', trades, quotes);
            ws.connection.subscribe({ trades, quotes });
          }
        } else {
          for (const ticker of rawTrades) {
            // Not supported.
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
            $$utexAlpaca('unsubscribe, trades: %o, quotes: %o', trades, quotes);
            ws.connection.unsubscribe({ trades, quotes });
          }
        }

        return ws.send(
          JSON.stringify([
            {
              T: 'subscription',
              trades: Array.from(ws.trades),
              quotes: Array.from(ws.quotes)
            }
          ])
        );
      } else {
        ws.send(
          JSON.stringify([{ T: 'error', code: 400, msg: 'invalid syntax' }])
        );
      }
    } catch (e) {
      $$utexAlpaca('message handling failed: %o', e);

      !ws.closed &&
        ws.send(
          JSON.stringify([{ T: 'error', code: 400, msg: 'invalid syntax' }])
        );
    }
  }
}

new UtexAlpaca().main();
