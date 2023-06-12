// ==PPPScript==
// @version 1
// ==/PPPScript==

import uWS from '/salt/states/ppp/lib/uWebSockets.js/uws.js';

uWS
  .App({})
  .get('/*', (res) => {
    res.end('Hello from PPP!');
  })
  .listen('0.0.0.0', process.env.NOMAD_PORT_HTTP ?? 9001, () => {});
