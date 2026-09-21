import { describe, expect, spyOn, test } from 'bun:test';
import { createHmac } from 'node:crypto';
import {
  HMAC,
  bufferToString,
  generateAWSSigningKey,
  generateIV,
  isJWTTokenExpired,
  parseJwt,
  sha256,
  stringToBuffer,
  uuidv4
} from '../../lib/ppp-crypto.js';

/**
 * @param {object} payload Unsigned test claims.
 * @returns {string} Test JWT.
 */
function token(payload) {
  return `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.x`;
}

describe('JWT payloads and expiry', () => {
  test('decodes claims without claiming to verify the signature', () => {
    expect(parseJwt(token({ sub: 'тест', exp: 120 }))).toEqual({
      sub: 'тест',
      exp: 120
    });
  });

  test.each([
    [undefined, true],
    ['', true],
    ['broken', true],
    [token({}), true],
    [token({ exp: '200' }), true],
    [token({ exp: 100 }), true],
    [token({ exp: 101 }), true],
    [token({ exp: 102 }), false]
  ])(
    'expiry of %p is %p, including the one-second safety margin',
    (jwt, expired) => {
      spyOn(Date, 'now').mockReturnValue(100_000);
      expect(isJWTTokenExpired(jwt)).toBe(expired);
    }
  );
});

test('binary base64 round trips include NUL and non-ASCII bytes', () => {
  for (const bytes of [
    new Uint8Array(),
    new Uint8Array([0, 1, 127, 128, 255])
  ]) {
    expect(new Uint8Array(stringToBuffer(bufferToString(bytes)))).toEqual(
      bytes
    );
    expect(bufferToString(bytes.buffer)).toBe(
      Buffer.from(bytes).toString('base64')
    );
  }
});

test('IVs and identifiers have the required shape and are fresh', () => {
  const first = generateIV();
  expect(first).toBeInstanceOf(Uint8Array);
  expect(first.length).toBe(12);
  expect(generateIV()).not.toEqual(first);
  expect(uuidv4()).toMatch(
    /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/
  );
  expect(uuidv4()).not.toBe(uuidv4());
});

test('SHA-256 matches a known vector', async () => {
  expect(await sha256('abc')).toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
});

test.each(['SHA-256', 'SHA-512'])(
  'HMAC %s agrees with the independent Node implementation',
  async (algorithm) => {
    const expected = createHmac(
      algorithm.replace('-', '').toLowerCase(),
      'ключ'
    )
      .update('message')
      .digest('hex');
    expect(await HMAC('ключ', 'message', { algorithm, format: 'hex' })).toBe(
      expected
    );
    expect(
      Buffer.from(
        await HMAC(new TextEncoder().encode('ключ'), 'message', { algorithm })
      ).toString('hex')
    ).toBe(expected);
  }
);

test('AWS signing key follows date, region, service and request derivation', async () => {
  let expected = Buffer.from('AWS4secret');

  for (const value of ['20250921', 'ru-central1', 's3', 'aws4_request']) {
    expected = createHmac('sha256', expected).update(value).digest();
  }

  expect(
    Buffer.from(
      await generateAWSSigningKey({
        ycStaticKeySecret: 'secret',
        date: '20250921',
        region: 'ru-central1'
      })
    )
  ).toEqual(expected);
});
