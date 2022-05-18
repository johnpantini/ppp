import { KeyVault } from './shared/key-vault.js';
import { PPPCrypto } from './shared/ppp-crypto.js';

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
        const code = `
          const db = context
            .services.get('mongodb-atlas')
            .db('ppp');

          const workspaces = db.collection('workspaces').aggregate(
            [{$match:{removed:{$not:{$eq:true}}}}]
          );

          const settings = db.collection('app').findOne(
            {_id:'@settings'}
          );

          const extensions = db.collection('extensions').aggregate(
            [{$match:{removed:{$not:{$eq:true}}}}]
          );

          return {workspaces, settings, extensions};
        `;

        const evalRequest = await this.user.functions.eval(code);

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
        } else {
          document
            .getElementById('global-loader')
            .setText('Ошибка загрузки. Подробности в консоли браузера');
        }

        return;
      }
    }

    const element = document.createElement('ppp-app');

    if (!emergency) {
      element.workspaces = workspaces;
      element.extensions = extensions;
      element.settings = settings ?? {};
    }

    element.ppp = this;

    this.appElement = document.body.insertBefore(
      element,
      document.body.firstChild
    );

    this.appElement.setAttribute('hidden', true);
    this.appElement.setAttribute('appearance', this.theme);
    document.getElementById('global-loader').setAttribute('hidden', true);
    this.appElement.removeAttribute('hidden');
  }

  async i18n(url) {
    const fileName = url
      .substr(url.lastIndexOf('/') + 1)
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
})(document.documentElement.getAttribute('ppp-type'));
