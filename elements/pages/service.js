import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { SERVICE_STATE, SERVICES, VERSIONING_STATUS } from '../../lib/const.js';
import { cloud, search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

export function serviceStateAppearance(document) {
  if (document.removed) return 'lightgray';

  switch (document.state) {
    case SERVICE_STATE.ACTIVE:
      return 'green';
    case SERVICE_STATE.STOPPED:
      return 'lightgray';
    case SERVICE_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const servicePageHeaderExtraControls = html`
  <ppp-badge
    slot="controls"
    appearance="${(x) => serviceStateAppearance(x.document)}"
  >
    ${(x) => ppp.t(`$const.serviceState.${x.document.state}`)}
  </ppp-badge>
  <ppp-badge
    slot="controls"
    appearance="${(x) => {
      const vs = x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK;

      if (vs === VERSIONING_STATUS.OK) return 'green';
      else if (vs === VERSIONING_STATUS.OLD) {
        return 'yellow';
      } else if (vs === VERSIONING_STATUS.OFF) {
        return 'blue';
      }
    }}"
  >
    ${(x) =>
      ppp.t(
        `$const.versioningStatus.${
          x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK
        }`
      )}
  </ppp-badge>
  ${when(
    (x) =>
      typeof x.updateService === 'function' &&
      (x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK) ===
        VERSIONING_STATUS.OLD,
    html`
      <ppp-button
        ?disabled="${(x) => !x.isSteady()}"
        slot="controls"
        appearance="primary"
        @click="${(x) => x.updateService?.()}"
      >
        Обновить
        <span slot="start">${html.partial(cloud)}</span>
      </ppp-button>
    `
  )}
`;

export const servicePageFooterExtraControls = html`
  <ppp-button
    ?hidden="${(x) => !x.document._id}"
    ?disabled="${(x) =>
      !x.isSteady() ||
      x.document.removed ||
      x.document.state === SERVICE_STATE.FAILED}"
    @click="${(x) => x.restartService()}"
  >
    Перезапустить
  </ppp-button>
  <ppp-button
    ?hidden="${(x) => !x.document._id}"
    ?disabled="${(x) =>
      !x.isSteady() ||
      x.document.removed ||
      x.document.state === SERVICE_STATE.FAILED ||
      x.document.state === SERVICE_STATE.STOPPED}"
    @click="${(x) => x.stopService()}"
  >
    Приостановить
  </ppp-button>
`;

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
            alt="Торговые паузы SPBEX"
            style="height: 30px"
            src="${() => ppp.brandSvg('spbex')}"
          />
          <span slot="title">Торговые паузы СПБ Биржи</span>
          <span slot="description">
            Оповещение о торговых паузах СПБ Биржи в Telegram.
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://spbexchange.ru/ru/about/news.aspx?sectionrss=30"
              >RSS-лента пауз</a
            >.
          </span>
          <ppp-button
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.SPBEX_HALTS}`
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
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Aspirant"
            style="height: 40px"
            src="${() => ppp.brandSvg('javascript')}"
          />
          <span slot="title">Aspirant</span>
          <span slot="description">
            Сервис для запуска долго работающих процессов в облаке.
          </span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.CLOUD_PPP_ASPIRANT}`
                })}"
            >
              В облаке
            </ppp-button>
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.DEPLOYED_PPP_ASPIRANT}`
                })}"
            >
              По адресу
            </ppp-button>
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.SYSTEMD_PPP_ASPIRANT}`
                })}"
            >
              Systemd
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Aspirant Worker"
            style="height: 40px"
            src="${() => ppp.brandSvg('javascript-green')}"
          />
          <span slot="title">Aspirant Worker</span>
          <span slot="description">
            Рабочий процес в облачном сервисе Aspirant.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.PPP_ASPIRANT_WORKER}`
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
