// ==PPPScript==
// @version 13
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

  #mktDepthHandlersInstalled = false;

  // tickerId → { status: 'pending' | 'active' | 'pending-cancel', timer }
  #mktDepthState = new Map();

  #installMktDepthHandlers() {
    if (this.#mktDepthHandlersInstalled) return;
    this.#mktDepthHandlersInstalled = true;

    this.#api.api.on(
      EventName.updateMktDepthL2,
      (tickerId, position, marketMaker, operation, side, price, size, isSmartDepth) => {
        const state = this.#mktDepthState.get(tickerId);

        if (state) {
          if (state.status === 'pending-cancel') {
            clearTimeout(state.timer);
            this.#mktDepthState.delete(tickerId);
            this.#api.api.cancelMktDepth(tickerId, state.isSmartDepth);

            return;
          }

          if (state.status === 'pending') {
            clearTimeout(state.timer);
            state.status = 'active';
          }
        }

        this.#app.publish(
          this.#key,
          JSON.stringify({
            message: 'marketDepth',
            payload: { tickerId, position, marketMaker, operation, side, price, size, isSmartDepth }
          })
        );
      }
    );

    this.#api.api.on(
      EventName.updateMktDepth,
      (tickerId, position, operation, side, price, size) => {
        const state = this.#mktDepthState.get(tickerId);

        if (state) {
          if (state.status === 'pending-cancel') {
            clearTimeout(state.timer);
            this.#mktDepthState.delete(tickerId);
            this.#api.api.cancelMktDepth(tickerId, state.isSmartDepth);

            return;
          }

          if (state.status === 'pending') {
            clearTimeout(state.timer);
            state.status = 'active';
          }
        }

        this.#app.publish(
          this.#key,
          JSON.stringify({
            message: 'marketDepth',
            payload: { tickerId, position, marketMaker: '', operation, side, price, size, isSmartDepth: false }
          })
        );
      }
    );
  }

  reqMktDepth(body = {}) {
    const { tickerId, contract, numRows = 1, isSmartDepth = true } = body;

    this.#installMktDepthHandlers();

    this.#mktDepthState.set(tickerId, {
      status: 'pending',
      isSmartDepth,
      timer: setTimeout(() => {
        this.#mktDepthState.delete(tickerId);
      }, 10000)
    });

    this.#api.api.reqMktDepth(
      tickerId,
      contract,
      numRows,
      isSmartDepth,
      []
    );

    return { subscribed: true, tickerId };
  }

  cancelMktDepth(body = {}) {
    const { tickerId, isSmartDepth = true } = body;

    const state = this.#mktDepthState.get(tickerId);

    if (state && state.status === 'pending') {
      // TWS ещё не подтвердил подписку — отложить cancel.
      state.status = 'pending-cancel';

      return { cancelled: false, deferred: true, tickerId };
    }

    // active, pending-cancel, или не tracked — отправить cancel в TWS.
    if (state) {
      clearTimeout(state.timer);
      this.#mktDepthState.delete(tickerId);
    }

    this.#api.api.cancelMktDepth(tickerId, isSmartDepth);

    return { cancelled: true, tickerId };
  }

  cancelAllMktDepth() {
    for (const [tickerId, state] of this.#mktDepthState) {
      clearTimeout(state.timer);

      if (state.status === 'active') {
        this.#api.api.cancelMktDepth(tickerId, state.isSmartDepth);
        this.#mktDepthState.delete(tickerId);
      } else if (state.status === 'pending') {
        state.status = 'pending-cancel';
      } else {
        this.#mktDepthState.delete(tickerId);
      }
    }
  }

  #tickByTickHandlersInstalled = false;

  // reqId → { status: 'pending' | 'active' | 'pending-cancel', timer }
  #tickByTickState = new Map();

  #installTickByTickHandlers() {
    if (this.#tickByTickHandlersInstalled) return;
    this.#tickByTickHandlersInstalled = true;

    this.#api.api.on(
      EventName.tickByTickAllLast,
      (reqId, tickType, time, price, size, tickAttribLast, exchange, specialConditions) => {
        const state = this.#tickByTickState.get(reqId);

        if (state) {
          if (state.status === 'pending-cancel') {
            clearTimeout(state.timer);
            this.#tickByTickState.delete(reqId);
            this.#api.api.cancelTickByTickData(reqId);

            return;
          }

          if (state.status === 'pending') {
            clearTimeout(state.timer);
            state.status = 'active';
          }
        }

        this.#app.publish(
          this.#key,
          JSON.stringify({
            message: 'tickByTick',
            payload: {
              reqId,
              tickType,
              time,
              price,
              size,
              pastLimit: tickAttribLast?.pastLimit ?? false,
              unreported: tickAttribLast?.unreported ?? false,
              exchange: exchange ?? '',
              specialConditions: specialConditions ?? ''
            }
          })
        );
      }
    );
  }

  reqTickByTick(body = {}) {
    const { reqId, contract } = body;

    this.#installTickByTickHandlers();

    this.#tickByTickState.set(reqId, {
      status: 'pending',
      timer: setTimeout(() => {
        this.#tickByTickState.delete(reqId);
      }, 10000)
    });

    this.#api.api.reqTickByTickData(
      reqId,
      contract,
      'AllLast',
      0,
      false
    );

    return { subscribed: true, reqId };
  }

  cancelTickByTick(body = {}) {
    const { reqId } = body;

    const state = this.#tickByTickState.get(reqId);

    if (state && state.status === 'pending') {
      // TWS ещё не подтвердил подписку — отложить cancel.
      state.status = 'pending-cancel';

      return { cancelled: false, deferred: true, reqId };
    }

    // active, pending-cancel, или не tracked — отправить cancel в TWS.
    if (state) {
      clearTimeout(state.timer);
      this.#tickByTickState.delete(reqId);
    }

    this.#api.api.cancelTickByTickData(reqId);

    return { cancelled: true, reqId };
  }

  cancelAllTickByTick() {
    for (const [reqId, state] of this.#tickByTickState) {
      clearTimeout(state.timer);

      if (state.status === 'active') {
        this.#api.api.cancelTickByTickData(reqId);
        this.#tickByTickState.delete(reqId);
      } else if (state.status === 'pending') {
        state.status = 'pending-cancel';
      } else {
        this.#tickByTickState.delete(reqId);
      }
    }
  }

  async getHistoricalTicksLast(body = {}) {
    const {
      contract,
      numberOfTicks = 100,
      useRth = false,
      startDateTime = '',
      endDateTime = ''
    } = body;

    return this.#api
      .getHistoricalTicksLast(
        contract,
        startDateTime,
        endDateTime,
        numberOfTicks,
        useRth
      )
      .toPromise();
  }

  async reqContractDetails(body = {}) {
    const { contract } = body;

    return this.#api.getContractDetails(contract);
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
    const connections = this.#connections;

    this.#app
      .ws('/*', {
        idleTimeout: 10,
        maxPayloadLength: 1024 ** 2,
        maxBackpressure: 128 * 1024 * 1024,
        close: (ws) => {
          ws.closed = true;

          if (ws.key) {
            const connection = connections.get(ws.key);

            if (connection) {
              connection.cancelAllMktDepth();
              connection.cancelAllTickByTick();
            }
          }
        },
        message(ws, message) {
          const text = Buffer.from(message).toString();

          // First message is the subscription key (backwards compatible).
          if (!ws.key) {
            ws.key = text;

            ws.subscribe(text);
            ws.send(
              JSON.stringify({
                message: 'subscription',
                payload: {
                  subscribed: true
                }
              })
            );

            return;
          }

          // Subsequent messages are JSON commands.
          try {
            const data = JSON.parse(text);
            const connection = connections.get(ws.key);

            if (
              !connection ||
              connection.connectionState !== ConnectionState.Connected
            ) {
              return;
            }

            switch (data.message) {
              case 'reqMktDepth':
                connection.reqMktDepth(data.payload);

                break;
              case 'cancelMktDepth':
                connection.cancelMktDepth(data.payload);

                break;
              case 'reqTickByTick':
                connection.reqTickByTick(data.payload);

                break;
              case 'cancelTickByTick':
                connection.cancelTickByTick(data.payload);

                break;
            }
          } catch (e) {
            console.error('[ib-gateway] WS command error:', e);
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
            'positions',
            'reqContractDetails',
            'getHistoricalTicksLast'
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
              `[ib-gateway.mjs] Listening to port ${uWS.us_socket_local_port(
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
