import { createServer } from 'http2';

createServer()
  .on('error', (err) => console.error(err))
  .on('stream', (stream, headers) => {
    stream.respond({
      ':status': 200
    });

    stream.write('Test unencrypted HTTP/2');
    stream.end();
  })
  .listen(process.env.PORT ?? 3777);
