import { expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import {
  bufferToString,
  generateIV,
  stringToBuffer
} from '../../lib/ppp-crypto.js';
import { TAG } from '../../lib/tag.js';

const source = readFileSync(new URL('../../ppp.js', import.meta.url), 'utf8');

/**
 * Evaluates the actual storage/crypto implementations without booting the SPA.
 * Source slices retain the original bodies; no copied implementation is tested.
 * @returns {object} Isolated constructors, storage and application dependencies.
 */
function state() {
  const storage = new Map();
  const app = {
    user: { functions: { updateOne: mock(async () => ({ modifiedCount: 1 })) } }
  };
  const Observable = { notify: mock() };
  const definitions = [
    source
      .slice(
        source.indexOf('export const keySet'),
        source.indexOf('class PPPCrypto')
      )
      .replace('export const', 'const'),
    source.slice(
      source.indexOf('class PPPCrypto'),
      source.indexOf('(class DesignSystemCanvas')
    ),
    source.slice(
      source.indexOf('class SettingsMap'),
      source.indexOf('class PPP {')
    )
  ].join('\n');
  const constructors = runInNewContext(
    `${definitions}\n({ KeyVault, PPPCrypto, SettingsMap, keySet });`,
    {
      ppp: app,
      Observable,
      TAG,
      TextEncoder,
      TextDecoder,
      window: { crypto: globalThis.crypto },
      bufferToString,
      stringToBuffer,
      localStorage: {
        setItem: (key, value) => storage.set(key, value),
        getItem: (key) => storage.get(key) ?? null,
        removeItem: (key) => storage.delete(key)
      }
    }
  );
  app.keyVault = new constructors.KeyVault();

  return { ...constructors, app, storage, Observable };
}

test('key vault persists trimmed values, caches reads and supports explicit invalidation', () => {
  const { app, storage } = state();
  const vault = app.keyVault;
  expect(vault.getKey('missing')).toBe('');
  vault.setKey('name', '  Alice  ');
  expect(storage.get('ppp-name')).toBe('Alice');
  expect(vault.getKey('name')).toBe('  Alice  ');
  storage.set('ppp-name', ' Bob ');
  expect(vault.getKey('name')).toBe('  Alice  ');
  vault.decacheKey('name');
  expect(vault.getKey('name')).toBe('Bob');
  vault.removeKey('name');
  expect(vault.getKey('name')).toBe('');
  expect(storage.has('ppp-name')).toBe(false);
});

test('configuration readiness requires both the current tag and every required key', () => {
  const { app, keySet } = state();
  const vault = app.keyVault;
  for (const key of keySet) vault.setKey(key, 'fixture');
  expect(vault.ok()).toBe(false);
  vault.setKey('tag', TAG);
  expect(vault.ok()).toBe(true);
  vault.removeKey(keySet[0]);
  expect(vault.ok()).toBe(false);
});

test('application encryption round-trips Unicode plaintext with binary and base64 IVs', async () => {
  const { PPPCrypto, app } = state();
  app.keyVault.setKey('master-password', 'test-password');
  const crypto = new PPPCrypto();
  const iv = generateIV();
  const plaintext = 'Секретные настройки — fixture 🔐';
  const ciphertext = await crypto.encrypt(iv, plaintext);
  expect(ciphertext).not.toContain(plaintext);
  expect(await crypto.decrypt(bufferToString(iv), ciphertext)).toBe(plaintext);
  expect(await new PPPCrypto().decrypt(iv, ciphertext, 'test-password')).toBe(
    plaintext
  );
});

test('ciphertext authentication rejects tampering and a reset key uses the new password', async () => {
  const { PPPCrypto } = state();
  const crypto = new PPPCrypto();
  const iv = generateIV();
  const encrypted = await crypto.encrypt(iv, 'fixture', 'first-password');
  const bytes = new Uint8Array(stringToBuffer(encrypted));
  bytes[0] ^= 1;
  await expect(crypto.decrypt(iv, bufferToString(bytes))).rejects.toThrow();
  crypto.resetKey();
  await expect(
    crypto.decrypt(iv, encrypted, 'different-password')
  ).rejects.toThrow();
  crypto.resetKey();
  expect(await crypto.decrypt(iv, encrypted, 'first-password')).toBe('fixture');
});

test('settings hydration is silent and incomplete configuration avoids persistence', () => {
  const { SettingsMap, app, Observable } = state();
  const owner = {};
  const settings = new SettingsMap(owner);
  expect(settings.load('theme', 'dark')).toBe(settings);
  expect(Observable.notify).not.toHaveBeenCalled();
  expect(settings.set('theme', 'light')).toBeUndefined();
  expect(settings.get('theme')).toBe('light');
  expect(Observable.notify).toHaveBeenCalledWith(owner, 'settings');
  expect(app.user.functions.updateOne).not.toHaveBeenCalled();
});

test('settings updates persist one upsert after configuration is ready', async () => {
  const { SettingsMap, app, keySet } = state();
  for (const key of keySet) app.keyVault.setKey(key, 'fixture');
  app.keyVault.setKey('tag', TAG);
  const settings = new SettingsMap({});
  expect(await settings.set('theme', 'dark')).toEqual({ modifiedCount: 1 });
  expect(app.user.functions.updateOne).toHaveBeenCalledWith(
    { collection: 'app' },
    { _id: '@settings' },
    { $set: { theme: 'dark' } },
    { upsert: true }
  );
});
