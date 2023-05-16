import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { SERVICES } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

export const servicePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Сервисы</ppp-page-header>
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
          <img
            slot="logo"
            draggable="false"
            alt="Cloudflare Worker"
            style="height: 40px;"
            src="${() => ppp.brandSvg('cloudflare-worker')}"
          />
          <span slot="title">Cloudflare Worker</span>
          <span slot="description">
            Бессерверная разработка от Cloudflare.&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://workers.cloudflare.com/"
              >Официальный ресурс</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.CLOUDFLARE_WORKER}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Торговые паузы NYSE/NASDAQ"
            style="height: 44px"
            src="${() => ppp.brandSvg('nsdq')}"
          />
          <span slot="title">Торговые паузы NYSE/NASDAQ</span>
          <span slot="description">
            Оповещение о торговых паузах NYSE/NASDAQ в Telegram.
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts"
              >RSS-лента пауз</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.NYSE_NSDQ_HALTS}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Парсер (Supabase)"
            style="height: 40px"
            src="${() => ppp.brandSvg('supabase')}"
          />
          <span slot="title">Парсер (Supabase)</span>
          <span slot="description">
            Парсер общего назначения на основе Supabase.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.SUPABASE_PARSER}`
              })}"
          >
            Продолжить
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const servicePageStyles = css`
  ${pageStyles}
`;

export class ServicePage extends Page {}

export default ServicePage.compose({
  template: servicePageTemplate,
  styles: servicePageStyles
}).define();
