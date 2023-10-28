// ==PPPScript==
// @version 1
// ==/PPPScript==

import uWS from '/ppp/vendor/uWebSockets.js/uws.js';

uWS
  .App({})
  .get('/*', (res) => {
    res.end('Hello from PPP!');
  })
  .listen('0.0.0.0', process.env.NOMAD_PORT_HTTP ?? 9001, (listenSocket) => {
    if (listenSocket) {
      console.log(
        `The worker is listening to port ${uWS.us_socket_local_port(
          listenSocket
        )}`
      );
    } else {
      process.exit(1);
    }
  });
