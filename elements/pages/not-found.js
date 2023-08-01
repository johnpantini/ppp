import { html, css } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { arrowLeft } from '../../static/svg/sprite.js';
import {
  fontSizeBody1,
  lineHeightBody1,
  paletteBlack,
  paletteGrayDark1,
  paletteGrayLight1,
  paletteGrayLight2,
  themeConditional
} from '../../design/design-tokens.js';
import '../button.js';

export const notFoundPageTemplate = html`
  <template>
    <main>
      <div class="content">
        <img src="static/svg/404.svg" draggable="false" alt="404" />
        <div class="details">
          <p class="headline">Что-то пошло не так.</p>
          <p class="text">
            Страница не открывается. Убедитесь, что адрес введён правильно.
          </p>
          <div class="actions">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: 'cloud-services'
                })}"
              appearance="primary"
            >
              К настройкам облачных сервисов
              <span slot="start">${html.partial(arrowLeft)}</span>
            </ppp-button>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="copyright">
          <p>© PPP 2021-текущее время.</p>
        </div>
      </div>
    </main>
  </template>
`;

export const notFoundPageStyles = css`
  ${pageStyles}
  :host {
    width: 100%;
  }

  main {
    margin: 32px auto;
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
    user-select: none;
  }

  .details {
    padding: 0 16px;
  }

  p {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
    font-size: ${fontSizeBody1};
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .headline {
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    font-size: 28px;
  }

  .text {
    font-size: ${fontSizeBody1};
    line-height: ${lineHeightBody1};
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

export class NotFoundPage extends Page {
  async connectedCallback() {
    await super.connectedCallback();

    ppp.app.pageConnected = true;
  }
}

export default NotFoundPage.compose({
  template: notFoundPageTemplate,
  styles: notFoundPageStyles
}).define();
