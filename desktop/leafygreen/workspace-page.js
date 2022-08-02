import { WorkspacePage } from '../../shared/workspace-page.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import ppp from '../../ppp.js';

export const workspacePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} headless>
        ${when(
          (x) => !x.page.loading && !x.widgets.length,
          html`
            <div class="empty-state">
              <img
                width="200"
                height="200"
                src="static/empty-state.svg"
                draggable="false"
                alt="Этот терминал не настроен"
              />
              <h1>В этом терминале нет виджетов</h1>
              <h2>
                Для того, чтобы начать торговать, разместите виджеты на рабочей
                области
              </h2>
              <button
                type="button"
                class="cta"
                aria-disabled="false"
                role="link"
                @click="${() => ppp.app.showWidgetSelector()}"
              >
                <div class="text">Разместить виджет</div>
              </button>
              <footer>
                Чтобы в дальнейшем добавлять виджеты на рабочую область,
                выберите терминал в боковом меню и нажмите&nbsp;<code
                  class="hotkey"
                  slot="end"
                  >+W</code
                >
              </footer>
            </div>
          `
        )}
        <span slot="actions"></span>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default WorkspacePage.compose({
  template: workspacePageTemplate,
  styles: pageStyles
});
