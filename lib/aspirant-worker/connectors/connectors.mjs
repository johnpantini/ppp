// ==PPPScript==
// @version 4
// ==/PPPScript==

import { createServer } from 'http';
import { request as httpsRequest } from 'https';
import Redis from '/ppp/vendor/ioredis.min.js';

const ROOT = process.env.DOCKERIZED ? '.' : '/ppp';
const { Connection } = await import(`${ROOT}/vendor/pg/connection.min.mjs`);
const SSH = await import(`${ROOT}/vendor/ssh2/ssh2.min.js`);
const SSHClient = SSH.default.Client;

async function finamGrpc(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  request.headers.host = 'trade-api.finam.ru';
  request.headers['content-type'] = 'application/grpc';
  request.headers['x-grpc-web'] = null;

  const finamReq = httpsRequest(
    {
      host: 'trade-api.finam.ru',
      port: 443,
      path: request.url.split(/^\/finam-grpc/i)[1],
      method: request.method,
      headers: request.headers
    },
    (finamRes) => {
      response.writeHead(finamRes.statusCode, finamRes.headers);
      finamRes.pipe(response, { end: true });
    }
  );

  return request.pipe(finamReq, { end: true });
}

async function $fetch(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());
    const headers = body.headers ?? {};
    const requestOptions = {
      method: body.method?.toUpperCase() ?? request.method.toUpperCase(),
      headers
    };

    if (typeof body.body === 'string') {
      requestOptions.body = body.body;
    } else if (body.body && typeof body.body === 'object') {
      requestOptions.body = JSON.stringify(body.body);
    }

    if (
      requestOptions.body &&
      typeof requestOptions.headers['Content-Length'] === 'undefined'
    )
      requestOptions.headers['Content-Length'] = Buffer.byteLength(
        requestOptions.body
      );

    const fetchResponse = await fetch(body.url, requestOptions);
    const ct = fetchResponse.headers.get(['content-type']);

    if (ct) response.setHeader('Content-Type', ct);

    const headersToInclude = [];

    if (Array.isArray(body.headersToInclude)) {
      for (const header of body.headersToInclude) {
        headersToInclude.push({
          header,
          value: fetchResponse.headers.get(header)
        });
      }
    }

    response.writeHead(fetchResponse.status);

    const text = await fetchResponse.text();

    if (headersToInclude.length) {
      response.write(
        JSON.stringify({
          headers: headersToInclude,
          response: text
        })
      );
    } else {
      response.write(text);
    }

    response.end();
  } catch (e) {
    console.error(e);

    response.setHeader('Content-Type', 'application/json; charset=UTF-8');
    response.writeHead(400);
    response.write(
      JSON.stringify({
        error: {
          message: e.message
        }
      })
    );
    response.end();
  }
}

async function ssh(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  let client;

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());

    if (!body.cmd || typeof body.cmd !== 'string')
      return response.writeHead(422).end();

    response.setHeader('Transfer-Encoding', 'chunked');
    response.setHeader('Content-Type', 'application/json; charset=UTF-8');

    client = new SSHClient();

    client
      .on('ready', () => {
        client.exec(body.cmd, { pty: true }, (err, stream) => {
          if (err) {
            console.error(err);

            response.writeHead(503);
            response.write(
              JSON.stringify({
                e: {
                  level: err.level,
                  message: err.message
                }
              })
            );

            return response.end();
          }

          stream
            .on('close', () => {
              client.end();
            })
            .on('data', (data) => {
              response.write(data.toString());
            })
            .stderr.on('data', (data) => {
              response.write(data.toString());
            });
        });
      })
      .on('error', (e) => {
        console.error(e);

        if (!response.writableEnded) {
          response.writeHead(400);
          response.write(
            JSON.stringify({
              e: {
                level: e.level,
                message: e.message
              }
            })
          );
          response.end();
        }
      })
      .on('end', () => response.end())
      .connect(body);

    request.on('close', () => client.end());
  } catch (e) {
    console.error(e);

    if (client) client.end();

    response.writeHead(400);
    response.write(
      JSON.stringify({
        e: {
          message: e.message
        }
      })
    );

    response.end();
  }
}

async function pg(request, response) {
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

    if (!body.connectionString || typeof body.connectionString !== 'string')
      return response.writeHead(422).end();

    if (!body.query || typeof body.query !== 'string')
      return response.writeHead(422).end();

    let connection;

    try {
      connection = new Connection(body.connectionString);

      await connection.connect();

      const result = await connection.execute(body.query, body.options ?? {});

      response.write(JSON.stringify(result));
      response.end();
    } finally {
      if (connection) await connection.close();
    }
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
          : result.toString() ?? ''
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

const server = createServer(async (request, response) => {
  if (typeof process.env.NOMAD_PORT_HTTP === 'undefined') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    response.setHeader('Access-Control-Allow-Headers', '*');
  }

  if (/options/i.test(request.method)) {
    return response.writeHead(200).end();
  }

  if (request.url.startsWith('/finam-grpc/')) {
    return finamGrpc(request, response);
  }

  switch (request.url) {
    case '/':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write(`https://${request.headers.host}`);
      response.end();

      break;
    case '/fetch':
      return $fetch(request, response);
    case '/ssh':
      return ssh(request, response);
    case '/pg':
      return pg(request, response);
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
}).listen(process.env.NOMAD_PORT_HTTP ?? process.env.PORT ?? 9999, () => {
  console.log('Connector is listening to port ' + server.address().port);
});
