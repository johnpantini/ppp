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
import { OrderCommonPage } from './order.js';
import { invalidate, validate, ValidationError } from '../../lib/ppp-errors.js';
import '../button.js';
import '../text-field.js';

export const orderCustomPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название шаблона</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Заявка"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Базовая ссылка на директорию заявки</h5>
          <p class="description">
            Ссылка на директорию на сервере, где находятся файлы реализации
            заявки.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            ?disabled="${(x) => x.document.baseUrl || x.orderPageDefinition}"
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.baseUrl}"
            ${ref('baseUrl')}
          ></ppp-text-field>
        </div>
      </section>
      ${when(
        (x) => x.orderPageDefinition,
        html`
          ${(x) => x.orderPageDefinition.template}
          ${documentPageFooterPartial()}
        `
      )}
      ${when(
        (x) => !x.orderPageDefinition,
        html`
          ${(x) => x.orderPageDefinition}
          <footer>
            <ppp-button
              appearance="primary"
              @click="${(x) => x.loadOrderPageDefinition()}"
            >
              Продолжить
            </ppp-button>
          </footer>
        `
      )}
    </form>
  </template>
`;

export const orderCustomPageStyles = css`
  ${pageStyles}
`;

export class OrderCustomPage extends Page {
  collection = 'orders';

  @observable
  orderPageDefinition;

  async loadOrderPageDefinition(url) {
    this.beginOperation();

    try {
      if (!url) {
        await validate(this.name);
        await validate(this.baseUrl);
      }

      let orderBaseUrl;

      try {
        orderBaseUrl = `${new URL(
          url ??
            (this.baseUrl.value.endsWith('/')
              ? this.baseUrl.value
              : this.baseUrl.value + '/')
        ).toString()}page.js`;
      } catch (e) {
        invalidate(this.baseUrl, {
          errorMessage: 'Этот URL не может быть использован',
          raiseException: true
        });
      }

      try {
        const module = await import(orderBaseUrl.toString());

        if (typeof module.orderPageDefinition !== 'function') {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError({
            element: this.baseUrl
          });
        } else {
          const hasDefinition = typeof this.orderPageDefinition !== 'undefined';

          if (!hasDefinition) {
            this.orderPageDefinition = await module.orderPageDefinition(this);
            this.orderPageDefinition.styles.addStylesTo(this);

            OrderCustomPage.prototype.read =
              this.orderPageDefinition.pageClass.prototype.read;

            OrderCustomPage.prototype.find =
              this.orderPageDefinition.pageClass.prototype.find;

            OrderCustomPage.prototype.validate ==
              async function () {
                await OrderCommonPage.prototype.validate.call(this);

                return this.traderPageDefinition.pageClass.prototype.validate.call(
                  this
                );
              };

            OrderCustomPage.prototype.submit = async function () {
              return this.orderPageDefinition.pageClass.prototype.submit.call(
                this,
                await OrderCommonPage.prototype.submit.call(this)
              );
            };

            if (
              typeof this.orderPageDefinition.pageClass.prototype
                .loadedCallback === 'function'
            ) {
              await this.orderPageDefinition.pageClass.prototype.loadedCallback.call(
                this
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
        invalidate(this.baseUrl, {
          errorMessage: 'Этот URL не может быть загружен',
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e, 'Загрузка шаблона заявки по ссылке');
    } finally {
      this.endOperation();
    }
  }

  async connectedCallback() {
    // Get the URL first.
    await this.readDocument();

    if (this.document.baseUrl) {
      if (!this.document.baseUrl.endsWith('/')) {
        this.document.baseUrl += '/';
      }

      await this.loadOrderPageDefinition(this.document.baseUrl);
    }

    return super.connectedCallback();
  }
}

export default OrderCustomPage.compose({
  template: orderCustomPageTemplate,
  styles: orderCustomPageStyles
}).define();
