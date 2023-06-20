import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { getMongoDBRealmAccessToken } from '../../lib/realm.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { Tmpl } from '../../lib/tmpl.js';
import '../badge.js';
import '../button.js';
import '../select.js';
import '../snippet.js';
import '../text-field.js';

const exampleCode = `exports = function({ query, headers, body}, response) {
  return "Hello from PPP!";
};`;

export const endpointPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Маршрут</h5>
          <p class="description">Должен начинаться с /</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="/webhook"
            value="${(x) => x.document.route}"
            ${ref('route')}
          ></ppp-text-field>
          <div class="spacing2"></div>
          <ppp-button
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
          <p class="description">Метод для запросов к конечной точке.</p>
        </div>
        <div class="input-group">
          <ppp-select
            value="${(x) => x.document.http_method ?? 'POST'}"
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
          <p class="description">
            Название облачной функции, которая будет обрабатывать запросы к
            конечной точке. Это значение нельзя будет изменить в дальнейшем.
          </p>
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
        <div class="label-group">
          <h5>Реализация функции</h5>
          <p class="description">
            Бизнес-логика обработки запроса на языке JavaScript.
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            style="height: 384px;"
            :code="${(x) => x.document.source ?? exampleCode}"
            ${ref('source')}
          ></ppp-snippet>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const endpointPageStyles = css`
  ${pageStyles}
`;

export async function checkNorthflankCredentials({ token, serviceMachineUrl }) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'reload',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: 'https://api.northflank.com/v1/projects',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  });
}

export class EndpointPage extends Page {
  processSource(source) {
    const match = source.match(/\*\*@ppp([\s\S]+)@ppp\*/i);

    if (match) return match[1].trim();
    else return source;
  }

  async validate() {
    await validate(this.route);
    await validate(this.route, {
      hook: async (value) => value.startsWith('/'),
      errorMessage: 'Маршрут должен начинаться с /'
    });
    await validate(this.functionName);
    await validate(this.source);
  }

  async read(documentId) {
    const groupId = ppp.keyVault.getKey('mongo-group-id');
    const appId = ppp.keyVault.getKey('mongo-app-id');
    const token = await getMongoDBRealmAccessToken();

    const endpoint = await (
      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'GET',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${documentId}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        ),
        'Не удалось загрузить конечную точку.'
      )
    ).json();

    const func = await (
      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'GET',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${endpoint.function_id}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        ),
        'Не удалось загрузить исходный код конечной точки.'
      )
    ).json();

    endpoint.source = this.processSource(func.source);

    return endpoint;
  }

  async submitDocument() {
    this.beginOperation();

    try {
      await this.validate();

      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const token = await getMongoDBRealmAccessToken();

      let source;

      try {
        source = `/**@ppp\n${this.source.value.trim()}\n@ppp*/\n${await new Tmpl().render(
          this,
          this.source.value.trim(),
          {}
        )}`;
      } catch (e) {
        console.dir(e);

        invalidate(this.source, {
          errorMessage: 'Исходный код содержит ошибки в шаблонах.',
          raiseException: true
        });
      }

      if (this.document._id) {
        await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'reload',
              method: 'POST',
              body: JSON.stringify({
                method: 'PUT',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${this.document.function_id}`,
                body: {
                  name: this.document.function_name,
                  private: false,
                  run_as_system: true,
                  source
                },
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            }
          ),
          'Не удалось обновить код функции конечной точки.'
        );

        await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'reload',
              method: 'POST',
              body: JSON.stringify({
                method: 'PUT',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${this.document._id}`,
                body: {
                  _id: this.document._id,
                  route: this.route.value,
                  function_name: this.document.function_name,
                  function_id: this.document.function_id,
                  http_method: this.method.value,
                  validation_method: 'NO_VALIDATION',
                  secret_id: '',
                  secret_name: '',
                  create_user_on_auth: false,
                  fetch_custom_user_data: false,
                  respond_result: true,
                  last_modified: Math.floor(Date.now() * 1000),
                  disabled: false
                },
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            }
          ),
          'Не удалось обновить конечную точку.'
        );
      } else {
        const rNewFunction = await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'reload',
              method: 'POST',
              body: JSON.stringify({
                method: 'POST',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions`,
                body: {
                  name: this.functionName.value.trim(),
                  private: false,
                  run_as_system: true,
                  source
                },
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            }
          ),
          'Не удалось создать функцию конечной точки.'
        );

        const jNewFunction = await rNewFunction.json();
        const rNewEndpoint = await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'reload',
              method: 'POST',
              body: JSON.stringify({
                method: 'POST',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
                body: {
                  route: this.route.value.trim(),
                  function_name: jNewFunction.name,
                  function_id: jNewFunction._id,
                  http_method: this.method.value,
                  validation_method: 'NO_VALIDATION',
                  secret_id: '',
                  secret_name: '',
                  create_user_on_auth: false,
                  fetch_custom_user_data: false,
                  respond_result: true,
                  disabled: false
                },
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            }
          ),
          'Не удалось создать конечную точку.'
        );

        // {_id, function_id, function_name, http_method, route}
        const jNewEndpoint = await rNewEndpoint.json();

        this.document = Object.assign({}, jNewEndpoint, {
          source: this.source.value.trim()
        });

        ppp.app.setURLSearchParams({
          document: this.document._id
        });
      }

      this.showSuccessNotification();
    } catch (e) {
      if (/FunctionDuplicateName/i.test(e.message)) {
        e.name = 'FunctionDuplicateName';
      } else if (/EndpointDuplicateKey/i.test(e.message)) {
        e.name = 'EndpointDuplicateKey';
      }

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async cleanup() {
    this.beginOperation();

    try {
      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const token = await getMongoDBRealmAccessToken();

      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${this.document._id}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        ),
        'Не удалось удалить функцию конечной точки.'
      );

      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'reload',
            method: 'POST',
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${this.document.function_id}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        ),
        'Не удалось удалить конечную точку.'
      );

      this.showSuccessNotification();
    } catch (e) {
      this.failOperation(e, 'Удаление конечной точки');
    } finally {
      this.endOperation();
    }
  }
}

export default EndpointPage.compose({
  template: endpointPageTemplate,
  styles: endpointPageStyles
}).define();
