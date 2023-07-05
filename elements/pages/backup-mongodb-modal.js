/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref, attr } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { maybeFetchError, validate } from '../../lib/ppp-errors.js';
import {
  enableMongoDBRealmHosting,
  getMongoDBRealmAccessToken
} from '../../lib/realm.js';
import '../../vendor/zip-full.min.js';
import '../../vendor/spark-md5.min.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';

export const backupMongodbModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>Прокси MongoDB Realm</h5>
          <p class="description">
            Сервис Cloudflare Worker, который будет использован для загрузки
            файлов на хостинг MongoDB Realm.
          </p>
          <ppp-checkbox
            style="margin-top:6px;"
            checked
            ${ref('downloadBackupFile')}
          >
            Также скачать архив с копией на диск
          </ppp-checkbox>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('mongodbRealmProxyServiceId')}
            :context="${(x) => x}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('services')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
                      },
                      { workerPredefinedTemplate: 'mongoDBRealm' },
                      { removed: { $ne: true } }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить резервную копию
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const backupMongodbModalPageStyles = css`
  ${pageStyles}
  section:first-of-type {
    padding-top: 10px;
  }

  .label-group ppp-select,
  .label-group ppp-text-field {
    max-width: unset;
  }
`;

export class BackupMongodbModalPage extends Page {
  @attr({ mode: 'boolean' })
  cloud;

  zipWriter;

  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.mongodbRealmProxyServiceId);

      const collections = [
        'apis',
        'app',
        'bots',
        'brokers',
        'chats',
        'extensions',
        'instruments',
        'psina',
        'servers',
        'services',
        'traders',
        'widgets',
        'workspaces'
      ];

      const zip = globalThis.zip;

      this.zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

      for (const collection of collections) {
        const documents = await ppp.user.functions.find({ collection }, {});

        await this.zipWriter.add(
          `${collection}.json`,
          new zip.TextReader(
            JSON.stringify(
              documents.filter((d) => {
                return !(collection === 'app' && d?._id === 'settings');
              })
            )
          )
        );
      }

      const zipBlob = await this.zipWriter.close();
      const now = Date.now();
      const groupId = ppp.keyVault.getKey('mongo-group-id');
      const appId = ppp.keyVault.getKey('mongo-app-id');
      const mongoDBRealmAccessToken = await getMongoDBRealmAccessToken();
      const serviceMachineUrl = ppp.keyVault.getKey('service-machine-url');

      await enableMongoDBRealmHosting({
        groupId,
        appId,
        serviceMachineUrl,
        mongoDBRealmAccessToken
      });

      const fd = new FormData();
      const reader = new FileReader();

      reader.readAsArrayBuffer(zipBlob);

      const hash = await new Promise((resolve) => {
        reader.onloadend = async function () {
          resolve(SparkMD5.ArrayBuffer.hash(reader.result));
        };
      });

      const backupRelativeUrl = `/backups/backup-of-${
        this.cloud ? 'cloud' : 'alternative'
      }-mongodb-${now}.zip`;

      fd.set(
        'meta',
        JSON.stringify({
          path: backupRelativeUrl,
          size: zipBlob.size,
          attrs: [
            {
              name: 'Cache-Control',
              value: 'no-cache'
            },
            {
              name: 'Content-Disposition',
              value: 'attachment'
            }
          ],
          hash
        })
      );
      fd.set('file', zipBlob);

      const proxyDatum = this.mongodbRealmProxyServiceId.datum();

      await maybeFetchError(
        await fetch(
          `https://ppp-${proxyDatum._id}.${proxyDatum.subdomain}.workers.dev/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/assets/asset`,
          {
            cache: 'reload',
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: fd
          }
        ),
        'Не удалось загрузить резервную копию в облачное хранилище MongoDB Realm.'
      );

      if (this.downloadBackupFile.checked) {
        const link = document.createElement('a');

        link.download = `backup-of-${
          this.cloud ? 'cloud' : 'alternative'
        }-mongodb-${now}.zip`;
        link.href = window.URL.createObjectURL(zipBlob);
        link.dataset.downloadurl = [
          'application/zip',
          link.download,
          link.href
        ].join(':');

        link.dispatchEvent(
          new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          })
        );
        link.remove();
      }

      await maybeFetchError(
        await fetch(
          `https://ppp-${proxyDatum._id}.${proxyDatum.subdomain}.workers.dev/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/cache`,
          {
            cache: 'reload',
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${mongoDBRealmAccessToken}`
            },
            body: JSON.stringify({ invalidate: true, path: '/*' })
          }
        ),
        'Не удалось сбросить кэш облачного хранилища MongoDB Realm.'
      );

      ppp.app.mountPointModal.setAttribute('hidden', '');

      this.showSuccessNotification(
        this.cloud
          ? 'Копия облачной базы данных успешно сохранена.'
          : 'Копия альтернативной базы данных успешно сохранена.'
      );
    } catch (e) {
      this.failOperation(e, 'Создание резервной копии');
    } finally {
      this.endOperation();
    }
  }
}

export default BackupMongodbModalPage.compose({
  template: backupMongodbModalPageTemplate,
  styles: backupMongodbModalPageStyles
}).define();
