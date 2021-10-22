const { createServer } = require('http');
const { request } = require('https');
const { Client } = require('./ppp-dyno/ssh2');

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

async function fetch(url, options = {}) {
  const u = new URL(url);

  return new Promise(async (resolve, reject) => {
    const requestOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: options.method,
      headers: options.headers
    };

    const req = request(requestOptions, async (res) => {
      try {
        let responseText = '';

        for await (const chunk of res) {
          responseText += chunk;
        }

        resolve({
          responseText,
          headers: res.headers,
          statusCode: res.statusCode
        });
      } catch (error) {
        reject({
          responseText: error.toString(),
          headers: res.headers,
          statusCode: res.statusCode
        });
      }
    });

    req.on('error', (error) => reject(error));

    if (options.body) req.write(options.body);

    req.end();
  });
}

async function ut(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());
    const utResponse = await fetch(
      'https://sso.unitedtraders.com/rest/grpc/com.unitedtraders.luna.sessionservice.api.sso.SsoService.authorizeByFirstFactor',
      {
        method: 'POST',
        headers: {
          'User-Agent':
            request.headers['user-agent'] ??
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          realm: 'aurora',
          clientId: 'utcom',
          loginOrEmail: body.login,
          password: body.password,
          product: 'UTCOM',
          locale: 'ru'
        })
      }
    );

    response.setHeader('Content-Type', utResponse.headers['content-type']);
    response.writeHead(utResponse.statusCode);
    response.write(utResponse.responseText);
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

    client = new Client();

    client
      .on('ready', () => {
        client.exec(body.cmd, { pty: true }, (err, stream) => {
          if (err) {
            console.error(err);

            return response.writeHead(503).end();
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

    client.end();

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

createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  switch (request.url) {
    case '/':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write(`https://${request.headers.host}`);
      response.end();

      break;
    case '/ut':
      return ut(request, response);
    case '/ssh':
      return ssh(request, response);
    case '/ping':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write('pong');
      response.end();

      break;
    default:
      response.writeHead(404).end();
  }
}).listen(process.env.PORT ?? 3777);
