import { expect, test } from 'bun:test';
import * as errors from '../../lib/ppp-exceptions.js';

test.each(
  Object.entries(errors).filter(
    ([name]) => name.endsWith('Error') && name !== 'maybeFetchError'
  )
)('%s preserves message and Error identity', (name, ErrorType) => {
  const error = new ErrorType({
    message: 'failure',
    details: { code: 1 },
    documentId: 'id',
    status: 503
  });

  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe(name);
  expect(error.message).toBe('failure');
  expect(new ErrorType()).toBeInstanceOf(Error);
});

test.each([errors.TradingError, errors.RemoteTraderError])(
  'serializes worker errors for transport',
  (ErrorType) => {
    const error = new ErrorType({ message: 'failed', details: { code: 7 } });

    expect(error.serialize()).toEqual({
      name: ErrorType.name,
      args: { message: 'failed', details: { code: 7 } }
    });
  }
);

test('successful responses are returned without consuming their body', async () => {
  const response = new Response('ok');

  expect(await errors.maybeFetchError(response)).toBe(response);
  expect(response.bodyUsed).toBe(false);
  expect(
    await errors.maybeFetchError(async () => ({ ok: true, response }))
  ).toBe(response);
});

test('failed native Responses retain the HTTP status and extra explanation', async () => {
  const promise = errors.maybeFetchError(
    new Response('not found', { status: 404 }),
    'Document unavailable'
  );

  await expect(promise).rejects.toMatchObject({
    name: 'FetchError',
    status: 404,
    message: 'not found',
    pppMessage: 'Document unavailable'
  });
});

test('a response factory can override success and propagates its rejection', async () => {
  await expect(
    errors.maybeFetchError(async () => ({
      ok: false,
      response: new Response('logical failure')
    }))
  ).rejects.toMatchObject({ message: 'logical failure', status: 200 });
  const failure = new Error('offline');
  await expect(
    errors.maybeFetchError(async () => {
      throw failure;
    })
  ).rejects.toBe(failure);
});
