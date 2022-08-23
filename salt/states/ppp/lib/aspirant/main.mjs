import process from 'node:process';
import { Worker } from 'node:worker_threads';
import uWS from '../uWebSockets.js/uws.js';

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
    try {
      // Can fail if service machine is not OK
      const map = await (
        await this.#redisCommand(['HGETALL', this.key])
      ).json();
      let i = 0;

      for (const _id of map) {
        if (i % 2 === 0) {
          const { source, env } = JSON.parse(map[i + 1]);

          await this.#runWorker(_id, { source, env });
        }

        i++;
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => this.#sync(), 1000);
    }
  }

  async #runWorker(_id, { source, env = {} }) {
    try {
      const currentWorkerData = this.#workers.get(_id);

      if (currentWorkerData?.worker) {
        await currentWorkerData.worker.terminate();
        currentWorkerData.worker.unref();
        this.#workers.delete(_id);
        delete currentWorkerData?.worker;
      }

      this.#workers.set(_id, {
        source,
        env,
        worker: new Worker(new URL(`data:text/javascript,${source}`), {
          env: Object.assign({}, process.env, env)
        })
      });

      this.#workers.get(_id).worker.once('exit', () => {
        if (this.#workers.has(_id)) {
          setTimeout(() => {
            if (this.#workers.has(_id)) {
              this.#runWorker(_id, { source, env });
            }
          }, 1000);
        }
      });
    } catch (e) {
      console.error(e);

      if (this.#workers.has(_id)) {
        setTimeout(() => {
          if (this.#workers.has(_id)) {
            this.#runWorker(_id, { source, env });
          }
        }, 1000);
      }
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
            const { _id, source, env = {} } = payload;

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

            await this.#redisCommand(['HDEL', this.key, _id]);

            const currentWorkerData = this.#workers.get(_id);

            this.#workers.delete(_id);

            if (currentWorkerData?.worker) {
              currentWorkerData.worker.removeAllListeners('exit');
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
            .end(await (await this.#redisCommand(['PING'])).text());
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
