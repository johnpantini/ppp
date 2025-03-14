// ==PPPScript==
// @version 25
// ==/PPPScript==

import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { WebSocket as WS } from '/ppp/vendor/websocket/websocket.mjs';
import uWS from '/ppp/vendor/uWebSockets.js/uws.js';
import Redis from '/ppp/vendor/ioredis.min.js';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { PPPUWSWorkerApplication, defaultRedisOptions, later, EventBus } =
  await import(`${ROOT}/lib/aspirant-worker/utils.mjs`);

const { default: zip } = await import(`${ROOT}/vendor/zip-full.min.js`);
const jose = await import(`${ROOT}/vendor/jose.min.mjs`);

globalThis.vm = vm;
globalThis.later = later;
globalThis.https = https;
globalThis.zip = zip;
globalThis.jose = jose;
globalThis.EventBus = EventBus;
globalThis.module = {};
globalThis.WebSocket = WS;
globalThis.__filename ??= fileURLToPath(import.meta.url);
globalThis.__dirname ??= path.dirname(globalThis.__filename);
globalThis.navigator ??= {
  userAgent: process.env.USER_AGENT
};

const {
  onRuntimeWebSocketOpen,
  onRuntimeWebSocketDrain,
  onRuntimeWebSocketClose,
  onRuntimeWebSocketMessage
} = await import(
  `${ROOT}/lib/aspirant-worker/ppp-trader-runtime/runtime-classes.mjs`
);

class PPPTraderRuntime extends PPPUWSWorkerApplication {
  $$app = globalThis.ppp.$debug('app');

  $$server = globalThis.ppp.$debug('server');

  $$ws = globalThis.ppp.$debug('ws');

  #app = uWS.App({});

  traders = new Map();

  redis = new Redis(defaultRedisOptions());

  bus = new Redis(defaultRedisOptions());

  // Key: ws, value: Map(sourceID, RemoteSource)
  wsSources = new WeakMap();

  getFullKey(key) {
    return `aspirant-worker:ppp-trader-runtime:${process.env.PPP_WORKER_ID}:${key}`;
  }

  constructor() {
    super();

    globalThis.ppp.runtime = this;

    return this.#connect();
  }

  #connect() {
    this.#app
      .ws('/*', {
        idleTimeout: 0,
        maxPayloadLength: 1024 ** 3,
        maxBackpressure: 1024 ** 3,
        open: onRuntimeWebSocketOpen.bind(this),
        close: onRuntimeWebSocketClose.bind(this),
        message: onRuntimeWebSocketMessage.bind(this),
        drain: onRuntimeWebSocketDrain.bind(this)
      })
      .post('/call', async (res) => {
        try {
          const payload = await this.readJSONPayload(res);
          const existingTrader = this.traders.get(payload._id);

          if (typeof existingTrader !== 'undefined') {
            return this.jsonResponse(
              res,
              await existingTrader.call(payload.data ?? {})
            );
          } else {
            return this.jsonResponse(res, {});
          }
        } catch (e) {
          return this.errorResponse(res, e);
        }
      })
      .post('/serialize', async (res) => {
        try {
          const payload = await this.readJSONPayload(res);
          const existingTrader = this.traders.get(payload._id);

          if (typeof existingTrader !== 'undefined') {
            return this.jsonResponse(res, await existingTrader.serialize());
          } else {
            return this.jsonResponse(res, {});
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
        process.env.NOMAD_PORT_HTTP ?? process.env.PORT ?? 14177,
        (listenSocket) => {
          if (listenSocket) {
            this.$$app(
              'PPPTraderRuntime is listening on port %d',
              uWS.us_socket_local_port(listenSocket)
            );
          } else {
            this.$$app('failed to get a port, terminating...');
            process.exit(1);
          }
        }
      );
  }
}

await import(`${ROOT}/lib/debug.js`);
new PPPTraderRuntime();
