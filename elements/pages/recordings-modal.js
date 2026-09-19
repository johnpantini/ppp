/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { maybeFetchError } from '../../lib/ppp-errors.js';
import { HMAC, sha256 } from '../../lib/ppp-crypto.js';
import { getYCPsinaFolder, generateYCAWSSigningKey } from '../../lib/yc.js';
import { formatDateWithOptions, formatFileSize } from '../../lib/intl.js';
import * as jose from '../../vendor/jose.min.js';
import '../../vendor/zip-full.min.js';
import '../button.js';
import '../query-select.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const recordingsModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-query-select
        style="max-width: 384px"
        placeholder="${() =>
          ppp.t('$recordingsModalPage.selectYcApiPlaceholder')}"
        ${ref('ycApiId')}
        :context="${(x) => x}"
        @change="${(x) => {
          x.ycApiId.disabled = true;

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
        ?hidden="${(x) => !x.ycApiId.value}"
        :columns="${() => [
          {
            label: ppp.t('$g.symbol')
          },
          {
            label: ppp.t('$recordingsModalPage.dictionaryColumn')
          },
          {
            label: ppp.t('$recordingsModalPage.dateColumn')
          },
          {
            label: ppp.t('$recordingsModalPage.sizeColumn')
          },
          {
            label: ppp.t('$recordingsModalPage.actionsColumn')
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
                      >${datum.key.split('|')[0]}</a
                    >
                  `,
                  datum.key.split('|')[1],
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
                        appearance="danger"
                        class="xsmall"
                        @click="${() => x.deleteRecording(datum)}"
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

export const recordingsModalPageStyles = css`
  ${pageStyles}
  form[novalidate] {
    padding: 0 25px 25px 25px;
  }
`;

export class RecordingsModalPage extends Page {
  async deleteRecording(datum) {
    const [ticker] = datum.key.split('|');

    if (
      await ppp.app.confirm(
        ppp.t('$recordingsModalPage.recordingRemovalTitle'),
        ppp.t('$recordingsModalPage.confirmRecordingRemoval', {
          ticker,
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
        const { ycStaticKeyID, ycStaticKeySecret } = this.ycApiId.datum();
        let { host, key } = datum;

        key = encodeURIComponent(key);

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
          ppp.t('$recordingsModalPage.cannotDeleteRecording')
        );

        const index = this.documents.findIndex((d) => d.url === datum.url);

        if (index > -1) {
          this.documents.splice(index, 1);
        }

        Observable.notify(this, 'documents');
        this.showSuccessNotification(
          ppp.t('$recordingsModalPage.recordingDeleted')
        );
      } catch (e) {
        this.failOperation(
          e,
          ppp.t('$recordingsModalPage.recordingRemovalTitle')
        );
      } finally {
        this.endOperation();
      }
    }
  }

  async populate() {
    if (!this.ycApiId.value) {
      return;
    }

    const {
      ycServiceAccountID,
      ycPublicKeyID,
      ycPrivateKey,
      ycStaticKeyID,
      ycStaticKeySecret
    } = this.ycApiId.datum();
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
      ppp.t('$recordingsModalPage.cannotFetchBucketList')
    );

    const bucketList = await rBucketList.json();
    const backupsBucket = bucketList?.buckets?.find((b) =>
      /^ppp-recordings-/.test(b.name)
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
        ppp.t('$recordingsModalPage.cannotFetchRecordingList')
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

export default RecordingsModalPage.compose({
  template: recordingsModalPageTemplate,
  styles: recordingsModalPageStyles
}).define();
