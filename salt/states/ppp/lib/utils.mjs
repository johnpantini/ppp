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
  if (process.env.SERVICE_MACHINE_URL && canUseRedis()) {
    return await (
      await fetch(
        new URL('redis', process.env.SERVICE_MACHINE_URL).toString(),
        {
          method: 'POST',
          cache: 'reload',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            options: defaultRedisOptions(),
            command,
            args
          })
        }
      )
    ).text();
  }

  return null;
}

/**
 * uWebSockets.js helper.
 *
 * @param r
 * @param cb
 */
export function readJSONPayload(r, cb) {
  let buffer;

  r.onData((ab, isLast) => {
    let chunk = Buffer.from(ab);

    if (isLast) {
      let json;

      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
        } catch (e) {
          console.error(e);
          r.close();

          return;
        }

        cb(json);
      } else {
        try {
          json = JSON.parse(chunk.toString());
        } catch (e) {
          r.close();

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

  r.onAborted(() => {
    r.aborted = true;

    console.error('readJSONPayload() failed: invalid JSON or no data.');
  });
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
