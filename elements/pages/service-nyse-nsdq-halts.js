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
import { validate } from '../../lib/ppp-errors.js';
import { Tmpl } from '../../lib/tmpl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../snippet.js';
import '../terminal.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

const exampleSymbolsCodeAll = `/**
 * An empty array means all tickers are tracked.
 *
 */
return [];`;

const exampleFormatterCode = `/**
 * Trading halt message formatter function.
 *
 * @param {string} halt_date - Trading halt start date (MM/DD/YYYY).
 * @param {string} halt_time - Trading halt time (Eastern Time).
 * @param {string} symbol - Instrument ticker.
 * @param {string} name - Instrument name.
 * @param {string} market - Instrument listing market.
 * @param {string} reason_code - Trading halt code.
 * @param {string} pause_threshold_price - Indicative trading halt threshold price.
 * @param {string} resumption_date - Trading halt end date (MM/DD/YYYY).
 * @param {string} resumption_quote_time - Order book opening time (Eastern Time).
 * @param {string} resumption_trade_time - Trading resumption time (Eastern Time).
 */
const mappings = {
  T1: 'Halt - News Pending. News is expected.',
  T2: 'Halt - News Released. The issuer is starting the news dissemination process in accordance with fair disclosure requirements (SEC Regulation FD).',
  T5: 'Single Stock Trading Pause in Effect. The instrument price has changed by 10% or more within 5 minutes.',
  T6: 'Halt - Extraordinary Market Activity. Unusual market activity. Triggered when NASDAQ detects problems (that may affect the price) with quoting, trade reporting, or connectivity.',
  T8: 'Halt - Exchange-Traded-Fund (ETF). Triggered for an ETF when problems are detected in the underlying assets.',
  T12: 'Halt - Additional Information Requested by NASDAQ. Triggered when NASDAQ is awaiting additional information (the issuer is sent questions it must answer).',
  H4: 'Halt - Non-compliance. Non-compliance with NASDAQ listing requirements.',
  H9: 'Halt - Not Current. The company has not filed a current report with the regulators (SEC).',
  H10: 'Halt - SEC Trading Suspension. The SEC has suspended trading indefinitely.',
  H11: 'Halt - Regulatory Concern. Trading is halted in another market center at the request of the regulators. The halt may last for days or weeks.',
  O1: 'Operations Halt, Contact Market Operations. Market-making problems (issues with posting quotes and processing orders of trading participants).',
  IPO1: 'HIPO Issue not yet Trading. Problems with trading of instruments going through an IPO (on the first trading day). IPO trading starts several hours after the main session opens.',
  M1: 'Corporate Action. Corporate action.',
  M2: 'Quotation Not Available. No quotes available for the instrument.',
  LUDP: 'Volatility Trading Pause. Volatility trading pause.',
  LUDS: 'Volatility Trading Pause - Straddle Condition. A pause triggered when the bid or ask quote moves outside the allowed bands.',
  MWC1: 'Market Wide Circuit Breaker Halt. Trading halted due to a market-wide circuit breaker.',
  MWC2: 'Market Wide Circuit Breaker Halt. Trading halted due to a market-wide circuit breaker.',
  MWC3: 'Market Wide Circuit Breaker Halt. Trading halted due to a market-wide circuit breaker.',
  MWC0: 'Market Wide Circuit Breaker Halt. Trading halted due to a market-wide circuit breaker.',
  T3: 'News and Resumption Times. The issuer has finished disseminating news; trading is expected to resume shortly.',
  T7: 'Single Stock Trading Pause/Quotation-Only Period. See code T5.',
  R4: 'Qualifications Issues Reviewed/Resolved; Quotations/Trading to Resume. See code H4.',
  R9: 'Filing Requirements Satisfied/Resolved; Quotations/Trading To Resume. See code H9.',
  C3: 'Issuer News Not Forthcoming; Quotations/Trading To Resume. News publication has been cancelled. See codes T2 and T3.',
  C4: 'Qualifications Halt Ended; Maintenance Requirements Met. See codes H4 and R4.',
  C9: 'Qualifications Halt Concluded; Filings Met; Quotes/Trades To Resume. See codes H9 and R9.',
  C11: 'Trade Halt Concluded By Other Regulatory Auth.; Quotes/Trades Resume. See code H11.',
  R1: 'New Issue Available. See code T1.',
  R2: 'Issue Available. See code T2.',
  IPOQ: 'IPO security released for quotation. For instruments on their IPO day - quotation start. NASDAQ only.',
  IPOE: 'IPO security - positioning window extension. Extension of the order entry period in the NASDAQ cross session for instruments on their IPO day.',
  MWCQ: 'Market Wide Circuit Breaker Resumption. Market-wide circuit breaker lifted.',
  M: 'Volatility Trading Pause. Volatility trading pause.',
  D: 'Security deletion from NASDAQ / CQS. The instrument has been removed from trading (delisting).'
};
const formatDateTime = (dateString) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch = firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember = firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);
  const isDST = currentDate.getTime() <= end.getTime() && currentDate.getTime() >= start.getTime();
  const [date, timeZ] = new Date(\`\${dateString} GMT-\${isDST ? '7' : '8'}\`)
    .toISOString()
    .split(/T/);
  const [y, m, d] = date.split(/-/);
  const [time] = timeZ.split(/\\./);

  return \`\${d}.\${m}.\${y} \${time} MSK\`;
};

let message = \`‼️⏸ Trading halt (\${market})
\${'\$'}\${symbol}
<b>\${name}</b>
🕒 \${formatDateTime(\`\${halt_date} \${halt_time}\`)}

\`;

const description = mappings[reason_code];

if (description) message += \`<b>Code \${reason_code}</b>: \${description}\\n\`;
else message += \`<b>Awaiting code</b>\\n\`;

if (resumption_quote_time)
  message += \`\\nOrder book opens: \${formatDateTime(
    \`\${resumption_date} \${resumption_quote_time}\`
  )}\`;

if (resumption_trade_time)
  message += \`\\nTrading resumes: \${formatDateTime(
    \`\${resumption_date} \${resumption_trade_time}\`
  )}\`;

message +=
  '\\n\\n<a href="https://www.nasdaqtrader.com/trader.aspx?id=TradeHalts">To the trading halt list</a>';

return message;`;

export const serviceNyseNsdqHaltsPageTemplate = html`
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
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.supabaseApiProfile')}</h5>
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
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.addSupabaseApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.pusherIntegration')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceNyseNsdqHaltsPage.pusherIntegrationDescription')}
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
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.addPusherApi')}
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.pollingInterval')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceNyseNsdqHaltsPage.pollingIntervalDescription')}
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
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.storageDepth')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.storageDepthDescription')}
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
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.symbolsToTrack')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceNyseNsdqHaltsPage.symbolsToTrackDescription')}
          </p>
          <ppp-select
            value="${(x) => x.document.symbolsTemplate ?? 'all'}"
            @change="${(x) => {
              x.symbolsCode.updateCode(
                x.symbolsTemplate.value === 'all' ? exampleSymbolsCodeAll : ''
              );
            }}"
            ${ref('symbolsTemplate')}
          >
            <ppp-option value="all">
              ${() => ppp.t('$serviceNyseNsdqHaltsPage.trackAllSymbols')}
            </ppp-option>
          </ppp-select>
        </div>
        <div class="input-group">
          <ppp-snippet
            revertable
            :code="${(x) => x.document.symbolsCode ?? exampleSymbolsCodeAll}"
            @revert="${(x) => {
              x.symbolsCode.updateCode(
                x.symbolsTemplate.value === 'all' ? exampleSymbolsCodeAll : ''
              );
            }}"
            ${ref('symbolsCode')}
          ></ppp-snippet>
          <div class="spacing2">
            <ppp-button
              ?disabled="${(x) => !x.isSteady()}"
              @click="${(x) => x.callSymbolsFunction()}"
              appearance="primary"
            >
              ${() => ppp.t('$serviceNyseNsdqHaltsPage.callFunction')}
            </ppp-button>
          </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.bot')}</h5>
          <p class="description">
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.botDescription')}
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
          <h5>${() => ppp.t('$serviceNyseNsdqHaltsPage.channelOrGroup')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$serviceNyseNsdqHaltsPage.channelOrGroupDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="${() =>
              ppp.t('$serviceNyseNsdqHaltsPage.channelOrGroup')}"
            value="${(x) => x.document.channel}"
            ${ref('channel')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.notificationFormatting')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t(
                '$serviceNyseNsdqHaltsPage.notificationFormattingDescription'
              )}
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
            ?disabled="${(x) => !x.isSteady()}"
            @click="${(x) => x.sendTestNyseNsdqHaltMessage()}"
            appearance="primary"
          >
            ${() => ppp.t('$serviceNyseNsdqHaltsPage.sendTestMessage')}
          </ppp-button>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: ppp.t('$serviceNyseNsdqHaltsPage.saveToPPPAndUpdateInSupabase'),
        extraControls: servicePageFooterExtraControls
      })}
    </form>
  </template>
`;

export const serviceNyseNsdqHaltsPageStyles = css`
  ${pageStyles}
  ppp-snippet {
    height: 300px;
  }
`;

export class ServiceNyseNsdqHaltsPage extends Page {
  collection = 'services';

  async sendTestNyseNsdqHaltMessage() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const temporaryFormatterName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFormatterBody = `function ${temporaryFormatterName}(halt_date,
        halt_time, symbol, name, market, reason_code, pause_threshold_price,
        resumption_date, resumption_quote_time, resumption_trade_time) {
          const closure = () => {${this.formatterCode.value}};
          const formatted = closure();

          if (typeof formatted === 'string')
            return \`chat_id=${this.channel.value}&text=\${formatted}&parse_mode=html\`;
          else {
            const options = formatted.options || {};
            let formData = \`chat_id=${this.channel.value}&text=\${formatted.text}\`;

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

      const functionBody = `${temporaryFormatterBody}
         return plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
           this.botId.datum().token
         }/sendMessage',
        '\${${temporaryFormatterName}('02/10/2022', '15:37:48', 'ASTR', 'Astra Space Inc Cl A Cmn Stk', 'NASDAQ', 'LUDP',
          '', '02/10/2022', '15:37:48', '15:42:48')}',
        'application/x-www-form-urlencoded')\`);`;

      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody
      });

      this.showSuccessNotification(
        ppp.t('$serviceNyseNsdqHaltsPage.messageSent')
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async callSymbolsFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.symbolsCode);

      const result = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.symbolsCode.value,
        returnResult
      });

      if (!returnResult)
        this.showSuccessNotification(
          ppp.t('$serviceNyseNsdqHaltsPage.functionExecutedSeeConsole')
        );

      return result;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async #deploy() {
    this.document.supabaseApi = this.supabaseApiId.datum();
    this.document.pusherApi = this.pusherApiId.datum();
    this.document.bot = this.botId.datum();

    const [sendTelegramMessage, deployNyseNsdqHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl(`${SERVICES.NYSE_NSDQ_HALTS}/deploy.sql`)).then(
        (r) => r.text()
      )
    ]);

    this.document.symbols = JSON.stringify(
      await this.callSymbolsFunction(true)
    );

    const query = `${sendTelegramMessage}
      ${await new Tmpl().render(this, deployNyseNsdqHalts, {})}`;

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
      hook: async (value) => +value >= 1000 && +value <= 10000,
      errorMessage: ppp.t('$page.valueInRange', { min: 1000, max: 10000 })
    });
    await validate(this.symbolsCode);
    await validate(this.botId);
    await validate(this.channel);
    await validate(this.formatterCode);
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.NYSE_NSDQ_HALTS%]`
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
      type: SERVICES.NYSE_NSDQ_HALTS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          supabaseApiId: this.supabaseApiId.value,
          pusherApiId: this.pusherApiId.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          symbolsCode: this.symbolsCode.value,
          symbolsTemplate: this.symbolsTemplate.value,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.NYSE_NSDQ_HALTS,
          createdAt: new Date()
        }
      },
      this.#deploy,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }
}

applyMixins(ServiceNyseNsdqHaltsPage, PageWithService, PageWithSupabaseService);

// noinspection JSUnusedGlobalSymbols
export default ServiceNyseNsdqHaltsPage.compose({
  template: serviceNyseNsdqHaltsPageTemplate,
  styles: serviceNyseNsdqHaltsPageStyles
}).define();
