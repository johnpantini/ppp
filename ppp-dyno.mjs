import { createServer } from 'http';
import { Client } from './ppp-dyno/ssh2/index.js';

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

async function ssh(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());

    if (!body.cmd || typeof body.cmd !== 'string')
      return response.writeHead(422).end();

    response.setHeader('Transfer-Encoding', 'chunked');
    response.setHeader('Content-Type', 'application/json; charset=UTF-8');

    const client = new Client();

    client
      .on('ready', () => {
        client.exec(body.cmd, (err, stream) => {
          if (err) {
            console.error(err);

            return response.writeHead(503).end();
          }

          stream
            .on('close', () => {
              client.end();
            })
            .on('data', (data) => {
              response.write(
                JSON.stringify({
                  s: 'o',
                  d: data.toString()
                })
              );
            })
            .stderr.on('data', (data) => {
              response.write(
                JSON.stringify({
                  s: 'e',
                  d: data.toString()
                })
              );
            });
        });
      })
      .on('error', (e) => {
        console.error(e);

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
      })
      .on('end', () => response.end())
      .connect(body);

    request.on('close', () => client.end());
  } catch (e) {
    console.error(e);

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
