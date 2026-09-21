import { describe, expect, mock, spyOn, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import netlify from '../../ppp-proxy-netlify.js';

/**
 * Captures Deno.serve without opening a port; all upstream traffic is mocked.
 * @param {Function} fetch Controlled upstream response.
 * @returns {Function} The real Deno request handler.
 */
function denoHandler(fetch) {
  let handler;

  runInNewContext(
    readFileSync(new URL('../../ppp-proxy-deno.js', import.meta.url), 'utf8'),
    {
      Headers,
      Request,
      Response,
      URL,
      fetch,
      Deno: {
        serve: (callback) => {
          handler = callback;
        }
      }
    }
  );

  return handler;
}

describe.each(['Netlify', 'Deno'])('%s HTTP proxy', (runtime) => {
  /**
   * @param {Function} fetch Mock upstream.
   * @returns {Function} Proxy handler.
   */
  function handler(fetch) {
    if (runtime === 'Deno') return denoHandler(fetch);

    spyOn(globalThis, 'fetch').mockImplementation(fetch);

    return netlify;
  }

  test('preflight and missing-host requests never reach the network', async () => {
    const fetch = mock();
    const proxy = handler(fetch);
    const preflight = await proxy(
      new Request('https://proxy.test/a', {
        method: 'OPTIONS',
        headers: { Origin: 'https://client.test' }
      })
    );

    expect(preflight.headers.get('access-control-allow-origin')).toBe('*');
    expect(
      (
        await proxy(new Request('https://proxy.test/a', { method: 'OPTIONS' }))
      ).headers.get('allow')
    ).toContain('GET');
    expect((await proxy(new Request('https://proxy.test/a'))).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('forwards explicit headers, path, query and body while stripping transport metadata', async () => {
    const upstream = new Response('response', {
      status: 201,
      headers: {
        'content-type': 'text/plain',
        'content-length': '8',
        'content-encoding': 'gzip',
        connection: 'close',
        'x-frame-options': 'DENY',
        'content-security-policy': "default-src 'none'",
        'x-upstream': 'yes',
        vary: 'Accept',
        'set-cookie': 'session=one'
      }
    });
    const fetch = mock(async () => upstream);
    const proxy = handler(fetch);
    const response = await proxy(
      new Request('https://proxy.test/path?q=1', {
        method: 'POST',
        body: 'payload',
        headers: {
          'X-Host': 'upstream.test',
          'X-Port': '80',
          'Content-Type': 'text/plain',
          Accept: 'application/json',
          Authorization: 'Bearer test',
          'X-Allowed-Headers':
            ' Authorization, Connection, X-Extra, Content-Type, ',
          Connection: 'close',
          'X-Extra': 'extra',
          'X-Private': 'private'
        }
      })
    );
    const [url, init] = fetch.mock.calls[0];

    expect(url.toString()).toBe('http://upstream.test/path?q=1');
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('follow');
    expect(await new Response(init.body).text()).toBe('payload');
    expect(Object.fromEntries(init.headers)).toEqual({
      accept: 'application/json',
      authorization: 'Bearer test',
      'content-type': 'text/plain',
      'x-extra': 'extra'
    });
    expect(response.status).toBe(201);
    expect(await response.text()).toBe('response');
    for (const name of [
      'connection',
      'content-length',
      'content-encoding',
      'x-frame-options',
      'content-security-policy'
    ]) {
      expect(response.headers.has(name)).toBe(false);
    }
    expect(response.headers.get('x-upstream')).toBe('yes');
    expect(response.headers.getSetCookie()).toEqual(['session=one']);
    expect(response.headers.get('vary')).toContain('Origin');
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });

  test.each([204, 205, 304])('status %s has no body', async (status) => {
    const proxy = handler(mock(async () => new Response(null, { status })));
    const response = await proxy(
      new Request('https://proxy.test/', {
        headers: { 'X-Host': 'upstream.test' }
      })
    );

    expect(response.status).toBe(status);
    expect(response.body).toBeNull();
  });

  test('HEAD drops the upstream body and upstream failures return CORS-enabled 502', async () => {
    const fetch = mock(async () => new Response('body'));
    const proxy = handler(fetch);
    const request = new Request('https://proxy.test/', {
      method: 'HEAD',
      headers: { 'X-Host': 'upstream.test' }
    });

    expect((await proxy(request)).body).toBeNull();
    expect(fetch.mock.calls[0][1].body).toBeNull();
    fetch.mockRejectedValue(new Error('offline'));
    const response = await proxy(request);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'offline',
      host: 'upstream.test'
    });
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });
});

test('Netlify rejects WebSocket upgrades explicitly', async () => {
  const response = await netlify(
    new Request('https://proxy.test/', {
      headers: { 'X-Host': 'upstream.test', Upgrade: 'websocket' }
    })
  );

  expect(response.status).toBe(501);
  expect((await response.json()).error).toContain('WebSocket');
});
