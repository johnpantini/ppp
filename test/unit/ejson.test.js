import { expect, test } from 'bun:test';
import {
  deserialize,
  deserializeValue,
  getISOString,
  serialize,
  serializeDocument
} from '../../lib/ejson.js';

test.each([
  [0, { $numberInt: '0' }],
  [2147483647, { $numberInt: '2147483647' }],
  [-2147483648, { $numberInt: '-2147483648' }],
  [2147483648, { $numberLong: '2147483648' }],
  [-2147483649, { $numberLong: '-2147483649' }],
  [1.25, { $numberDouble: '1.25' }],
  [NaN, { $numberDouble: 'NaN' }],
  [Infinity, { $numberDouble: 'Infinity' }],
  [-Infinity, { $numberDouble: '-Infinity' }]
])('canonical numeric representation for %p', (value, encoded) => {
  expect(serialize(value)).toEqual(encoded);
  expect(deserialize(encoded)).toBe(value);
});

test('nested dates, identifiers and arrays round trip without mutating the input', () => {
  const source = {
    _id: '0123456789abcdef01234567',
    traderId: 'abcdef0123456789abcdef01',
    specialId: '@settings',
    count: 2,
    items: [undefined, null, new Date('2025-01-02T03:04:05.006Z')]
  };
  const encoded = serialize(source);

  expect(encoded._id).toEqual({ $oid: source._id });
  expect(encoded.specialId).toBe('@settings');
  expect(encoded.items[2]).toEqual({ $date: { $numberLong: '1735787045006' } });
  expect(deserialize(encoded)).toEqual({
    ...source,
    items: [null, null, source.items[2]]
  });
  expect(source.items[0]).toBeUndefined();
});

test('relaxed mode preserves ordinary numbers and uses ISO dates when in range', () => {
  expect(
    serialize(
      { n: 1.25, date: new Date('2025-01-02T03:04:05Z') },
      { relaxed: true }
    )
  ).toEqual({ n: 1.25, date: { $date: '2025-01-02T03:04:05Z' } });
  expect(serialize(new Date(-1), { relaxed: true })).toEqual({
    $date: { $numberLong: '-1' }
  });
  expect(getISOString(new Date('2025-01-02T03:04:05.001Z'))).toBe(
    '2025-01-02T03:04:05.001Z'
  );
});

test('unknown values remain unchanged and unsupported BSON objects fail explicitly', () => {
  expect(deserializeValue({ $unknown: 1 })).toEqual({ $unknown: 1 });
  expect(deserializeValue({ $undefined: true })).toBeUndefined();
  expect(deserializeValue(null)).toBeNull();
  expect(() => serializeDocument(null, {})).toThrow('not an object instance');
  expect(() => serialize({ _bsontype: 'ObjectId' })).toThrow('_bsontype');
});
