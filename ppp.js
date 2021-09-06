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
  }
})(document.documentElement.getAttribute('data-ppp-realm'));
