/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import { validate, invalidate } from '../../lib/validate.js';
import { attr } from '../../lib/element/components/attributes.js';
import { generateIV } from '../../lib/ppp-crypto.js';

await i18nImport(['validation']);

const SUPPORTED_BROKERS = {
  ALOR_OPENAPI_V2: 'alor-openapi-v2'
};

export async function checkAlorOAPIV2RefreshToken({ refreshToken }) {
  try {
    return await fetch(`https://oauth.alor.ru/refresh?token=${refreshToken}`, {
      cache: 'no-cache',
      method: 'POST'
    });
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}

export class NewBrokerPage extends BasePage {
  @attr
  broker;

  async createAlorOAPIV2Broker() {
    // TODO
  }

  async createBroker() {
    try {
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = i18n.t('$pages.newBroker.toast.title');

      await validate(this.profileName);

      switch (this.broker) {
        case SUPPORTED_BROKERS.ALOR_OPENAPI_V2:
          return await this.createAlorOAPIV2Broker();
      }
    } catch (e) {
      console.error(e);

      invalidate(this.app.toast, {
        errorMessage: i18n.t('operationFailed')
      });
    } finally {
      this.busy = false;
    }
  }

  brokerChanged(oldValue, newValue) {
    this.app.navigate(
      this.app.url({
        page: this.app.params().page,
        broker: newValue || void 0
      })
    );
  }

  #onPopState() {
    this.broker = this.app.params()?.broker;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onPopState = this.#onPopState.bind(this);

    window.addEventListener('popstate', this._onPopState, {
      passive: true
    });

    const broker = this.app.params()?.broker;

    if (Object.values(SUPPORTED_BROKERS).indexOf(broker) === -1)
      return this.app.navigate(this.app.url({ page: this.app.params().page }));

    this.broker = broker;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('popstate', this._onPopState, {
      passive: true
    });

    this.broker = void 0;
  }
}
