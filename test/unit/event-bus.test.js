import { describe, expect, mock, spyOn, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { EventBus as BrowserEventBus } from '../../lib/event-bus.js';

// Evaluate the standalone server implementation without loading Redis or
// installing its unrelated process-level exception listeners.
const workerSource = readFileSync(
  new URL('../../lib/aspirant-worker/utils.mjs', import.meta.url),
  'utf8'
);
const workerBus = workerSource.slice(
  workerSource.indexOf('export class EventBus'),
  workerSource.indexOf('export class PPPEventEmitter')
);
const WorkerEventBus = runInNewContext(
  workerBus.replace('export class', 'class') + '\nEventBus;',
  { Date }
);

describe.each([
  ['browser', BrowserEventBus],
  ['Aspirant', WorkerEventBus]
])('%s EventBus', (name, EventBus) => {
  test('validates subscriptions and refuses duplicates', () => {
    const bus = new EventBus();
    const handler = mock();

    for (const type of ['', null, 1, {}]) {
      expect(bus.on(type, handler)).toBe(false);
      expect(bus.once(type, handler)).toBe(false);
      expect(bus.has(type)).toBe(false);
      expect(bus.getHandlers(type)).toEqual([]);
    }

    expect(bus.on('tick', null)).toBe(false);
    expect(bus.on('tick', 'handler')).toBe(false);
    expect(bus.on('tick', handler)).toBe(true);
    expect(bus.on('tick', handler)).toBe(false);
    expect(bus.has('tick', handler)).toBe(true);
    expect(bus.has('tick', mock())).toBe(false);
  });

  test('emits an event with the original payload and timestamp', () => {
    const bus = new EventBus();
    const handler = mock();
    const detail = { price: 10 };

    spyOn(Date, 'now').mockReturnValue(123);
    bus.on('tick', handler);
    bus.emit('tick', detail);
    expect(handler).toHaveBeenCalledWith({
      type: 'tick',
      detail,
      timestamp: 123,
      once: false
    });
    expect(handler.mock.calls[0][0].detail).toBe(detail);
  });

  test('removes one handler, one event or all events', () => {
    const bus = new EventBus();
    const first = mock();
    const second = mock();

    bus.on('tick', first);
    bus.on('tick', second);
    bus.on('other', first);
    bus.off('tick', first);
    bus.emit('tick');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    bus.off('tick');
    expect(bus.has('tick')).toBe(false);
    expect(bus.has('other')).toBe(true);
    bus.off();
    expect(bus.has('other')).toBe(false);
    expect(() => bus.off('missing', first)).not.toThrow();
  });

  test('once does not skip or remove subsequent persistent handlers', () => {
    const bus = new EventBus();
    const once = mock();
    const persistent = mock();
    const last = mock();

    bus.once('tick', once);
    bus.on('tick', persistent);
    bus.on('tick', last);
    bus.emit('tick');
    bus.emit('tick');
    expect(once).toHaveBeenCalledTimes(1);
    expect(persistent).toHaveBeenCalledTimes(2);
    expect(last).toHaveBeenCalledTimes(2);
    expect(persistent.mock.calls[0][0].once).toBe(false);
  });

  test('once belongs to a subscription, even when a callback is reused', () => {
    const bus = new EventBus();
    const handler = mock();

    bus.once('first', handler);
    bus.on('second', handler);
    bus.emit('first');
    bus.emit('first');
    bus.emit('second');
    bus.emit('second');
    expect(handler).toHaveBeenCalledTimes(3);
  });

  test('once is removed before a recursive emit', () => {
    const bus = new EventBus();
    const handler = mock(() => {
      if (handler.mock.calls.length < 3) bus.emit('tick');
    });

    bus.once('tick', handler);
    bus.emit('tick');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test.each(['constructor', '__proto__', 'toString'])(
    'event names may be %s',
    (name) => {
      const bus = new EventBus();
      const handler = mock();

      expect(bus.has(name)).toBe(false);
      expect(bus.on(name, handler)).toBe(true);
      bus.emit(name);
      expect(handler).toHaveBeenCalledTimes(1);
      bus.offAll();
      expect(bus.getHandlers(name)).toEqual([]);
    }
  );

  test('removals during delivery are respected and new handlers wait for the next event', () => {
    const bus = new EventBus();
    const removed = mock();
    const added = mock();

    bus.on('tick', () => {
      bus.off('tick', removed);
      bus.on('tick', added);
    });
    bus.on('tick', removed);
    bus.emit('tick');
    expect(removed).not.toHaveBeenCalled();
    expect(added).not.toHaveBeenCalled();
    bus.emit('tick');
    expect(added).toHaveBeenCalledTimes(1);
  });

  test('frozen callbacks can subscribe and a throwing once callback is still removed', () => {
    const bus = new EventBus();
    const handler = Object.freeze(() => {
      throw new Error('callback failure');
    });

    expect(bus.once('tick', handler)).toBe(true);
    expect(() => bus.emit('tick')).toThrow('callback failure');
    expect(bus.has('tick')).toBe(false);
  });
});
