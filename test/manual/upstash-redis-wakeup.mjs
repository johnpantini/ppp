import tls from 'node:tls';

const star = Buffer.from('*', 'ascii');
const dollar = Buffer.from('$', 'ascii');
const crlf = Buffer.from('\r\n', 'ascii');

function toRESPBulkString(string) {
  const asciiString = Buffer.from(string, 'ascii');
  const byteLength = Buffer.from(String(asciiString.length), 'ascii');
  const totalLength =
    dollar.length +
    byteLength.length +
    crlf.length +
    asciiString.length +
    crlf.length;

  return Buffer.concat(
    [dollar, byteLength, crlf, asciiString, crlf],
    totalLength
  );
}

function toRESPArray(command) {
  const respStrings = command.map(toRESPBulkString);
  const stringCount = Buffer.from(String(respStrings.length), 'ascii');

  return Buffer.concat([star, stringCount, crlf, ...respStrings]);
}

function createRedisCommand(commands) {
  const respArrays = commands.map(toRESPArray);

  return Buffer.concat([...respArrays, crlf]);
}

const socket = tls.connect({
  host: process.env.HOST,
  port: process.env.PORT,
  servername: process.env.HOST
});

socket.setEncoding('utf8');
socket.on('connect', () => {
  socket.write(
    createRedisCommand([
      ['auth', process.env.USERNAME || 'default', process.env.PASSWORD]
    ])
  );
  socket.write(
    createRedisCommand([['set', process.env.KEY, new Date().toISOString()]])
  );

  process.nextTick(() => socket.end());
});
