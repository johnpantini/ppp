import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { ORDERS } from '../../lib/const.js';
import {
  buySell,
  scale,
  cloudFunctions,
  search
} from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

await ppp.i18n(import.meta.url);

export class OrderCommonPage extends Page {
  async validate() {
    await validate(this.name);
    await validate(this.baseUrl);

    try {
      await import(`${new URL(this.baseUrl.value).toString()}page.js`);
    } catch (e) {
      console.error(e);

      invalidate(this.baseUrl, {
        errorMessage: ppp.t('$page.urlCannotBeUsed'),
        raiseException: true
      });
    }
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        baseUrl: new URL(
          this.baseUrl.value.endsWith('/')
            ? this.baseUrl.value
            : `${this.baseUrl.value}/`
        ).toString(),
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export const orderPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>${() => ppp.t('$collection.orders')}</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="${() => ppp.t('$orderPage.searchPlaceholder')}"
        @input="${(x, c) =>
          filterCards(x.cards.children, c.event.target.value)}"
      >
        <span class="icon" slot="end">${html.partial(search)}</span>
      </ppp-text-field>
      <div class="card-container" ${ref('cards')}>
        <ppp-generic-card>
          <div class="picture buy-sell" slot="logo">
            ${html.partial(buySell)}
          </div>
          <span slot="title">
            ${() => ppp.t(`$const.order.${ORDERS.STOP_LOSS_TAKE_PROFIT}`)}
          </span>
          <span slot="description">
            ${() => ppp.t('$orderPage.slTpCardDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `order-${ORDERS.STOP_LOSS_TAKE_PROFIT}`
              })}"
          >
            ${() => ppp.t('$orderPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <div class="picture buy-sell" slot="logo">${html.partial(scale)}</div>
          <span slot="title">${() => ppp.t('$orderPage.recorderCardTitle')}</span>
          <span slot="description">
            ${() => ppp.t('$orderPage.recorderCardDescription')}
          </span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `order-${ORDERS.MARKET_DATA_RECORDER}`
                })}"
            >
              ${() => ppp.t('$orderPage.continueButton')}
            </ppp-button>
            <ppp-button @click="${(x) => x.showRecordingsWindow()}">
              ${() => ppp.t('$orderPage.manageRecordings')}
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <div class="picture" slot="logo">${html.partial(cloudFunctions)}</div>
          <div slot="title">${() => ppp.t(`$const.order.${ORDERS.CUSTOM}`)}</div>
          <span slot="description">
            ${() => ppp.t('$orderPage.customCardDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `order-${ORDERS.CUSTOM}`
              })}"
          >
            ${() => ppp.t('$orderPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const orderPageStyles = css`
  ${pageStyles}
  .picture svg {
    position: relative;
    height: 40px;
  }

  .picture.buy-sell svg {
    position: relative;
    height: 45px;
  }
`;

export class OrderPage extends Page {
  async showRecordingsWindow() {
    this.beginOperation();

    try {
      await ppp.app.mountPage('recordings-modal', {
        title: ppp.t('$orderPage.manageRecordings'),
        size: 'medium'
      });
    } catch (e) {
      this.failOperation(e, ppp.t('$orderPage.manageRecordings'));
    } finally {
      this.endOperation();
    }
  }
}

export default OrderPage.compose({
  template: orderPageTemplate,
  styles: orderPageStyles
}).define();
