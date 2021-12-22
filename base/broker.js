/** @decorator */

import { BasePage } from '../lib/page/page.js';
import { validate, invalidate } from '../lib/validate.js';
import { attr } from '../lib/element/components/attributes.js';
import { generateIV, bufferToString, uuidv4 } from '../lib/ppp-crypto.js';
import { SUPPORTED_BROKERS } from '../lib/const.js';

await i18nImport(['validation', 'new-broker']);

export async function checkTinkoffOAPIV1Token({ token }) {
  try {
    return await fetch(
      'https://api-invest.tinkoff.ru/openapi/market/search/by-ticker?ticker=AAPL',
      {
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: e
    };
  }
}

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

export async function checkAlpacaV2Token({ key, secret }) {
  try {
    return await fetch(
      'https://data.alpaca.markets/v2/stocks/AAPL/quotes/latest',
      {
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'APCA-API-KEY-ID': key,
          'APCA-API-SECRET-KEY': secret
        }
      }
    );
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: e
    };
  }
}

export async function checkUnitedTradersLoginPassword({
  url,
  login,
  password
}) {
  try {
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        login,
        password
      })
    });
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}

export class BrokerPage extends BasePage {
  @attr
  broker;

  async createTinkoffOAPIV1Broker() {
    await validate(this.tinkoffToken);

    const r1 = await checkTinkoffOAPIV1Token({
      token: this.tinkoffToken.value.trim()
    });

    if (!r1.ok) {
      console.warn(r1);

      invalidate(this.tinkoffToken, {
        errorMessage: i18n.t('invalidTokenWithStatus', { status: 401 }),
        status: 401
      });
    }

    const iv = generateIV();
    const encryptedToken = await this.app.ppp.crypto.encrypt(
      iv,
      this.tinkoffToken.value.trim()
    );

    await this.app.ppp.user.functions.insertOne(
      {
        collection: 'brokers'
      },
      {
        _id: this.profileName.value.trim(),
        uuid: uuidv4(),
        type: SUPPORTED_BROKERS.TINKOFF_OPENAPI_V1,
        iv: bufferToString(iv),
        token: encryptedToken,
        created_at: new Date()
      }
    );
  }

  async createUnitedTradersBroker() {
    await validate(this.utLogin);
    await validate(this.utPassword);

    const r1 = await checkUnitedTradersLoginPassword({
      url: new URL(
        'ut',
        this.app.ppp.keyVault.getKey('service-machine-url')
      ).toString(),
      login: this.utLogin.value.trim(),
      password: this.utPassword.value.trim()
    });

    if (!r1.ok) {
      console.warn(await r1.text());

      invalidate(this.utPassword, {
        errorMessage: i18n.t('invalidLoginPasswordWithStatus', r1),
        status: r1.status
      });
    }

    const iv = generateIV();
    const encryptedPassword = await this.app.ppp.crypto.encrypt(
      iv,
      this.utPassword.value.trim()
    );

    await this.app.ppp.user.functions.insertOne(
      {
        collection: 'brokers'
      },
      {
        _id: this.profileName.value.trim(),
        uuid: uuidv4(),
        type: SUPPORTED_BROKERS.UNITED_TRADERS,
        iv: bufferToString(iv),
        login: this.utLogin.value.trim(),
        password: encryptedPassword,
        created_at: new Date()
      }
    );
  }

  async createAlorOAPIV2Broker() {
    await validate(this.alorRefreshToken);

    const r1 = await checkAlorOAPIV2RefreshToken({
      refreshToken: this.alorRefreshToken.value.trim()
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
        uuid: uuidv4(),
        type: SUPPORTED_BROKERS.ALOR_OPENAPI_V2,
        iv: bufferToString(iv),
        refresh_token: encryptedToken,
        created_at: new Date()
      }
    );
  }

  async createAlpacaV2Broker() {
    await validate(this.alpacaKey);
    await validate(this.alpacaSecret);

    const r1 = await checkAlpacaV2Token({
      key: this.alpacaKey.value.trim(),
      secret: this.alpacaSecret.value.trim()
    });

    if (!r1.ok) {
      console.warn(r1);

      invalidate(this.alpacaSecret, {
        errorMessage: i18n.t('invalidKeySecretWithStatus', { status: 403 }),
        status: 403
      });
    }

    const iv = generateIV();
    const encryptedSecret = await this.app.ppp.crypto.encrypt(
      iv,
      this.alpacaSecret.value.trim()
    );

    await this.app.ppp.user.functions.insertOne(
      {
        collection: 'brokers'
      },
      {
        _id: this.profileName.value.trim(),
        uuid: uuidv4(),
        type: SUPPORTED_BROKERS.ALPACA_V2,
        iv: bufferToString(iv),
        key: this.alpacaKey.value.trim(),
        secret: encryptedSecret,
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

        case SUPPORTED_BROKERS.UNITED_TRADERS:
          await this.createUnitedTradersBroker();

          break;

        case SUPPORTED_BROKERS.TINKOFF_OPENAPI_V1:
          await this.createTinkoffOAPIV1Broker();

          break;

        case SUPPORTED_BROKERS.ALPACA_V2:
          await this.createAlpacaV2Broker();

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
    const params = this.app.params();

    this.app.navigate(
      this.app.url({
        ...params,
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
