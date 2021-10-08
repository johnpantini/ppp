import { parseJwt } from './key-vault.js';
import { later } from './later.js';

const getFullActionCode = (code) => {
  return `exports.onExecutePostLogin = async (event, api) => {
    const request = require('request');

    ${code}
  };`;
};

export const auth0BridgeCallback = `function (err, response, body) {
  if (err)
    return reject({err, status: response.statusCode, uri: response.request.uri.href});

  return resolve({response: body, status: response.statusCode, uri: response.request.uri.href});
}`;

export async function auth0Bridge({ auth0Token, code }) {
  try {
    const json = parseJwt(auth0Token);

    // 1. Create a temporary action
    const r1 = await fetch(new URL('actions/actions', json.aud).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth0Token}`
      },
      body: JSON.stringify({
        name: `ppp-temp-` + Date.now(),
        supported_triggers: [
          {
            id: 'post-login',
            version: 'v2'
          }
        ],
        code: getFullActionCode(code),
        runtime: 'node16'
      })
    });

    if (!r1.ok) {
      return r1;
    }

    const j1 = await r1.json();
    let r2;

    await later(1000);

    try {
      // 2. Test the action
      r2 = await fetch(
        new URL(`actions/actions/${j1.id}/test`, json.aud).toString(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth0Token}`
          },
          body: JSON.stringify({
            payload: { event: { transaction: {} }, event_shape: 'version' }
          })
        }
      );
    } finally {
      // 3. Remove the action
      await fetch(new URL(`actions/actions/${j1.id}`, json.aud).toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth0Token}`
        }
      });
    }

    if (!r2.ok) {
      return r2;
    }

    const j2 = await r2.json();
    const logs = new Function(`return ${j2.payload.logs ?? {}}`)();

    return {
      ok: logs.status < 400,
      status: logs.status,
      details: j2,
      logs: logs
    };
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}
