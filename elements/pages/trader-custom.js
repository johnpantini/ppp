/** @decorator */

import {
  html,
  css,
  ref,
  observable,
  when
} from '../../vendor/fast-element.min.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { invalidate, validate, ValidationError } from '../../lib/ppp-errors.js';
import { traderNameAndRuntimePartial } from './trader.js';
import '../button.js';
import '../text-field.js';

export const traderCustomPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>Ссылка на реализацию трейдера</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => x.document.url || x.traderPageDefinition}"
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.url}"
            ${ref('url')}
          ></ppp-text-field>
        </div>
      </section>
      ${when(
        (x) => x.traderPageDefinition,
        html`
          ${(x) => x.traderPageDefinition.template}
          ${documentPageFooterPartial()}
        `
      )}
      ${when(
        (x) => !x.traderPageDefinition,
        html`
          ${(x) => x.traderPageDefinition}
          <footer>
            <ppp-button
              appearance="primary"
              @click="${(x) => x.loadTraderPageDefinition()}"
            >
              Продолжить
            </ppp-button>
          </footer>
        `
      )}
    </form>
  </template>
`;

export const traderCustomPageStyles = css`
  ${pageStyles}
`;

export class TraderCustomPage extends Page {
  collection = 'traders';

  @observable
  traderPageDefinition;

  async loadTraderPageDefinition(url) {
    this.beginOperation();

    try {
      if (!url) {
        await validate(this.name);
        await validate(this.url);
      }

      let traderUrl;

      try {
        traderUrl = new URL(url ?? this.url.value);
      } catch (e) {
        invalidate(this.url, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }

      try {
        const module = await import(traderUrl.toString());

        if (typeof module.traderPageDefinition !== 'function') {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError({
            element: this.url
          });
        } else {
          const hasDefinition =
            typeof this.traderPageDefinition !== 'undefined';

          if (!hasDefinition) {
            this.traderPageDefinition = await module.traderPageDefinition(this);
            this.traderPageDefinition.styles.addStylesTo(this);

            TraderCustomPage.prototype.read =
              this.traderPageDefinition.pageClass.prototype.read;

            TraderCustomPage.prototype.find =
              this.traderPageDefinition.pageClass.prototype.find;

            TraderCustomPage.prototype.validate =
              this.traderPageDefinition.pageClass.prototype.validate;

            TraderCustomPage.prototype.submit =
              this.traderPageDefinition.pageClass.prototype.submit;
          }
        }
      } catch (e) {
        invalidate(this.url, {
          errorMessage: 'Этот URL не может быть загружен',
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e, 'Загрузка трейдера по ссылке');
    } finally {
      this.endOperation();
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (this.document.url) {
      return this.loadTraderPageDefinition(this.document.url);
    }
  }
}

export default TraderCustomPage.compose({
  template: traderCustomPageTemplate,
  styles: traderCustomPageStyles
}).define();
