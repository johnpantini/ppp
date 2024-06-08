import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../button.js';
import '../checkbox.js';
import '../select.js';

export const settingsUiPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Язык приложения</h5>
          <p class="description">Выберите язык приложения.</p>
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-select
              value="${(x) => x.document.language ?? ppp.locale}"
              placeholder="Выберите язык"
              ${ref('languageSelector')}
            >
              <ppp-option value="ru">Русский</ppp-option>
              <ppp-option value="en">English</ppp-option>
            </ppp-select>
          </div>
        </div>
      </section>
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

  async connectedCallback() {
    await super.connectedCallback();

    if (sessionStorage.getItem('ppp-show-success-notification') === '1') {
      sessionStorage.removeItem('ppp-show-success-notification');
      this.showSuccessNotification();
    }
  }

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
    const language = this.languageSelector.value;

    ppp.settings.set('closeModalsOnEsc', closeModalsOnEsc);
    ppp.settings.set('language', language);

    return {
      $set: {
        closeModalsOnEsc,
        language
      }
    };
  }

  async submitDocument(options = {}) {
    try {
      await super.submitDocument(
        Object.assign(options, { silent: true, raiseException: true })
      );
      sessionStorage.setItem('ppp-show-success-notification', '1');
      location.reload();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default SettingsUiPage.compose({
  template: settingsUiPageTemplate,
  styles: settingsUiPageStyles
}).define();
