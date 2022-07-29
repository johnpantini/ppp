import net from 'net';
import { createSocksServer } from './socks.mjs';

export const server = createSocksServer(
  (socket, port, address, proxyReady) => {
    const proxy = net.createConnection(
      {
        port: port,
        host: address
      },
      proxyReady
    );

    proxy.on('data', (d) => {
      try {
        if (!socket.write(d)) {
          proxy.pause();

          socket.on('drain', () => {
            proxy.resume();
          });

          setTimeout(() => {
            proxy.resume();
          }, 100);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('data', (d) => {
      try {
        if (!proxy.write(d)) {
          socket.pause();

          proxy.on('drain', () => {
            socket.resume();
          });

          setTimeout(() => {
            socket.resume();
          }, 100);
        }
      } catch (err) {
        console.error(err);
      }
    });

    proxy.on('error', (err) => {
      console.error(err);
    });

    proxy.on('close', () => {
      try {
        socket.end();
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('error', (err) => {
      console.error(err);
    });

    socket.on('close', () => {
      try {
        if (proxy) {
          proxy.removeAllListeners('data');
          proxy.end();
        }
      } catch (err) {
        console.error(err);
      }
    });
  },
  {
    username: process.env.SOCKS5_USERNAME,
    password: process.env.SOCKS5_PASSWORD
  }
);

server.on('error', (err) => {
  console.error(err);
});
