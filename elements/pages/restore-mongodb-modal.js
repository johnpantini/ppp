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
import { maybeFetchError, validate } from '../../lib/ppp-errors.js';
import {
  enableMongoDBRealmHosting,
  getMongoDBRealmAccessToken
} from '../../lib/realm.js';
import { formatDateWithOptions, formatFileSize } from '../../lib/intl.js';
import '../../vendor/zip-full.min.js';
import '../../vendor/spark-md5.min.js';
import '../banner.js';
import '../button.js';
import '../query-select.js';
import '../table.js';

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
        Чтобы восстановить базу из ZIP-архива, нажмите
        <a
          class="link"
          style="font-weight: 700"
          @click="${(x) => x.fileInput.click()}"
          href="javascript:void(0)"
          >сюда</a
        >.
      </ppp-banner>
      <div class="spacing2"></div>
      <ppp-table
        :columns="${() => [
          {
            label: 'База данных'
          },
          {
            label: 'Дата создания копии'
          },
          {
            label: 'Размер'
          },
          {
            label: 'Действия'
          }
        ]}"
        :rows="${(x) =>
          x.documents?.map((datum) => {
            return {
              datum,
              cells: [
                html`
                  <a
                    class="link"
                    href="${datum.url}"
                    target="_blank"
                    rel="noopener"
                    >${/backup-of-cloud-mongodb/i.test(datum.url)
                      ? 'Облачная'
                      : 'Альтернативная'}</a
                  >
                `,
                formatDateWithOptions(datum.last_modified * 1000, {
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
                      Восстановить
                    </ppp-button>
                    <ppp-button
                      appearance="danger"
                      class="xsmall"
                      @click="${() => x.deleteBackup(datum)}"
                    >
                      Удалить
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
          'extensions',
          'instruments',
          'psina',
          'servers',
          'services',
          'traders',
          'widgets',
          'workspaces'
        ];

        for (const entry of entries) {
          const collection = entry.filename.split('.json')[0];

          if (collections.indexOf(collection) > -1) {
            const parsed = JSON.parse(
              await entry.getData(new zip.TextWriter())
            ).filter((d) => {
              return !(collection === 'app' && d?._id === 'settings');
            });

            if (Array.isArray(parsed) && parsed.length) {
              await ppp.user.functions.deleteMany({ collection }, {});

              if (parsed.length > 2000) {
                // Fix execution timeout errors
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
        'Восстановление прошло успешно, можно обновить страницу.'
      );
    } catch (e) {
      this.failOperation(e, 'Восстановление из резервной копии');
    } finally {
      this.endOperation();
    }
  }

  async restoreFromBackup(datum) {
    if (
      await ppp.app.confirm(
        'Восстановление из резервной копии',
        `Будет восстановлена база данных по резервной копии, созданной ${formatDateWithOptions(
          datum.last_modified * 1000,
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
          }
        )}. Перед восстановлением текущая база данных будет очищена. Подтвердите действие.`
      )
    ) {
      return this.#restore(datum.url);
    }
  }

  async deleteBackup(datum) {
    if (
      await ppp.app.confirm(
        'Удаление резервной копии',
        `Будет удалена резервная копия, созданная ${formatDateWithOptions(
          datum.last_modified * 1000,
          {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
          }
        )}. Подтвердите действие.`
      )
    ) {
      this.beginOperation();

      try {
        const groupId = ppp.keyVault.getKey('mongo-group-id');
        const appId = ppp.keyVault.getKey('mongo-app-id');
        const mongoDBRealmAccessToken = await getMongoDBRealmAccessToken();

        await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'reload',
              method: 'POST',
              body: JSON.stringify({
                method: 'DELETE',
                url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/assets/asset?path=${encodeURIComponent(
                  datum.path
                )}`,
                headers: {
                  Authorization: `Bearer ${mongoDBRealmAccessToken}`
                }
              })
            }
          ),
          'Не удалось удалить резервную копию.'
        );

        const index = this.documents.findIndex((d) => d.path === datum.path);

        if (index > -1) {
          this.documents.splice(index, 1);
        }

        Observable.notify(this, 'documents');
        this.showSuccessNotification('Копия удалена.');
      } catch (e) {
        this.failOperation(e, 'Удаление резервной копии');
      } finally {
        this.endOperation();
      }
    }
  }

  async populate() {
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

    const request = await fetch(
      new URL('fetch', serviceMachineUrl).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: `https://realm.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/hosting/assets?prefix=%2Fbackups%2F`,
          headers: {
            Authorization: `Bearer ${mongoDBRealmAccessToken}`
          }
        })
      }
    );

    if (request.status === 404) {
      return [];
    } else {
      await maybeFetchError(
        request,
        'Не удалось получить список резервных копий.'
      );

      return request.json();
    }
  }
}

export default RestoreMongodbModalPage.compose({
  template: restoreMongodbModalPageTemplate,
  styles: restoreMongodbModalPageStyles
}).define();
