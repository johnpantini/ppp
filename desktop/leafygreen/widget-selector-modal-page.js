import { WidgetSelectorModalPage } from '../../shared/widget-selector-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const widgetSelectorModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <${'ppp-table'}
          :columns="${() => [
            {
              label: 'Название',
              sortBy: (d) => d._id
            },
            {
              label: 'Тип',
              sortBy: (d) => d.type
            },
            {
              label: 'Коллекция',
              sortBy: (d) => d.collection
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
                  datum.name,
                  x.t(`$const.widget.${datum.type}`),
                  datum.collection,
                  html`
                    <${'ppp-button'}
                      class="xsmall"
                      @click="${() => console.log(datum._id)}"
                    >
                      Выбрать
                    </ppp-button>
                  `
                ]
              };
            })}"
        >
        </ppp-table>
        <span slot="actions"></span>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetSelectorModalPage.compose({
  template: widgetSelectorModalPageTemplate,
  styles: pageStyles
});
