import { PageWithTable } from '../page.js';
import { Observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';

export class EndpointsPage extends PageWithTable {
  columns = [
    {
      label: 'Маршрут'
    },
    {
      label: 'Конечная точка MongoDB Realm',
      sortBy: (d) => d.route
    },
    {
      label: 'Функция MongoDB Realm',
      sortBy: (d) => d.function_name
    },
    {
      label: 'Последнее изменение',
      sortBy: (d) => d.last_modified
    },
    {
      label: 'Действия'
    }
  ];

  async data() {
    const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
    const appId = this.app.ppp.keyVault.getKey('mongo-app-id');

    return await (
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
            url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
            headers: {
              Authorization: `Bearer ${await this.getMongoDBRealmAccessToken()}`
            }
          })
        }
      )
    ).json();
  }

  async removeEndpoint(endpointId, functionId) {
    this.beginOperation('Удаление конечной точки HTTPS');

    try {
      const groupId = this.app.ppp.keyVault.getKey('mongo-group-id');
      const appId = this.app.ppp.keyVault.getKey('mongo-app-id');
      const token = await this.getMongoDBRealmAccessToken();

      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints/${endpointId}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        )
      );

      await maybeFetchError(
        await fetch(
          new URL(
            'fetch',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'DELETE',
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/functions/${functionId}`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        )
      );

      this.table.rows.splice(
        this.table.rows.findIndex((r) => r.datum._id === endpointId),
        1
      );

      Observable.notify(this.table, 'rows');

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
