/** @decorator */

import ppp from '../../ppp.js';
import {
  observable,
  html,
  css,
  ref,
  when
} from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const templateLibraryModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$templateLibraryModalPage.template')}</h5>
          <div class="spacing2"></div>
          <ppp-badge appearance="yellow">
            ${(x) => ppp.t(`$templateLibraryModalPage.hints.${x.hint}`)}
          </ppp-badge>
        </div>
        <div class="input-group">
          <ppp-select
            value="${(x) => x.template ?? 'psina-us-news'}"
            ${ref('templateSelector')}
          >
            <ppp-option value="psina-us-news">
              ${() => ppp.t('$templateLibraryModalPage.psinaUsNews')}
            </ppp-option>
            <ppp-option value="psina-us-statuses">
              ${() => ppp.t('$templateLibraryModalPage.psinaUsStatuses')}
            </ppp-option>
          </ppp-select>
        </div>
      </section>
      ${when(
        (x) => x.templateSelector.value === 'psina-us-news',
        html`
          <section>
            <div class="label-group">
              <h5>${() => ppp.t('$templateLibraryModalPage.sourceService')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$templateLibraryModalPage.selectNewsSourceService')}
              </p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('psinaUsNewsServiceId')}
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
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                          },
                          { workerPredefinedTemplate: 'psinaUsNews' },
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
          ${when(
            (x) => x.hint === 'formatter',
            html`
              <section>
                <div class="label-group">
                  <h5>
                    ${() =>
                      ppp.t(
                        '$templateLibraryModalPage.newsBodyExtractionService'
                      )}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$templateLibraryModalPage.newsBodyExtractionServiceDescription'
                      )}
                  </p>
                </div>
                <div class="input-group">
                  <ppp-query-select
                    ${ref('psinaUsNewsBodyExtractionServiceId')}
                    deselectable
                    placeholder="${() => ppp.t('$g.optionalClickToSelect')}"
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
                                type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
                              },
                              {
                                workerPredefinedTemplate:
                                  'psinaUsNewsBodyExtraction'
                              },
                              { removed: { $ne: true } }
                            ]
                          })
                          .sort({ updatedAt: -1 });
                      };
                    }}"
                    :transform="${() => ppp.decryptDocumentsTransformation()}"
                  ></ppp-query-select>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>
                    ${() => ppp.t('$templateLibraryModalPage.yandexOauthToken')}
                  </h5>
                  <p class="description">
                    ${() =>
                      ppp.t(
                        '$templateLibraryModalPage.yandexOauthTokenDescription'
                      )}
                  </p>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="password"
                    optional
                    placeholder="${() =>
                      ppp.t('$templateLibraryModalPage.yandexOauthToken')}"
                    ${ref('yandexToken')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
        `
      )}
      ${when(
        (x) => x.templateSelector.value === 'psina-us-statuses',
        html`
          <section>
            <div class="label-group">
              <h5>${() => ppp.t('$templateLibraryModalPage.sourceService')}</h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$templateLibraryModalPage.selectStatusesSourceService'
                  )}
              </p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('psinaUsStatusesServiceId')}
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
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                          },
                          { workerPredefinedTemplate: 'psinaUsNews' },
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
          ${() => ppp.t('$templateLibraryModalPage.insertTemplateCode')}
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
  hint;

  @observable
  template;

  baseUrl;

  destination;

  constructor() {
    super();

    this.hint = 'formatter';
  }

  async loadTemplate() {
    return await (
      await fetch(
        `${this.baseUrl}/templates/${this.template}/${this.hint}.js`,
        {
          cache: 'reload'
        }
      )
    ).text();
  }

  async submitDocument() {
    this.beginOperation();

    try {
      this.template = this.templateSelector.value;

      switch (this.template) {
        case 'psina-us-news':
          await validate(this.psinaUsNewsServiceId);

          break;

        case 'psina-us-statuses':
          await validate(this.psinaUsStatusesServiceId);

          break;
      }

      let code = await this.loadTemplate();

      switch (this.template) {
        case 'psina-us-news':
          code = code.replace(
            '@@SERVICE_ID',
            this.psinaUsNewsServiceId.datum()._id
          );

          if (this.hint === 'formatter') {
            let extractionEndpoint = '';
            const datum = this.psinaUsNewsBodyExtractionServiceId.datum();

            if (datum) {
              extractionEndpoint = `https://ppp-${datum._id}.${datum.subdomain}.workers.dev/`;
            }

            code = code
              .replace('@@YANDEX_TOKEN', this.yandexToken.value)
              .replace('@@EXTRACTION_ENDPOINT', extractionEndpoint);
          }

          break;

        case 'psina-us-statuses':
          code = code.replace(
            '@@SERVICE_ID',
            this.psinaUsStatusesServiceId.datum()._id
          );

          break;
      }

      if (typeof this.destination.updateCode === 'function') {
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
