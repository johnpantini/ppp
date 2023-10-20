/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref, attr } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { HMAC, uuidv4, sha256 } from '../../lib/ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from './api-yc.js';
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
          <h5>API Yandex Cloud</h5>
          <p class="description">
            API, который будет использован для выгрузки резервной копии в
            облачное хранилище.
          </p>
          <div class="spacing2"></div>
          <ppp-checkbox checked ${ref('downloadBackupFile')}>
            Также скачать архив с копией на диск
          </ppp-checkbox>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('ycApiId')}
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
      await validate(this.ycApiId);

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
      const {
        ycServiceAccountID,
        ycPublicKeyID,
        ycPrivateKey,
        ycStaticKeyID,
        ycStaticKeySecret
      } = this.ycApiId.datum();
      const { psinaFolderId, iamToken } = await getYCPsinaFolder({
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
        // Create new bucket.
        const rNewBucket = await maybeFetchError(
          await ppp.fetch(
            `https://storage.api.cloud.yandex.net/storage/v1/buckets`,
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

      const now = Date.now();
      let key = `backup-of-${
        this.cloud ? 'cloud' : 'alternative'
      }-mongodb-${now}.zip`;
      const reader = new FileReader();

      reader.readAsArrayBuffer(zipBlob);

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
      const signature = await HMAC(signingKey, stringToSign, { format: 'hex' });
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
