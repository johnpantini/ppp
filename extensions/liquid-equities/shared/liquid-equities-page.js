/** @decorator */

const [{ Page }, { observable }] = await Promise.all([
  import(`${globalThis.ppp.rootUrl}/shared/page.js`),
  import(`${globalThis.ppp.rootUrl}/shared/element/observation/observable.js`)
]);

export class LiquidEquitiesPage extends Page {
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
          'alor-ksur-turbo': 4,
          'alor-kpur-turbo': 5,
          'alor-ksur-spbex-no-overnight': 6,
          'alor-kpur-spbex-no-overnight': 7
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
            { cache: 'no-cache' }
          )
        ).json();

        const { payload } = await (
          await fetch(
            `https://www.tinkoff.ru/api/trading/symbols/risk_parameters?sessionId=${sessionId}&appName=web&origin=web`,
            { cache: 'no-cache' }
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
