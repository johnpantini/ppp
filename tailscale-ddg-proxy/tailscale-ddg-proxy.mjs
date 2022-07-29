import { createServer } from 'http';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

async function handleFetch(request, response) {
  if (!/post/i.test(request.method)) {
    return response.writeHead(405).end();
  }

  const buffers = [];

  for await (const chunk of request) {
    buffers.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(buffers).toString());
    const response = await fetch(body.url, {
      method: body.method ?? 'GET',
      headers: body.headers
    });

    const ct = response.headers['Content-Type'];

    if (ct) response.setHeader('Content-Type', ct);

    response.writeHead(response.status);
    response.write(await response.text());
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

createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  response.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (/options/i.test(request.method)) {
    return response.writeHead(200).end();
  }

  switch (request.url) {
    case '/fetch':
      return handleFetch(request, response);
    case '/ping':
      response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      response.write('pong');
      response.end();

      break;
    default:
      response.writeHead(404).end();
  }
}).listen(process.env.PORT ?? 24344);
