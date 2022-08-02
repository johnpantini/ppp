import { PageWithDocuments, PageWithShiftLock } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';

export class EndpointsPage extends PageWithShiftLock {
  async populate() {
    const groupId = ppp.keyVault.getKey('mongo-group-id');
    const appId = ppp.keyVault.getKey('mongo-app-id');

    return await (
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
              url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/endpoints`,
              headers: {
                Authorization: `Bearer ${await ppp.getMongoDBRealmAccessToken()}`
              }
            })
          }
        ), 'Не удалось получить список конечных точек HTTPS.'
      )
    ).json();
  }
}

applyMixins(EndpointsPage, PageWithDocuments);
