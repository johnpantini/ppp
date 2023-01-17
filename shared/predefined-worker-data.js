export const predefinedWorkerData = {
  default: {
    env: `{
  SERVICE_MACHINE_URL: '[%#ppp.keyVault.getKey("service-machine-url")%]'
}`,
    envSecret: '{}',
    content: `// ==PPPScript==
// @version 1
// ==/PPPScript==

import { parentPort } from 'node:worker_threads';

function log(text) {
  return parentPort.postMessage(text);
}

log(process.env.SERVICE_MACHINE_URL);`,
    url: '/salt/states/ppp/lib/default-worker-example.mjs'
  },
  auroraOnNorthflank: {
    env: `{
  SERVICE_MACHINE_URL: '[%#ppp.keyVault.getKey("service-machine-url")%]',
  UTEX_USER_AGENT: '[%#navigator.userAgent%]'
}`,
    envSecret: '{}',
    url: '/salt/states/ppp/lib/aurora/main.mjs'
  },
  auroraOnRender: {
    env: `{
  SERVICE_MACHINE_URL: '[%#ppp.keyVault.getKey("service-machine-url")%]',
  PORT: 24567,
  UTEX_USER_AGENT: '[%#navigator.userAgent%]'
}`,
    envSecret: '{}',
    url: '/salt/states/ppp/lib/aurora/main.mjs'
  }
};
