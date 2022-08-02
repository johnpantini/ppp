import { EndpointPage } from '../../../shared/pages/endpoint.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { uuidv4 } from '../../../shared/ppp-crypto.js';
import { caretDown } from '../icons/caret-down.js';

const exampleCode = `exports = function({ query, headers, body}, response) {
  return "OK";
};`;

export const endpointPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.endpoint
          ? `Конечная точка HTTPS - ${x.endpoint?.function_name}`
          : 'Конечная точка HTTPS'}
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="label-group">
            <h5>Маршрут</h5>
            <p>Должен начинаться с /</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="/webhook"
              value="${(x) => x.endpoint?.route}"
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
              value="${(x) => x.endpoint?.method}"
              ${ref('method')}
            >
              <ppp-option value="POST">POST</ppp-option>
              <ppp-option value="GET">GET</ppp-option>
              <ppp-option value="PUT">PUT</ppp-option>
              <ppp-option value="DELETE">DELETE</ppp-option>
              <ppp-option value="PATCH">PATCH</ppp-option>
              <ppp-option value="*">Любой метод</ppp-option>
              ${caretDown({
                slot: 'indicator'
              })}
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
              ?disabled="${(x) => x.endpoint?.function_name}"
              placeholder="myWebhook"
              value="${(x) => x.endpoint?.function_name}"
              ${ref('functionName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group full">
            <h5>Функция</h5>
            <p>Бизнес-логика обработки запроса на языке JavaScript.</p>
            <${'ppp-codeflask'}
              :code="${(x) => x.endpoint?.source ?? exampleCode}"
              ${ref('source')}
            ></ppp-codeflask>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy}"
            type="submit"
            @click="${(x) => x.addEndpoint()}"
            appearance="primary"
          >
            ${(x) =>
              x.endpoint
                ? 'Обновить конечную точну'
                : 'Добавить конечную точку'}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const endpointPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    section ppp-codeflask {
      width: 100%;
      height: 256px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const endpointPage = EndpointPage.compose({
  baseName: 'endpoint-page',
  template: endpointPageTemplate,
  styles: endpointPageStyles
});
