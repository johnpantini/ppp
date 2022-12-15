import { NewDomainModalPage } from '../../shared/new-domain-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import ppp from '../../ppp.js';

export const newDomainModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <section>
          <div class="label-group full">
            <h6>Email</h6>
            <p>
              Адрес регистрации учётной записи <a target="_blank"
                                                  href="https://letsencrypt.org/">Let's
              Encrypt</a> для получения служебных уведомлений (например, при
              скором истечении
              сертификата).
            </p>
            <${'ppp-text-field'}
              placeholder="Email"
              ${ref('certbotEmail')}
            ></ppp-text-field>
          </div>
        </section>
        <section class="last">
          <div class="label-group full">
            <h6>Домены</h6>
            <p>
              Список доменов, для которых нужно получить сертификаты. Можно
              ввести несколько через запятую.
            </p>
            <ppp-text-field
              placeholder="example.com, www.example.com"
              ${ref('certbotDomains')}
            ></ppp-text-field>
          </div>
        </section>
        <div class="footer-border"></div>
        <footer slot="actions">
          <div class="footer-actions">
            <${'ppp-button'}
              @click="${() => (ppp.app.getVisibleModal().visible = false)}">
              Отмена
            </ppp-button>
            <${'ppp-button'}
              ?disabled="${(x) => x.page.loading}"
              type="submit"
              @click="${(x) => x.page.saveDocument()}"
              appearance="primary"
            >
              <slot name="submit-control-text">Добавить домены</slot>
            </ppp-button>
          </div>
        </footer>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default NewDomainModalPage.compose({
  template: newDomainModalPageTemplate,
  styles: pageStyles
});
