import {
  Page,
  PageWithActionPage,
  PageWithDocuments,
  PageWithShiftLock
} from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { maybeFetchError } from './fetch-error.js';
import { Observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class EndpointsPage extends Page {
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
        ),
        'Не удалось получить список конечных точек.'
      )
    ).json();
  }

  async removeEndpoint(datum) {
    await this.actionPageCall({
      page: 'endpoint',
      documentId: datum._id,
      methodName: 'remove'
    });

    const index = this.documents.findIndex((d) => d._id === datum._id);

    if (index > -1) {
      this.documents.splice(index, 1);
    }

    Observable.notify(this, 'documents');
  }
}

applyMixins(
  EndpointsPage,
  PageWithDocuments,
  PageWithShiftLock,
  PageWithActionPage
);
