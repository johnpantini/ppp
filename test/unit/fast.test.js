import { afterEach, expect, mock, test } from 'bun:test';
import {
  SubscriberSet,
  PropertyChangeNotifier
} from '../../lib/fast/notifier.js';
import { Updates } from '../../lib/fast/update-queue.js';
import {
  Observable,
  observable,
  ExecutionContext
} from '../../lib/fast/observable.js';
import {
  createMetadataLocator,
  createTypeRegistry,
  FAST
} from '../../lib/fast/platform.js';

afterEach(() => {
  Updates.setMode(true);
  ExecutionContext.setEvent(null);
});

test.each([1, 2, 5])(
  'SubscriberSet handles %s subscribers, duplicates and removal',
  (count) => {
    const subject = {};
    const subscribers = Array.from({ length: count }, () => ({
      handleChange: mock()
    }));
    const set = new SubscriberSet(subject);

    for (const subscriber of subscribers) {
      set.subscribe(subscriber);
      set.subscribe(subscriber);
      expect(set.has(subscriber)).toBe(true);
    }
    set.notify('price');
    for (const subscriber of subscribers) {
      expect(subscriber.handleChange).toHaveBeenCalledTimes(1);
      expect(subscriber.handleChange).toHaveBeenCalledWith(subject, 'price');
    }
    set.unsubscribe(subscribers[0]);
    expect(set.has(subscribers[0])).toBe(false);
    set.notify('quantity');
    expect(subscribers[0].handleChange).toHaveBeenCalledTimes(1);
  }
);

test('property-specific subscribers receive only their property while global observers receive both', () => {
  const subject = {};
  const notifier = new PropertyChangeNotifier(subject);
  const specific = { handleChange: mock() };
  const general = { handleChange: mock() };

  notifier.subscribe(specific, 'price');
  notifier.subscribe(general);
  notifier.notify('price');
  notifier.notify('quantity');
  expect(specific.handleChange).toHaveBeenCalledTimes(1);
  expect(general.handleChange).toHaveBeenCalledTimes(2);
  notifier.unsubscribe(specific, 'price');
  notifier.unsubscribe(general);
  notifier.notify('price');
  expect(general.handleChange).toHaveBeenCalledTimes(2);
});

test('observable values invoke change callbacks only when changed', () => {
  class Model {
    priceChanged = mock();
  }
  observable(Model.prototype, 'price');
  const model = new Model();
  const subscriber = { handleChange: mock() };

  Observable.getNotifier(model).subscribe(subscriber, 'price');
  model.price = 10;
  model.price = 10;
  model.price = 20;
  expect(model.priceChanged.mock.calls).toEqual([
    [undefined, 10],
    [10, 20]
  ]);
  expect(subscriber.handleChange).toHaveBeenCalledTimes(2);
  expect(Observable.getNotifier(model)).toBe(Observable.getNotifier(model));
  expect(
    Observable.getAccessors(model).map((accessor) => accessor.name)
  ).toContain('price');
});

test('update queue drains nested tasks in order and survives capacity compaction', () => {
  const values = [];

  Updates.enqueue(() => {
    for (let i = 0; i < 2050; i++) Updates.enqueue(() => values.push(i));
  });
  Updates.process();
  expect(values).toEqual(Array.from({ length: 2050 }, (_, i) => i));
});

test('synchronous update failures clear the queue and propagate to the caller', () => {
  Updates.setMode(false);
  expect(() =>
    Updates.enqueue(() => {
      throw new Error('failed update');
    })
  ).toThrow('failed update');
  const callback = mock();
  Updates.enqueue(callback);
  expect(callback).toHaveBeenCalledTimes(1);
});

test('Updates.next resolves after earlier tasks', async () => {
  const values = [];

  Updates.enqueue(() => values.push('first'));
  await Updates.next();
  expect(values).toEqual(['first']);
});

test('metadata inheritance copies ancestor metadata without mutating the parent', () => {
  const locate = createMetadataLocator();
  const parent = {};
  const child = Object.create(parent);

  locate(parent).push('parent');
  locate(child).push('child');
  expect(locate(child)).toEqual(['parent', 'child']);
  expect(locate(parent)).toEqual(['parent']);
});

test('type registry refuses duplicate registration and resolves instances', () => {
  class Model {}
  const registry = createTypeRegistry();
  const definition = { type: Model };

  expect(registry.register(definition)).toBe(true);
  expect(registry.register({ type: Model })).toBe(false);
  expect(registry.getByType(Model)).toBe(definition);
  expect(registry.getForInstance(new Model())).toBe(definition);
  expect(registry.getForInstance(null)).toBeUndefined();
  expect(FAST.getById('test-only-missing')).toBeNull();
});

test('execution context exposes event details and target', () => {
  const event = { detail: 42, target: {} };

  ExecutionContext.setEvent(event);
  expect(ExecutionContext.getEvent()).toBe(event);
  expect(ExecutionContext.default.eventDetail()).toBe(42);
  expect(ExecutionContext.default.eventTarget()).toBe(event.target);
});
