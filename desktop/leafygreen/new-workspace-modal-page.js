import { NewWorkspaceModalPage } from '../../shared/new-workspace-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import ppp from '../../ppp.js';

export const newWorkspaceModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <section>
          <div class="label-group full">
            <h6>Название</h6>
            <p>Будет отображаться в боковой панели.</p>
            <${'ppp-text-field'}
              placeholder="Название пространства"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section class="last">
          <div class="label-group full">
            <h6>Комментарий</h6>
            <ppp-text-field
              optional
              placeholder="Произвольное описание"
              value="${(x) => x.document.comment}"
              ${ref('comment')}
            ></ppp-text-field>
          </div>
        </section>
        <div class="footer-border"></div>
        <footer slot="actions">
          <div class="footer-actions">
            <${'ppp-button'}
              @click="${() => (ppp.app.newWorkspaceModal.visible = false)}">
              Отмена
            </ppp-button>
            <${'ppp-button'}
              ?disabled="${(x) => x.page.loading}"
              type="submit"
              @click="${(x) => x.page.saveDocument()}"
              appearance="primary"
            >
              <slot name="submit-control-text">Создать пространство</slot>
            </ppp-button>
          </div>
        </footer>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default NewWorkspaceModalPage.compose({
  template: newWorkspaceModalPageTemplate,
  styles: pageStyles
});
