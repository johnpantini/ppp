/** @decorator */

import { BasePage } from '../page.js';
import { validate } from '../validate.js';
import { Observable, observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';
import { Tmpl } from '../tmpl.js';

export class EndpointPage extends BasePage {
  @observable
  endpoint;

  processSource(source) {
    const match = source.match(/\*\*@ppp([\s\S]+)@ppp\*/i);

    if (match) return match[1].trim();
    else return source;
  }

  async connectedCallback() {
    super.connectedCallback();

    const endpointId = this.app.params()?.endpoint;

    if (endpointId) {
      this.beginOperation();

      try {
        const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
        const appId = this.app.ppp.keyVault.getKey('mongo-app-id');
        const token = await this.getMongoDBRealmAccessToken();

        this.endpoint = await (
          await fetch(
            new URL(
              'fetch',
              this.app.ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'no-cache',
              method: 'POST',
              body: JSON.stringify({
                method: 'GET',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${endpointId}`,
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            }
          )
        ).json();

        if (!this.endpoint || this.endpoint?.error) {
          this.failOperation(404);
          await this.notFound();
        } else {
          const source = (
            await (
              await fetch(
                new URL(
                  'fetch',
                  this.app.ppp.keyVault.getKey('service-machine-url')
                ).toString(),
                {
                  cache: 'no-cache',
                  method: 'POST',
                  body: JSON.stringify({
                    method: 'GET',
                    url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${this.endpoint.function_id}`,
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  })
                }
              )
            ).json()
          ).source;

          this.endpoint.source = this.processSource(source);

          Observable.notify(this, 'endpoint');
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async addEndpoint() {
    this.beginOperation();

    try {
      await validate(this.route);
      await validate(this.route, {
        hook: async (value) => value.startsWith('/'),
        errorMessage: 'Маршрут должен начинаться с /'
      });
      await validate(this.functionName);
      await validate(this.source);

      const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
      const appId = this.app.ppp.keyVault.getKey('mongo-app-id');
      const token = await this.getMongoDBRealmAccessToken();

      const source = `/**@ppp\n${this.source.value.trim()}\n@ppp*/\n${await new Tmpl().render(
        this,
        this.source.value.trim(),
        {}
      )}`;

      if (this.endpoint) {
        const rUpdateFunction = await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'PUT',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${this.endpoint.function_id}`,
              body: {
                name: this.endpoint.function_name,
                private: false,
                run_as_system: true,
                source
              },
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        );

        await maybeFetchError(rUpdateFunction);

        const rUpdateEndpoint = await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'PUT',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${this.endpoint._id}`,
              body: {
                _id: this.endpoint._id,
                route: this.route.value,
                function_name: this.endpoint.function_name,
                function_id: this.endpoint.function_id,
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
        );

        await maybeFetchError(rUpdateEndpoint);
      } else {
        const rNewFunction = await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
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
        );

        await maybeFetchError(rNewFunction);

        const jNewFunction = await rNewFunction.json();
        const rNewEndpoint = await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'POST',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
              body: {
                route: this.route.value,
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
        );

        await maybeFetchError(rNewEndpoint);
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
