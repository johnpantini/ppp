// @version 2
import { isMainThread, parentPort } from 'node:worker_threads';
import path from 'path';

if (isMainThread && typeof process.env.PPP_ASPIRANT_DIRNAME === 'undefined')
  process.env.PPP_ASPIRANT_DIRNAME = path.dirname(
    new URL(import.meta.url).pathname
  );

const { default: uWS } = await import(
  'file://' +
    path.join(process.env.PPP_ASPIRANT_DIRNAME, '../uWebSockets.js/uws.js')
);

const { UTEXUSDataServer } = await import(
  'file://' + path.join(process.env.PPP_ASPIRANT_DIRNAME, '../aurora/utex.mjs')
);

function isJWTTokenExpired(jwtToken) {
  if (jwtToken) {
    try {
      const [, payload] = jwtToken.split('.');
      const { exp: expires } = JSON.parse(atob(payload));

      if (typeof expires === 'number') {
        return Date.now() + 1000 >= expires * 1000;
      }
    } catch {
      return true;
    }
  }

  return true;
}

const PORT = process.env.PORT ?? 24567;

const tickerToUTEXTicker = (ticker) => {
  if (/@/i.test(ticker)) ticker = ticker.split('@')[0];

  return ticker.replace(' ', '/').replace('.', '/') + '~US';
};

const UTEXTickerToTicker = (ticker) => {
  return ticker.replace('/', ' ').split('~')[0];
};

const isDST = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
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
      return 'Y';
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

let appListenSocket;
const wsMap = new Map();

const redisCommand = async (command, args = []) => {
  if (process.env.ASPIRANT_ID && process.env.PPP_WORKER_ID) {
    return await (
      await fetch(
        new URL('redis', process.env.SERVICE_MACHINE_URL).toString(),
        {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            options: {
              host: process.env.REDIS_HOST,
              port: +process.env.REDIS_PORT,
              tls: !!process.env.REDIS_TLS
                ? {
                    servername: process.env.REDIS_HOST
                  }
                : void 0,
              username: process.env.REDIS_USERNAME,
              db: +process.env.REDIS_DATABASE,
              password: process.env.REDIS_PASSWORD
            },
            command,
            args
          })
        }
      )
    ).text();
  }

  return null;
};

uWS
  .App({})
  .ws('/*', {
    maxBackpressure: 20 * 1024 * 1024,
    open: (ws) => {
      wsMap.set(ws, Date.now());
      ws.send(JSON.stringify([{ T: 'success', msg: 'connected' }]));
    },
    close: (ws) => {
      ws.closed = true;
      ws.authenticated = false;

      if (ws.connection) {
        ws.connection.socket.end();
        ws.connection.socket.unref();

        ws.connection = null;
      }

      wsMap.delete(ws);
    },
    drain: (ws) => {
      if (!ws.closed)
        return ws.send(
          JSON.stringify([{ T: 'error', code: 407, msg: 'slow client' }])
        );
    },
    message: async (ws, message) => {
      if (ws.closed) return;

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
            let savedAccessToken = await redisCommand('get', [
              `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-token`
            ]);
            let savedRefreshToken = await redisCommand('get', [
              `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-refresh-token`
            ]);
            let tokensResponse;

            if (isJWTTokenExpired(savedAccessToken)) {
              if (isJWTTokenExpired(savedRefreshToken)) {
                const tokensRequest = await fetch(
                  process.env.UTEX_AUTH_URL ??
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
                      loginOrEmail: payload.key,
                      password: payload.secret,
                      product: 'UTEX',
                      locale: 'ru'
                    })
                  }
                );

                tokensResponse = await tokensRequest.json();
              } else {
                // Refresh token is OK - try to refresh access token.
                const refreshAuthRequest = await fetch(
                  process.env.UTEX_REFRESH_AUTH_URL ??
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
                      refreshToken: savedRefreshToken
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

              if (tokensResponse.tokens) {
                savedAccessToken = tokensResponse.tokens.accessToken;
                savedRefreshToken = tokensResponse.tokens.refreshToken;

                await redisCommand('mset', [
                  `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-token`,
                  savedAccessToken,
                  `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-refresh-token`,
                  savedRefreshToken
                ]);
              }
            } else {
              // Access token is OK.
              tokensResponse = {
                tokens: {
                  accessToken: savedAccessToken,
                  refreshToken: savedRefreshToken
                }
              };
            }

            if (
              !tokensResponse.tokens ||
              /NoActiveSessionException/i.test(tokensResponse?.type)
            ) {
              await redisCommand('del', [
                `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-token`,
                `ppp-aspirant-worker:${process.env.PPP_WORKER_ID}:saved-refresh-token`
              ]);
            }

            // Must be checked after await
            if (ws.closed) return;

            if (
              /InvalidCredentialsException|NoActiveSessionException/i.test(
                tokensResponse?.type
              )
            ) {
              return ws.send(
                JSON.stringify([{ T: 'error', code: 402, msg: 'auth failed' }])
              );
            } else if (/BlockingException/i.test(tokensResponse?.type)) {
              console.log(tokensResponse);

              return ws.send(
                JSON.stringify([{ T: 'error', code: 429, msg: 'auth failed' }])
              );
            } else if (
              !tokensResponse.tokens &&
              tokensResponse.secondFactorRequestId
            ) {
              return ws.send(
                JSON.stringify([{ T: 'error', code: 404, msg: 'auth timeout' }])
              );
            } else if (tokensResponse.tokens?.accessToken) {
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

              const server =
                servers[Math.floor(Math.random() * servers.length)];

              ws.connection = new UTEXUSDataServer({
                host: server.host,
                port: server.port
              });

              ws.connection.username = payload.key;

              ws.connection.once('close', () => !ws.closed && ws.close());
              ws.connection.once('error', () => !ws.closed && ws.close());
              ws.connection.once('end', () => !ws.closed && ws.close());
              ws.connection.once('connect', () => {
                ws.connection.tokenLogin(tokensResponse.tokens.accessToken);
              });

              ws.connection.on('ConnectionPermit', () => {
                if (!ws.closed) {
                  ws.authenticated = true;

                  ws.send(
                    JSON.stringify([{ T: 'success', msg: 'authenticated' }])
                  );
                }
              });

              ws.connection.on('Level2', (level2) => {
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
              });

              ws.connection.on('MarketPrint', (print) => {
                if (!ws.closed) {
                  const date = new Date(print?.Time?.Timestamp);

                  date.setTime(
                    date.getTime() + (isDST() ? 4 : 5) * 3600 * 1000
                  );

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
                        z: '-'
                      }
                    ])
                  );
                }
              });

              ws.connection.connect();
            }
          }
        } else if (payload.action === 'subscribe') {
          if (!ws.authenticated) {
            return ws.send(
              JSON.stringify([
                { T: 'error', code: 401, msg: 'not authenticated' }
              ])
            );
          }

          const L1List =
            payload.trades?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];
          const L2List =
            payload.quotes?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];

          return ws.connection.batchDataSubscriptionRequest(L1List, L2List);
        } else if (payload.action === 'unsubscribe') {
          if (!ws.authenticated) {
            return ws.send(
              JSON.stringify([
                { T: 'error', code: 401, msg: 'not authenticated' }
              ])
            );
          }

          const L1List =
            payload.trades?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];
          const L2List =
            payload.quotes?.map((ticker) => tickerToUTEXTicker(ticker)) ?? [];

          for (const ticker of L1List) {
            ws.connection.dataSubscriptionRequest(ticker, false, 'L1');
          }

          for (const ticker of L2List) {
            ws.connection.dataSubscriptionRequest(ticker, false, 'L2');
          }
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
  })
  .get('/ping', async (res) => {
    res
      .writeStatus('200 OK')
      .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
      .end('pong', true);
  })
  .listen(+PORT, (listenSocket) => {
    if (listenSocket) {
      appListenSocket = listenSocket;

      console.log(`Listening to port ${PORT}`);
    }
  });

if (!isMainThread) {
  parentPort.once('message', (message) => {
    if (message === 'cleanup') {
      if (appListenSocket) {
        uWS.us_listen_socket_close(appListenSocket);

        appListenSocket = null;

        for (const [ws] of wsMap) {
          if (!ws.closed) ws.close();
        }
      }
    }
  });
}
