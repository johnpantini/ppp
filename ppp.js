import { KeyVault, keySet } from './shared/key-vault.js';
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

  crypto = new PPPCrypto(this);

  constructor(appType) {
    this.appType = appType;

    const storedLang = localStorage.getItem('ppp-lang');

    this.locale = this.locales.indexOf(storedLang) > -1 ? storedLang : 'ru';
    this.dict = new Polyglot({
      locale: this.locale
    });

    document.documentElement.setAttribute('lang', this.locale);

    void this.start();
  }

  async #authenticated() {
    const token = await this.auth0.getTokenSilently();

    if (token) {
      const user = await this.auth0.getUser();
      const req = await fetch(
        new URL(
          `/api/v2/users/${user.sub}`,
          `https://${this.keyVault.getKey('auth0-domain')}`
        ),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const json = await req.json();

      if (!json.app_metadata) {
        console.error(req, json);

        alert(
          'Проблема с метаданными пользователя Auth0. Свяжитесь с @johnpantini'
        );
      }

      keySet.forEach((k) => this.keyVault.setKey(k, json.app_metadata[k]));

      this.auth0.logout({
        returnTo:
          window.location.origin +
          window.location.pathname +
          '?page=cloud-services'
      });
    }
  }

  async #authorizeWithAuth0() {
    const script = document.createElement('script');

    script.onload = async () => {
      this.auth0 = await createAuth0Client({
        domain: this.keyVault.getKey('auth0-domain'),
        client_id: this.keyVault.getKey('auth0-client-id'),
        audience: `https://${this.keyVault.getKey('auth0-domain')}/api/v2/`,
        scope: 'read:current_user',
        redirect_uri:
          window.location.origin +
          window.location.pathname +
          '?page=cloud-services',
        advancedOptions: {
          defaultScope: 'openid'
        }
      });

      const isAuthenticated = await this.auth0.isAuthenticated();

      if (!isAuthenticated) {
        const query = window.location.search;

        if (query.includes('code=') && query.includes('state=')) {
          await this.auth0.handleRedirectCallback();
          await this.#authenticated();
        } else {
          await this.auth0.loginWithRedirect({
            redirect_uri:
              window.location.origin +
              window.location.pathname +
              '?page=cloud-services'
          });
        }
      } else {
        await this.#authenticated();
      }
    };

    script.src = './vendor/auth0.min.js';

    document.head.append(script);
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

          return this.#authorizeWithAuth0();
        } else {
          return alert(
            'Не удалось соединиться с MongoDB, попробуйте обновить страницу. Если проблема не решится, вероятно, кластер MongoDB Atlas отключён за неактивность. В таком случае перейдите в панель управления MongoDB Atlas и нажмите Resume, а спустя несколько минут обновите текущую страницу'
          );
        }
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
        [workspaces, settings, extensions] = await Promise.all([
          this.user.functions.find({
            collection: 'workspaces'
          }),
          this.user.functions.findOne(
            {
              collection: 'app'
            },
            {
              _id: 'settings'
            }
          ),
          this.user.functions.find({
            collection: 'extensions'
          })
        ]);
      } catch (e) {
        console.error(e);
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

    let [repoOwner] = location.hostname.split('.');

    if (!this.keyVault.hasAuth0Keys()) {
      let r = await fetch(
        `https://api.github.com/repos/${repoOwner}/ppp/milestones`,
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Try to remove potential extra dash
      if (!r.ok) {
        r = await fetch(
          `https://api.github.com/repos/${repoOwner
            .split('-')
            .slice(0, -1)
            .join('-')}/ppp/milestones`,
          {
            cache: 'no-cache',
            headers: {
              Accept: 'application/vnd.github.v3+json'
            }
          }
        );
      }

      if (r.ok) {
        const json = await r.json();
        const m = json?.find((m) => m.title.endsWith('auth0.com'));

        if (m) {
          this.keyVault.setKey('auth0-domain', m.title.trim());
          this.keyVault.setKey('auth0-client-id', m.description.trim());

          if (!this.keyVault.ok()) {
            return this.#authorizeWithAuth0();
          } else {
            return this.#createApplication({});
          }
        } else return this.#createApplication({ emergency: true });
      } else {
        return this.#createApplication({ emergency: true });
      }
    } else if (!this.keyVault.ok()) {
      return this.#authorizeWithAuth0();
    } else {
      return this.#createApplication({});
    }
  }
})(document.documentElement.getAttribute('ppp-type'));
