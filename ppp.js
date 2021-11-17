import { $global } from './lib/element/platform.js';
import { KeyVault, keySet } from './lib/key-vault.js';
import { PPPCrypto } from './lib/ppp-crypto.js';

new (class {
  /**
   * Default theme is leafygreen {@link https://www.mongodb.design/}
   */
  theme = 'leafygreen';

  crypto = new PPPCrypto(this);

  constructor(appType) {
    this.appType = appType;
    $global.ppp = this;

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
      const { getApp, Credentials } = await import('./lib/realm.js');

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

    const [{ DesignSystem }, { app }, { appStyles, appTemplate }] =
      await Promise.all([
        import('./lib/design-system/design-system.js'),
        import(`./${this.appType}/app.js`),
        import(`./design/${this.theme}/app.js`)
      ]);

    $global.ppp.DesignSystem = DesignSystem;

    DesignSystem.getOrCreate().register(app(appStyles, appTemplate)());
    document.body.setAttribute('appearance', this.theme);

    this.appElement = document.body.insertBefore(
      document.createElement('ppp-app'),
      document.body.firstChild
    );

    this.appElement.setAttribute('hidden', true);

    // TODO - handle errors
    if (!emergency) {
      const [workspaces, settings] = await Promise.all([
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
        )
      ]);

      this.appElement.workspaces = workspaces;
      this.appElement.settings = settings ?? {};
    }

    this.appElement.ppp = this;
    this.appElement.setAttribute('appearance', this.theme);
    $global.loader.setAttribute('hidden', true);
    this.appElement.removeAttribute('hidden');
  }

  async start() {
    this.keyVault = new KeyVault();

    const repoOwner = location.hostname.endsWith('pages.dev')
      ? location.hostname.split('.pages.dev')[0]
      : location.hostname.split('.github.io')[0];

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

      // Try to remove potential Cloudflare Pages extra dash
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
