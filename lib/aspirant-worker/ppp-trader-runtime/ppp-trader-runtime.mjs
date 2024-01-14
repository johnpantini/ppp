// ==PPPScript==
// @version 1
// @meta {"enableHttp":true}
// ==/PPPScript==

import { createServer } from 'http';

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
      response.write('Hello from PPP!');
      response.end();

      break;

    default:
      response.writeHead(404).end();
  }
}).listen(process.env.NOMAD_PORT_HTTP ?? process.env.PORT ?? 38118);
