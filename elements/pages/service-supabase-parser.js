import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
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
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { Tmpl } from '../../lib/tmpl.js';
import { parsePPPScript } from '../../lib/ppp-script.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  themeConditional
} from '../../design/design-tokens.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const predefinedParserData = {
  default: {
    url: '/lib/supabase-parser/default-parser.js',
    tableSchema: `title text primary key,
description text not null,
pub_date text not null,
link text not null`,
    constsCode: 'return [];',
    parsingCode: await (
      await fetch(`${ppp.rootUrl}/lib/supabase-parser/default-parser.js`)
    ).text(),
    insertTriggerCode: `/**
 * @constant {string} TABLE_NAME - State table name.
 */
void 0;`,
    deleteTriggerCode: `/**
 * @constant {string} TABLE_NAME - State table name.
 */
void 0;`,
    formatterCode: `/**
 * Formatter function for a message about a new record in the state table.
 *
 * @param {json} record - The record inserted into the state table.
 * @var consts - Static data generated when the service is saved.
 */
const formatDateTime = (pubDate) => {
  const [date, timeZ] = new Date(Date.parse(pubDate || new Date()))
    .toISOString()
    .split(/T/);
  const [y, m, d] = date.split(/-/);
  const [time] = timeZ.split(/\\./);

  return \`\${d}.\${m}.\${y} \${time} UTC\`;
};

return \`⏰ \${formatDateTime(record.pub_date)}
<b><a href="\${encodeURIComponent(record.link)}">\${encodeURIComponent(record.title)}</a></b>

\${encodeURIComponent(record.description)}\`;`
  },
  thefly: {
    url: '/lib/supabase-parser/thefly.js',
    tableSchema: `title text primary key,
tickers text,
topic text,
date text not null,
priority bool not null,
link text`,
    constsCode: 'return [];',
    insertTriggerCode: `/**
 * @constant {string} TABLE_NAME - State table name.
 */
void 0;`,
    deleteTriggerCode: `/**
 * @constant {string} TABLE_NAME - State table name.
 */
void 0;`,
    formatterCode: `const formatDateTime = (pubDate) => {
  const [date, timeZ] = new Date(Date.parse(pubDate || new Date()))
    .toISOString()
    .split(/T/)
  const [y, m, d] = date.split(/-/)
  const [time] = timeZ.split(/\\./)

  return \`\${d}.\${m}.\${y} \${time} MSK\`
}

const formatTitle = (record) => {
  let icon = '🐝'

  switch (record.topic) {
    case 'events':
      icon = '📅'

      break
    case 'recomm':
      icon = '👍'

      break
    case 'recDowngrade':
      icon = '⬇️'

      break
    case 'recUpgrade':
      icon = '⬆️'

      break
    case 'periodicals':
      icon = '📰'

      break
    case 'options':
      icon = '🅾️'

      break
    case 'general_news':
      icon = '🌎'

      break
    case 'hot_stocks':
      icon = '🔥'

      break
    case 'earnings':
      icon = '💰'

      break
    case 'syndic':
      break
    case 'technical_analysis':
      icon = '💹'

      break
  }

  if (record.priority) icon = '‼️' + icon

  if (record.tickers.trim())
    return (
      icon +
      ' ' +
      record.tickers
        .split(',')
        .map((ticker) => {
          if (ticker.startsWith('$')) return ticker

          return '$' + ticker
        })
        .join(' ')
    )

  return icon + ' The Fly'
}

const options = {
  disable_web_page_preview: true
}

if (record.tickers.trim()) {
  options.reply_markup = JSON.stringify({
    inline_keyboard: [
      record.tickers
        .split(',')
        .filter((ticker) => {
          return ticker !== '$ECON' && consts.indexOf(ticker) > -1
        })
        .slice(0, 5)
        .map((t) => {
          if (t === 'SPB') t = 'SPB@US'

          return {
            text: t,
            callback_data: JSON.stringify({
              e: 'ticker',
              t
            })
          }
        })
    ]
  })
}

return {
  text: \`\${formatTitle(record)}
⏰ \${formatDateTime(record.date)}
<b><a href="\${encodeURIComponent(record.link)}">\${encodeURIComponent(
      record.title
    )}</a></b>\`,
  options
}`
  }
};

export const serviceSupabaseParserPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      ${when(
        (x) => x.document.frameUrl,
        html` <iframe
          src="${(x) => x.document.frameUrl}"
          width="100%"
          height="667"
        ></iframe>`
      )}
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
          <h5>${() => ppp.t('$serviceSupabaseParserPage.supabaseApiProfile')}</h5>
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
            ${() => ppp.t('$serviceSupabaseParserPage.addSupabaseApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSupabaseParserPage.pusherIntegration')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceSupabaseParserPage.pusherIntegrationDescription')}
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
            ${() => ppp.t('$serviceSupabaseParserPage.addPusherApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSupabaseParserPage.resource')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSupabaseParserPage.resourceDescription')}
          </p>
          <div>
            <ppp-select
              placeholder="${() =>
                ppp.t('$serviceSupabaseParserPage.selectTemplate')}"
              ${ref('urlTemplateSelect')}
            >
              <ppp-option value="thefly">
                ${() => ppp.t('$serviceSupabaseParserPage.theflyNews')}
              </ppp-option>
            </ppp-select>
            ${when(
              (x) => x.urlTemplateSelect.value === 'thefly',
              html`
                <ppp-query-select
                  ${ref('cloudflareWorkerSelector')}
                  :context="${(x) => x}"
                  :placeholder="${() =>
                    ppp.t('$serviceSupabaseParserPage.clickToSelectService')}"
                  :query="${() => {
                    return (context) => {
                      return context.services
                        .get('mongodb-atlas')
                        .db('ppp')
                        .collection('services')
                        .find({
                          $and: [
                            { removed: { $ne: true } },
                            { sourceCode: { $regex: 'thefly\\.com' } },
                            {
                              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.CLOUDFLARE_WORKER%]`
                            }
                          ]
                        })
                        .sort({ updatedAt: -1 });
                    };
                  }}"
                  :transform="${() => ppp.decryptDocumentsTransformation()}"
                ></ppp-query-select>
              `
            )}
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.urlTemplateSelect.value}"
              appearance="primary"
              @click="${(x) =>
                x.generateUrlByTemplate(x.urlTemplateSelect.value)}"
            >
              ${() => ppp.t('$serviceSupabaseParserPage.insertUrlByTemplate')}
            </ppp-button>
          </div>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.url}"
            ${ref('url')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSupabaseParserPage.frame')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSupabaseParserPage.frameDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            type="url"
            placeholder="https://example.com"
            value="${(x) => x.document.frameUrl}"
            ${ref('frameUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceSupabaseParserPage.pollingInterval')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceSupabaseParserPage.pollingIntervalDescription')}
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
          <h5>${() => ppp.t('$serviceSupabaseParserPage.storageDepth')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceSupabaseParserPage.storageDepthDescription')}
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
        <div class="implementation-area">
          <div class="label-group full" style="min-width: 600px">
            <h5>${() => ppp.t('$serviceSupabaseParserPage.parsingFunction')}</h5>
            <p class="description">
              ${() =>
                ppp.t('$serviceSupabaseParserPage.parsingFunctionDescription')}
            </p>
            <ppp-snippet
              style="height: 1378px"
              :code="${(x) =>
                x.document.parsingCode ??
                predefinedParserData.default.parsingCode}"
              ${ref('parsingCode')}
            ></ppp-snippet>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.isSteady()}"
              @click="${(x) => x.callParsingFunction()}"
              appearance="primary"
            >
              ${() => ppp.t('$serviceSupabaseParserPage.callFunction')}
            </ppp-button>
          </div>
          <div class="control-stack">
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.versioning')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.versioningDescription')}
              </p>
              <ppp-checkbox
                ?checked="${(x) => x.document.useVersioning ?? false}"
                @change="${(x) => {
                  if (!x.useVersioning.checked)
                    x.versioningUrl.appearance = 'default';
                }}"
                ${ref('useVersioning')}
              >
                ${() => ppp.t('$serviceSupabaseParserPage.trackVersionByFile')}
              </ppp-checkbox>
              <ppp-text-field
                ?disabled="${(x) => !x.useVersioning.checked}"
                placeholder="${() =>
                  ppp.t('$serviceSupabaseParserPage.enterLink')}"
                value="${(x) => x.document.versioningUrl ?? ''}"
                ${ref('versioningUrl')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>
                ${() => ppp.t('$serviceSupabaseParserPage.predefinedTemplates')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$serviceSupabaseParserPage.predefinedTemplatesDescription'
                  )}
              </p>
              <ppp-select
                value="${(x) =>
                  x.document.parserPredefinedTemplate ?? 'default'}"
                ${ref('parserPredefinedTemplate')}
              >
                <ppp-option value="default">
                  ${() => ppp.t('$serviceSupabaseParserPage.defaultTemplate')}
                </ppp-option>
                <ppp-option value="thefly">
                  ${() => ppp.t('$serviceSupabaseParserPage.theflyNews')}
                </ppp-option>
              </ppp-select>
              <div class="spacing2"></div>
              <ppp-button
                @click="${(x) => x.fillOutParserFormsWithTemplate()}"
                appearance="primary"
              >
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.fillOutFormsWithTemplate')}
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.tableSchema')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.tableSchemaDescription')}
              </p>
              <ppp-snippet
                style="height: 150px"
                ?disabled="${(x) =>
                  x.document.tableSchema && !x.document.removed}"
                :code="${(x) =>
                  x.document.tableSchema ??
                  predefinedParserData.default.tableSchema}"
                ${ref('tableSchema')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.constsData')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.constsDataDescription')}
              </p>
              <ppp-snippet
                style="height: 256px"
                :code="${(x) =>
                  x.document.constsCode ??
                  predefinedParserData.default.constsCode}"
                ${ref('constsCode')}
              ></ppp-snippet>
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) => !x.isSteady()}"
                @click="${(x) => x.callConstsFunction()}"
                appearance="primary"
              >
                ${() => ppp.t('$serviceSupabaseParserPage.callFunction')}
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.insertTrigger')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.insertTriggerDescription')}
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.insertTriggerCode ??
                  predefinedParserData.default.insertTriggerCode}"
                ${ref('insertTriggerCode')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.deleteTrigger')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.deleteTriggerDescription')}
              </p>
              <ppp-snippet
                style="height: 150px"
                :code="${(x) =>
                  x.document.deleteTriggerCode ??
                  predefinedParserData.default.deleteTriggerCode}"
                ${ref('deleteTriggerCode')}
              ></ppp-snippet>
            </div>
            <div class="label-group full">
              <ppp-checkbox
                ?checked="${(x) => x.document.telegramEnabled ?? false}"
                ${ref('telegramEnabled')}
              >
                ${() => ppp.t('$serviceSupabaseParserPage.alsoSendToTelegram')}
              </ppp-checkbox>
              <div class="spacing2"></div>
              <h5>${() => ppp.t('$serviceSupabaseParserPage.bot')}</h5>
              <p class="description">
                ${() => ppp.t('$serviceSupabaseParserPage.botDescription')}
              </p>
              <ppp-query-select
                ${ref('botId')}
                ?disabled="${(x) => !x.telegramEnabled.checked}"
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
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                @click="${() =>
                  ppp.app.mountPage('bot', {
                    size: 'xlarge',
                    adoptHeader: true
                  })}"
                appearance="primary"
              >
                ${() => ppp.t('$serviceSupabaseParserPage.addBot')}
              </ppp-button>
            </div>
            <div class="label-group full">
              <h5>${() => ppp.t('$serviceSupabaseParserPage.channelOrGroup')}</h5>
              <p class="description">
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.channelOrGroupDescription')}
              </p>
              <ppp-text-field
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                type="number"
                placeholder="${() =>
                  ppp.t('$serviceSupabaseParserPage.channelOrGroup')}"
                value="${(x) => x.document.channel}"
                ${ref('channel')}
              ></ppp-text-field>
            </div>
            <div class="label-group full">
              <h5>
                ${() =>
                  ppp.t('$serviceSupabaseParserPage.notificationFormatting')}
              </h5>
              <p class="description">
                ${() =>
                  ppp.t(
                    '$serviceSupabaseParserPage.notificationFormattingDescription'
                  )}
              </p>
              <ppp-snippet
                style="height: 256px"
                ?disabled="${(x) => !x.telegramEnabled.checked}"
                :code="${(x) =>
                  x.document.formatterCode ??
                  predefinedParserData.default.formatterCode}"
                ${ref('formatterCode')}
              ></ppp-snippet>
              <div class="spacing2"></div>
              <ppp-button
                ?disabled="${(x) =>
                  !x.telegramEnabled.checked || !x.isSteady()}"
                @click="${(x) => x.sendTestMessage()}"
                appearance="primary"
              >
                ${() => ppp.t('$serviceSupabaseParserPage.sendTestMessage')}
              </ppp-button>
            </div>
          </div>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: ppp.t('$serviceSupabaseParserPage.saveToPPPAndUpdateInSupabase'),
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const serviceSupabaseParserPageStyles = css`
  ${pageStyles}
  iframe {
    background: transparent;
    margin-top: 15px;
    border-radius: 4px;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }
`;

export class ServiceSupabaseParserPage extends Page {
  collection = 'services';

  async connectedCallback() {
    await super.connectedCallback();

    return this.checkVersion();
  }

  async callConstsFunction() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.constsCode);
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value
      });

      this.showSuccessNotification(
        ppp.t('$serviceSupabaseParserPage.functionExecutedSeeConsole')
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async fillOutParserFormsWithTemplate() {
    this.beginOperation();

    try {
      const data = predefinedParserData[this.parserPredefinedTemplate.value];

      try {
        const contentsResponse = await fetch(
          ppp.getWorkerTemplateFullUrl(data.url).toString(),
          {
            cache: 'reload'
          }
        );

        await maybeFetchError(
          contentsResponse,
          ppp.t('$serviceSupabaseParserPage.couldNotLoadTemplateFile')
        );

        this.parsingCode.updateCode(await contentsResponse.text());

        if (!this.document._id || this.document.removed) {
          this.tableSchema.updateCode(data.tableSchema);
        }

        this.constsCode.updateCode(data.constsCode);
        this.insertTriggerCode.updateCode(data.insertTriggerCode);
        this.deleteTriggerCode.updateCode(data.deleteTriggerCode);
        this.formatterCode.updateCode(data.formatterCode);

        this.versioningUrl.value = data.url;
        this.useVersioning.checked = true;

        this.showSuccessNotification(
          ppp.t('$serviceSupabaseParserPage.templateLoaded', {
            name: this.parserPredefinedTemplate.displayValue.trim()
          })
        );
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: ppp.t('$serviceSupabaseParserPage.invalidUrl'),
          raiseException: true
        });
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async callParsingFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.parsingCode);
      await validate(this.constsCode);

      this.document.url = this.url.value.trim();
      this.document.frameUrl = this.frameUrl.value.trim();

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const result = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: `const consts = ${JSON.stringify(consts)};
          ${this.parsingCode.value}
        `,
        returnResult,
        extraSQL: `
          ${await fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text())}
          ${await fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) =>
            r.text()
          )}
        `
      });

      if (!returnResult)
        this.showSuccessNotification(
          ppp.t('$serviceSupabaseParserPage.functionExecutedSeeConsole')
        );

      return result;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async sendTestMessage() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const [firstRecord] = await this.callParsingFunction(true);

      if (!firstRecord) {
        console.log(firstRecord);

        invalidate(ppp.app.toast, {
          errorMessage: ppp.t(
            '$serviceSupabaseParserPage.parsingResultNotSuitable'
          ),
          raiseException: true
        });
      }

      // Once again
      this.beginOperation();

      const temporaryFormatterName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFormatterBody = `function ${temporaryFormatterName}(record) {
        const closure = () => {${this.formatterCode.value}};
        const formatted = closure();

        if (typeof formatted === 'string')
          return \`chat_id=${this.channel.value}&text=\${formatted.replace(/'/g, '%27')}&parse_mode=html\`;
        else {
          const options = formatted.options || {};
          let formData = \`chat_id=${this.channel.value}&text=\${formatted.text.replace(/'/g, '%27')}\`;

          if (typeof options.parse_mode === 'undefined')
            formData += '&parse_mode=html';

          if (typeof options.entities !== 'undefined')
            formData += \`&entities=\${encodeURIComponent(options.entities)}\`;

          if (options.disable_web_page_preview === true)
            formData += '&disable_web_page_preview=true';

          if (options.disable_notification === true)
            formData += '&disable_notification=true';

          if (options.protect_content === true)
            formData += '&protect_content=true';

          if (typeof options.reply_markup !== 'undefined')
            formData += \`&reply_markup=\${encodeURIComponent(options.reply_markup)}\`;

          return formData;
        }
      }`;

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const functionBody = `${temporaryFormatterBody}
        const record = ${JSON.stringify(firstRecord)};
        const consts = ${JSON.stringify(consts)};

        plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
          this.botId.datum().token
        }/sendMessage',
        '\${${temporaryFormatterName}(record)}',
        'application/x-www-form-urlencoded')\`);`;

      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody
      });

      this.showSuccessNotification(
        ppp.t('$serviceSupabaseParserPage.messageSent')
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async generateUrlByTemplate(template) {
    switch (template) {
      case 'thefly': {
        await validate(this.cloudflareWorkerSelector);

        const datum = this.cloudflareWorkerSelector.datum();
        const url = `https://ppp-${datum._id}.${datum.subdomain}.workers.dev/news.php`;

        this.document.url = url;
        this.url.value = url;

        break;
      }
    }
  }

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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SUPABASE_PARSER%]`
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
            $unwind: '$supabaseApi'
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
            $lookup: {
              from: 'bots',
              localField: 'botId',
              foreignField: '_id',
              as: 'bot'
            }
          },
          {
            $unwind: {
              path: '$bot',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SUPABASE_PARSER,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async #deploySupabaseParser() {
    this.document.supabaseApi = this.supabaseApiId.datum();
    this.document.pusherApi = this.pusherApiId.datum();
    this.document.bot = this.botId.datum();

    const [sendTelegramMessage, pppXmlParse, pppFetch, deployParser] =
      await Promise.all([
        fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) =>
          r.text()
        ),
        fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl(`${SERVICES.SUPABASE_PARSER}/deploy.sql`)).then(
          (r) => r.text()
        )
      ]);

    this.document.consts = JSON.stringify(
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      })
    );

    const query = `${sendTelegramMessage}
      ${pppXmlParse}
      ${pppFetch}
      ${await new Tmpl().render(this, deployParser, {})}`;

    await this.executeSQL({
      api: this.document.supabaseApi,
      query: await new Tmpl().render(this, query, {})
    });
  }

  async validate() {
    await validate(this.name);
    await validate(this.supabaseApiId);
    await validate(this.interval);
    await validate(this.interval, {
      hook: async (value) => +value > 0 && +value <= 1000,
      errorMessage: ppp.t('$page.valueInRange', { min: 1, max: 1000 })
    });
    await validate(this.depth);
    await validate(this.depth, {
      hook: async (value) => +value >= 30 && +value <= 1000000,
      errorMessage: ppp.t('$page.valueInRange', { min: 30, max: 1000000 })
    });

    if (this.useVersioning.checked) {
      await validate(this.versioningUrl);

      // URL validation
      try {
        ppp.getWorkerTemplateFullUrl(this.versioningUrl.value);
      } catch (e) {
        invalidate(this.versioningUrl, {
          errorMessage: ppp.t('$serviceSupabaseParserPage.invalidUrl'),
          raiseException: true
        });
      }
    }

    await validate(this.parsingCode);
    await validate(this.tableSchema);
    await validate(this.constsCode);
    await validate(this.insertTriggerCode);
    await validate(this.deleteTriggerCode);

    if (this.telegramEnabled.checked) {
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);
    } else {
      this.botId.appearance = 'default';
      this.channel.appearance = 'default';
      this.formatterCode.appearance = 'default';
    }
  }

  async submit() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;
    let version = 1;
    const parsed = parsePPPScript(this.parsingCode.value);

    if (parsed) {
      [version] = parsed?.meta?.version ?? [1];
      version = Math.abs(+version) || 1;
    }

    if (this.useVersioning.checked) {
      if (!parsed || typeof version !== 'number') {
        invalidate(this.parsingCode, {
          errorMessage: ppp.t('$page.couldNotReadVersion'),
          raiseException: true
        });
      }
    }

    if (typeof version !== 'number') {
      version = 1;
    }

    return [
      {
        $set: {
          name: this.name.value.trim(),
          supabaseApiId: this.supabaseApiId.value,
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim(),
          pusherApiId: this.pusherApiId.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          tableSchema: this.tableSchema.value,
          constsCode: this.constsCode.value,
          parsingCode: this.parsingCode.value,
          insertTriggerCode: this.insertTriggerCode.value,
          deleteTriggerCode: this.deleteTriggerCode.value,
          telegramEnabled: this.telegramEnabled.checked,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          parserPredefinedTemplate: this.parserPredefinedTemplate.value,
          version,
          useVersioning: this.useVersioning.checked,
          versioningUrl: this.versioningUrl.value.trim(),
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SUPABASE_PARSER,
          createdAt: new Date()
        }
      },
      this.#deploySupabaseParser,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }

  async update() {
    const data = predefinedParserData[this.parserPredefinedTemplate.value];
    const contentsResponse = await fetch(
      ppp.getWorkerTemplateFullUrl(data.url).toString(),
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      contentsResponse,
      ppp.t('$serviceSupabaseParserPage.couldNotLoadTemplateFile')
    );

    this.parsingCode.updateCode(await contentsResponse.text());
    this.constsCode.updateCode(data.constsCode);
    this.insertTriggerCode.updateCode(data.insertTriggerCode);
    this.deleteTriggerCode.updateCode(data.deleteTriggerCode);
    this.formatterCode.updateCode(data.formatterCode);
  }
}

applyMixins(
  ServiceSupabaseParserPage,
  PageWithService,
  PageWithSupabaseService
);

export default ServiceSupabaseParserPage.compose({
  template: serviceSupabaseParserPageTemplate,
  styles: serviceSupabaseParserPageStyles
}).define();
