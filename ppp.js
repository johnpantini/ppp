import { KeyVault } from './shared/key-vault.js';
import { bufferToString, generateIV, PPPCrypto } from './shared/ppp-crypto.js';
import { maybeFetchError } from './shared/fetch-error.js';

export default new (class {
  /**
   * Default theme is leafygreen {@link https://www.mongodb.design/}
   */
  theme = 'leafygreen';

  /**
   * Supported languages.
   * @type {[string]}
   */
  locales = ['ru'];

  crypto = new PPPCrypto();

  constructor(appType) {
    globalThis.ppp = this;

    this.appType = appType;
    this.rootUrl = window.location.origin;

    if (this.rootUrl.endsWith('.github.io')) this.rootUrl += '/ppp';

    const storedLang = localStorage.getItem('ppp-lang');

    this.locale = this.locales.indexOf(storedLang) > -1 ? storedLang : 'ru';
    this.dict = new Polyglot({
      locale: this.locale
    });

    document.documentElement.setAttribute('lang', this.locale);

    void this.start();
  }

  async #createApplication({ emergency }) {
    // try {
    //   await import(`data:text/javascript,export default '42'`);
    // } catch (e) {
    //   document.getElementById('global-loader').classList.add('error');
    //
    //   document
    //     .getElementById('global-loader')
    //     .setText('Приложение ppp не поддерживает ваш браузер');
    //
    //   return;
    // }

    if (!emergency) {
      const { getApp, Credentials } = await import('./shared/realm.js');

      try {
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
          document.getElementById('global-loader').classList.add('error');

          if (/Failed to fetch/i.test(e?.message)) {
            document
              .getElementById('global-loader')
              .setText('Нет связи с сервисной машиной');

            document
              .getElementById('global-loader')
              .showInput(this.keyVault.getKey('service-machine-url'));
          } else {
            document
              .getElementById('global-loader')
              .setText('Ошибка загрузки. Подробности в консоли браузера');
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

    const [{ DesignSystem }, { app, appStyles, appTemplate }] =
      await Promise.all([
        import('./shared/design-system/design-system.js'),
        import(`./${this.appType}/${this.theme}/app.js`)
      ]);

    this.DesignSystem = DesignSystem;

    DesignSystem.getOrCreate().register(app(appStyles, appTemplate)());
    document.body.setAttribute('appearance', this.theme);

    let workspaces = [];
    let extensions = [];
    let settings = {};

    if (!emergency) {
      try {
        const lines = ((context) => {
          const db = context.services.get('mongodb-atlas').db('ppp');

          const workspaces = db
            .collection('workspaces')
            .find({ removed: { $not: { $eq: true } } }, { _id: 1, name: 1 });

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

        workspaces = evalRequest.workspaces;
        extensions = evalRequest.extensions;
        settings = evalRequest.settings;
      } catch (e) {
        console.error(e);
        document.getElementById('global-loader').classList.add('error');

        if (/Failed to fetch/i.test(e?.message)) {
          document
            .getElementById('global-loader')
            .setText('Нет связи с сервисной машиной');

          document
            .getElementById('global-loader')
            .showInput(this.keyVault.getKey('service-machine-url'));
        } else if (/failed to find refresh token/i.test(e?.message)) {
          sessionStorage.removeItem('realmLogin');
          window.location.reload();
        } else if (/Cannot access member 'db' of undefined/i.test(e?.message)) {
          document
            .getElementById('global-loader')
            .setText(
              'Хранилище MongoDB Atlas не имеет связи с приложением MongoDB Realm'
            );
        } else if (
          /error resolving cluster hostname/i.test(e?.message) ||
          /error connecting to MongoDB cluster/i.test(e?.message)
        ) {
          document
            .getElementById('global-loader')
            .setText(
              'Хранилище MongoDB Atlas не в сети или отключено за неактивность'
            );
        } else if (/function not found: 'eval'/i.test(e?.message)) {
          document
            .getElementById('global-loader')
            .setText(
              'Сбой настройки облачных сервисов, пожалуйста, подождите...'
            );

          setTimeout(() => {
            localStorage.removeItem('ppp-mongo-app-id');
            localStorage.removeItem('ppp-tag');

            window.location.reload();
          }, 5000);
        } else {
          document
            .getElementById('global-loader')
            .setText('Ошибка загрузки. Подробности в консоли браузера');
        }

        return;
      }
    }

    const appElement = document.createElement('ppp-app');

    if (!emergency) {
      appElement.workspaces = workspaces;
      appElement.extensions = extensions;
      appElement.settings = settings ?? {};
    }

    appElement.ppp = this;

    this.app = document.body.insertBefore(appElement, document.body.firstChild);

    this.app.setAttribute('hidden', true);
    this.app.setAttribute('appearance', this.theme);
    document.getElementById('global-loader').setAttribute('hidden', true);
    this.app.removeAttribute('hidden');
  }

  async i18n(url) {
    const fileName = url
      .substring(url.lastIndexOf('/') + 1)
      .replace('.', '.i18n.');

    (await import(`./i18n/${this.locale}/${fileName}`)).default(this.dict);
  }

  async start() {
    this.keyVault = new KeyVault();

    (await import(`./i18n/${this.locale}/shared.i18n.js`)).default(this.dict);

    if (!this.keyVault.ok()) {
      this.#createApplication({ emergency: true });
    } else {
      return this.#createApplication({});
    }
  }

  /**
   *
   * @param username
   * @param apiKey
   * @param serviceMachineUrl
   * @throws {FetchError}
   */
  async getMongoDBRealmAccessToken({
    username = this.keyVault.getKey('mongo-public-key'),
    apiKey = this.keyVault.getKey('mongo-private-key'),
    serviceMachineUrl = this.keyVault.getKey('service-machine-url')
  } = {}) {
    const rMongoDBRealmAccessToken = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
          body: {
            username,
            apiKey
          }
        })
      }
    );

    await maybeFetchError(
      rMongoDBRealmAccessToken,
      'Не удалось авторизоваться в MongoDB Realm. Проверьте ключи.'
    );

    const { access_token: mongoDBRealmAccessToken } =
      await rMongoDBRealmAccessToken.json();

    return mongoDBRealmAccessToken;
  }

  async encrypt(document = {}, excludedKeys = []) {
    const clone = Object.assign({}, document);

    let iv;

    for (const key in clone) {
      if (
        /(token|key|secret|password)$/i.test(key) &&
        excludedKeys.indexOf(key) < 0
      ) {
        if (!iv) {
          iv = generateIV();
        }

        clone[key] = await ppp.crypto.encrypt(iv, clone[key]);
        clone.iv = bufferToString(iv);
      }
    }

    return clone;
  }

  async decrypt(document = {}, excludedKeys = []) {
    const clone = Object.assign({}, document);

    for (const key in clone) {
      if (
        /(token|key|secret|password)$/i.test(key) &&
        excludedKeys.indexOf(key) < 0
      ) {
        clone[key] = await ppp.crypto.decrypt(document.iv, clone[key]);
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

  decryptDocumentsTransformation(excludedKeys = []) {
    return async (d) => {
      if (Array.isArray(d)) {
        const mapped = [];

        for (const document of d) {
          mapped.push(await ppp.decrypt(document, excludedKeys));
        }

        return mapped;
      }

      return d;
    };
  }
})(document.documentElement.getAttribute('ppp-type'));
