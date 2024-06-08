/** @decorator */

import {
  observable,
  html,
  Observable,
  css
} from './vendor/fast-element.min.js';
import { DesignToken } from './design/design-token.js';
import {
  bufferToString,
  generateIV,
  stringToBuffer
} from './lib/ppp-crypto.js';
import { PPPElement } from './lib/ppp-element.js';
import { APIS } from './lib/const.js';
import { TAG } from './lib/tag.js';

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
  'global-proxy-url'
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

  decacheKey(key) {
    this.#keys[key] = void 0;
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

class PPPCrypto {
  #key;

  resetKey() {
    this.#key = void 0;
  }

  async #generateKey(password = ppp.keyVault.getKey('master-password')) {
    if (!this.#key) {
      const rawKey = new TextEncoder().encode(
        password.slice(0, 32).padEnd(32, '.')
      );

      this.#key = await window.crypto.subtle.importKey(
        'raw',
        rawKey,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );
    }

    return this.#key;
  }

  async encrypt(iv, plaintext, password) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const encoded = new TextEncoder().encode(plaintext);
    const key = await this.#generateKey(password);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encoded
    );

    return bufferToString(ciphertext);
  }

  async decrypt(iv, ciphertext, password) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const key = await this.#generateKey(password);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      stringToBuffer(ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  }
}

(class DesignSystemCanvas extends PPPElement {
  connectedCallback() {
    super.connectedCallback();

    DesignToken.registerDefaultStyleTarget(this);
  }
})
  .compose({
    template: html` <slot></slot> `,
    styles: css`
      :host {
        position: relative;
        height: 100%;
      }
    `
  })
  .define();

class SettingsMap extends Map {
  #observable;

  constructor(observable) {
    super();

    this.#observable = observable;
  }

  load(key, value) {
    return super.set(key, value);
  }

  set(key, value) {
    super.set(key, value);

    Observable.notify(this.#observable, 'settings');

    if (ppp.keyVault?.ok()) {
      return ppp.user.functions.updateOne(
        {
          collection: 'app'
        },
        {
          _id: '@settings'
        },
        {
          $set: {
            [key]: value
          }
        },
        {
          upsert: true
        }
      );
    }
  }
}

class PPP {
  @observable
  workspaces;

  @observable
  extensions;

  @observable
  settings;

  @observable
  darkMode;

  locales = ['ru', 'en'];

  locale =
    localStorage.getItem('ppp-locale') ??
    this.locales.find((l) => {
      return new RegExp(`^${l}\\b`, 'i').test(navigator.language);
    }) ??
    this.locales[0];

  crypto = new PPPCrypto();

  pusherConnections = new Map();

  keyVault = new KeyVault();

  constructor(appType) {
    this.workspaces = [];
    this.extensions = [];
    this.settings = new SettingsMap(this);

    this.designSystemCanvas = document.querySelector(
      'ppp-design-system-canvas'
    );

    this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const savedDarkMode = localStorage.getItem('ppp-dark-mode');

    if (typeof savedDarkMode === 'string') {
      if (savedDarkMode === '0') this.darkMode = false;
      else if (savedDarkMode === '1') this.darkMode = true;
      else localStorage.setItem('ppp-dark-mode', '2');
    } else {
      localStorage.setItem('ppp-dark-mode', '2');
    }

    this.appType = appType;
    this.rootUrl = window.location.origin;

    if (this.rootUrl.endsWith('.github.io')) this.rootUrl += '/ppp';

    if (!this.keyVault.ok()) {
      this.#createApplication({ emergency: true });
    } else {
      this.#createApplication({});
    }
  }

  structuredClone(value) {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    } else {
      return Object.assign({}, value);
    }
  }

  #showLoadingError({ errorText, shouldShowGlobalProxyUrlInput }) {
    document.querySelector('.splashscreen-loader').classList.add('error');
    document.querySelector('.loading-text').classList.add('error');

    document.querySelector('.loading-text').textContent = errorText;

    if (shouldShowGlobalProxyUrlInput) {
      document.querySelector('.global-proxy-url').removeAttribute('hidden');
    }
  }

  async #rebuildDictionary() {
    let savedPhrases = {};

    if (this.dict) {
      savedPhrases = ppp.structuredClone(this.dict.phrases);
    }

    this.dict = new Polyglot({
      locale: this.locale
    });

    (await import(`./i18n/${this.locale}/loading-errors.i18n.js`)).default(
      this.dict
    );

    this.dict.extend(savedPhrases);
  }

  async #createApplication({ emergency }) {
    await this.#rebuildDictionary();

    if (!emergency) {
      const { getApp, Credentials } = await import(
        `${this.rootUrl}/lib/realm.js`
      );
      const { Traders } = await import(
        `${this.rootUrl}/lib/traders/runtime.js`
      );

      try {
        this.traders = new Traders();
        this.realm = getApp(this.keyVault.getKey('mongo-app-client-id'));
        this.credentials = Credentials.apiKey(
          this.keyVault.getKey('mongo-api-key')
        );
        this.user = await this.realm.logIn(this.credentials, false);
      } catch (e) {
        console.error(e);

        if (e.statusCode === 401 || e.statusCode === 404) {
          this.keyVault.removeKey('mongo-api-key');

          return this.#createApplication({ emergency: true });
        } else {
          if (/Failed to fetch/i.test(e?.message)) {
            if (localStorage.getItem('ppp-use-alternative-mongo') === '1') {
              this.#showLoadingError({
                errorText: this.t('$loadingErrors.E_NO_MONGODB_CONNECTION')
              });

              const listener = function (event) {
                if (event.key === 'Enter') {
                  localStorage.removeItem('ppp-use-alternative-mongo');
                  window.location.reload();
                }

                document.removeEventListener('keydown', listener);
              };

              document.addEventListener('keydown', listener);
            } else {
              this.#showLoadingError({
                errorText: this.t('$loadingErrors.E_NO_PROXY_CONNECTION'),
                shouldShowGlobalProxyUrlInput: true
              });
            }
          } else {
            this.#showLoadingError({
              errorText: this.t('$loadingErrors.E_UNKNOWN')
            });
          }

          return;
        }
      }
    } else {
      const params = Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
      );

      if (params.page !== 'cloud-services') {
        window.history.replaceState(
          '',
          '',
          `${window.location.origin}${window.location.pathname}?page=cloud-services`
        );
      }
    }

    if (!emergency) {
      try {
        const lines = ((context) => {
          const db = context.services.get('mongodb-atlas').db('ppp');

          const workspaces = db
            .collection('workspaces')
            .find(
              { removed: { $not: { $eq: true } } },
              { _id: 1, name: 1, order: 1 }
            );

          const settings = db.collection('app').findOne({ _id: '@settings' });

          const extensions = db
            .collection('extensions')
            .find({ removed: { $not: { $eq: true } } });

          return { workspaces, settings, extensions };
        })
          .toString()
          .split(/\r?\n/);

        lines.pop();
        lines.shift();

        const evalRequest = await this.user.functions.eval(lines.join('\n'));

        this.workspaces = evalRequest.workspaces ?? [];
        this.extensions = evalRequest.extensions ?? [];

        for (const key in evalRequest.settings ?? {}) {
          if (key !== '_id') {
            this.settings.load(key, evalRequest.settings?.[key]);
          }
        }

        const storedDarkMode = this.settings.get('darkMode');

        if (storedDarkMode === '1') {
          this.darkMode = true;

          localStorage.setItem('ppp-dark-mode', '1');
        } else if (storedDarkMode === '0') {
          this.darkMode = false;

          localStorage.setItem('ppp-dark-mode', '0');
        } else if (storedDarkMode === '2') {
          this.darkMode = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;

          localStorage.setItem('ppp-dark-mode', '2');
        }

        const locale = this.settings.get('language');

        if (this.locales.includes(locale)) {
          this.locale = locale;
        }

        await this.#rebuildDictionary();

        localStorage.setItem('ppp-locale', this.locale);
      } catch (e) {
        console.error(e);

        if (/Failed to fetch/i.test(e?.message)) {
          if (localStorage.getItem('ppp-use-alternative-mongo') === '1') {
            this.#showLoadingError({
              errorText: this.t('$loadingErrors.E_NO_MONGODB_CONNECTION')
            });

            const listener = function (event) {
              if (event.key === 'Enter') {
                localStorage.removeItem('ppp-use-alternative-mongo');
                window.location.reload();
              }

              document.removeEventListener('keydown', listener);
            };

            document.addEventListener('keydown', listener);
          } else {
            this.#showLoadingError({
              errorText: this.t('$loadingErrors.E_NO_PROXY_CONNECTION'),
              shouldShowGlobalProxyUrlInput: true
            });
          }
        } else if (/failed to find refresh token/i.test(e?.message)) {
          sessionStorage.removeItem('realmLogin');
          window.location.reload();
        } else if (/Cannot access member 'db' of undefined/i.test(e?.message)) {
          this.#showLoadingError({
            errorText: this.t('$loadingErrors.E_BROKEN_ATLAS_REALM_LINK')
          });
        } else if (
          /error resolving cluster hostname/i.test(e?.message) ||
          /error connecting to MongoDB cluster/i.test(e?.message) ||
          /server selection error/i.test(e?.message)
        ) {
          this.#showLoadingError({
            errorText: this.t('$loadingErrors.E_OFFLINE_REALM')
          });
        } else if (/function not found: 'eval'/i.test(e?.message)) {
          this.#showLoadingError({
            errorText: this.t(
              '$loadingErrors.E_CLOUD_SERVICES_MISCONFIGURATION_PLEASE_WAIT'
            )
          });

          setTimeout(() => {
            localStorage.removeItem('ppp-mongo-app-id');
            localStorage.removeItem('ppp-tag');

            window.location.reload();
          }, 5000);
        } else {
          this.#showLoadingError({
            errorText: this.t('$loadingErrors.E_UNKNOWN')
          });
        }

        return;
      }
    }

    try {
      await import(`./elements/app.js`);

      const appElement = document.createElement('ppp-app');

      this.app = this.designSystemCanvas.appendChild(appElement);

      document
        .querySelector('.splashscreen-loader')
        .setAttribute('hidden', true);
    } catch (e) {
      console.error(e);

      this.#showLoadingError({
        errorText: this.t('$loadingErrors.E_UNKNOWN')
      });
    }
  }

  async i18n(url) {
    (
      await import(
        `./i18n/${this.locale}${url
          .split(ppp.rootUrl)[1]
          .replace('.js', '.i18n.js')}`
      )
    ).default(this.dict);
  }

  t(key, options) {
    return this.dict.t(key, options);
  }

  async encrypt(document = {}) {
    const clone = this.structuredClone(document);

    let iv;

    for (const key in clone) {
      if (
        /(token|key|secret|password)$/i.test(key) &&
        !(key === 'key' && clone?.type === APIS.PUSHER)
      ) {
        if (!iv) {
          iv = generateIV();
        }

        clone[key] = await this.crypto.encrypt(iv, clone[key]);
        clone.iv = bufferToString(iv);
      }
    }

    return clone;
  }

  async decrypt(document = {}) {
    const clone = this.structuredClone(document);

    for (const key in clone) {
      if (
        /(token|key|secret|password)$/i.test(key) &&
        !(key === 'key' && clone?.type === APIS.PUSHER)
      ) {
        try {
          clone[key] = await this.crypto.decrypt(document.iv, clone[key]);
        } catch (e) {
          if (!(key === 'key' && clone?.type === APIS.PUSHER)) {
            throw e;
          }
        }
      } else if (
        clone[key] !== null &&
        typeof clone[key] === 'object' &&
        clone[key].iv
      ) {
        clone[key] = await this.decrypt(clone[key]);
      }
    }

    return clone;
  }

  decryptDocumentsTransformation() {
    return async (d) => {
      if (Array.isArray(d)) {
        const mapped = [];

        for (const document of d) {
          mapped.push(await this.decrypt(document));
        }

        return mapped;
      }

      return d;
    };
  }

  brandSvg(svg) {
    return `static/brand/${ppp.darkMode ? 'dark' : 'light'}/${svg}.svg`;
  }

  async getOrCreateTrader(document) {
    return this.traders.getOrCreateTrader(document);
  }

  async getOrCreatePusherConnection(document) {
    if (document) {
      await import(`${ppp.rootUrl}/vendor/pusher.min.js`);

      Pusher.logToConsole = false;

      if (!this.pusherConnections.has(document._id)) {
        this.pusherConnections.set(
          document._id,
          new Pusher(document.key, {
            cluster: document.cluster,
            enabledTransports: ['ws', 'wss'],
            disabledTransports: ['xhr_streaming', 'xhr_polling', 'sockjs']
          })
        );

        this.pusherConnections.get(document._id).subscribe('telegram');
        this.pusherConnections.get(document._id).subscribe('ppp');
        this.pusherConnections.get(document._id).subscribe('psina');
      }

      return this.pusherConnections.get(document._id);
    }
  }

  async nextInstrumentCacheVersion({ exchange, broker }) {
    const cacheFieldName = `instrumentCache:${exchange}:${broker}`;

    await this.user.functions.updateOne(
      {
        collection: 'app'
      },
      {
        _id: '@settings'
      },
      {
        $inc: {
          [cacheFieldName]: 1
        }
      },
      {
        upsert: true
      }
    );

    const response = await this.user.functions.findOne(
      {
        collection: 'app'
      },
      {
        _id: '@settings'
      }
    );

    const result = +response[cacheFieldName];

    this.settings.load(cacheFieldName, result);

    return result;
  }

  async openInstrumentCache({ exchange, broker }) {
    let version = 1;

    // Check for Firefox garbage browser.
    if (typeof indexedDB.databases === 'function') {
      const databases = await indexedDB.databases();
      const database = databases.find((db) => db.name === 'ppp');

      if (database) {
        version = database.version;
      }
    }

    const checkStoreRequest = indexedDB.open('ppp');
    let storeNames;

    try {
      storeNames = Array.from(
        await new Promise((resolve, reject) => {
          checkStoreRequest.onsuccess = () => {
            if (typeof indexedDB.databases !== 'function') {
              version = checkStoreRequest.result.version;
            }

            resolve(checkStoreRequest.result.objectStoreNames);
          };

          checkStoreRequest.onerror = (event) => {
            reject(event.target.error);
          };
        })
      );
    } finally {
      checkStoreRequest.result.close();
    }

    const storeName = `${exchange}:${broker}`;

    if (!storeNames.includes(storeName)) {
      version++;
    }

    const openRequest = indexedDB.open('ppp', version);

    return new Promise((resolve, reject) => {
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'symbol' });
        }

        db.onerror = (event) => {
          console.error(event.target.error);
          reject(event.target.error);
        };
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;

        db.onversionchange = () => {
          db.close();
        };

        resolve(openRequest.result);
      };
    });
  }

  getWorkerTemplateFullUrl(relativeOrAbsoluteUrl) {
    let url;

    if (relativeOrAbsoluteUrl.startsWith('/')) {
      const rootUrl = window.location.origin;

      if (rootUrl.endsWith('.github.io'))
        url = new URL('/ppp' + relativeOrAbsoluteUrl, rootUrl);
      else url = new URL(relativeOrAbsoluteUrl, rootUrl);
    } else {
      url = new URL(relativeOrAbsoluteUrl);
    }

    return url;
  }

  async fetch(url, options = {}, allowedHeaders = []) {
    const globalProxy = this.keyVault.getKey('global-proxy-url');

    if (globalProxy) {
      const urlObject = new URL(url);

      options.headers ??= {};
      options.headers['X-Host'] = urlObject.hostname;
      options.headers['X-Port'] = urlObject.port;

      for (const h of Object.keys(options.headers)) {
        const lower = h.toLowerCase();

        if (lower === 'x-host' || lower === 'x-port') {
          continue;
        }

        if (!allowedHeaders.includes(lower)) {
          allowedHeaders.push(h);
        }
      }

      options.headers['X-Allowed-Headers'] = allowedHeaders.join(',');
      urlObject.hostname = new URL(globalProxy).hostname;
      urlObject.port = 443;

      return fetch(urlObject.toString(), options);
    } else {
      return fetch(url, options);
    }
  }
}

/** @global */
globalThis.ppp = new PPP(document.documentElement.getAttribute('ppp-app-type'));

export default globalThis.ppp;
