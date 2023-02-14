import { TAG } from './tag.js';

export const keySet = [
  'github-login',
  'github-token',
  'master-password',
  'mongo-api-key',
  'mongo-app-client-id',
  'mongo-app-client-id',
  'mongo-app-id',
  'mongo-group-id',
  'mongo-private-key',
  'mongo-public-key',
  'service-machine-url'
];

class KeyVault {
  #keys = {};

  ok() {
    if (this.getKey('tag') !== TAG) return false;

    return keySet.map((k) => this.getKey(k)).every((i) => !!i);
  }

  setKey(key, value) {
    if (key) {
      this.#keys[key] = value;

      localStorage.setItem(`ppp-${key}`, (value ?? '').trim());
    }
  }

  getKey(key) {
    if (!this.#keys[key])
      this.#keys[key] = (localStorage.getItem(`ppp-${key}`) ?? '').trim();

    return this.#keys[key];
  }

  removeKey(key) {
    this.#keys[key] = void 0;

    localStorage.removeItem(`ppp-${key}`);
  }
}

export { KeyVault };
