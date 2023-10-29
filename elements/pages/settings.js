import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../tabs.js';
import './settings-appearance.js';
import './settings-ui.js';
import './settings-workspace.js';

export const settingsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <ppp-page-header>Параметры</ppp-page-header>
    <ppp-tabs
      ${ref('tabs')}
      activeid="${(x) => x.getActiveTab()}"
      @change="${(x, { event }) => {
        ppp.app.setURLSearchParams({
          tab: event.detail.id
        });
      }}"
    >
      <ppp-tab id="appearance">Тема и цвета</ppp-tab>
      <ppp-tab id="workspace">Терминал</ppp-tab>
      <ppp-tab id="ui">UI</ppp-tab>
      <ppp-tab-panel id="appearance-panel"></ppp-tab-panel>
      <ppp-tab-panel id="workspace-panel"></ppp-tab-panel>
      <ppp-tab-panel id="ui-panel"></ppp-tab-panel>
    </ppp-tabs>
    ${when(
      (x) => x.tabs.activeid === 'appearance',
      html` <ppp-settings-appearance-page></ppp-settings-appearance-page>`
    )}
    ${when(
      (x) => x.tabs.activeid === 'workspace',
      html` <ppp-settings-workspace-page></ppp-settings-workspace-page>`
    )}
    ${when(
      (x) => x.tabs.activeid === 'ui',
      html` <ppp-settings-ui-page></ppp-settings-ui-page>`
    )}
  </template>
`;

export const settingsPageStyles = css`
  ${pageStyles}
`;

export class SettingsPage extends Page {
  getActiveTab() {
    const params = ppp.app.params();

    if (/appearance|workspace|ui/i.test(params.tab)) return params.tab;
    else return 'appearance';
  }
}

export default SettingsPage.compose({
  template: settingsPageTemplate,
  styles: settingsPageStyles
}).define();
