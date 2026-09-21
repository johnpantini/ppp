import { describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const operations = [
  ['aggregate', 'aggregate', [[]]],
  ['bulk-write', 'bulkWrite', [[], {}]],
  ['count', 'count', [{}, {}]],
  ['delete-many', 'deleteMany', [{}]],
  ['delete-one', 'deleteOne', [{}]],
  ['distinct', 'distinct', [undefined, {}, {}]],
  ['find', 'find', [{}, {}]],
  ['find-one', 'findOne', [{}, {}]],
  ['find-one-and-delete', 'findOneAndDelete', [{}, {}]],
  ['find-one-and-replace', 'findOneAndReplace', [{}, {}, {}]],
  ['find-one-and-update', 'findOneAndUpdate', [{}, {}, {}]],
  ['insert-many', 'insertMany', [[]]],
  ['insert-one', 'insertOne', [{}]],
  ['update-many', 'updateMany', [{}, {}, {}]],
  ['update-one', 'updateOne', [{}, {}, {}]]
];

describe.each(operations)('MongoDB %s', (file, method, defaults) => {
  test('forwards all arguments and returns the original server result', () => {
    const result = { acknowledged: true };
    const operation = mock(() => result);
    const collection = mock(() => ({ [method]: operation }));
    const db = mock(() => ({ collection }));
    const get = mock(() => ({ db }));
    const realm = { context: { services: { get } } };

    runInNewContext(
      readFileSync(
        new URL(`../../lib/functions/mongodb/${file}.js`, import.meta.url),
        'utf8'
      ),
      realm
    );
    expect(realm.exports({ collection: 'traders' })).toBe(result);
    expect(get).toHaveBeenCalledWith('mongodb-atlas');
    expect(db).toHaveBeenCalledWith('ppp');
    expect(collection).toHaveBeenCalledWith('traders');
    expect(operation).toHaveBeenLastCalledWith(...defaults);
    const args = defaults.map((_, index) => ({ marker: index }));
    expect(realm.exports({ db: 'custom', collection: 'orders' }, ...args)).toBe(
      result
    );
    expect(db).toHaveBeenLastCalledWith('custom');
    expect(operation).toHaveBeenLastCalledWith(...args);
    for (const [index, argument] of args.entries()) {
      expect(operation.mock.calls.at(-1)[index]).toBe(argument);
    }
  });
});

test('MongoDB eval exposes only the supplied context and propagates script errors', () => {
  const realm = { context: { value: 42 } };

  runInNewContext(
    readFileSync(
      new URL('../../lib/functions/mongodb/eval.js', import.meta.url),
      'utf8'
    ),
    realm
  );
  expect(realm.exports()).toEqual({});
  expect(realm.exports('return context.value;')).toBe(42);
  expect(() => realm.exports('throw new Error("failure");')).toThrow('failure');
});
