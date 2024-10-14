/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  repeat,
  observable
} from '../../vendor/fast-element.min.js';
import { ValidationError, validate } from '../../lib/ppp-errors.js';
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
import { FLAG_TO_DATUM_MAP } from '../../lib/traders/combined-l1.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../text-field.js';
import { dictionarySelectorTemplate } from './instruments-manage.js';

export const levelOneTraderClonableListTemplate = html`
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
                placeholder="Трейдер L1"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`,
                        type: {
                          $ne: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.COMBINED_L1%]`
                        }
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <div class="control-line checkboxes">
                <ppp-checkbox
                  value="1"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('1')}"
                >
                  1
                </ppp-checkbox>
                <ppp-checkbox
                  value="2"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('2')}"
                >
                  2
                </ppp-checkbox>
                <ppp-checkbox
                  value="3"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('3')}"
                >
                  3
                </ppp-checkbox>
                <ppp-checkbox
                  value="4"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('4')}"
                >
                  4
                </ppp-checkbox>
                <ppp-checkbox
                  value="5"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('5')}"
                >
                  5
                </ppp-checkbox>
                <ppp-checkbox
                  value="6"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('6')}"
                >
                  6
                </ppp-checkbox>
                <ppp-checkbox
                  value="7"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('7')}"
                >
                  7
                </ppp-checkbox>
                <ppp-checkbox
                  value="8"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('8')}"
                >
                  8
                </ppp-checkbox>
                <ppp-checkbox
                  value="9"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('9')}"
                >
                  9
                </ppp-checkbox>
                <ppp-checkbox
                  value="A"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('A')}"
                >
                  A
                </ppp-checkbox>
                <ppp-checkbox
                  value="B"
                  ?checked="${(x) => !x.flags?.length || x.flags.includes('B')}"
                >
                  B
                </ppp-checkbox>
              </div>
            </div>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class LevelOneTraderClonableList extends ClonableList {
  async validate() {
    const duplicates = new Set();

    for (const field of Array.from(
      this.dragList.querySelectorAll('[trader-id]')
    )) {
      await validate(field);

      if (duplicates.has(field.value)) {
        throw new ValidationError({
          message: 'Трейдеры не могут повторяться в списке',
          element: ppp.app.toast
        });
      } else {
        duplicates.add(field.value);
      }
    }

    const value = this.value;

    if (!value.length || value.every((x) => x.hidden)) {
      throw new ValidationError({
        message: 'Список источников не должен быть пустым',
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
        flags: Array.from(
          line.querySelector('.checkboxes').querySelectorAll('ppp-checkbox')
        )
          .filter((c) => c.checked)
          .map((c) => c.getAttribute('value')),
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return result;
  }
}

export const traderCombinedL1Template = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      ${traderNameAndRuntimePartial()}
      <section>
        <div class="label-group">
          <h5>Словарь</h5>
          <p class="description">
            Словарь инструментов, который будет назначен трейдеру.
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
          <h5>Список трейдеров-источников L1</h5>
          <p class="description">
            Выбранные трейдеры будут объединены в один комбинированный источник
            данных L1. Цифробуквенные флаги контролируют возможность поставки
            данных в соотвествии с документацией:
          </p>
          <div class>
            <ppp-snippet
              style="width:50%;min-width:400px;height:260px"
              readonly
              :code="${() =>
                Object.entries(FLAG_TO_DATUM_MAP)
                  .map(
                    ([key, datum]) =>
                      `${key}: ${ppp.t(`$const.datum.${datum}`)}`
                  )
                  .join('\n')}"
            ></ppp-snippet>
          </div>
        </div>
        <div class="input-group">
          <ppp-level-one-trader-clonable-list
            ${ref('traderList')}
            :stencil="${() => {
              return {
                traderId: void 0,
                flags: []
              };
            }}"
            :list="${(x) =>
              x.document.traderList ?? [
                {
                  traderId: void 0,
                  flags: []
                }
              ]}"
            :traders="${(x) => x.traders}"
          ></ppp-level-one-trader-clonable-list>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderCombinedL1Styles = css`
  ${pageStyles}
`;

export class TraderCombinedL1Page extends TraderCommonPage {
  collection = 'traders';

  @observable
  traders;

  denormalization = new Denormalization();

  async connectedCallback() {
    super.connectedCallback();
  }

  getDefaultCaps() {
    return [TRADER_CAPS.CAPS_LEVEL1];
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.COMBINED_L1%]`
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.COMBINED_L1,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const sup = await super.submit();
    const traderList = this.traderList.value;

    for (const t of traderList) {
      t.document = await this.denormalization.denormalize(
        this.traders.find((x) => x._id === t.traderId)
      );
    }

    sup.$set = {
      ...sup.$set,
      dictionary: this.dictionary.value,
      traderList,
      version: 1,
      type: TRADERS.COMBINED_L1
    };

    return sup;
  }
}

export default {
  TraderCombinedL1PageComposition: TraderCombinedL1Page.compose({
    name: 'ppp-trader-combined-l1-page',
    template: traderCombinedL1Template,
    styles: traderCombinedL1Styles
  }).define(),
  LevelOneTraderClonableListComposition: LevelOneTraderClonableList.compose({
    template: levelOneTraderClonableListTemplate,
    styles: clonableListStyles
  }).define()
};
