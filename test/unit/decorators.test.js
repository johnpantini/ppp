import { expect, mock, test } from 'bun:test';
import {
  $debounce,
  $throttle,
  debounce,
  later,
  throttle
} from '../../lib/ppp-decorators.js';
import { captureTimeouts } from '../helpers/timers.js';

test('debounce retains only the last call, its arguments and receiver', () => {
  const timers = captureTimeouts();
  const callback = mock(function (value) {
    return this.name + value;
  });
  const debounced = $debounce(callback, 100);
  const receiver = { name: 'last' };

  debounced.call({ name: 'first' }, 1);
  debounced.call(receiver, 2);
  expect(callback).not.toHaveBeenCalled();
  expect(timers.pending.size).toBe(1);
  expect([...timers.pending.values()][0].delay).toBe(100);
  timers.runNext();
  expect(callback).toHaveBeenCalledWith(2);
  expect(callback.mock.contexts[0]).toBe(receiver);
});

test('throttle runs the leading call and the latest trailing call in each window', () => {
  const timers = captureTimeouts();
  const callback = mock();
  const throttled = $throttle(callback, 50);
  const receiver = {};

  throttled(1);
  throttled(2);
  throttled.call(receiver, 3);
  expect(callback.mock.calls).toEqual([[1]]);
  timers.runNext();
  expect(callback.mock.calls).toEqual([[1], [3]]);
  expect(callback.mock.contexts[1]).toBe(receiver);
  timers.runNext();
  expect(timers.pending.size).toBe(0);
  throttled(4);
  expect(callback.mock.calls).toEqual([[1], [3], [4]]);
});

test.each([debounce, throttle])(
  'method decorators reject non-method targets',
  (decorate) => {
    expect(() => decorate()(Object.prototype, 'field', undefined)).toThrow(
      'can only decorate functions'
    );
    expect(() => decorate()({}, 'field', { value: 1 })).toThrow(
      'can only decorate functions'
    );
  }
);

test.each([debounce, throttle])(
  'method decorators preserve property flags and receiver',
  (decorate) => {
    const timers = captureTimeouts();
    const callback = mock();
    const proto = {};
    const descriptor = {
      configurable: true,
      writable: false,
      enumerable: false,
      value: callback
    };

    decorate(25)(proto, 'method', descriptor);
    const instance = Object.create(proto);
    instance.method('value');
    timers.runNext();
    expect(callback).toHaveBeenCalledWith('value');
    expect(callback.mock.contexts[0]).toBe(instance);
    expect(Object.getOwnPropertyDescriptor(proto, 'method').writable).toBe(
      false
    );
  }
);

test('later resolves only after the requested timeout', async () => {
  const timers = captureTimeouts();
  let resolved = false;
  const promise = later(123).then(() => {
    resolved = true;
  });

  expect(resolved).toBe(false);
  expect([...timers.pending.values()][0].delay).toBe(123);
  timers.runNext();
  await promise;
  expect(resolved).toBe(true);
});
