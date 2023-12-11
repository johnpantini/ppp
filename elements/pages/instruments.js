import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../tabs.js';
import './instruments-import.js';
import './instruments-manage.js';

export const instrumentsTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <ppp-page-header>Торговые инструменты</ppp-page-header>
    <ppp-tabs
      ${ref('tabs')}
      activeid="${(x) => x.getActiveTab()}"
      @change="${(x, { event }) => {
        ppp.app.navigate({
          page: 'instruments',
          tab: event.detail.id,
          dictionary: encodeURIComponent(ppp.app.params().dictionary ?? '')
        });
      }}}"
    >
      <ppp-tab id="manage">Добавление/редактирование</ppp-tab>
      <ppp-tab id="import">Импорт</ppp-tab>
      <ppp-tab-panel id="manage-panel"></ppp-tab-panel>
      <ppp-tab-panel id="import-panel"></ppp-tab-panel>
    </ppp-tabs>
    ${when(
      (x) => x.tabs.activeid === 'manage',
      html` <ppp-instruments-manage-page
        disable-auto-read
      ></ppp-instruments-manage-page>`
    )}
    ${when(
      (x) => x.tabs.activeid === 'import',
      html` <ppp-instruments-import-page
        disable-auto-read
      ></ppp-instruments-import-page>`
    )}
    ${when(
      (x) => x.tabs.activeid === 'remove',
      html` <ppp-instruments-remove-page
        disable-auto-read
      ></ppp-instruments-remove-page>`
    )}
  </template>
`;

export const instrumentsStyles = css`
  ${pageStyles}
`;

export class InstrumentsPage extends Page {
  getActiveTab() {
    const params = ppp.app.params();

    if (/manage|import|remove/i.test(params.tab)) return params.tab;
    else return 'manage';
  }
}

export default InstrumentsPage.compose({
  template: instrumentsTemplate,
  styles: instrumentsStyles
}).define();
