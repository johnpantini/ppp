import { $global } from './lib/element/platform.js';
import { KeyVault, keySet } from './lib/key-vault.js';
import { PPPCrypto } from './lib/ppp-crypto.js';

new (class {
  /**
   * Default theme is leafygreen {@link https://www.mongodb.design/}
   */
  theme = 'leafygreen';

  crypto = new PPPCrypto(this);

  constructor(realm) {
    this.realm = realm;
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
    // TODO - fetch settings from MongoDB
    const [{ DesignSystem }, { app }, { appStyles, appTemplate }] =
      await Promise.all([
        import('./lib/design-system/design-system.js'),
        import(`./${this.realm}/app.js`),
        import(`./design/${this.theme}/app.js`)
      ]);

    $global.ppp.DesignSystem = DesignSystem;

    DesignSystem.getOrCreate().register(app(appStyles, appTemplate)());
    document.body.setAttribute('appearance', this.theme);

    this.appElement = document.body.insertBefore(
      document.createElement('ppp-app'),
      document.body.firstChild
    );

    $global.loader.setAttribute('hidden', true);
    this.appElement.ppp = this;
    this.appElement.setAttribute('appearance', this.theme);
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
})(document.documentElement.getAttribute('ppp-realm'));
