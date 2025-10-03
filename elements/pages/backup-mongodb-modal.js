/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { HMAC, uuidv4, sha256 } from '../../lib/ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from '../../lib/yc.js';
import * as jose from '../../vendor/jose.min.js';
import '../../vendor/zip-full.min.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';

export const backupMongodbModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>API S3</h5>
          <p class="description">
            API, который будет использован для выгрузки резервной копии в
            облачное хранилище.
          </p>  
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('s3ApiID')}
            :context="${(x) => x}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.YC%]`
                      },
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
          appearance="secondary"
          @click="${(x) => x.saveToDisk()}"
        >
          Сохранить копию на диск
        </ppp-button>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить копию в S3
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
  zipWriter;

  async saveBackup(saveToDisk = false) {
    this.beginOperation();

    try {
      if (!saveToDisk) {
        await validate(this.s3ApiID);
      }

      const collections = [
        'apis',
        'app',
        'bots',
        'brokers',
        'chats',
        'extensions',
        'instruments',
        'orders',
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

      if (!saveToDisk) {
        const {
          ycServiceAccountID,
          ycPublicKeyID,
          ycPrivateKey,
          ycStaticKeyID,
          ycStaticKeySecret
        } = this.s3ApiID.datum();
        const { psinaFolderId, iamToken } = await getYCPsinaFolder({
          jose,
          ycServiceAccountID,
          ycPublicKeyID,
          ycPrivateKey
        });

        const rBucketList = await maybeFetchError(
          await ppp.fetch(
            `https://storage.api.cloud.yandex.net/storage/v1/buckets?folderId=${psinaFolderId}`,
            {
              headers: {
                Authorization: `Bearer ${iamToken}`
              }
            }
          ),
          'Не удалось получить список бакетов. Проверьте права доступа.'
        );

        const bucketList = await rBucketList.json();
        let backupsBucket = bucketList?.buckets?.find((b) =>
          /^ppp-backups-/.test(b.name)
        );

        if (!backupsBucket) {
          const rNewBucket = await maybeFetchError(
            await ppp.fetch(
              'https://storage.api.cloud.yandex.net/storage/v1/buckets',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${iamToken}`
                },
                body: JSON.stringify({
                  name: `ppp-backups-${uuidv4()}`,
                  folderId: psinaFolderId,
                  defaultStorageClass: 'STANDARD',
                  // 1 GB
                  maxSize: 1024 ** 3,
                  anonymousAccessFlags: {
                    read: true,
                    list: false,
                    configRead: false
                  }
                })
              }
            ),
            'Не удалось создать бакет для резервных копий.'
          );

          backupsBucket = (await rNewBucket.json()).response;
        }

        const key = `backup-of-mongodb-${now}.zip`;
        const host = `${backupsBucket.name}.storage.yandexcloud.net`;
        const xAmzDate =
          new Date()
            .toISOString()
            .replaceAll('-', '')
            .replaceAll(':', '')
            .split('.')[0] + 'Z';
        const date = xAmzDate.split('T')[0];
        const signingKey = await generateYCAWSSigningKey({
          ycStaticKeySecret,
          date
        });
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256',
          await zipBlob.arrayBuffer()
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPayload = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const canonicalRequest = `PUT\n/${encodeURIComponent(
          key
        )}\n\nhost:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-content-sha256;x-amz-date\n${hashedPayload}`;
        const scope = `${date}/ru-central1/s3/aws4_request`;
        const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
          canonicalRequest
        )}`;
        const signature = await HMAC(signingKey, stringToSign, {
          format: 'hex'
        });
        const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;

        await maybeFetchError(
          await ppp.fetch(`https://${host}/${key}`, {
            method: 'PUT',
            headers: {
              Authorization,
              'x-amz-date': xAmzDate,
              'x-amz-content-sha256': hashedPayload
            },
            body: zipBlob
          }),
          'Не удалось загрузить резервную копию в облачное хранилище.'
        );
      }

      if (saveToDisk) {
        const link = document.createElement('a');
        const data = window.URL.createObjectURL(zipBlob);

        link.download = `backup-of-mongodb-${now}.zip`;
        link.href = data;
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

      ppp.app.mountPointModal.setAttribute('hidden', '');

      this.showSuccessNotification('Копия базы данных успешно сохранена.');
    } catch (e) {
      this.failOperation(e, 'Создание резервной копии');
    } finally {
      this.endOperation();
    }
  }

  async saveToDisk() {
    await this.saveBackup(true);
  }

  async submitDocument() {
    return this.saveBackup(false);
  }
}

export default BackupMongodbModalPage.compose({
  template: backupMongodbModalPageTemplate,
  styles: backupMongodbModalPageStyles
}).define();
