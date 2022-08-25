import { BrokerUtexAuroraPage } from '../../shared/broker-utex-aurora-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const brokerUtexAuroraPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Брокер - UTEX Aurora - ${x.document.name}`
              : 'Брокер - UTEX Aurora'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Aurora"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Логин учётной записи UTEX</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="UTEX login"
              value="${(x) => x.document.login}"
              ${ref('login')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пароль учётной записи UTEX</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="UTEX password"
              value="${(x) => x.document.password}"
              ${ref('password')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default BrokerUtexAuroraPage.compose({
  template: brokerUtexAuroraPageTemplate,
  styles: pageStyles
});
