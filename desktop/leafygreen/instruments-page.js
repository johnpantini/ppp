import { InstrumentsPage } from '../../shared/instruments-page.js';
import { html, requireComponent } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import ppp from '../../ppp.js';

const getActiveTab = () => {
  const params = ppp.app.params();

  if (/manage|import|export/i.test(params.tab)) return params.tab;
  else return 'manage';
};

void requireComponent(`ppp-instruments-${getActiveTab()}-page`);

export const instrumentsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page'}>
      <span slot="header">
        Торговые инструменты
      </span>
      <ppp-tabs
        ${ref('tabs')}
        activeid="${() => getActiveTab()}"
        @change="${(x, { event }) => {
          void requireComponent(`ppp-instruments-${event.detail.id}-page`);

          ppp.app.setURLSearchParams({
            tab: event.detail.id
          });
        }}"
      >
        <ppp-tab id="manage">Добавление/редактирование</ppp-tab>
        <ppp-tab id="import" disabled>Импорт</ppp-tab>
        <ppp-tab id="export" disabled>Экспорт</ppp-tab>
        <ppp-tab-panel id="manage-panel"></ppp-tab-panel>
        <ppp-tab-panel id="import-panel"></ppp-tab-panel>
        <ppp-tab-panel id="export-panel"></ppp-tab-panel>
      </ppp-tabs>
      ${when(
        (x) => x.tabs.activeid === 'manage',
        html` <ppp-instruments-manage-page></ppp-instruments-manage-page>`
      )}
      ${when(
        (x) => x.tabs.activeid === 'import',
        html` <ppp-instruments-import-page></ppp-instruments-import-page>`
      )}
      ${when(
        (x) => x.tabs.activeid === 'export',
        html` <ppp-instruments-export-page></ppp-instruments-export-page>`
      )}
      <span slot="actions"></span>
    </ppp-page>
  </template>
`;

await Promise.all([
  requireComponent('ppp-tabs'),
  requireComponent(
    'ppp-tab',
    `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/tabs.js`
  ),
  requireComponent(
    'ppp-tab-panel',
    `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/tabs.js`
  )
]);

// noinspection JSUnusedGlobalSymbols
export default InstrumentsPage.compose({
  template: instrumentsPageTemplate,
  styles: pageStyles
});
