import { WorkspacePage } from '../../shared/workspace-page.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { css } from '../../shared/element/styles/css.js';
import { ref } from '../../shared/element/templating/ref.js';
import { loadingIndicator, pageStyles } from './page.js';
import ppp from '../../ppp.js';

export const workspacePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-top-loader'} ${ref('topLoader')}></ppp-top-loader>
    ${when(
      (x) => x.page.loading,
      html` <div class="loading-wrapper" loading>${loadingIndicator()}</div> `
    )}
    ${when(
      (x) => !x.page.loading && !(x.document.widgets ?? []).length,
      html`
        <form novalidate>
          <${'ppp-page'} headless>
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
                <div
                  style="display: flex; flex-direction: column; text-align: center; gap: 8px">
                  <div>
                    Чтобы в дальнейшем добавлять виджеты на рабочую область,
                    выберите терминал в боковом меню и нажмите&nbsp;<code
                    class="hotkey"
                    slot="end"
                  >+W</code
                  >
                  </div>
                  <div>
                    Для того, чтобы скрыть боковую панель и увеличить доступное
                    рабочее пространство, выполните двойной щелчок мышью с
                    зажатой клавишей&nbsp;<code
                    class="hotkey"
                    slot="end"
                  >Ctrl</code
                  >
                  </div>
                </div>
              </footer>
            </div>
            <span slot="actions"></span>
          </ppp-page>
        </form>
      `
    )}
    ${when(
      (x) => !x.page.loading && (x.document.widgets ?? []).length,
      html` <div class="workspace" ${ref('workspace')}></div> `
    )}
  </template>
`;

export const workspacePageStyles = (context, definition) => css`
  ${pageStyles}
  :host {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .workspace {
    z-index: 1;
    overflow: auto;
    position: relative;
    background-color: #ebeef2;
    width: 100%;
    height: 100%;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
    scrollbar-width: thin;
  }

  .workspace::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .workspace::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .workspace::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .widget {
    position: absolute !important;
    overflow: hidden;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WorkspacePage.compose({
  template: workspacePageTemplate,
  styles: workspacePageStyles
});
