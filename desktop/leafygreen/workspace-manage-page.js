import { WorkspaceManagePage } from '../../shared/workspace-manage-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const workspaceManagePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name ? `Терминал - ${x.document.name}` : 'Терминал'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название терминала</h5>
            <p>Название будет отображаться в боковой панели в списке
              терминалов.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="PPP"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default WorkspaceManagePage.compose({
  template: workspaceManagePageTemplate,
  styles: pageStyles
});
