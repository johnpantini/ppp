/** @decorator */

export async function extension({ ppp, baseExtensionUrl, extension }) {
  const [{ observable, css, html, ref }, { search }, { Page, pageStyles }] =
    await Promise.all([
      import(`${ppp.rootUrl}/vendor/fast-element.min.js`),
      import(`${ppp.rootUrl}/static/svg/sprite.js`),
      import(`${ppp.rootUrl}/elements/page.js`),
      import(`${ppp.rootUrl}/elements/badge.js`),
      import(`${ppp.rootUrl}/elements/table.js`),
      import(`${ppp.rootUrl}/elements/tabs.js`),
      import(`${ppp.rootUrl}/elements/text-field.js`)
    ]);

  (
    await import(
      `${baseExtensionUrl}/i18n/${ppp.locale}/elements/pages/liquid-equities.i18n.js`
    )
  ).default(ppp.dict);

  const liquidEquitiesPageTemplate = html`
    <template class="${(x) => x.generateClasses()}">
      <ppp-loader></ppp-loader>
      <form novalidate>
        <ppp-page-header>
          Маржинальные инструменты со ставками риска
        </ppp-page-header>
        <ppp-tabs
          activeid="alor-ksur"
          ${ref('tabs')}
          @change="${(x, c) => x.handleTabChange(c)}"
        >
          <ppp-tab id="alor-ksur">Алор КСУР</ppp-tab>
          <ppp-tab id="alor-kpur">Алор КПУР</ppp-tab>
          <ppp-tab id="alor-ksur-edp">Алор КСУР с ЕДП</ppp-tab>
          <ppp-tab id="alor-kpur-edp">Алор КПУР с ЕДП</ppp-tab>
          <ppp-tab id="alor-knur">Алор КНУР</ppp-tab>
          <ppp-tab id="alor-knur-edp">Алор КНУР с ЕДП</ppp-tab>
          <ppp-tab id="tinkoff">Тинькофф</ppp-tab>
          <ppp-tab-panel id="alor-ksur-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-kpur-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-ksur-edp-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-kpur-edp-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-knur-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-knur-edp-panel"></ppp-tab-panel>
          <ppp-tab-panel id="tinkoff-panel"></ppp-tab-panel>
        </ppp-tabs>
        <ppp-text-field
          class="global-search-input"
          type="search"
          placeholder="Поиск"
          @input="${(x, c) => (x.searchText = c.event.target.value)}"
        >
          <span class="icon" slot="end">${html.partial(search)}</span>
        </ppp-text-field>
        <ppp-table
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
              label: 'Плечо в long'
            },
            {
              label: 'Плечо в short'
            }
          ]}"
          :rows="${(x) =>
            x.instruments
              ?.filter((datum) => {
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
                    ppp.t(
                      `$extensions.liquidEquities.type.${datum.type.toLowerCase()}`
                    ),
                    datum.isin ?? '-',
                    datum.currency ?? '-',
                    html`
                      <ppp-badge
                        appearance="${datum.isShortPossible ? 'green' : 'red'}"
                      >
                        ${datum.isShortPossible ? 'Да' : 'Нет'}
                      </ppp-badge>
                    `,
                    datum.rateLong === 0 ||
                    typeof datum.rateLong === 'undefined'
                      ? '-'
                      : datum.rateLong.toFixed(2),
                    datum.rateShort === 0 ||
                    typeof datum.rateShort === 'undefined'
                      ? '-'
                      : datum.rateShort.toFixed(2),
                    datum.rateLong === 0 ||
                    typeof datum.rateLong === 'undefined'
                      ? '-'
                      : `x${(100 / datum.rateLong).toFixed(2)}`,
                    datum.rateShort === 0 ||
                    typeof datum.rateShort === 'undefined'
                      ? '-'
                      : `x${(100 / datum.rateShort).toFixed(2)}`
                  ]
                };
              })}"
        >
        </ppp-table>
      </form>
    </template>
  `;

  const liquidEquitiesPageStyles = css`
    ${pageStyles}
  `;

  class LiquidEquitiesPage extends Page {
    @observable
    instruments;

    @observable
    searchText;

    constructor() {
      super();

      this.instruments = [];
    }

    async connectedCallback() {
      super.connectedCallback();

      await this.fetchInstruments('alor-ksur');
    }

    async handleTabChange({ event }) {
      await this.fetchInstruments(event.detail.id);
    }

    async fetchInstruments(id) {
      this.beginOperation('Загрузка инструментов');

      this.tabs.disabled = true;

      try {
        let json;

        this.instruments = [];

        if (id.startsWith('alor')) {
          const categoryId = {
            'alor-ksur': 1,
            'alor-kpur': 2,
            'alor-ksur-edp': 700,
            'alor-kpur-edp': 701,
            'alor-knur': 8,
            'alor-knur-edp': 702
          }[id];

          json = await (
            await fetch(
              `https://www.alorbroker.ru/cmsapi/v1/site/riskrates?categoryId=${categoryId}`,
              { cache: 'no-cache' }
            )
          ).json();

          this.instruments = json.list.map((i) => {
            return {
              ticker: i.instrument,
              name: i.humanReadableName,
              type: i.assetType,
              isin: i.isin,
              currency: i.currencyCode,
              isShortPossible: i.isShortSellPossible,
              rateLong: i.rateDown,
              rateShort: i.rateUp
            };
          });
        } else {
          const { payload: sessionId } = await (
            await fetch(
              'https://www.tinkoff.ru/api/common/v1/session?appName=invest&origin=web%2Cib5%2Cplatform',
              { cache: 'reload' }
            )
          ).json();

          const { payload } = await (
            await fetch(
              `https://www.tinkoff.ru/api/trading/symbols/risk_parameters?sessionId=${sessionId}&appName=web&origin=web`,
              { cache: 'reload' }
            )
          ).json();

          this.instruments = payload.symbols.map((s) => {
            return {
              ticker: s.ticker,
              name: s.showName,
              type: s.symbolType.toLowerCase(),
              isin: s.isin,
              isShortPossible: s.availableForShort,
              rateLong: s.dLong,
              rateShort: s.dShort
            };
          });
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.tabs.disabled = false;

        this.endOperation();
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  // export default
  return LiquidEquitiesPage.compose({
    name: `ppp-liquid-equities-${extension._id}-page`,
    template: liquidEquitiesPageTemplate,
    styles: liquidEquitiesPageStyles
  }).define();
}
