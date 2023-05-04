/** @decorator */

import ppp from '../../ppp.js';
import {
  observable,
  html,
  css,
  ref,
  when
} from '../../vendor/fast-element.min.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../text-field.js';

export const templateLibraryModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Категория</h5>
          <p class="description">Выберите категорию шаблона.</p>
        </div>
        <div class="input-group">
          <ppp-select
            value="${(x) => x.template ?? 'thefly/formatter'}"
            ${ref('templateSelector')}
          >
            <ppp-option value="thefly/formatter">
              The Fly - форматирование
            </ppp-option>
            <ppp-option value="thefly/history">
              The Fly - загрузка истории
            </ppp-option>
          </ppp-select>
        </div>
      </section>
      ${when(
        (x) =>
          x.templateSelector.value === 'thefly/formatter' ||
          x.templateSelector.value === 'thefly/history',
        html`
          <section>
            <div class="label-group">
              <h5>Парсер The Fly</h5>
              <p class="description">Выберите сервис парсера.</p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('theflyServiceId')}
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('services')
                      .find({
                        $and: [
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SUPABASE_PARSER%]`
                          },
                          {
                            removed: { $ne: true }
                          }
                        ]
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
            </div>
          </section>
        `
      )}
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Вставить код по шаблону
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const templateLibraryModalPageStyles = css`
  ${pageStyles}
`;

export class TemplateLibraryModalPage extends Page {
  @observable
  template;

  baseUrl;

  destination;

  async loadTemplate() {
    return await (
      await fetch(`${this.baseUrl}/templates/${this.template}.js`, {
        cache: 'reload'
      })
    ).text();
  }

  async submitDocument() {
    this.beginOperation();

    try {
      switch (this.template) {
        case 'thefly/formatter':
        case 'thefly/history':
          await validate(this.theflyServiceId);

          break;
      }

      let code = await this.loadTemplate();

      switch (this.template) {
        case 'thefly/formatter':
        case 'thefly/history':
          code = code.replace('@@SERVICE_ID', this.theflyServiceId.datum()._id);

          break;
      }

      if (typeof this.destination.updateCode == 'function') {
        this.destination.updateCode(code);
      } else {
        this.destination.value = code;
      }

      this.destination.$emit('input');

      this.getRootNode().host.templateLibraryModal.setAttribute('hidden', '');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default TemplateLibraryModalPage.compose({
  template: templateLibraryModalPageTemplate,
  styles: templateLibraryModalPageStyles
}).define();
