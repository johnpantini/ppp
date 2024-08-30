/** @decorator */

import {
  html,
  css,
  ref,
  observable,
  when
} from '../../vendor/fast-element.min.js';
import {
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { invalidate, validate, ValidationError } from '../../lib/ppp-errors.js';
import { traderNameAndRuntimePartial, TraderCommonPage } from './trader.js';
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

export class TraderCustomPage extends TraderCommonPage {
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
          errorMessage: 'Этот URL не может быть использован',
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

            TraderCustomPage.prototype.getCaps =
              this.traderPageDefinition.pageClass.prototype.getCaps;

            TraderCustomPage.prototype.getDefaultCaps =
              TraderCustomPage.prototype.getCaps;

            TraderCustomPage.prototype.read =
              this.traderPageDefinition.pageClass.prototype.read;

            TraderCustomPage.prototype.find =
              this.traderPageDefinition.pageClass.prototype.find;

            TraderCustomPage.prototype.validate = async function () {
              await TraderCommonPage.prototype.validate.call(this);

              return this.traderPageDefinition.pageClass.prototype.validate.call(
                this
              );
            };

            TraderCustomPage.prototype.submit = async function () {
              return this.traderPageDefinition.pageClass.prototype.submit.call(
                this,
                await TraderCommonPage.prototype.submit.call(this)
              );
            };

            if (
              typeof this.traderPageDefinition.pageClass.prototype
                .loadedCallback === 'function'
            ) {
              await this.traderPageDefinition.pageClass.prototype.loadedCallback.call(
                this
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
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
    // Get the URL first.
    const documentId = await this.documentId();
    const rawDocument = await ppp.decrypt(
      await ppp.user.functions.findOne(
        { collection: this.collection },
        {
          _id: documentId
        }
      )
    );

    if (rawDocument.url) {
      await this.loadTraderPageDefinition(rawDocument.url);
    }

    return super.connectedCallback();
  }
}

export default TraderCustomPage.compose({
  template: traderCustomPageTemplate,
  styles: traderCustomPageStyles
}).define();
