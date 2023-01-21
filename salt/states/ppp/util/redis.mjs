async function redisCommand(command, args = []) {
  if (process.env.REDIS_HOST && process.env.PPP_WORKER_ID) {
    return await (
      await fetch(
        new URL('redis', process.env.SERVICE_MACHINE_URL).toString(),
        {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            options: {
              host: process.env.REDIS_HOST,
              port: +process.env.REDIS_PORT,
              tls: !!process.env.REDIS_TLS
                ? {
                    servername: process.env.REDIS_HOST
                  }
                : void 0,
              username: process.env.REDIS_USERNAME,
              db: +process.env.REDIS_DATABASE,
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
