import { LiquidEquitiesPage } from '[%#payload.baseExtensionUrl%]/shared/pages/liquid-equities.js';
import {
  html,
  requireComponent
} from '[%#ctx.ppp.rootUrl%]/shared/template.js';
import { css } from '[%#ctx.ppp.rootUrl%]/shared/element/styles/css.js';
import { search } from '[%#ctx.ppp.rootUrl%]/desktop/leafygreen/icons/search.js';
import { when } from '[%#ctx.ppp.rootUrl%]/shared/element/templating/when.js';
import { ref } from '[%#ctx.ppp.rootUrl%]/shared/element/templating/ref.js';
import {
  pageStyles,
  loadingIndicator
} from '[%#ctx.ppp.rootUrl%]/desktop/leafygreen/page.js';
import ppp from '[%#ctx.ppp.rootUrl%]/ppp.js';

(
  await import(
    `[%#payload.baseExtensionUrl%]/i18n/${ppp.locale}/liquid-equities.i18n.js`
  )
).default(ppp.dict);

await Promise.all([
  requireComponent(
    'ppp-tabs',
    `[%#ctx.ppp.rootUrl%]/${ppp.appType}/${ppp.theme}/tabs.js`
  ),
  requireComponent(
    'ppp-tab',
    `[%#ctx.ppp.rootUrl%]/${ppp.appType}/${ppp.theme}/tabs.js`
  ),
  requireComponent(
    'ppp-tab-panel',
    `[%#ctx.ppp.rootUrl%]/${ppp.appType}/${ppp.theme}/tabs.js`
  ),
  requireComponent(
    'ppp-badge',
    `[%#ctx.ppp.rootUrl%]/${ppp.appType}/${ppp.theme}/badge.js`
  )
]);

export const liquidEquitiesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Маржинальные инструменты со ставками риска
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <ppp-tabs activeid="alor-ksur" ${ref('tabs')}
                @change="${(x, c) => x.handleTabChange(c)}">
        <ppp-tab id="alor-ksur">Алор КСУР</ppp-tab>
        <ppp-tab id="alor-kpur">Алор КПУР</ppp-tab>
        <ppp-tab id="alor-ksur-turbo">Алор КСУР с Турбо</ppp-tab>
        <ppp-tab id="alor-kpur-turbo">Алор КПУР с Турбо</ppp-tab>
        <ppp-tab id="tinkoff">Тинькофф</ppp-tab>
        <ppp-tab-panel id="alor-ksur-panel"></ppp-tab-panel>
        <ppp-tab-panel id="alor-kpur-panel"></ppp-tab-panel>
        <ppp-tab-panel id="alor-ksur-turbo-panel"></ppp-tab-panel>
        <ppp-tab-panel id="alor-kpur-turbo-panel"></ppp-tab-panel>
        <ppp-tab-panel id="tinkoff-panel"></ppp-tab-panel>
      </ppp-tabs>
      <${'ppp-text-field'}
        class="search-input"
        type="search"
        placeholder="Поиск"
        @input="${(x, c) => (x.searchText = c.event.target.value)}"
      >
        ${search({
          slot: 'end'
        })}
      </ppp-text-field>
      <${'ppp-table'}
        sticky
        :columns="${() => [
          {
            label: 'Тикер'
          },
          {
            label: 'Название'
          },
          {
            label: 'Тип'
          },
          {
            label: 'ISIN'
          },
          {
            label: 'Валюта'
          },
          {
            label: 'Доступно в short'
          },
          {
            label: 'Ставка риска long, %'
          },
          {
            label: 'Ставка риска short, %'
          },
          {
            label: 'Плечо в long, %'
          },
          {
            label: 'Плечо в short, %'
          }
        ]}"
        :rows="${(x) =>
          (x.instruments || [])
            .filter((datum) => {
              if (!x.searchText) return true;

              return new RegExp(x.searchText, 'ig').test(
                [datum.ticker, datum.name, datum.isin].join(' ')
              );
            })
            .map((datum) => {
              return {
                datum,
                cells: [
                  datum.ticker,
                  datum.name,
                  x.t(`$extensions.liquidEquities.type.${datum.type}`),
                  datum.isin ?? '-',
                  datum.currency ?? '-',
                  html` <ppp-badge
                    appearance="${datum.isShortPossible ? 'green' : 'red'}"
                  >
                    ${datum.isShortPossible ? 'Да' : 'Нет'}
                  </ppp-badge>`,
                  datum.rateLong === 0 ? '-' : datum.rateLong.toFixed(2),
                  datum.rateShort === 0 ? '-' : datum.rateShort.toFixed(2),
                  datum.rateLong === 0
                    ? '-'
                    : `x${(100 / datum.rateLong).toFixed(2)}`,
                  datum.rateShort === 0
                    ? '-'
                    : `x${(100 / datum.rateShort).toFixed(2)}`
                ]
              };
            })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const liquidEquitiesPageStyles = (context, definition) => css`
  ${pageStyles}
  .search-input {
    display: flex;
    margin: 5px 0 10px 0;
    width: 300px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default LiquidEquitiesPage.compose({
  baseName: 'liquid-equities-[%#payload.extension._id%]-page',
  template: liquidEquitiesPageTemplate,
  styles: liquidEquitiesPageStyles
});
