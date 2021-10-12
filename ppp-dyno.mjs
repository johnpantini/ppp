import { createServer } from 'http';

let i = 0;

createServer((request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  response.setHeader('Transfer-Encoding', 'chunked');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  response.write(i + '');

  const int = setInterval(() => {
    console.log(1);

    response.write(i++ + 'ABC');
  }, 1000);

  request.on('abort', () => {
    console.log('abort');
  });

  request.on('error', () => {
    clearInterval(int);
  });

  request.on('close', () => {
    clearInterval(int);
  });
}).listen(process.env.PORT ?? 3777);
