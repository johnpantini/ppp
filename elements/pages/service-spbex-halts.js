import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import {
  documentPageFooterPartial,
  documentPageHeaderPartial,
  Page,
  pageStyles,
  PageWithService,
  PageWithSupabaseService
} from '../page.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { APIS, SERVICES } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

const exampleFormatterCode = `/**
 * Trading halt message formatter function.
 *
 * @param {string} isin - Instrument ISIN.
 * @param {string} ticker - Instrument ticker.
 * @param {string} name - Instrument name.
 * @param {string} currency - Instrument currency.
 * @param {string} date - Date and time of the exchange message.
 * @param {string} url - Link to the message on the exchange website.
 * @param {string} start - Trading halt start time, MSK.
 * @param {string} finish - Trading halt end time, MSK.
 */
return \`‼️⏸ Trading halt (SPBEX)
\${'$'}\${ticker || isin}
<b>\${name}, \${isin}</b>
🕒 \${start} - \${finish}

<a href="\${encodeURIComponent(url)}">Trading halt message</a>
\`;`;

export const serviceSpbexHaltsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$page.serviceName')}</h5>
          <p class="description">
            ${() => ppp.t('$page.arbitraryProfileName')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="${() => ppp.t('$page.enterName')}"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.supabaseApiProfile')}</h5>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('supabaseApiId')}
            value="${(x) => x.document.supabaseApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.supabaseApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.SUPABASE%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.supabaseApiId ?? ''%]` }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.SUPABASE}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            ${() => ppp.t('$serviceSpbexHaltsPage.addSupabaseApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.baseUrl')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.baseUrlDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="https://spbexchange.ru"
            value="${(x) => x.document.proxyURL}"
            ${ref('proxyURL')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.pusherIntegration')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.pusherIntegrationDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('pusherApiId')}
            deselectable
            placeholder="${() => ppp.t('$g.optionalClickToSelect')}"
            value="${(x) => x.document.pusherApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.pusherApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.PUSHER%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.pusherApiId ?? ''%]`
                          }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.PUSHER}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            ${() => ppp.t('$serviceSpbexHaltsPage.addPusherApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.pollingInterval')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.pollingIntervalDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="5"
            value="${(x) => x.document.interval ?? '5'}"
            ${ref('interval')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.storageDepth')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.storageDepthDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="10000"
            value="${(x) => x.document.depth ?? '10000'}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.bot')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.botDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('botId')}
            value="${(x) => x.document.botId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.bot ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('bots')
                  .find({
                    $or: [
                      { removed: { $ne: true } },
                      { _id: `[%#this.document.botId ?? ''%]` }
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
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.channelOrGroup')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSpbexHaltsPage.channelOrGroupDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="${() => ppp.t('$serviceSpbexHaltsPage.channelOrGroup')}"
            value="${(x) => x.document.channel}"
            ${ref('channel')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSpbexHaltsPage.notificationFormatting')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceSpbexHaltsPage.notificationFormattingDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-snippet
            revertable
            :code="${(x) => x.document.formatterCode ?? exampleFormatterCode}"
            ${ref('formatterCode')}
            @revert="${(x) => {
              x.formatterCode.updateCode(exampleFormatterCode);
            }}"
          ></ppp-snippet>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => true || !x.isSteady()}"
            @click="${(x) => x.sendTestSpbexHaltMessage()}"
            appearance="primary"
          >
            ${() => ppp.t('$serviceSpbexHaltsPage.sendTestMessage')}
          </ppp-button>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: ppp.t('$serviceSpbexHaltsPage.saveToPPPAndUpdateInSupabase'),
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const serviceSpbexHaltsPageStyles = css`
  ${pageStyles}
  ppp-snippet {
    height: 300px;
  }
`;

export class ServiceSpbexHaltsPage extends Page {
  collection = 'services';

  async #deploy() {}

  async validate() {}

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: 'spbex-halts'
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'supabaseApiId',
              foreignField: '_id',
              as: 'supabaseApi'
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'pusherApiId',
              foreignField: '_id',
              as: 'pusherApi'
            }
          },
          {
            $unwind: {
              path: '$pusherApi',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: '$supabaseApi'
          },
          {
            $lookup: {
              from: 'bots',
              localField: 'botId',
              foreignField: '_id',
              as: 'bot'
            }
          },
          {
            $unwind: '$bot'
          }
        ]);
    };
  }

  async find() {
    return {
      type: 'spbex-halts',
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return false;
  }
}

applyMixins(ServiceSpbexHaltsPage, PageWithService, PageWithSupabaseService);

// noinspection JSUnusedGlobalSymbols
export default ServiceSpbexHaltsPage.compose({
  template: serviceSpbexHaltsPageTemplate,
  styles: serviceSpbexHaltsPageStyles
}).define();
