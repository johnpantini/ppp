import { BrokerBinancePage } from '../../shared/broker-binance-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const brokerBinancePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Брокер - Binance - ${x.document.name}`
              : 'Брокер - Binance'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Binance"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ API Binance</h5>
            <p>Получить можно по
              <a rel="noopener" target="_blank"
                 href="https://www.binance.com/ru/my/settings/api-management"
              >ссылке</a>.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Ключ API"
              value="${(x) => x.document.apiKey}"
              ${ref('apiKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Секретный ключ API Binance</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Секрет API"
              value="${(x) => x.document.secret}"
              ${ref('secret')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default BrokerBinancePage.compose({
  template: brokerBinancePageTemplate,
  styles: pageStyles
});
