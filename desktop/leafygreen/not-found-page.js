import { FoundationElement } from '../../shared/foundation-element.js';
import { html } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { notDefined } from '../../shared/utilities/style/display.js';
import ppp from '../../ppp.js';

import { settings } from './icons/settings.js';

export class NotFoundPage extends FoundationElement {
  connectedCallback() {
    super.connectedCallback();

    ppp.app.pageConnected = true;
  }
}

export const notFoundPageTemplate = (context, definition) => html`
  <template>
    <main>
      <div class="content">
        <img src="static/404.png" draggable="false" alt="404"/>
        <div class="details">
          <p class="headline">Что-то пошло не так.</p>
          <p class="text">
            Страница не открывается. Убедитесь, что адрес введён корректно.
          </p>
          <div class="actions">
            <${'ppp-button'}
              @click="${() =>
                ppp.app.navigate({
                  page: 'cloud-services'
                })}"
              appearance="primary">
              ${settings({
                slot: 'start'
              })}
              К настройкам облачных сервисов
            </ppp-button>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="copyright">
          <p>
            © PPP 2021-текущее время. Приложение PPP разработано командой John
            Pantini.
          </p>
        </div>
      </div>
    </main>
  </template>
`;

export const notFoundPageStyles = (context, definition) =>
  css`
    ${notDefined}
    main {
      margin: 32px auto;
      max-width: 1150px;
      padding: 0 24px;
    }

    .content {
      align-items: center;
      display: flex;
      flex-flow: row-reverse wrap;
      justify-content: center;
      margin-bottom: 64px;
    }

    img {
      width: 550px;
      max-width: 100%;
      border: 0;
      vertical-align: middle;
    }

    .details {
      padding: 0 16px;
    }

    p {
      color: rgb(6, 22, 33);
      font-size: 16px;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }

    .headline {
      font-size: 32px;
      line-height: 32px;
    }

    .text {
      font-size: 16px;
      line-height: 24px;
      margin-top: 24px;
    }

    .actions {
      margin-top: 24px;
    }

    .footer {
      width: auto;
      font-size: 80%;
      border: none;
      padding: 20px 0;
    }

    .copyright {
      text-align: center;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default NotFoundPage.compose({
  template: notFoundPageTemplate,
  styles: notFoundPageStyles
});
