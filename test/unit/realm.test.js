import { afterEach, beforeEach, expect, spyOn, test } from 'bun:test';
import {
  App,
  Credentials,
  MongoDBRealmError,
  UserState
} from '../../lib/realm.js';

let savedStorage;

beforeEach(() => {
  savedStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) =>
      key === 'ppp-mongo-proxy-url'
        ? 'http://0.0.0.0:14444/'
        : 'mongodb://fixture.invalid/test'
  };
});

afterEach(() => {
  globalThis.localStorage = savedStorage;
});

/** @returns {App} Isolated app with in-memory user state and a fake proxy URL. */
function application() {
  return new App({ id: 'test-app' });
}

/**
 * @param {object} [payload] Additional JWT claims.
 * @returns {string} Unsigned fixture token.
 */
function token(payload = {}) {
  return `header.${Buffer.from(JSON.stringify({ exp: 4102444800, iat: 1, sub: 'user', ...payload })).toString('base64url')}.signature`;
}

test('API-key credentials retain the provider payload without network access', () => {
  expect(Credentials.apiKey('fixture-key')).toEqual(
    new Credentials('api-key', 'api-key', { key: 'fixture-key' })
  );
  const app = application();
  expect(app.currentUser).toBeNull();
  expect(app.allUsers).toEqual({});
  expect(app._locationUrl).toBe('http://localhost:14444/');
});

test('app user creation, token updates and switching preserve user identity', () => {
  const app = application();
  const first = app.createOrUpdateUser(
    { userId: 'first', accessToken: token(), refreshToken: 'refresh-1' },
    'api-key'
  );
  const second = app.createOrUpdateUser(
    { userId: 'second', accessToken: token(), refreshToken: 'refresh-2' },
    'api-key'
  );
  expect(app.currentUser).toBe(second);
  app.switchUser(first);
  expect(app.currentUser).toBe(first);
  const updated = app.createOrUpdateUser(
    {
      userId: first.id,
      accessToken: token({ user_data: { role: 'viewer' } }),
      refreshToken: 'new-refresh'
    },
    'api-key'
  );
  expect(updated).toBe(first);
  expect(first.customData).toEqual({ role: 'viewer' });
  expect(first.isLoggedIn).toBe(true);
  first.refreshToken = null;
  expect(first.state).toBe(UserState.LoggedOut);
  expect(app.currentUser).toBe(second);
  expect(() => app.switchUser('missing')).toThrow();
  expect(() =>
    app.createOrUpdateUser({ userId: 'third', accessToken: token() }, 'api-key')
  ).toThrow('No refresh token');
});

test.each([
  ['bad', 'three parts'],
  [token({ exp: 'invalid' }), "'exp'"],
  [token({ iat: null }), "'iat'"]
])(
  'invalid access token %s produces an explicit decode failure',
  (accessToken, message) => {
    const app = application();
    const user = app.createOrUpdateUser(
      { userId: 'user', accessToken, refreshToken: 'refresh' },
      'api-key'
    );
    expect(() => user.decodeAccessToken()).toThrow(message);
  }
);

test('JSON requests serialize EJSON, join proxy URLs and retain explicit headers', async () => {
  const app = application();
  const user = app.createOrUpdateUser(
    { userId: 'user', accessToken: 'access', refreshToken: 'refresh' },
    'api-key'
  );
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({ total: { $numberInt: '3' } })
  );
  const result = await user.fetcher.fetchJSON({
    path: '/test',
    method: 'POST',
    body: { count: 2 },
    headers: { 'X-Fixture': 'yes' }
  });
  expect(result).toEqual({ total: 3 });
  expect(fetch.mock.calls[0][0]).toBe('http://localhost:14444/test');
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    body: '{"count":{"$numberInt":"2"}}',
    headers: {
      Authorization: 'Bearer access',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Fixture': 'yes'
    }
  });
});

test('an expired access token refreshes once before a successful retry', async () => {
  const app = application();
  const user = app.createOrUpdateUser(
    { userId: 'user', accessToken: 'old', refreshToken: 'refresh' },
    'api-key'
  );
  const refresh = spyOn(user, 'refreshAccessToken').mockImplementation(
    async () => {
      user.accessToken = 'new';
    }
  );
  const fetch = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('', { status: 401 }))
    .mockResolvedValueOnce(Response.json({ ok: true }));
  expect(
    await user.fetcher.fetchJSON({ url: 'https://fixture.invalid/test' })
  ).toEqual({ ok: true });
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer old');
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer new');
});

test('rejected refresh authentication clears both tokens and preserves server error details', async () => {
  const app = application();
  const user = app.createOrUpdateUser(
    { userId: 'user', accessToken: 'access', refreshToken: 'refresh' },
    'api-key'
  );
  spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json(
      {
        error: 'expired',
        error_code: 'InvalidSession',
        link: 'https://fixture.invalid/help'
      },
      { status: 401 }
    )
  );
  await expect(
    user.fetcher.fetch({
      url: 'https://fixture.invalid/session',
      tokenType: 'refresh'
    })
  ).rejects.toMatchObject({
    statusCode: 401,
    errorCode: 'InvalidSession',
    error: 'expired'
  });
  expect(user.accessToken).toBeNull();
  expect(user.refreshToken).toBeNull();
  expect(user.state).toBe(UserState.LoggedOut);
});

test('request validation rejects ambiguous destinations and non-JSON responses', async () => {
  const fetcher = application().fetcher;
  await expect(
    fetcher.fetch({ path: '/test', url: 'https://fixture.invalid' })
  ).rejects.toThrow('mutually exclusive');
  await expect(fetcher.fetch({})).rejects.toThrow(
    "Expected either 'url' or 'path'"
  );
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('text', { headers: { 'content-type': 'text/plain' } })
  );
  await expect(
    fetcher.fetchJSON({ url: 'https://fixture.invalid' })
  ).rejects.toThrow('Expected JSON response');
  fetch.mockResolvedValue(new Response(null, { status: 204 }));
  expect(
    await fetcher.fetchJSON({ url: 'https://fixture.invalid' })
  ).toBeNull();
});

test.each([
  [
    'application/json',
    '{"error":"failure","error_code":"Fixture"}',
    'failure',
    'Fixture'
  ],
  ['application/json', 'broken-json', 'broken-json', undefined],
  ['text/plain', 'unavailable', undefined, undefined]
])(
  'Realm errors retain HTTP context for %s responses',
  async (contentType, body, error, errorCode) => {
    const result = await MongoDBRealmError.fromRequestAndResponse(
      { method: 'POST', url: 'https://fixture.invalid' },
      new Response(body, {
        status: 503,
        statusText: 'Unavailable',
        headers: { 'content-type': contentType }
      })
    );
    expect(result).toBeInstanceOf(Error);
    expect(result).toMatchObject({
      method: 'POST',
      url: 'https://fixture.invalid',
      statusCode: 503,
      statusText: 'Unavailable',
      error,
      errorCode
    });
  }
);
