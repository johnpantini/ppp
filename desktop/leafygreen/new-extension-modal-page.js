import { NewExtensionModalPage } from '../../shared/new-extension-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import ppp from '../../ppp.js';

export const newExtensionModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <section>
          <div class="label-group full">
            <h6>Манифест</h6>
            <p>Введите полный URL манифеста (адрес файла ppp.json).</p>
            <${'ppp-text-field'}
              type="url"
              placeholder="https://example.com/ppp.json"
              ${ref('url')}
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
        <div class="footer-border"></div>
        <footer slot="actions">
          <div class="footer-actions">
            <${'ppp-button'}
              @click="${() => (ppp.app.getVisibleModal().visible = false)}">
              Отмена
            </ppp-button>
            <${'ppp-button'}
              ?disabled="${(x) => x.page.loading}"
              type="submit"
              @click="${(x) => x.page.saveDocument()}"
              appearance="primary"
            >
              <slot name="submit-control-text">Установить дополнение</slot>
            </ppp-button>
          </div>
        </footer>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default NewExtensionModalPage.compose({
  template: newExtensionModalPageTemplate,
  styles: pageStyles
});
