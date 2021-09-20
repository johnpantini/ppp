import { $global } from './lib/element/platform.js';
import { KeyVault } from './lib/key-vault.js';

new (class {
  theme = 'leafygreen';

  constructor(realm) {
    this.realm = realm;

    $global.ppp = this;

    [this.repoOwner] = location.hostname.endsWith('pages.dev')
      ? [location.hostname.split('-').slice(0, -1).join('-')]
      : location.hostname.split('.github.io');

    void this.start();
  }

  async createApplication() {
    const [{ DesignSystem }, { app }, { appStyles, appTemplate }] =
      await Promise.all([
        import('./lib/design-system/design-system.js'),
        import(`./${this.realm}/app.js`),
        import(`./design/${this.theme}/app.js`)
      ]);

    $global.ppp.DesignSystem = DesignSystem;

    DesignSystem.getOrCreate().register(app(appStyles, appTemplate)());

    document.body.setAttribute('appearance', this.theme);

    this.appElement = document.body.appendChild(
      document.createElement('ppp-app')
    );

    this.appElement.ppp = this;
    this.appElement.setAttribute('appearance', this.theme);
  }

  async problemWithKeys() {
    await this.createApplication();

    $global.loader.setAttribute('hidden', true);
  }

  async start() {
    this.keyVault = new KeyVault();

    return this.problemWithKeys();
  }
})(document.documentElement.getAttribute('ppp-realm'));
