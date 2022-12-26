import { ServicePage } from '../../shared/service-page.js';
import { SERVICE_STATE, SERVICES } from '../../shared/const.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { filterCards } from '../../shared/generic-card.js';
import { stateAppearance } from './services-page.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

export const servicePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Сервисы
      </span>
      <${'ppp-text-field'}
        class="global-search-input"
        type="search"
        placeholder="Поиск"
        @input="${(x, c) =>
          filterCards(x.cards.children, c.event.target.value)}"
      >
        ${search({
          slot: 'end'
        })}
      </ppp-text-field>
      <div class="card-container" ${ref('cards')}>
        <${'ppp-generic-card'}>
          <img slot="logo" draggable="false" alt="SPBEX" style="height: 33px"
               src="static/spbex.svg"/>
          <span slot="title">Торговые паузы SPBEX</span>
          <span slot="description">Оповещение о торговых паузах SPBEX в Telegram. <a
            target="_blank"
            href="https://spbexchange.ru/ru/about/news.aspx?sectionrss=30">RSS-лента пауз</a>.</span>
          <${'ppp-button'}
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
          <img slot="logo" draggable="false" alt="NYSE/NASDAQ"
               style="height: 44px"
               src="static/nsdq.svg"/>
          <span slot="title">Торговые паузы NYSE/NASDAQ</span>
          <span slot="description">Оповещение о торговых паузах NYSE/NASDAQ в Telegram. <a
            target="_blank"
            href="http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts">RSS-лента пауз</a>.</span>
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
          <img slot="logo" draggable="false" alt="Supabase Parser"
               style="height: 40px"
               src="static/parser.svg"/>
          <span slot="title">Парсер с персистентностью</span>
          <span slot="description">Произвольный парсер с сохранением состояния в Supabase.</span>
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
          <img slot="logo" draggable="false" alt="PPP Aspirant (в облаке)"
               style="height: 45px"
               src="static/ppp-aspirant.svg"/>
          <div slot="title">
            PPP Aspirant
            <${'ppp-badge'} appearance="blue">
              В облаке
            </ppp-badge>
          </div>
          <span slot="description">Подсистема обслуживания процессов приложения PPP.</span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.CLOUD_PPP_ASPIRANT}`
                })}"
            >
              Продолжить
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="PPP Aspirant (по адресу)"
               style="height: 45px"
               src="static/ppp-aspirant.svg"/>
          <div slot="title">
            PPP Aspirant
            <${'ppp-badge'} appearance="blue">
              По адресу
            </ppp-badge>
          </div>
          <span slot="description">Подсистема обслуживания процессов приложения PPP.</span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.DEPLOYED_PPP_ASPIRANT}`
                })}"
            >
              Продолжить
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="PPP Aspirant (systemd)"
               style="height: 45px"
               src="static/ppp-aspirant.svg"/>
          <div slot="title">
            PPP Aspirant
            <${'ppp-badge'} appearance="blue">
              systemd
            </ppp-badge>
          </div>
          <span slot="description">Подсистема обслуживания процессов приложения PPP.</span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.SYSTEMD_PPP_ASPIRANT}`
                })}"
            >
              Продолжить
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <img slot="logo" draggable="false" alt="PPP Aspirant Worker"
               style="height: 45px"
               src="static/ppp-aspirant-worker.svg"/>
          <span slot="title">PPP Aspirant Worker</span>
          <span
            slot="description">Рабочий процесс под управлением PPP Aspirant.</span>
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
      <span slot="actions"></span>
    </ppp-page>
  </template>
`;

export const serviceControlsTemplate = (context, definition) => html`
  <div class="section-content horizontal-overflow">
    <div class="service-details">
      <div class="service-details-controls">
        <div class="service-details-control service-details-label">
          ${(x) => x.document.name}
        </div>
        <div
          class="service-details-control"
          style="justify-content: left"
        >
          <${'ppp-button'}
            ?disabled="${(x) =>
              x.page.loading ||
              x.document.removed ||
              x.document.state === SERVICE_STATE.FAILED}"
            @click="${(x) => x.restartService()}">Перезапустить
          </ppp-button>
          <ppp-button
            ?disabled="${(x) =>
              x.page.loading ||
              x.document.removed ||
              x.document.state === SERVICE_STATE.FAILED ||
              x.document.state === SERVICE_STATE.STOPPED}"
            @click="${(x) => x.stopService()}">Приостановить
          </ppp-button>
          <ppp-button
            ?disabled="${(x) => x.page.loading || x.document.removed}"
            appearance="danger"
            @click="${(x) => x.cleanupService()}">Удалить
          </ppp-button>
        </div>
        <div class="service-details-control">
          <${'ppp-badge'}
            appearance="${(x) => stateAppearance(x.document.state)}">
            ${(x) => x.t(`$const.serviceState.${x.document.state}`)}
          </ppp-badge>
          <ppp-badge
            appearance="blue">
            Последняя версия
          </ppp-badge>
        </div>
      </div>
      <div class="service-details-info">
        <div class="service-details-info-container">
          <span style="grid-column-start: 1;grid-row-start: 1;">
          Версия
          </span>
          <div style="grid-column-start: 1;grid-row-start: 2;">
            <ppp-badge appearance="green">
              ${(x) => x.document.version}
            </ppp-badge>
          </div>
          <span style="grid-column-start: 2;grid-row-start: 1;">
            Тип
          </span>
          <div style="grid-column-start: 2;grid-row-start: 2;">
            ${(x) => x.t(`$const.service.${x.document.type}`)}
          </div>
          <span style="grid-column-start: 3;grid-row-start: 1;">
            Создан
          </span>
          <div style="grid-column-start: 3;grid-row-start: 2;">
            ${(x) => formatDate(x.document.createdAt)}
          </div>
          <span style="grid-column-start: 4;grid-row-start: 1;">
            Последнее изменение
          </span>
          <div style="grid-column-start: 4;grid-row-start: 2;">
            ${(x) => formatDate(x.document.updatedAt ?? x.document.createdAt)}
          </div>
          <span style="grid-column-start: 5;grid-row-start: 1;">
            Удалён
          </span>
          <div style="grid-column-start: 5;grid-row-start: 2;">
            ${(x) => (x.document.removed ? 'Да' : 'Нет')}
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// noinspection JSUnusedGlobalSymbols
export default ServicePage.compose({
  template: servicePageTemplate,
  styles: pageStyles
});
