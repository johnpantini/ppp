import { createServer } from 'http';

function ssh(request, response) {
  response.setHeader('Transfer-Encoding', 'chunked');
}

createServer((request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  switch (request.url) {
    case '/':
      response.write(`https://${request.headers.host}`);
      response.end();

      break;
    case '/ssh':
      return ssh(request, response);
    default:
      response.writeHead(404).end();
  }
}).listen(process.env.PORT ?? 3777);
