import { $global } from './lib/element/platform.js';

new (class {
  theme = 'leafygreen';

  constructor(realm) {
    this.realm = realm;

    $global.ppp = this;

    [this.repoOwner] = location.hostname.split('.github.io');

    void this.start();

    return 0;
  }

  async createApplication() {
    const { DesignSystem } = await import(
      './lib/design-system/design-system.js'
    );
    const { app } = await import(`./${this.realm}/app.js`);
    const { appStyles, appTemplate } = await import(
      `./design/${this.theme}/app.js`
    );

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
    return this.problemWithKeys();
  }
})(document.documentElement.getAttribute('ppp-realm'));
