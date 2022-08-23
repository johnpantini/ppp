import { ServiceDeployedPppAspirantPage } from '../../shared/service-deployed-ppp-aspirant-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const serviceDeployedPppAspirantPageTemplate = (
  context,
  definition
) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Сервис - PPP Aspirant (по адресу) - ${x.document.name}`
              : 'Сервис - PPP Aspirant (по адресу)'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название сервиса</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Aspirant"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>URL сервиса</h5>
            <p>Ссылка на развёрнутный сервис PPP Aspirant.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="url"
              placeholder="https://example.com"
              value="${(x) => x.document.url}"
              ${ref('url')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServiceDeployedPppAspirantPage.compose({
  template: serviceDeployedPppAspirantPageTemplate,
  styles: pageStyles
});
