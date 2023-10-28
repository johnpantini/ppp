import { spawnSync } from 'node:child_process';
import { createServer } from 'http';
import Redis from '/ppp/vendor/ioredis.min.js';

process.on('unhandledRejection', (err) => {
  console.log(err);
});

async function shell(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  response.setHeader('Content-Type', 'application/json; charset=UTF-8');

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());

    if (!body.command || typeof body.command !== 'string')
      return response.writeHead(422).end();

    if (!Array.isArray(body.args)) body.args = [];

    console.log('Executing shell command:', body.command);
    console.log('With arguments:', body.args);

    const { pid, stdout, stderr, status, signal, error } = spawnSync(
      body.command,
      body.args,
      body.options ?? { stdio: 'pipe' }
    );

    response.write(
      JSON.stringify({
        pid,
        stdout: stdout?.toString?.(),
        stderr: stderr?.toString?.(),
        status,
        signal,
        error
      })
    );
    response.end();
  } catch (e) {
    console.error(e);

    response.writeHead(400);
    response.write(
      JSON.stringify(
        Object.assign(
          {
            e
          },
          {
            message: e.message
          }
        )
      )
    );

    response.end();
  }
}

async function redis(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  response.setHeader('Content-Type', 'application/json; charset=UTF-8');

  let errorOccurred;

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());

    if (!body.options || typeof body.options !== 'object')
      return response.writeHead(422).end();

    if (!body.command || typeof body.command !== 'string')
      return response.writeHead(422).end();

    if (!Array.isArray(body.args)) body.args = [];

    console.log('Executing Redis command:', body.command);
    console.log('With arguments:', body.args);

    const client = new Redis(
      Object.assign({}, body.options, { lazyConnect: true })
    );

    client.on('error', (e) => {
      console.dir(e);

      errorOccurred = true;

      response.writeHead(400);
      response.write(
        JSON.stringify(
          Object.assign(
            {
              e
            },
            {
              message: e.message
            }
          )
        )
      );

      response.end();
    });

    try {
      await client.connect();

      const result = await client[body.command]?.apply(client, body.args);

      response.write(
        typeof result === 'object'
          ? JSON.stringify(result)
          : result?.toString?.() ?? ''
      );
      response.end();
    } finally {
      client.quit();
    }
  } catch (e) {
    if (errorOccurred) return;

    console.error(e);

    response.writeHead(400);
    response.write(
      JSON.stringify(
        Object.assign(
          {
            e
          },
          {
            message: e.message
          }
        )
      )
    );

    response.end();
  }
}

createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  response.setHeader('Access-Control-Allow-Headers', '*');

  if (/options/i.test(request.method)) {
    return response.writeHead(200).end();
  }

  switch (request.url) {
    case '/':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write('Hello from PPP Aspirant!');
      response.end();

      break;
    case '/shell':
      return shell(request, response);
    case '/redis':
      return redis(request, response);
    case '/ping':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write('pong');
      response.end();

      break;
    default:
      response.writeHead(404).end();
  }
}).listen(24422);
