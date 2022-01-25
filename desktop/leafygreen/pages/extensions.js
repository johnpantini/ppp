import { ExtensionsPage } from '../../../shared/pages/extensions.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';
import { Observable } from '../../../shared/element/observation/observable.js';

const newExtensionModalTemplate = html`
  <ppp-modal ${ref('newExtensionModal')} dismissible>
    <span slot="title" ${ref('modalHeader')}>Новое дополнение</span>
    <div slot="body">
      <form ${ref('newWorkspaceModalForm')} onsubmit="return false" novalidate>
        <div class="loading-wrapper" ?busy="${(x) => x.busy}">
          <section>
            <div class="label-group full">
              <h6>Манифест</h6>
              <p>Введите полный URL манифеста (ppp.json).</p>
              <${'ppp-text-field'}
                type="url"
                placeholder="https://example.com/ppp.json"
                ${ref('manifestUrl')}
              ></ppp-text-field>
            </div>
          </section>
          <section class="last">
            <div class="label-group full">
              <h6>Название</h6>
              <p>Название для отображения в боковой панели в разделе
                дополнений.</p>
              <ppp-text-field
                optional
                placeholder="Введите название"
                ${ref('extensionTitle')}
              ></ppp-text-field>
            </div>
          </section>
          ${when((x) => x.busy, html`${loadingIndicator()}`)}
          <div class="footer-border"></div>
          <footer>
            <div class="footer-actions">
              <${'ppp-button'}
                @click="${(x) => (x.newExtensionModal.visible = false)}">Отмена
              </ppp-button>
              <ppp-button
                style="margin-left: 10px;"
                appearance="primary"
                ?disabled="${(x) => x.busy}"
                type="submit"
                @click="${(x) => x.addExtension()}"
              >
                Добавить
              </ppp-button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  </ppp-modal>
`;

export const extensionsPageTemplate = (context, definition) => html`
  <template>
    ${newExtensionModalTemplate}
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => x.handleNewExtensionClick()}"
      >
        Установить дополнение
      </ppp-button>
      Список дополнений
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.rows.map((datum) => {
            return {
              datum,
              cells: [
                datum.title,
                datum.author,
                formatDate(datum.createdAt),
                datum.version,
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => {
                      const index = x.app.extensions.findIndex(
                        (x) => x._id === datum._id
                      );

                      if (index > -1) x.app.extensions.splice(index, 1);

                      Observable.notify(x.app, 'extensions');

                      return x.simpleRemove('extensions', datum._id);
                    }}"
                  >
                    ${trash()}
                  </ppp-button>`
              ]
            };
          })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const extensionsPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const extensionsPage = ExtensionsPage.compose({
  baseName: 'extensions-page',
  template: extensionsPageTemplate,
  styles: extensionsPageStyles
});
