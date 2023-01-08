import { BrokerTinkoffInvestApiPage } from '../../shared/broker-tinkoff-invest-api-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const brokerTinkoffInvestApiPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Брокер - Tinkoff Invest API - ${x.document.name}`
              : 'Брокер - Tinkoff Invest API'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Tinkoff"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен для доступа к API</h5>
            <p>
              Требуется для подписи всех запросов. Получить можно по
              <a rel="noopener" target="_blank"
                 href="https://www.tinkoff.ru/invest/settings/api/"
              >ссылке</a>.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Введите токен"
              value="${(x) => x.document.apiToken}"
              ${ref('apiToken')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default BrokerTinkoffInvestApiPage.compose({
  template: brokerTinkoffInvestApiPageTemplate,
  styles: pageStyles
});
