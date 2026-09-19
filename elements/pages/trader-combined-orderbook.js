/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  repeat,
  observable
} from '../../vendor/fast-element.min.js';
import { ValidationError, invalidate, validate } from '../../lib/ppp-errors.js';
import {
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { TRADER_CAPS, TRADERS } from '../../lib/const.js';
import {
  Denormalization,
  extractEverything
} from '../../lib/ppp-denormalize.js';
import { traderNameAndRuntimePartial, TraderCommonPage } from './trader.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from '../clonable-list.js';
import { dictionarySelectorTemplate } from './instruments-manage.js';
import { Tmpl } from '../../lib/tmpl.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const defaultProcessorFuncCode = `/**
* Order book processing function of the trader.
*
* @param {object} trader - PPP trader instance.
* @param {array} prices - Array of order book prices (bid or ask).
* @param {boolean} isBidSide - Type of the price array being processed.
*/

return prices;`;

export const orderbookTraderClonableListTemplate = html`
  <template>
    <ppp-draggable-stack
      style="flex-flow: row wrap; gap: 24px 16px;"
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div
            class="control-line draggable draggable-line"
            style="align-items: center"
          >
            ${dragControlsTemplate({})}
            <div class="control-stack">
              <ppp-query-select
                trader-id
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(x) => x.traderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.traderId);
                }}"
                placeholder="${() =>
                  ppp.t(
                    '$traderCombinedOrderbookPage.sourceTraderPlaceholder'
                  )}"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_ORDERBOOK%]`,
                        type: {
                          $ne: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.COMBINED_ORDERBOOK%]`
                        }
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <div class="control-stack">
                <ppp-checkbox
                  ?disabled="${(x) => x.hidden}"
                  use-processor-func
                  ?checked="${(x) => x.useProcessorFunc ?? false}"
                >
                  ${() =>
                    ppp.t('$traderCombinedOrderbookPage.processorFuncCheckbox')}
                </ppp-checkbox>
                <ppp-snippet
                  ?disabled="${(x) => x.hidden}"
                  processor-func-code
                  style="width:50%;min-width:512px; height:220px"
                  :code="${(x) =>
                    x.processorFuncCode ?? defaultProcessorFuncCode}"
                ></ppp-snippet>
              </div>
            </div>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class OrderbookTraderClonableList extends ClonableList {
  async validate() {
    const duplicates = new Set();

    for (const field of Array.from(
      this.dragList.querySelectorAll('[trader-id]')
    )) {
      await validate(field);

      if (duplicates.has(field.value)) {
        throw new ValidationError({
          message: ppp.t('$traderCombinedOrderbookPage.tradersMustBeUnique'),
          element: ppp.app.toast
        });
      } else {
        duplicates.add(field.value);
      }
    }

    // Snippets.
    for (const field of Array.from(
      this.dragList.querySelectorAll('[processor-func-code]')
    )) {
      await validate(field);

      try {
        new Function(
          'trader',
          'prices',
          'isBidSide',
          await new Tmpl().render(this, field.value, {})
        );
      } catch (e) {
        console.dir(e);

        invalidate(field, {
          errorMessage: ppp.t('$page.codeContainsErrors'),
          raiseException: true
        });
      }
    }

    const value = this.value;

    if (!value.length || value.every((x) => x.hidden)) {
      throw new ValidationError({
        message: ppp.t('$traderCombinedOrderbookPage.sourceListEmpty'),
        element: ppp.app.toast
      });
    }
  }

  get value() {
    const result = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      const traderId = line.querySelector('[trader-id]').value;

      result.push({
        traderId,
        useProcessorFunc: line.querySelector('[use-processor-func]').checked,
        processorFuncCode: line.querySelector('[processor-func-code]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return result;
  }
}

export const traderCombinedOrderbookTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderCombinedOrderbookPage.dictionaryTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderCombinedOrderbookPage.dictionaryDescription')}
          </p>
        </div>
        <div class="input-group">
          ${(x) =>
            dictionarySelectorTemplate({
              silent: true,
              value: x.document.dictionary
            })}
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$traderCombinedOrderbookPage.traderListTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$traderCombinedOrderbookPage.traderListDescription')}
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            ${() => ppp.t('$traderCombinedOrderbookPage.maxTradersWarning')}
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-orderbook-trader-clonable-list
            ${ref('traderList')}
            :stencil="${() => {
              return {
                traderId: void 0,
                useProcessorFunc: false,
                processorFuncCode: defaultProcessorFuncCode
              };
            }}"
            :list="${(x) =>
              x.document.traderList ?? [
                {
                  traderId: void 0,
                  useProcessorFunc: false,
                  processorFuncCode: defaultProcessorFuncCode
                }
              ]}"
            :traders="${(x) => x.traders}"
          ></ppp-orderbook-trader-clonable-list>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderCombinedOrderbookStyles = css`
  ${pageStyles}
`;

export class TraderCombinedOrderbookPage extends TraderCommonPage {
  collection = 'traders';

  @observable
  traders;

  denormalization = new Denormalization();

  getDefaultCaps() {
    return [TRADER_CAPS.CAPS_ORDERBOOK];
  }

  async connectedCallback() {
    const refs = await extractEverything();

    this.denormalization.fillRefs(refs);

    this.traders = refs.traders;

    await super.connectedCallback();
  }

  async validate() {
    await super.validate();
    await this.traderList.validate();
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.COMBINED_ORDERBOOK%]`
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.COMBINED_ORDERBOOK,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const sup = await super.submit();
    const traderList = this.traderList.value.slice(0, 10);

    for (const t of traderList) {
      // Full documents for remote traders!
      t.document = await this.denormalization.denormalize(
        this.traders.find((x) => x._id === t.traderId)
      );
    }

    sup.$set = {
      ...sup.$set,
      dictionary: this.dictionary.value,
      traderList,
      version: 1,
      type: TRADERS.COMBINED_ORDERBOOK
    };

    return sup;
  }
}

export default {
  TraderCombinedL1PageComposition: TraderCombinedOrderbookPage.compose({
    template: traderCombinedOrderbookTemplate,
    styles: traderCombinedOrderbookStyles
  }).define(),
  OrderbookTraderClonableListComposition: OrderbookTraderClonableList.compose({
    template: orderbookTraderClonableListTemplate,
    styles: clonableListStyles
  }).define()
};
