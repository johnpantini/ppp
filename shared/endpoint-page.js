import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { maybeFetchError } from './fetch-error.js';
import { Tmpl } from './tmpl.js';
import ppp from '../ppp.js';

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
    const token = await ppp.getMongoDBRealmAccessToken();

    const endpoint = await (
      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
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
            cache: 'no-cache',
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

  async save() {
    this.beginOperation();

    try {
      await this.page.view.validate();

      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const token = await ppp.getMongoDBRealmAccessToken();

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
              cache: 'no-cache',
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
              cache: 'no-cache',
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
              cache: 'no-cache',
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
              cache: 'no-cache',
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

      this.succeedOperation();
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

  async remove() {
    this.beginOperation('Удаление конечной точки');

    try {
      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const token = await ppp.getMongoDBRealmAccessToken();

      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
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
            cache: 'no-cache',
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

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
