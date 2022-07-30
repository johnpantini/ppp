import process from 'node:process';
import { Worker } from 'node:worker_threads';
import uWS from '../uWebSockets.js/uws.js';

const PORT = process.env.PORT ?? 32456;
const STATUS_TO_PHRASE = {
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
          res.close();

          return;
        }

        cb(json);
      } else {
        try {
          json = JSON.parse(chunk.toString());
        } catch (e) {
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

export default class Aspirant {
  #id;

  #redisCommand;

  #workers = new Map();

  constructor({
    id,
    serviceMachineUrl,
    host,
    port,
    tls,
    username,
    database,
    password
  }) {
    globalThis.Aspirant = this;

    this.#id = id;
    this.#redisCommand = async (command) =>
      fetch(new URL('redis', serviceMachineUrl).toString(), {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          socket: {
            host,
            port,
            tls
          },
          username,
          database,
          password,
          command
        })
      });
  }

  get key() {
    return `ppp-aspirant:${this.#id}:workers`;
  }

  async #sync() {
    const map = await (await this.#redisCommand(['HGETALL', this.key])).json();
    let i = 0;

    for (const _id of map) {
      if (i % 2 === 0) {
        const { source, env } = JSON.parse(map[i + 1]);

        await this.#runWorker(_id, { source, env });
      }

      i++;
    }
  }

  async #runWorker(_id, { source, env = {} }) {
    const currentWorker = this.#workers.get(_id);

    if (currentWorker?.worker) {
      await currentWorker.worker.terminate();
      currentWorker.worker.unref();
    }

    this.#workers.set(_id, {
      source,
      env,
      worker: new Worker(
        new URL(
          `data:text/javascript,${Buffer.from(source, 'base64').toString()}`
        ),
        {
          env: Object.assign({}, process.env, env)
        }
      )
    });
  }

  async main() {
    uWS
      .App({})
      .post('/worker', async (res) => {
        readJSON(res, async (payload = {}) => {
          try {
            const { _id, source, env = {} } = payload;

            if (!_id)
              return res
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker _id.');

            if (!source)
              return res
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker source.');

            await this.#redisCommand([
              'HSET',
              this.key,
              _id,
              JSON.stringify({ source, env })
            ]);

            await this.#runWorker(_id, {
              source,
              env
            });

            res
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('200 OK');
          } catch (e) {
            console.error(e);

            res
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .del('/worker', async (res) => {
        readJSON(res, async (payload = {}) => {
          try {
            const { _id } = payload;

            if (!_id)
              return res
                .writeStatus('400 Bad Request')
                .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
                .end('Missing worker _id.');

            await this.#redisCommand(['HDEL', this.key, _id]);

            const currentWorker = this.#workers.get(_id);

            if (currentWorker?.worker) {
              await currentWorker.worker.terminate();
              currentWorker.worker.unref();
            }

            this.#workers.delete(_id);

            res
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('200 OK');
          } catch (e) {
            console.error(e);

            res
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .get('/ping', async (res) => {
        res.writeHeader('Content-Type', 'text/plain;charset=UTF-8').end('pong');
      })
      .post('/fetch', async (res) => {
        readJSON(res, async (body = {}) => {
          try {
            const fetchResponse = await fetch(body.url, {
              method: body.method ?? 'GET',
              headers: body.headers,
              body: body.body
            });

            const ct = fetchResponse.headers.get('content-type');

            res
              .writeStatus(
                `${fetchResponse.status} ${
                  STATUS_TO_PHRASE[fetchResponse.status]
                }`
              )
              .writeHeader('Content-Type', ct)
              .end(await fetchResponse.text());
          } catch (e) {
            console.error(e);

            res
              .writeStatus('500 Internal Server Error')
              .writeHeader('Content-Type', 'text/plain;charset=UTF-8')
              .end('500 Internal Server Error');
          }
        });
      })
      .listen(PORT, async (listenSocket) => {
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
    database: +process.env.REDIS_DATABASE
  }).main();
}
