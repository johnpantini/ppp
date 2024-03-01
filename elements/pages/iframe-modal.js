/** @decorator */

import ppp from '../../ppp.js';
import { observable, html, css, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../badge.js';
import '../button.js';
import {
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight2,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  themeConditional
} from '../../design/design-tokens.js';

export const iframeModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${when((x) => x.src, html` <iframe src="${(x) => x.src}"></iframe> `)}
    </form>
  </template>
`;

export const iframeModalPageStyles = css`
  ${pageStyles}
  iframe {
    width: calc(100% - 50px);
    height: 600px;
    margin: 0 25px 20px 25px;
    background: transparent;
    border-radius: 4px;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }
`;

export class IframeModalPage extends Page {
  @observable
  src;

  generateHtml(html) {
    const styles = `
      * {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
        color: ${ppp.darkMode ? paletteGrayLight3.$value : paletteBlack.$value};
      }

      a, a u {
        color: ${
          ppp.darkMode ? paletteBlueBase.$value : paletteBlueLight2.$value
        };
      }

      ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      ::-webkit-scrollbar-track-piece {
        background-color: ${
          ppp.darkMode ? paletteGrayDark3.$value : paletteGrayLight3.$value
        } !important;
      }

      ::-webkit-scrollbar-thumb:horizontal {
        background-color: ${
          ppp.darkMode
            ? `${paletteGrayLight1.$value}33`
            : `${paletteGrayDark1.$value}33`
        } !important;
      }

      ::-webkit-scrollbar-thumb:vertical {
        background-color: ${
          ppp.darkMode
            ? `${paletteGrayLight1.$value}33`
            : `${paletteGrayDark1.$value}33`
        } !important;
      }

      ::-webkit-scrollbar-corner {
        background-color: ${
          ppp.darkMode
            ? `${paletteGrayLight1.$value}33`
            : `${paletteGrayDark1.$value}33`
        } !important;
      }
    `;

    return URL.createObjectURL(
      new Blob(
        [
          `<!DOCTYPE html><head><title></title><style>${styles}</style></head><body>${html}</body>`
        ],
        {
          type: 'text/html; charset=utf-8'
        }
      )
    );
  }

  constructor() {
    super();

    this.src = this.generateHtml('<p>Подождите, пока страница загрузится.</p>');
  }
}

export default IframeModalPage.compose({
  template: iframeModalPageTemplate,
  styles: iframeModalPageStyles
}).define();
