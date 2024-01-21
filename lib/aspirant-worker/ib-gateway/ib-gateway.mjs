// ==PPPScript==
// @version 8
// ==/PPPScript==

import uWS from '/ppp/vendor/uWebSockets.js/uws.js';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { PPPUWSWorkerApplication } = await import(
  `${ROOT}/lib/aspirant-worker/utils.mjs`
);
const { default: IB } = await import(`${ROOT}/vendor/ib.min.js`);
const { IBApiNext, ConnectionState, EventName } = IB;

class IBGatewayError extends Error {
  constructor(message) {
    super(message);

    this.name = 'IBGatewayError';
  }
}

class TwsConnection {
  #app;

  #api;

  #key;

  #connectionStateSubscription;

  #connectionState = ConnectionState.Disconnected;

  get connectionState() {
    return this.#connectionState;
  }

  #positionsSubscription;

  #positions = [];

  #summarySubscription;

  #errorSubscription;

  #summary = {};

  #connectionStateObservable = {
    next(state) {
      this.#connectionState = state;

      this.#app.publish(
        this.#key,
        JSON.stringify({
          message: 'connection',
          payload: {
            state: this.#connectionState
          }
        })
      );
    }
  };

  #positionsObservable = {
    next({ all }) {
      this.#positions = {};

      for (const [accountId, positions] of all) {
        this.#positions[accountId] = positions;
      }

      this.#app.publish(
        this.#key,
        JSON.stringify({
          message: 'positions',
          payload: this.#positions
        })
      );
    }
  };

  #summaryObservable = {
    next({ all }) {
      this.#summary = {};

      for (const [accountId, summary] of all) {
        this.#summary[accountId] = {};

        for (const [tag, currencyToValueMap] of summary) {
          this.#summary[accountId][tag] =
            Object.fromEntries(currencyToValueMap);
        }
      }

      this.#app.publish(
        this.#key,
        JSON.stringify({
          message: 'summary',
          payload: this.#summary
        })
      );
    }
  };

  #errorObservable = {
    next(error = {}) {
      this.#app.publish(
        this.#key,
        JSON.stringify({
          message: 'error',
          payload: {
            message: error.error?.message,
            code: error.code,
            reqId: error.reqId
          }
        })
      );
    }
  };

  constructor(app, key) {
    this.#app = app;
    this.#key = key;

    this.#connectionStateObservable.next =
      this.#connectionStateObservable.next.bind(this);
    this.#positionsObservable.next = this.#positionsObservable.next.bind(this);
    this.#summaryObservable.next = this.#summaryObservable.next.bind(this);
    this.#errorObservable.next = this.#errorObservable.next.bind(this);
  }

  cancelOrder(body = {}) {
    this.#api.cancelOrder(body.id);

    return {
      sent: true
    };
  }

  cancelAllOrders() {
    return this.#api.cancelAllOrders();
  }

  getAllOpenOrders() {
    return this.#api.getAllOpenOrders();
  }

  #reconnectObservables() {
    if (this.#connectionStateSubscription) {
      this.#connectionStateSubscription.unsubscribe();
    }

    if (this.#positionsSubscription) {
      this.#positionsSubscription.unsubscribe();
    }

    if (this.#summarySubscription) {
      this.#summarySubscription.unsubscribe();
    }

    if (this.#errorSubscription) {
      this.#errorSubscription.unsubscribe();
    }

    this.#connectionStateSubscription = this.#api.connectionState.subscribe(
      this.#connectionStateObservable
    );
    this.#positionsSubscription = this.#api
      .getPositions()
      .subscribe(this.#positionsObservable);
    this.#summarySubscription = this.#api
      .getAccountSummary(
        'All',
        'NetLiquidation,TotalCashValue,SettledCash,AccruedCash,BuyingPower,AvailableFunds,ExcessLiquidity'
      )
      .subscribe(this.#summaryObservable);
    this.#errorSubscription = this.#api.error.subscribe(this.#errorObservable);
  }

  #watchdogLoop() {
    if (this.#connectionState === ConnectionState.Connected) {
      this.#reconnectObservables();

      setTimeout(() => {
        this.#watchdogLoop();
      }, 10000);
    } else {
      setTimeout(() => {
        this.#watchdogLoop();
      }, 1000);
    }
  }

  async connect(body = {}) {
    if (!this.#api) {
      this.#api = new IBApiNext({
        host: body.host ?? 'localhost',
        port: body.port ?? 7496,
        connectionWatchdogInterval: 0,
        reconnectInterval: 0
      });

      this.#api.api.on(EventName.orderStatus, (reqId, status) => {
        this.#app.publish(
          this.#key,
          JSON.stringify({
            message: 'orderStatus',
            reqId,
            status
          })
        );
      });

      this.#watchdogLoop();
    }

    if (this.#connectionState === ConnectionState.Disconnected) {
      this.#reconnectObservables();
      this.#api.connect();
    } else if (this.#connectionState === ConnectionState.Connected) {
      this.#reconnectObservables();
    }

    return {
      connectionState: ConnectionState[this.#connectionState]
    };
  }

  disconnect() {
    this.#api?.disconnect?.();

    return {
      connectionState: ConnectionState[this.#connectionState]
    };
  }

  getConnectionState() {
    return {
      connectionState: ConnectionState[this.#connectionState]
    };
  }

  summary() {
    return {
      summary: this.#summary
    };
  }

  positions() {
    return {
      positions: this.#positions
    };
  }

  async getCommissionReport(filter = {}) {
    return this.#api.getCommissionReport(filter);
  }

  async getNextValidOrderId() {
    return this.#api.getNextValidOrderId();
  }

  async getExecutionDetails() {
    return this.#api.getExecutionDetails({});
  }

  async getCurrentTime() {
    return this.#api.getCurrentTime();
  }

  async placeNewOrder(body = {}) {
    return this.#api.placeNewOrder(body.contract ?? {}, body.order ?? {});
  }

  async placeOrder(body = {}) {
    return this.#api.placeOrder(
      body.id ?? (await this.#api.getNextValidOrderId()),
      body.contract ?? {},
      body.order ?? {}
    );
  }

  async modifyOrder(body = {}) {
    return this.#api.modifyOrder(
      body.id ?? (await this.#api.getNextValidOrderId()),
      body.contract ?? {},
      body.order ?? {}
    );
  }
}

class IBGateway extends PPPUWSWorkerApplication {
  #app = uWS.App({});

  #connections = new Map();

  main() {
    this.#app
      .ws('/*', {
        idleTimeout: 10,
        maxPayloadLength: 1024 ** 2,
        maxBackpressure: 128 * 1024 * 1024,
        close: (ws) => {
          if (!ws.closed) {
            ws.closed = true;

            if (ws.key) {
              ws.unsubscribe(ws.key);
            }
          }
        },
        message(ws, message) {
          const key = Buffer.from(message).toString();

          if (key) {
            ws.key = key;

            ws.subscribe(key);
            ws.send(
              JSON.stringify({
                message: 'subscription',
                payload: {
                  subscribed: true
                }
              })
            );
          }
        }
      })
      .post('/call', async (res) => {
        try {
          const payload = await this.readJSONPayload(res);
          const allowedMethods = [
            'connect',
            'disconnect',
            'getConnectionState',
            'getCommissionReport',
            'cancelOrder',
            'cancelAllOrders',
            'getAllOpenOrders',
            'modifyOrder',
            'placeNewOrder',
            'placeOrder',
            'getNextValidOrderId',
            'getExecutionDetails',
            'getCurrentTime',
            'summary',
            'positions'
          ];
          const method = payload.method;
          const key = payload.key;

          if (!key) {
            // noinspection ExceptionCaughtLocallyJS
            throw new IBGatewayError('E_INVALID_KEY');
          }

          if (allowedMethods.indexOf(method) === -1) {
            // noinspection ExceptionCaughtLocallyJS
            throw new IBGatewayError('E_UNKNOWN_METHOD');
          }

          const connection = this.#connections.get(key);

          if (!connection) {
            if (method === 'connect') {
              this.#connections.set(
                key,
                new TwsConnection(this.#app, payload.key)
              );

              return this.jsonResponse(
                res,
                await this.#connections.get(key).connect(payload.body)
              );
            } else {
              // noinspection ExceptionCaughtLocallyJS
              throw new IBGatewayError('E_CONNECT_TO_TWS_FIRST');
            }
          } else {
            // Connection exists.
            if (connection.connectionState !== ConnectionState.Connected) {
              if (
                method === 'connect' &&
                connection.connectionState === ConnectionState.Disconnected
              ) {
                return this.jsonResponse(
                  res,
                  await connection.connect(payload.body)
                );
              }

              // noinspection ExceptionCaughtLocallyJS
              throw new IBGatewayError('E_NO_TWS_CONNECTION');
            } else {
              return this.jsonResponse(
                res,
                await connection[method](payload.body)
              );
            }
          }
        } catch (e) {
          return this.errorResponse(res, e);
        }
      })
      .get('/*', (res) =>
        this.jsonResponse(res, {
          env: {
            PPP_WORKER_ID: process.env.PPP_WORKER_ID
          }
        })
      )
      .listen(
        '0.0.0.0',
        process.env.NOMAD_PORT_HTTP ?? 14785,
        (listenSocket) => {
          if (listenSocket) {
            console.log(
              `The IB Gateway worker is listening to port ${uWS.us_socket_local_port(
                listenSocket
              )}`
            );
          } else {
            process.exit(1);
          }
        }
      );
  }
}

new IBGateway().main();
