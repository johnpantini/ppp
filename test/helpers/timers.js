import { spyOn } from 'bun:test';

/**
 * Captures timeout callbacks for deterministic boundary tests without sleeping.
 * Restored by the common mock.restore hook; each test owns its pending callbacks.
 * @returns {{runNext: () => unknown, pending: Map<number, {callback: Function, delay: number}>}}
 */
export function captureTimeouts() {
  const pending = new Map();
  let nextId = 0;

  spyOn(globalThis, 'setTimeout').mockImplementation((callback, delay) => {
    const id = ++nextId;

    pending.set(id, { callback, delay });

    return id;
  });
  spyOn(globalThis, 'clearTimeout').mockImplementation((id) => {
    pending.delete(id);
  });

  return {
    pending,
    runNext() {
      const entry = pending.entries().next().value;

      if (!entry) throw new Error('No timeout is pending.');

      const [id, { callback }] = entry;

      pending.delete(id);

      return callback();
    }
  };
}
