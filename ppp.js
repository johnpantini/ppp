import { $global } from './lib/element/platform.js';

new (class {
  constructor(realm) {
    this.realm = realm;
    this.configuration = {
      realm,
      theme: 'leafygreen'
    };

    $global.ppp = this;

    [this.repoOwner] = location.hostname.split('.github.io');

    void this.start();

    return 0;
  }

  async createApplication(configuration = {}) {
    const { DesignSystem } = await import(
      './lib/design-system/design-system.js'
    );
    const { app } = await import(
      `./design/${configuration.theme}/${this.realm}/app.js`
    );

    $global.ppp.DesignSystem = DesignSystem;

    DesignSystem.getOrCreate().register(app());

    document.body.setAttribute('appearance', configuration.theme);

    this.appElement = document.body.appendChild(
      document.createElement('ppp-app')
    );

    this.appElement.ppp = this;
    this.appElement.setAttribute('appearance', configuration.theme);
  }

  async problemWithKeys() {
    await this.createApplication(this.configuration);

    $global.loader.setAttribute('hidden', true);
  }

  async start() {
    return this.problemWithKeys();

    this.auth0Credentials = await this.getAuth0Credentials();

    if (await this.checkAuth0Credentials(this.auth0Credentials)) {
    } else return this.problemWithKeys();
  }

  async checkAuth0Credentials({ domain, clientId }) {
    try {
      if (!domain || !clientId) return false;

      const redirectURI = encodeURIComponent(window.location.origin);

      await fetch(
        new URL(
          `authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}`,
          `https://${domain}`
        ),
        {
          mode: 'cors',
          redirect: 'manual'
        }
      );

      return true;
    } catch (e) {
      return false;
    }
  }

  async authenticated() {
    const token = await this.auth0.getTokenSilently();

    if (token) {
      const user = await this.auth0.getUser();
      const req = await fetch(
        new URL(
          `/api/v2/users/${user.sub}`,
          `https://${this.credentials.domain}`
        ),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const json = await req.json();

      console.log(json);
    } else {
      // TODO
    }
  }

  async authorizeUser() {
    this.auth0 = await createAuth0Client({
      domain: this.credentials.domain,
      client_id: this.credentials.clientId,
      audience: `https://${this.credentials.domain}/api/v2/`,
      scope: 'read:current_user',
      advancedOptions: {
        defaultScope: 'openid'
      }
    });

    console.log(this.auth0);

    // FIXME
    document.addEventListener('click', () => {
      // this.auth0.logout({
      //   returnTo: window.location.origin
      // });
    });

    const isAuthenticated = await this.auth0.isAuthenticated();

    if (!isAuthenticated) {
      const query = window.location.search;

      if (query.includes('code=') && query.includes('state=')) {
        await this.auth0.handleRedirectCallback();
        // TODO - check url
        window.history.replaceState({}, document.title, '/');
        await this.authenticated();
      } else {
        await this.auth0.loginWithRedirect({
          redirect_uri: window.location.origin
        });
      }
    } else {
      await this.authenticated();
    }
  }

  async getAuth0Credentials() {
    try {
      const saved = JSON.parse(localStorage.getItem('ppp-auth0-credentials'));

      if (saved) return saved;

      const req = await fetch(
        `https://api.github.com/repos/${this.repoOwner}/ppp/milestones`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      if (req.ok) {
        const json = await req.json();
        const m = json?.find((m) => m.title.endsWith('auth0.com'));
        const result = {
          domain: m.title.trim(),
          clientId: m.description.trim()
        };

        localStorage.setItem('ppp-auth0-credentials', JSON.stringify(result));

        return result;
      }
    } catch (e) {
      console.error(e);

      return null;
    }
  }
})(document.documentElement.getAttribute('data-ppp-realm'));
