/** @decorator */

import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../text-field.js';
import '../button.js';
import '../banner.js';
import '../radio-group.js';

export const settingsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Параметры</ppp-page-header>
      <section>
        <div class="label-group">
          <h5>Оформление приложения</h5>
          <p class="description">
            Светлое, тёмное или по выбору операционной системы.
          </p>
          <ppp-banner class="inline" appearance="warning">
            Оформление вступит в силу после сохранения изменений.
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.darkMode ?? '2'}"
            ${ref('darkMode')}
          >
            <ppp-radio value="2">По выбору системы</ppp-radio>
            <ppp-radio value="1">Тёмное</ppp-radio>
            <ppp-radio value="0">Светлое</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
    </form>
  </template>
`;

export const settingsPageStyles = css`
  ${pageStyles}
  ppp-banner {
    margin-top: 10px;
  }
`;

export class SettingsPage extends Page {
  collection = 'app';

  getDocumentId() {
    return '@settings';
  }

  async read() {
    return Object.fromEntries(ppp.settings);
  }
}

export default SettingsPage.compose({
  template: settingsPageTemplate,
  styles: settingsPageStyles
}).define();
