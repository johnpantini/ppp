/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  attr,
  Observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { maybeFetchError } from '../../lib/ppp-errors.js';
import { HMAC, sha256 } from '../../lib/ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from '../../lib/yc.js';
import { formatDateWithOptions, formatFileSize } from '../../lib/intl.js';
import * as jose from '../../vendor/jose.min.js';
import '../../vendor/zip-full.min.js';
import '../banner.js';
import '../button.js';
import '../query-select.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const restoreMongodbModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <input
        @change="${(x, c) => x.handleFileSelection(c)}"
        type="file"
        style="display: none;"
        ${ref('fileInput')}
      />
      <ppp-banner class="inline" appearance="warning">
        ${() => ppp.t('$restoreMongodbModalPage.restoreFromZipPrefix')}
        <a
          class="link"
          style="font-weight: 700"
          @click="${(x) => x.fileInput.click()}"
          href="javascript:void(0)"
          >${() => ppp.t('$restoreMongodbModalPage.hereLink')}</a
        >.
      </ppp-banner>
      <div class="spacing2"></div>
      <ppp-query-select
        style="max-width: 384px"
        placeholder="${() =>
          ppp.t('$restoreMongodbModalPage.selectS3ApiPlaceholder')}"
        ${ref('s3ApiID')}
        :context="${(x) => x}"
        @change="${(x) => {
          x.s3ApiID.disabled = true;

          return x.populateDocuments();
        }}"
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
      <div class="spacing2"></div>
      <ppp-table
        ?hidden="${(x) => !x.s3ApiID.value}"
        :columns="${() => [
          {
            label: ppp.t('$restoreMongodbModalPage.databaseColumn')
          },
          {
            label: ppp.t('$restoreMongodbModalPage.createdAtColumn')
          },
          {
            label: ppp.t('$restoreMongodbModalPage.sizeColumn')
          },
          {
            label: ppp.t('$restoreMongodbModalPage.actionsColumn')
          }
        ]}"
        :rows="${(x) =>
          x.documents
            ?.sort(
              (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
            )
            ?.map((datum) => {
              return {
                datum,
                cells: [
                  html`
                    <a
                      class="link"
                      href="${datum.url}"
                      target="_blank"
                      rel="noopener"
                      >${() => ppp.t('$restoreMongodbModalPage.link')}</a>
                  `,
                  formatDateWithOptions(datum.lastModified, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: false
                  }),
                  formatFileSize(datum.size),
                  html`
                    <div class="control-line">
                      <ppp-button
                        appearance="primary"
                        class="xsmall"
                        @click="${() => x.restoreFromBackup(datum)}"
                      >
                        ${() => ppp.t('$restoreMongodbModalPage.restore')}
                      </ppp-button>
                      <ppp-button
                        appearance="danger"
                        class="xsmall"
                        @click="${() => x.deleteBackup(datum)}"
                      >
                        ${() => ppp.t('$g.delete')}
                      </ppp-button>
                    </div>
                  `
                ]
              };
            })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const restoreMongodbModalPageStyles = css`
  ${pageStyles}
  form[novalidate] {
    padding: 0 25px 25px 25px;
  }
`;

export class RestoreMongodbModalPage extends Page {
  @attr({ mode: 'boolean' })
  cloud;

  handleFileSelection({ event }) {
    return this.#restore(event.target.files[0]);
  }

  async #restore(blobOrUrl) {
    this.beginOperation();

    try {
      const zip = globalThis.zip;
      let fileReader;

      if (typeof blobOrUrl === 'string') {
        const lines = ((context) => {
          if (typeof context.http === 'undefined') {
            return fetch('$fileUrl')
              .then((response) => response.arrayBuffer())
              .then((arrayBuffer) => [
                {
                  contents: Buffer.from(arrayBuffer).toString('base64')
                }
              ])
              .catch(() => Promise.resolve(null));
          } else {
            return context.http
              .get({
                url: '$fileUrl',
                followRedirects: true
              })
              .then((response) => response.body.toBase64())
              .then((base64) =>
                Promise.resolve([
                  {
                    contents: base64
                  }
                ])
              )
              .catch(() => Promise.resolve(null));
          }
        })
          .toString()
          .split(/\r?\n/);

        lines.pop();
        lines.shift();

        const evalRequest = await ppp.user.functions.eval(
          lines.join('\n').replaceAll('$fileUrl', blobOrUrl)
        );

        fileReader = new zip.Data64URIReader(
          'data:application/zip;base64,' + evalRequest?.[0]?.contents
        );
      } else {
        fileReader = new zip.BlobReader(blobOrUrl);
      }

      const zipReader = new zip.ZipReader(fileReader);

      try {
        const entries = await zipReader.getEntries();
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

        for (const entry of entries) {
          const collection = entry.filename.split('.json')[0];

          if (collections.includes(collection)) {
            const parsed = JSON.parse(
              await entry.getData(new zip.TextWriter()),
              (key, value) => {
                // Restore native dates.
                if (
                  key.endsWith('At') &&
                  typeof value === 'string' &&
                  value.endsWith('Z')
                ) {
                  return new Date(value);
                }

                return value;
              }
            ).filter((d) => {
              return !(collection === 'app' && d?._id === 'settings');
            });

            if (Array.isArray(parsed) && parsed.length) {
              await ppp.user.functions.deleteMany({ collection }, {});

              if (parsed.length > 2000) {
                // Fix execution timeout errors.
                const chunks = [];

                for (let i = 0; i < parsed.length; i += 2000) {
                  chunks.push(parsed.slice(i, i + 2000));
                }

                for (const chunk of chunks) {
                  await ppp.user.functions.insertMany({ collection }, chunk, {
                    ordered: true
                  });
                }
              } else {
                await ppp.user.functions.insertMany({ collection }, parsed, {
                  ordered: true
                });
              }
            }
          }
        }
      } finally {
        if (zipReader) {
          await zipReader.close();
        }
      }

      this.showSuccessNotification(
        ppp.t('$restoreMongodbModalPage.restoreSucceeded')
      );
    } catch (e) {
      this.failOperation(
        e,
        ppp.t('$restoreMongodbModalPage.restoreFromBackupTitle')
      );
    } finally {
      this.endOperation();
    }
  }

  async restoreFromBackup(datum) {
    if (
      await ppp.app.confirm(
        ppp.t('$restoreMongodbModalPage.restoreFromBackupTitle'),
        ppp.t('$restoreMongodbModalPage.confirmRestoreFromBackup', {
          date: formatDateWithOptions(datum.lastModified, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
          })
        })
      )
    ) {
      return this.#restore(datum.url);
    }
  }

  async deleteBackup(datum) {
    if (
      await ppp.app.confirm(
        ppp.t('$restoreMongodbModalPage.backupRemovalTitle'),
        ppp.t('$restoreMongodbModalPage.confirmBackupRemoval', {
          date: formatDateWithOptions(datum.lastModified, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
          })
        })
      )
    ) {
      this.beginOperation();

      try {
        const { ycStaticKeyID, ycStaticKeySecret } = this.s3ApiID.datum();
        const { host, key } = datum;
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
        const canonicalRequest = `DELETE\n/${key}\n\nhost:${host}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
        const scope = `${date}/ru-central1/s3/aws4_request`;
        const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
          canonicalRequest
        )}`;
        const signature = await HMAC(signingKey, stringToSign, {
          format: 'hex'
        });
        const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`;

        await maybeFetchError(
          await ppp.fetch(`https://${host}/${key}`, {
            method: 'DELETE',
            headers: {
              Authorization,
              'X-Amz-Date': xAmzDate
            }
          }),
          ppp.t('$restoreMongodbModalPage.cannotDeleteBackup')
        );

        const index = this.documents.findIndex((d) => d.url === datum.url);

        if (index > -1) {
          this.documents.splice(index, 1);
        }

        Observable.notify(this, 'documents');
        this.showSuccessNotification(
          ppp.t('$restoreMongodbModalPage.backupDeleted')
        );
      } catch (e) {
        this.failOperation(
          e,
          ppp.t('$restoreMongodbModalPage.backupRemovalTitle')
        );
      } finally {
        this.endOperation();
      }
    }
  }

  async populate() {
    if (!this.s3ApiID.value) {
      return;
    }

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
      ppp.t('$restoreMongodbModalPage.cannotFetchBucketList')
    );

    const bucketList = await rBucketList.json();
    const backupsBucket = bucketList?.buckets?.find((b) =>
      /^ppp-backups-/.test(b.name)
    );

    if (backupsBucket) {
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
      const canonicalRequest = `GET\n/\nlist-type=2\nhost:${host}\nx-amz-date:${xAmzDate}\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
      const scope = `${date}/ru-central1/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${xAmzDate}\n${scope}\n${await sha256(
        canonicalRequest
      )}`;
      const signature = await HMAC(signingKey, stringToSign, { format: 'hex' });
      const Authorization = `AWS4-HMAC-SHA256 Credential=${ycStaticKeyID}/${date}/ru-central1/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`;

      const rObjectList = await maybeFetchError(
        await ppp.fetch(`https://${host}/?list-type=2`, {
          headers: {
            Authorization,
            'X-Amz-Date': xAmzDate
          }
        }),
        ppp.t('$restoreMongodbModalPage.cannotFetchBackupList')
      );

      const xml = await rObjectList.text();
      const parser = new DOMParser();
      const list = parser.parseFromString(xml, 'application/xml');

      return Array.from(list.querySelectorAll('Contents') ?? []).map((node) => {
        const key = node.querySelector('Key').textContent;

        return {
          url: `https://${host}/${key}`,
          key,
          host,
          lastModified: node.querySelector('LastModified').textContent,
          size: parseFloat(node.querySelector('Size').textContent)
        };
      });
    }
  }
}

export default RestoreMongodbModalPage.compose({
  template: restoreMongodbModalPageTemplate,
  styles: restoreMongodbModalPageStyles
}).define();
