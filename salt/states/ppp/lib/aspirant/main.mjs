import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import uWS from '../uWebSockets.js/uws.js';
import * as inspector from 'node:inspector';

const httpStatuses = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  419: 'Insufficient Space on Resource',
  420: 'Method Failure',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  507: 'Insufficient Storage',
  511: 'Network Authentication Required'
};

async function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

const PORT = process.env.PORT ?? 32456;

function readJSON(res, cb) {
  let buffer;

  res.onData((ab, isLast) => {
    let chunk = Buffer.from(ab);

    if (isLast) {
      let json;

      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
        } catch (e) {
          console.error(e);
          res.close();

          return;
        }

        cb(json);
      } else {
        try {
          json = JSON.parse(chunk.toString());
        } catch (e) {
          console.error(e);
          res.close();

          return;
        }

        cb(json);
      }
    } else if (buffer) {
      buffer = Buffer.concat([buffer, chunk]);
    } else {
      buffer = Buffer.concat([chunk]);
    }
  });

  res.onAborted(() => {
    console.error('Invalid JSON or no data.');
  });
}

function cors(res) {
  if (res) {
    res
      .writeHeader('Access-Control-Allow-Origin', '*')
      .writeHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
      )
      .writeHeader('Access-Control-Allow-Headers', 'content-type');
  }

  return res;
}

export default class Aspirant {
  #id;

  #respawnTimeout;

  #redisCommand;

  #workers = new Map();

  constructor({
    id,
    serviceMachineUrl,
    tls,
    host,
    port,
    username,
    db,
    password,
    respawnTimeout = 1000
  }) {
    globalThis.Aspirant = this;

    this.#respawnTimeout = respawnTimeout;
    this.#id = id;
    this.#redisCommand = async (command, args) =>
      fetch(new URL('redis', serviceMachineUrl).toString(), {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            host,
            port,
            tls: tls
              ? {
                  servername: host
                }
              : void 0,
            username,
            db,
            password
          },
          command,
          args
        })
      });
  }

  get key() {
    return `ppp-aspirant:${this.#id}:workers`;
  }

  async #sync() {
    try {
      // Can fail if service machine is not OK
      const map = await (
        await this.#redisCommand('hgetall', [this.key])
      ).json();

      for (const _id of Object.keys(map)) {
        const { source, env, reconnectTimeout } = JSON.parse(map[_id]);

        await this.#runWorker(_id, { source, env, reconnectTimeout });
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => this.#sync(), 1000);
    }
  }

  #onWorkerExit() {
    for (const v of globalThis.Aspirant.#workers.values()) {
      if (v.worker === this) {
        v.worker.timer = setTimeout(() => {
          if (globalThis.Aspirant.#workers.has(v._id))
            void globalThis.Aspirant.#runWorker(v._id, {
              source: v.source,
              env: v.env,
              reconnectTimeout: v.reconnectTimeout
            });
        }, +v.reconnectTimeout || globalThis.Aspirant.#respawnTimeout);

        break;
      }
    }
  }

  async #runWorker(_id, { source, env = {}, reconnectTimeout }) {
    try {
      if (this.#workers.has(_id)) {
        const currentWorkerData = this.#workers.get(_id);

        clearTimeout(currentWorkerData.worker.timer);

        await currentWorkerData.worker.terminate();
        currentWorkerData.worker.unref();
        currentWorkerData.worker.off('exit', this.#onWorkerExit);
        this.#workers.delete(_id);
      }

      const PPP_ASPIRANT_FILENAME = fileURLToPath(import.meta.url);
      const PPP_ASPIRANT_DIRNAME = path.dirname(PPP_ASPIRANT_FILENAME);

      this.#workers.set(_id, {
        _id,
        source,
        env,
        worker: new Worker(new URL(`data:text/javascript,${source}`), {
          env: Object.assign(
            { PPP_ASPIRANT_FILENAME, PPP_ASPIRANT_DIRNAME, PPP_WORKER_ID: _id },
            process.env,
            env
          ),
          workerData: {
            aspirant: this
          }
        })
      });

      this.#workers
        .get(_id)
        .worker.on('error', (e) => {
          console.error(e);
        })
        .on('message', (value) => {
          console.log(value);
        })
        .on('exit', this.#onWorkerExit);
    } catch (e) {
      console.error(e);

      setTimeout(() => {
        this.#runWorker(_id, { source, env, reconnectTimeout });
      }, +reconnectTimeout || this.#respawnTimeout);
    }
  }

  async main() {
    uWS
      .App({})
      .get('/workers', async (res) => {
        res
          .writeHeader('Content-Type', 'application/json;charset=UTF-8')
          .end(JSON.stringify(Object.fromEntries(this.#workers)));
      })
      .options('/*', (res) => {
        return cors(res).writeStatus('200 OK').end();
      })
      .post('/workers', async (res) => {
        readJSON(res, async (payload = {}) => {
          try {
            const { _id, source, env = {}, reconnectTimeout } = payload;

            if (!_id)
              return cors(res)
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker _id.');

            if (!source)
              return cors(res)
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker source.');

            await this.#redisCommand('hset', [
              this.key,
              _id,
              JSON.stringify({ source, env })
            ]);

            await this.#runWorker(_id, {
              source,
              env,
              reconnectTimeout
            });

            cors(res)
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('200 OK');
          } catch (e) {
            console.error(e);

            cors(res)
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .del('/workers', async (res) => {
        readJSON(res, async (payload = {}) => {
          try {
            const { _id } = payload;

            if (!_id)
              return cors(res)
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker _id.');

            await this.#redisCommand('hdel', [this.key, _id]);

            if (this.#workers.has(_id)) {
              const currentWorkerData = this.#workers.get(_id);

              clearTimeout(currentWorkerData.worker.timer);

              this.#workers.delete(_id);
              currentWorkerData.worker.off('exit', this.#onWorkerExit);
              currentWorkerData.worker.postMessage('cleanup');
              await later(1000);
              await currentWorkerData.worker.terminate();
              currentWorkerData.worker.unref();
            }

            cors(res)
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('200 OK');
          } catch (e) {
            console.error(e);

            cors(res)
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .get('/ping_redis', async (res) => {
        res.onAborted(() => {
          console.error(res);
        });

        try {
          cors(res)
            .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
            .end(await (await this.#redisCommand('ping')).text());
        } catch (e) {
          console.error(e);

          cors(res)
            .writeStatus('500 Internal Server Error')
            .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
            .end('500 Internal Server Error');
        }
      })
      .get('/ping', async (res) => {
        cors(res)
          .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
          .end('pong');
      })
      .post('/fetch', async (res) => {
        readJSON(res, async (payload = {}) => {
          try {
            const headers = payload.headers ?? {};
            const requestOptions = {
              method: payload.method?.toUpperCase() ?? 'POST',
              headers
            };

            if (!headers['User-Agent']) {
              headers['User-Agent'] =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36';
            }

            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            }

            if (typeof payload.body === 'string') {
              requestOptions.body = payload.body;
            } else if (typeof payload.body === 'object')
              requestOptions.body = JSON.stringify(payload.body);

            if (
              requestOptions.body &&
              typeof requestOptions.headers['Content-Length'] === 'undefined'
            )
              requestOptions.headers['Content-Length'] = Buffer.byteLength(
                requestOptions.body
              );

            const response = await fetch(payload.url, requestOptions);
            const ct = response.headers.get('content-type');

            const chain = cors(res).writeStatus(
              `${response.status} ${
                httpStatuses[response.status] ?? 'Unknown Error'
              }`
            );

            if (ct) chain.writeHeader('Content-Type', ct);

            chain.end(await response.text());
          } catch (e) {
            console.error(e);

            cors(res)
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .get('/inspector_url', async (res) => {
        cors(res)
          .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
          .end(inspector.url());
      })
      .get('/', async (res) => {
        cors(res)
          .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
          .end(this.#id);
      })
      .listen('0.0.0.0', PORT, async (listenSocket) => {
        if (listenSocket) {
          console.log(`Listening to port ${PORT}`);
        }
      });

    await this.#sync();
  }
}

if (!process.env.ASPIRANT_ID) console.error('Aspirant ID must be provided.');
else if (!process.env.SERVICE_MACHINE_URL)
  console.error('Missing service machine URL.');
else {
  await new Aspirant({
    id: process.env.ASPIRANT_ID,
    serviceMachineUrl: process.env.SERVICE_MACHINE_URL,
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    tls: !!process.env.REDIS_TLS,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: +process.env.REDIS_DATABASE,
    respawnTimeout: +process.env.RESPAWN_TIMEOUT || 1000
  }).main();
}
