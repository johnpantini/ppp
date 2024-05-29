import { EventEmitter } from 'node:events';
import Redis from '/ppp/vendor/ioredis.min.js';

export class PPPUWSWorkerApplication extends EventEmitter {
  constructor() {
    super();

    process
      .on('uncaughtException', (error) => {
        console.error(error);
        this.emit('exception', error);
      })
      .on('unhandledRejection', (reason) => {
        console.error(error);
        this.emit('exception', reason);
      });
  }

  async readJSONPayload(res) {
    return new Promise((resolve, reject) => {
      res.onAborted(() => {
        res.aborted = true;

        return resolve({});
      });

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

              return reject(e);
            }

            resolve(json);
          } else {
            try {
              json = JSON.parse(chunk.toString());
            } catch (e) {
              res.close();

              return;
            }

            resolve(json);
          }
        } else if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      });
    });
  }

  jsonResponse(res, json = {}) {
    if (res.aborted) {
      return;
    }

    return res.cork(() => {
      res
        .writeStatus('200 OK')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8');

      if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
        res.writeHeader('Access-Control-Allow-Origin', '*');
      }

      res.end(
        JSON.stringify({
          ok: true,
          result: json
        })
      );
    });
  }

  errorResponse(
    res,
    error = {
      name: 'InternalServerError',
      message: 'An internal server error occurred.'
    }
  ) {
    console.error(error);

    if (res.aborted) {
      return;
    }

    return res.cork(() => {
      // noinspection JSVoidFunctionReturnValueUsed
      res
        .writeStatus('400 Bad Request')
        .writeHeader('Content-Type', 'application/json;charset=UTF-8');

      if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
        res.writeHeader('Access-Control-Allow-Origin', '*');
      }

      res.end(
        JSON.stringify({
          ok: false,
          error: error
            ? {
                name:
                  error.name === 'Error' ? 'InternalServerError' : error.name,
                message: error.message
              }
            : null
        })
      );
    });
  }
}

export function defaultRedisOptions() {
  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    tls: process.env.REDIS_TLS
      ? {
          servername: process.env.REDIS_HOST
        }
      : void 0,
    username: process.env.REDIS_USERNAME,
    db: parseInt(process.env.REDIS_DATABASE ?? '0'),
    password: process.env.REDIS_PASSWORD
  };
}

export function canUseRedis() {
  return ['REDIS_HOST', 'REDIS_PORT'].every(
    (v) => typeof process.env[v] !== 'undefined'
  );
}

export async function redisCommand(command, args = []) {
  if (canUseRedis()) {
    const client = new Redis(
      Object.assign({}, defaultRedisOptions(), { lazyConnect: true })
    );

    client.on('error', (e) => {
      console.dir(e);
    });

    try {
      await client.connect();

      return client[command]?.apply(client, args);
    } catch (e) {
      console.error(e);

      return null;
    } finally {
      client.quit();
    }
  }

  return null;
}

export function equalConstTime(s1, s2) {
  if (s1.length !== s2.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < s1.length; i++) {
    result |= s1[i].charCodeAt(0) ^ s2[i].charCodeAt(0);
  }

  return result === 0;
}

export async function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });

  clearTimeout(id);

  return response;
}

export function formatDateRU(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).format(new Date(date));
}
