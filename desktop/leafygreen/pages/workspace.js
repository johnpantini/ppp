import { WorkspacePage } from '../../../shared/pages/workspace.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';

const noWidgetsTemplate = html`
  <${'ppp-page-header'}>
    ${(x) => x.app.workspaces.find((i) => i.uuid === x.app.workspace)?._id}
  </ppp-page-header>
  <form ${ref('form')} id="workspace" name="workspace" onsubmit="return false">
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <div class="empty-state">
        <img src="static/empty-state.svg" draggable="false"
             alt="Этот терминал не настроен"/>
        <h1>Этот терминал не настроен</h1>
        <h2>
          Для того, чтобы начать торговать, разместите виджеты в этой рабочей
          области
        </h2>
        <button
          type="button"
          class="cta"
          aria-disabled="false"
          role="link"
          disabled
        >
          <div class="text">Добавить виджет</div>
        </button>
      </div>
    </div>
  </form>
`;

export const workspacePageTemplate = (context, definition) => html`
  <template>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
      ${when(
        (x) => x.notFound,
        html` <ppp-not-found-page :app="${(x) => x}"></ppp-not-found-page>`
      )}
      ${when(
        (x) => !x.busy && !x.notFound && !x.widgets.length,
        noWidgetsTemplate
      )}
    </div>
  </template>
`;

export const workspacePageStyles = (context, definition) => css`
  ${pageStyles}
  .loading-wrapper {
    margin-top: 8px;
  }
`;

export const workspacePage = WorkspacePage.compose({
  baseName: 'workspace-page',
  template: workspacePageTemplate,
  styles: workspacePageStyles
});
