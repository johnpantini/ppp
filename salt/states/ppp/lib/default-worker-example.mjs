// ==PPPScript==
// @version 1
// ==/PPPScript==

import { parentPort } from 'node:worker_threads';

function log(text) {
  return parentPort.postMessage(text);
}

log(process.env.SERVICE_MACHINE_URL);
