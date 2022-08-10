import { EndpointPage } from '../../shared/endpoint-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { uuidv4 } from '../../shared/ppp-crypto.js';

const exampleCode = `exports = function({ query, headers, body}, response) {
  return "OK";
};`;

export const endpointPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Конечная точка - ${x.document.function_name}`
              : 'Конечная точка'}
        </span>
        <section>
          <div class="label-group">
            <h5>Маршрут</h5>
            <p>Должен начинаться с /</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="/webhook"
              value="${(x) => x.document.route}"
              ${ref('route')}
            ></ppp-text-field>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) =>
                (x.route.value = `/${uuidv4().replaceAll('-', '')}`)}"
              appearance="primary"
            >
              Сгенерировать значение
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>HTTP-метод</h5>
          </div>
          <div class="input-group">
            <${'ppp-select'}
              value="${(x) => x.document.method ?? 'POST'}"
              ${ref('method')}
            >
              <ppp-option value="POST">POST</ppp-option>
              <ppp-option value="GET">GET</ppp-option>
              <ppp-option value="PUT">PUT</ppp-option>
              <ppp-option value="DELETE">DELETE</ppp-option>
              <ppp-option value="PATCH">PATCH</ppp-option>
              <ppp-option value="*">Любой метод</ppp-option>
            </ppp-select>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Название функции</h5>
            <p>Название облачной функции, которая будет обрабатывать запросы к
              конечной точке.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              ?disabled="${(x) => x.document.function_name}"
              placeholder="myWebhook"
              value="${(x) => x.document.function_name}"
              ${ref('functionName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group full">
            <h5>Реализация функции</h5>
            <p>Бизнес-логика обработки запроса на языке JavaScript.</p>
            <${'ppp-codeflask'}
              :code="${(x) => x.document.source ?? exampleCode}"
              ${ref('source')}
            ></ppp-codeflask>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default EndpointPage.compose({
  template: endpointPageTemplate,
  styles: pageStyles
});
