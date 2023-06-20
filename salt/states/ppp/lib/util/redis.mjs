async function redisCommand(command, args = []) {
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
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
            options: {
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
            },
            command,
            args
          })
        }
      )
    ).text();
  }

  return null;
}

export { redisCommand };
