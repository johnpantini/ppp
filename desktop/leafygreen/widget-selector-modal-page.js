import { WidgetSelectorModalPage } from '../../shared/widget-selector-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { when } from '../../shared/element/templating/when.js';
import { formatDate } from '../../shared/intl.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const widgetSelectorModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <${'ppp-banner'}
          class="inline"
          appearance="${(x) =>
            (x.isPredefinedWidgetType(x.activeItem) ? x.documents.length : true)
              ? 'info'
              : 'warning'}"
          style="margin-bottom: 1rem"
        >
          <div style="display: ${(x) =>
            (x.isPredefinedWidgetType(x.activeItem) ? x.documents.length : true)
              ? 'initial'
              : 'none'}">
            Найдите виджет, используя боковое меню, а затем нажмите на строку в
            таблице, чтобы разместить в терминале.
          </div>
          <div style="display: ${(x) =>
            !(x.isPredefinedWidgetType(x.activeItem)
              ? x.documents.length
              : true)
              ? 'initial'
              : 'none'}">
            Похоже, у вас нет ни одного виджета данного типа. Добавьте и
            настройте их в <a
            @click="${(x) => {
              ppp.app.navigate({
                page: 'widget',
                type: x.activeItem
              });
            }}}" href="javascript:void(0)">соответствующем
            разделе</a>.
          </div>
        </ppp-banner>
        <div class="selectors">
          <div class="selector-holder">
            <${'ppp-side-nav'}
              expanded
              static
              inline
              @click="${(x, c) => x.handleTypeSelectorClick(c)}"
            >
              <${'ppp-side-nav-group'}>
                <span slot="title">Тип виджета</span>
                <${'ppp-side-nav-item'}
                  slot="items"
                  slug="order"
                  ?active="${(x) => x.activeItem === 'order'}"
                >
                  <img draggable="false" alt="Заявка"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/order.svg"/>
                  <span slot="title">Заявка</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="scalping-buttons"
                  title="Скальперские кнопки"
                  ?active="${(x) => x.activeItem === 'scalping-buttons'}"
                >
                  <img draggable="false" alt="Скальперские кнопки"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/scalping-buttons.svg"/>
                  <span slot="title">Скальперские кнопки</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="active-orders"
                  ?active="${(x) => x.activeItem === 'active-orders'}"
                >
                  <img draggable="false" alt="Активные заявки"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/active-orders.svg"/>
                  <span slot="title">Активные заявки</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="light-chart"
                  ?active="${(x) => x.activeItem === 'light-chart'}"
                >
                  <img draggable="false" alt="Лёгкий график"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/light-chart.svg"/>
                  <span slot="title">Лёгкий график</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="orderbook"
                  ?active="${(x) => x.activeItem === 'orderbook'}"
                >
                  <img draggable="false" alt="Книга заявок"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/orderbook.svg"/>
                  <span slot="title">Книга заявок</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="time-and-sales"
                  ?active="${(x) => x.activeItem === 'time-and-sales'}"
                >
                  <img draggable="false" alt="Лента всех сделок"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/time-and-sales.svg"/>
                  <span slot="title">Лента всех сделок</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="portfolio"
                  ?active="${(x) => x.activeItem === 'portfolio'}"
                >
                  <img draggable="false" alt="Портфель"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/portfolio.svg"/>
                  <span slot="title">Портфель</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="instruments"
                  ?active="${(x) => x.activeItem === 'instruments'}"
                >
                  <img draggable="false" alt="Инструменты"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/instruments.svg"/>
                  <span slot="title">Инструменты</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="timeline"
                  ?active="${(x) => x.activeItem === 'timeline'}"
                >
                  <img draggable="false" alt="Лента операций"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/timeline.svg"/>
                  <span slot="title">Лента операций</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="frame"
                  ?active="${(x) => x.activeItem === 'frame'}"
                >
                  <img draggable="false" alt="Фрейм"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/custom.svg"/>
                  <span slot="title">Фрейм</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slot="items"
                  slug="other"
                  title="Специальный виджет"
                  ?active="${(x) => x.activeItem === 'other'}"
                >
                  <img draggable="false" alt="Специальный виджет"
                       style="height: 16px"
                       slot="start"
                       src="static/widgets/custom.svg"/>
                  <span slot="title">Специальный виджет</span>
                </ppp-side-nav-item>
              </ppp-side-nav-group>
            </ppp-side-nav>
          </div>
          <div class="table-holder">
            <${'ppp-table'}
              selectable
              sticky
              @click="${(x, c) => x.handleWidgetListClick(c)}"
              :columns="${() => [
                {
                  label: 'Название',
                  sortBy: (d) => d.name
                },
                {
                  label: 'Последнее изменение',
                  sortBy: (d) => d.updatedAt
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
                      datum.name ?? '<Без имени>',
                      formatDate(datum.updatedAt ?? datum.createdAt),
                      datum.collection,
                      html`
                        <${'ppp-button'}
                          class="xsmall"
                          @click="${() => {
                            ppp.app.navigate({
                              page: 'widget',
                              document: datum._id
                            });

                            return false;
                          }}"
                        >
                          Редактировать
                        </ppp-button>
                      `
                    ]
                  };
                })}"
            >
            </ppp-table>
          </div>
        </div>
        <span slot="actions"></span>
      </ppp-page>
    </form>
  </template>
`;

export const widgetSelectorModalPageStyles = (context, definition) => css`
  ${pageStyles}
  [name='start']::slotted(img) {
    height: 20px;
  }

  ppp-banner {
    width: 810px;
  }

  ppp-side-nav {
    position: absolute;
    height: 100%;
  }

  .selectors {
    position: relative;
  }

  .selector-holder {
    border: 1px solid rgb(231, 238, 236);
    width: 183px;
    height: 375px;
    position: relative;
    overflow: hidden;
  }

  .table-holder {
    position: absolute;
    width: calc(100% - 183px);
    height: 100%;
    left: 183px;
    top: 0;
    overflow: auto;
    margin-left: 8px;
    border: 1px solid rgb(231, 238, 236);
    border-left: none;
    border-right: none;
  }

  .table-holder::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .table-holder::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .table-holder::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetSelectorModalPage.compose({
  template: widgetSelectorModalPageTemplate,
  styles: widgetSelectorModalPageStyles
});
