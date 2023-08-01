// ==PPPScript==
// @version 1
// ==/PPPScript==

import { EventEmitter } from 'node:events';
import uWS from '/salt/states/ppp/lib/uWebSockets.js/uws.js';
import { readJSONPayload } from '/salt/states/ppp/lib/util/uws.mjs';
import IB from './lib/ib.min.js';

const { IBApiNext, LogLevel, ConnectionState } = IB;

class IBGatewayError extends Error {
  constructor(message) {
    super(message);

    this.name = 'IBGatewayError';
  }
}

class IBGateway extends EventEmitter {
  #app = uWS.App({});

  #api;

  #state = ConnectionState.Disconnected;

  #positions = [];

  #summary;

  #positionsObservable = {
    next({ all }) {
      this.#positions = {};

      for (const [accountId, positions] of all) {
        this.#positions[accountId] = positions;
      }

      this.#app.publish(
        'ppp',
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
        'ppp',
        JSON.stringify({
          message: 'summary',
          payload: this.#summary
        })
      );
    }
  };

  #connectionStateObservable = {
    next(state) {
      this.#state = state;

      if (state === ConnectionState.Connected) {
        this.#positionsObservable.next =
          this.#positionsObservable.next.bind(this);
        this.#summaryObservable.next = this.#summaryObservable.next.bind(this);

        this.#api.getPositions().subscribe(this.#positionsObservable);
        this.#api
          .getAccountSummary(
            'All',
            'NetLiquidation,TotalCashValue,SettledCash,AccruedCash,BuyingPower,AvailableFunds,ExcessLiquidity'
          )
          .subscribe(this.#summaryObservable);
      }

      this.#app.publish(
        'ppp',
        JSON.stringify({
          message: 'connection',
          payload: {
            state: this.#state
          }
        })
      );
    }
  };

  constructor() {
    super();

    process.on('uncaughtException', (error) => {
      this.emit('exception', error);
    });

    this.#connectionStateObservable.next =
      this.#connectionStateObservable.next.bind(this);
  }

  #errorOut(res, error) {
    res.cork(() => {
      // noinspection JSVoidFunctionReturnValueUsed
      res
        .writeStatus('400 Bad Request')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8')
        .end(
          JSON.stringify({
            ok: false,
            error: {
              name: error.name,
              message: error.message
            }
          })
        );
    });
  }

  json(res, json = {}) {
    res.cork(() => {
      res
        .writeStatus('200 OK')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8')
        .end(
          JSON.stringify({
            ok: true,
            result: json
          })
        );
    });
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

  async connect(body = {}) {
    this.#api = new IBApiNext({
      host: body.host ?? 'localhost',
      port: body.port ?? 7496,
      connectionWatchdogInterval: body.connectionWatchdogInterval ?? 5,
      reconnectInterval: body.reconnectInterval ?? 1000
    });

    this.#api.logLevel = LogLevel.DETAIL;

    this.#api.connectionState.subscribe(this.#connectionStateObservable);
    this.#api.connect();

    return {
      connectionState: ConnectionState[this.#state]
    };
  }

  disconnect() {
    this.#api?.disconnect?.();

    return {
      connectionState: ConnectionState[this.#state]
    };
  }

  connectionState() {
    return {
      connectionState: ConnectionState[this.#state]
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
    return this.#api.placeNewOrder(
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

  main() {
    this.#app
      .ws('/*', {
        maxBackpressure: 128 * 1024 * 1024,
        open: (ws) => {
          ws.subscribe('ppp');
        },
        close: (ws) => {
          ws.unsubscribe('ppp');
        }
      })
      .get('/ping', (res) => {
        res
          .writeStatus('200 OK')
          .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
          .end('pong');
      })
      .post('/call', (res) => {
        readJSONPayload(res, async (payload = {}) => {
          try {
            const allowedMethods = [
              'connect',
              'disconnect',
              'connectionState',
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

            if (allowedMethods.indexOf(method) === -1) {
              // noinspection ExceptionCaughtLocallyJS
              throw new IBGatewayError('E_UNKNOWN_METHOD');
            }

            if (
              [
                'connect',
                'disconnect',
                'connectionState',
                'summary',
                'positions'
              ].indexOf(method) === -1
            ) {
              if (this.#state !== ConnectionState.Connected) {
                // noinspection ExceptionCaughtLocallyJS
                throw new IBGatewayError('E_NO_TWS_CONNECTION');
              }
            }

            return this.json(res, await this[method](payload.body));
          } catch (e) {
            console.error(e);
            this.#errorOut(res, e);
          }
        });
      })
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
