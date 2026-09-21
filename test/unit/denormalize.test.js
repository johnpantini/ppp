import { expect, mock, spyOn, test } from 'bun:test';
import {
  Denormalization,
  extractEverything
} from '../../lib/ppp-denormalize.js';
import { app } from '../setup.js';

test('fills references from all supported collections and ignores entries without IDs', async () => {
  const denormalizer = new Denormalization();
  const collections = [
    'apis',
    'bots',
    'brokers',
    'orders',
    'traders',
    'services'
  ];

  denormalizer.fillRefs();
  denormalizer.fillRefs(
    Object.fromEntries(
      collections.map((name) => [name, [{ _id: name, name }, {}]])
    )
  );
  for (const id of collections) {
    expect(await denormalizer.denormalize({ refId: id })).toEqual({
      refId: id,
      ref: { _id: id, name: id }
    });
  }
});

test('resolves nested references without mutating source documents', async () => {
  const denormalizer = new Denormalization();
  const source = {
    trader: { stale: true },
    traderId: 'trader',
    literal: [1, 2]
  };

  denormalizer.fillRefs({
    traders: [{ _id: 'trader', brokerId: 'broker' }],
    brokers: [{ _id: 'broker', name: 'demo' }]
  });
  expect(await denormalizer.denormalize(source)).toEqual({
    traderId: 'trader',
    trader: {
      _id: 'trader',
      brokerId: 'broker',
      broker: { _id: 'broker', name: 'demo' }
    },
    literal: [1, 2]
  });
  expect(source.trader).toEqual({ stale: true });
  expect(
    await denormalizer.denormalize({ traderId: 'missing', trader: 'stale' })
  ).toEqual({ traderId: 'missing', trader: undefined });
  expect(
    await denormalizer.denormalize({ trader: 'stale', traderId: undefined })
  ).toEqual({ trader: undefined });
});

test('decrypts each encrypted reference once and resolves its dependencies', async () => {
  const denormalizer = new Denormalization();
  const decrypt = spyOn(app, 'decrypt').mockResolvedValue({
    _id: 'encrypted',
    brokerId: 'broker'
  });

  denormalizer.fillRefs({
    traders: [{ _id: 'encrypted', iv: 'iv' }],
    brokers: [{ _id: 'broker', name: 'demo' }]
  });
  const first = await denormalizer.denormalize({ traderId: 'encrypted' });
  const second = await denormalizer.denormalize({ traderId: 'encrypted' });
  expect(decrypt).toHaveBeenCalledTimes(1);
  expect(second.trader).toBe(first.trader);
  expect(first.trader.broker.name).toBe('demo');
});

test('depth limits bound cycles and errors propagate to callers', async () => {
  const denormalizer = new Denormalization();
  const document = { _id: 'loop', traderId: 'loop' };

  denormalizer.maxDepth = 0;
  denormalizer.fillRefs({ traders: [document] });
  expect((await denormalizer.denormalize({ traderId: 'loop' })).trader).toBe(
    document
  );
  denormalizer.fillRefs({ traders: [{ _id: 'secret', iv: 'iv' }] });
  spyOn(app, 'decrypt').mockRejectedValue(new Error('wrong key'));
  await expect(
    denormalizer.denormalize({ traderId: 'secret' })
  ).rejects.toThrow('wrong key');
});

test('extractEverything forwards the server function and unwraps the first result', async () => {
  app.user.functions.eval = async (source) => {
    const aggregate = mock(() => [{ traders: [] }]);
    const collection = mock(() => ({ aggregate }));
    const db = mock(() => ({ collection }));
    const get = mock(() => ({ db }));
    const result = new Function('context', source)({ services: { get } });

    expect(get).toHaveBeenCalledWith('mongodb-atlas');
    expect(db).toHaveBeenCalledWith('ppp');
    expect(collection).toHaveBeenCalledWith('app');
    const pipeline = aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({ $match: { _id: '@settings' } });
    expect(pipeline.slice(1).map((stage) => stage.$lookup.from)).toEqual([
      'apis',
      'traders',
      'brokers',
      'bots',
      'orders',
      'services'
    ]);
    for (const { $lookup } of pipeline.slice(1)) {
      expect($lookup.pipeline[0]).toEqual({
        $match: { isolated: { $ne: true } }
      });
    }

    return result;
  };

  expect(await extractEverything()).toEqual({ traders: [] });
  delete app.user.functions.eval;
});
