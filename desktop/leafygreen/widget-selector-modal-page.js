import { WidgetSelectorModalPage } from '../../shared/widget-selector-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const widgetSelectorModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        ${when(
          (x) => !x.page.loading && !x.documents.length,
          html`
            <${'ppp-banner'} class="inline" appearance="warning"
                             style="margin-bottom: 1rem">Похоже, у вас нет ни
              одного виджета. Добавьте и настройте их в <a @click="${() => {
                ppp.app.navigate({
                  page: 'widget'
                });
              }}}" href="javascript:void(0)">соответствующем
                разделе</a>.
            </ppp-banner>
          `
        )}
        <${'ppp-table'}
          :columns="${() => [
            {
              label: 'Название',
              sortBy: (d) => d.name
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
                  html`<a
                    @click="${() => {
                      ppp.app.navigate({
                        page: 'widget',
                        document: datum._id
                      });

                      return false;
                    }}"
                    href="?page=widget&document=${datum._id}"
                  >
                    ${datum.name}
                  </a>`,
                  x.t(`$const.widget.${datum.type}`),
                  datum.collection,
                  html`
                    <${'ppp-button'}
                      class="xsmall"
                      @click="${() => x.selectWidget(datum)}"
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
