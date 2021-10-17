/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import { validate, invalidate } from '../../lib/validate.js';
import { attr } from '../../lib/element/components/attributes.js';
import { generateIV, bufferToString } from '../../lib/ppp-crypto.js';

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
    await validate(this.alorRefreshToken);

    const r1 = await checkAlorOAPIV2RefreshToken({
      refreshToken: this.alorRefreshToken.value
    });

    if (!r1.ok) {
      console.warn(await r1.text());

      invalidate(this.alorRefreshToken, {
        errorMessage: i18n.t('invalidTokenWithStatus', r1),
        status: r1.status
      });
    }

    const iv = generateIV();
    const encryptedToken = await this.app.ppp.crypto.encrypt(
      iv,
      this.alorRefreshToken.value.trim()
    );

    await this.app.ppp.user.functions.insertOne(
      {
        collection: 'brokers'
      },
      {
        _id: this.profileName.value.trim(),
        type: SUPPORTED_BROKERS.ALOR_OPENAPI_V2,
        iv: bufferToString(iv),
        refresh_token: encryptedToken,
        created_at: new Date()
      }
    );
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
          await this.createAlorOAPIV2Broker();

          break;
      }

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationDone');
      this.app.toast.visible = true;
    } catch (e) {
      console.error(e);

      if (/E11000/i.test(e.error)) {
        invalidate(this.app.toast, {
          errorMessage: 'Профиль с таким названием уже существует'
        });
      } else {
        invalidate(this.app.toast, {
          errorMessage: i18n.t('operationFailed')
        });
      }
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
