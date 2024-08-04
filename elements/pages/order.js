import { html, css, ref } from '../../vendor/fast-element.min.js';
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

export class OrderCommonPage extends Page {
  async validate() {
    await validate(this.name);
    await validate(this.baseUrl);

    try {
      await import(`${new URL(this.baseUrl).toString()}page.js`);
    } catch (e) {
      console.error(e);

      invalidate(this.baseUrl, {
        errorMessage: 'Этот URL не может быть использован',
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
      <ppp-page-header>Шаблоны заявок</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="Поиск"
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
          <span slot="title">Stop Loss/Take Profit</span>
          <span slot="description">
            Классическая отложенная заявка с настройками.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `order-${ORDERS.STOP_LOSS_TAKE_PROFIT}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <div class="picture buy-sell" slot="logo">${html.partial(scale)}</div>
          <span slot="title">Запись сделок и котировок</span>
          <span slot="description">
            Записывает изменения рыночных данных в облачное хранилище.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `order-${ORDERS.MARKET_DATA_RECORDER}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <div class="picture" slot="logo">${html.partial(cloudFunctions)}</div>
          <div slot="title">По ссылке</div>
          <span slot="description">
            Собственная реализация заявки, загружаемая по ссылке.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `order-${ORDERS.CUSTOM}`
              })}"
          >
            Продолжить
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

export class OrderPage extends Page {}

export default OrderPage.compose({
  template: orderPageTemplate,
  styles: orderPageStyles
}).define();
