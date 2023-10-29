import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../button.js';
import '../checkbox.js';

export const settingsUiPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Флаги</h5>
          <p class="description">Параметры, принимающие значение Да или Нет.</p>
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-checkbox
              ?checked="${(x) => x.document.closeModalsOnEsc}"
              ${ref('closeModalsOnEsc')}
            >
              Закрывать модальные окна клавишей Esc
            </ppp-checkbox>
          </div>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить параметры
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const settingsUiPageStyles = css`
  ${pageStyles}
`;

export class SettingsUiPage extends Page {
  collection = 'app';

  getDocumentId() {
    return {
      _id: '@settings'
    };
  }

  async read() {
    return Object.fromEntries(ppp.settings);
  }

  async submit() {
    const closeModalsOnEsc = this.closeModalsOnEsc.checked;

    ppp.settings.set('closeModalsOnEsc', closeModalsOnEsc);

    return {
      $set: {
        closeModalsOnEsc
      }
    };
  }
}

export default SettingsUiPage.compose({
  template: settingsUiPageTemplate,
  styles: settingsUiPageStyles
}).define();
