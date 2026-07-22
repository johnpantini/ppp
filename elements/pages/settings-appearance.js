/** @decorator */

import {
  html,
  css,
  ref,
  attr,
  Updates,
  repeat
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { PPPElement } from '../../lib/ppp-element.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  designTokens,
  paletteGrayBase,
  spacing2,
  spacing3,
  spacing4
} from '../../design/design-tokens.js';
import defaultTheme from '../../design/themes/tinkoff.js';
import ppp from '../../ppp.js';
import '../banner.js';
import '../button.js';
import '../radio-group.js';
import '../select.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

const paletteLabel = (dt) => {
  const [, color, , shade, n] =
    dt.match(/^palette-([a-z]+)(-base|-(dark|light)-(\d))?$/) ?? [];

  if (!color) return dt;

  return (
    ppp.t(`$settingsAppearancePage.palette.${color}`) +
    (shade ? ` ${shade === 'dark' ? '-' : '+'}${n}` : '')
  );
};

const paletteSelectOptionsSnippet = [
  'palette-white',
  'palette-black',
  'palette-gray-dark-4',
  'palette-gray-dark-3',
  'palette-gray-dark-2',
  'palette-gray-dark-1',
  'palette-gray-base',
  'palette-gray-light-1',
  'palette-gray-light-2',
  'palette-gray-light-3',
  'palette-green-dark-3',
  'palette-green-dark-2',
  'palette-green-dark-1',
  'palette-green-base',
  'palette-green-light-1',
  'palette-green-light-2',
  'palette-green-light-3',
  'palette-purple-dark-3',
  'palette-purple-dark-2',
  'palette-purple-base',
  'palette-purple-light-2',
  'palette-purple-light-3',
  'palette-blue-dark-3',
  'palette-blue-dark-2',
  'palette-blue-dark-1',
  'palette-blue-base',
  'palette-blue-light-1',
  'palette-blue-light-2',
  'palette-blue-light-3',
  'palette-yellow-dark-3',
  'palette-yellow-dark-2',
  'palette-yellow-base',
  'palette-yellow-light-2',
  'palette-yellow-light-3',
  'palette-red-dark-3',
  'palette-red-dark-2',
  'palette-red-dark-1',
  'palette-red-base',
  'palette-red-light-1',
  'palette-red-light-2',
  'palette-red-light-3'
]
  .map((v) => `<ppp-option value="${v}">${paletteLabel(v)}</ppp-option>`)
  .join('\n      ');

const colorPairs = [
  {
    h: ppp.t('$settingsAppearancePage.linkColor'),
    pair: 'linkColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.increase'),
    pair: 'positive'
  },
  {
    h: ppp.t('$settingsAppearancePage.decrease'),
    pair: 'negative'
  },
  {
    h: ppp.t('$g.buyButtonText'),
    pair: 'buy'
  },
  {
    h: ppp.t('$g.sellButtonText'),
    pair: 'sell'
  },
  {
    h: ppp.t('$settingsAppearancePage.buyHover'),
    pair: 'buyHover'
  },
  {
    h: ppp.t('$settingsAppearancePage.sellHover'),
    pair: 'sellHover'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartUpColor'),
    pair: 'chartUpColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartDownColor'),
    pair: 'chartDownColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartBorderUpColor'),
    pair: 'chartBorderUpColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartBorderDownColor'),
    pair: 'chartBorderDownColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartWickUpColor'),
    pair: 'chartWickUpColor'
  },
  {
    h: ppp.t('$settingsAppearancePage.chartWickDownColor'),
    pair: 'chartWickDownColor'
  }
];

for (const g of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  colorPairs.push({
    h: ppp.t('$settingsAppearancePage.widgetGroup', { n: g }),
    pair: `widgetGroup${g}`
  });
}

const colorPairSelectSnippet = ({ index, pair, document }) => {
  const themePropName = `theme${pair[0].toUpperCase() + pair.slice(1)}`;
  const value = document[themePropName]?.[index] ?? defaultTheme[pair][index];

  return html` ${html.partial(`
    <ppp-select index="${index}" pair="${pair}" value="${value}" placeholder="${ppp.t(
      '$settingsAppearancePage.selectColor'
    )}">
      <span slot="label">${
        index === 0
          ? ppp.t('$settingsAppearancePage.light')
          : ppp.t('$settingsAppearancePage.dark')
      }</span>
      ${paletteSelectOptionsSnippet}
    </ppp-select>
  `)}`;
};

class PaletteItem extends PPPElement {
  @attr
  dt;

  dtChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      if (newValue) {
        Updates.enqueue(() => {
          const page = this.closest('form').getRootNode().host;
          const propName = newValue.replace(/-./g, (x) => x[1].toUpperCase());
          const themePropName = `theme${
            propName[0].toUpperCase() + propName.slice(1)
          }`;

          this.control.placeholder = defaultTheme[propName];
          this.control.value =
            page.document[themePropName] ?? designTokens.get(newValue).default;
          this.updateExampleColor();
        });
      }
    }
  }

  updateExampleColor() {
    const color = this.control.value;

    if (CSS.supports('color', color)) {
      this.example.style.backgroundColor = color;

      this.example.removeAttribute('hidden');
    } else {
      this.example.setAttribute('hidden', '');
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.dtChanged(void 0, this.dt);
  }
}

export const settingsAppearancePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsAppearancePage.appearanceHeader')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsAppearancePage.appearanceDescription')}
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            ${() => ppp.t('$settingsAppearancePage.appearanceBanner')}
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.darkMode ?? '2'}"
            ${ref('darkMode')}
          >
            <ppp-radio value="2">
              ${() => ppp.t('$settingsAppearancePage.bySystem')}
            </ppp-radio>
            <ppp-radio value="1">
              ${() => ppp.t('$settingsAppearancePage.dark')}
            </ppp-radio>
            <ppp-radio value="0">
              ${() => ppp.t('$settingsAppearancePage.light')}
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsAppearancePage.paletteHeader')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsAppearancePage.paletteDescription')}
          </p>
          <div>
            <ppp-select
              placeholder="${() =>
                ppp.t('$settingsAppearancePage.selectTemplate')}"
              ${ref('themeColorsTemplateSelect')}
            >
              <ppp-option value="tinkoff">Tinkoff</ppp-option>
              <ppp-option value="binance">Binance</ppp-option>
            </ppp-select>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.themeColorsTemplateSelect.value}"
              appearance="primary"
              @click="${(x) =>
                x.applyThemeColorsTemplate(x.themeColorsTemplateSelect.value)}"
            >
              ${() => ppp.t('$settingsAppearancePage.fillColorsFromTemplate')}
            </ppp-button>
          </div>
        </div>
        <div class="input-group">
          <div class="settings-grid colors">
            <div class="row">
              <ppp-palette-item dt="palette-white">
                ${() => paletteLabel('palette-white')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-black">
                ${() => paletteLabel('palette-black')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-gray-dark-4">
                ${() => paletteLabel('palette-gray-dark-4')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-3">
                ${() => paletteLabel('palette-gray-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-2">
                ${() => paletteLabel('palette-gray-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-1">
                ${() => paletteLabel('palette-gray-dark-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-base">
                ${() => paletteLabel('palette-gray-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-1">
                ${() => paletteLabel('palette-gray-light-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-2">
                ${() => paletteLabel('palette-gray-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-3">
                ${() => paletteLabel('palette-gray-light-3')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-green-dark-3">
                ${() => paletteLabel('palette-green-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-dark-2">
                ${() => paletteLabel('palette-green-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-dark-1">
                ${() => paletteLabel('palette-green-dark-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-base">
                ${() => paletteLabel('palette-green-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-1">
                ${() => paletteLabel('palette-green-light-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-2">
                ${() => paletteLabel('palette-green-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-3">
                ${() => paletteLabel('palette-green-light-3')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-purple-dark-3">
                ${() => paletteLabel('palette-purple-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-dark-2">
                ${() => paletteLabel('palette-purple-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-base">
                ${() => paletteLabel('palette-purple-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-light-2">
                ${() => paletteLabel('palette-purple-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-light-3">
                ${() => paletteLabel('palette-purple-light-3')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-blue-dark-3">
                ${() => paletteLabel('palette-blue-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-dark-2">
                ${() => paletteLabel('palette-blue-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-dark-1">
                ${() => paletteLabel('palette-blue-dark-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-base">
                ${() => paletteLabel('palette-blue-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-1">
                ${() => paletteLabel('palette-blue-light-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-2">
                ${() => paletteLabel('palette-blue-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-3">
                ${() => paletteLabel('palette-blue-light-3')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-yellow-dark-3">
                ${() => paletteLabel('palette-yellow-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-dark-2">
                ${() => paletteLabel('palette-yellow-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-base">
                ${() => paletteLabel('palette-yellow-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-light-2">
                ${() => paletteLabel('palette-yellow-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-light-3">
                ${() => paletteLabel('palette-yellow-light-3')}
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-red-dark-3">
                ${() => paletteLabel('palette-red-dark-3')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-dark-2">
                ${() => paletteLabel('palette-red-dark-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-dark-1">
                ${() => paletteLabel('palette-red-dark-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-base">
                ${() => paletteLabel('palette-red-base')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-1">
                ${() => paletteLabel('palette-red-light-1')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-2">
                ${() => paletteLabel('palette-red-light-2')}
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-3">
                ${() => paletteLabel('palette-red-light-3')}
              </ppp-palette-item>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsAppearancePage.colorPairsHeader')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsAppearancePage.colorPairsDescription')}
          </p>
          <div>
            <ppp-select
              placeholder="${() =>
                ppp.t('$settingsAppearancePage.selectTemplate')}"
              ${ref('themeColorPairsTemplateSelect')}
            >
              <ppp-option value="tinkoff">Tinkoff</ppp-option>
              <ppp-option value="binance">Binance</ppp-option>
            </ppp-select>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.themeColorPairsTemplateSelect.value}"
              appearance="primary"
              @click="${(x) =>
                x.applyThemeColorPairsTemplate(
                  x.themeColorPairsTemplateSelect.value
                )}"
            >
              ${() => ppp.t('$settingsAppearancePage.fillPairsFromTemplate')}
            </ppp-button>
          </div>
        </div>
        <div class="input-group">
          <div class="settings-grid color-pairs">
            ${repeat(
              colorPairs,
              (y) => html`
                <h5>${(x) => x.h}</h5>
                <div class="row">
                  ${(x) =>
                    colorPairSelectSnippet({
                      index: 0,
                      pair: x.pair,
                      document: y.document
                    })}
                  ${(x) =>
                    colorPairSelectSnippet({
                      index: 1,
                      pair: x.pair,
                      document: y.document
                    })}
                </div>
              `
            )}
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsAppearancePage.fontsHeader')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsAppearancePage.fontsDescription')}
          </p>
          <div>
            <ppp-select
              placeholder="${() =>
                ppp.t('$settingsAppearancePage.selectTemplate')}"
              ${ref('themeFontsTemplateSelect')}
            >
              <ppp-option value="tinkoff">Tinkoff</ppp-option>
              <ppp-option value="binance">Binance</ppp-option>
            </ppp-select>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.themeFontsTemplateSelect.value}"
              appearance="primary"
              @click="${(x) =>
                x.applyThemeFontsTemplate(x.themeFontsTemplateSelect.value)}"
            >
              ${() => ppp.t('$settingsAppearancePage.fillFontsFromTemplate')}
            </ppp-button>
          </div>
        </div>
        <div class="input-group">
          <div class="settings-grid fonts">
            <h5>${() => ppp.t('$settingsAppearancePage.fontFamily')}</h5>
            <div class="row">
              <ppp-text-field dt="body-font" placeholder="Roboto">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.regularFont')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="monospace-font" placeholder="monospace">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.monospaceFont')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.widgetFont')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-widget" placeholder="12px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-widget" placeholder="400">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-widget" placeholder="normal">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.bodyFont')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-body-1" placeholder="13px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-body-1" placeholder="400">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-body-1" placeholder="20px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.codeFont')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-code-1" placeholder="13px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-code-1" placeholder="400">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-code-1" placeholder="20px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.heading3Font')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-heading-3" placeholder="24px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-heading-3" placeholder="500">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-heading-3" placeholder="32px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.heading5Font')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-heading-5" placeholder="16px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-heading-5" placeholder="700">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-heading-5" placeholder="20px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>${() => ppp.t('$settingsAppearancePage.heading6Font')}</h5>
            <div class="row">
              <ppp-text-field dt="font-size-heading-6" placeholder="18px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontSize')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="font-weight-heading-6" placeholder="700">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.fontWeight')}
                </span>
              </ppp-text-field>
              <ppp-text-field dt="line-height-heading-6" placeholder="24px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.lineHeight')}
                </span>
              </ppp-text-field>
            </div>
            <h5>
              ${() => ppp.t('$settingsAppearancePage.widgetButtonHeight')}
            </h5>
            <div class="row">
              <ppp-text-field dt="button-height-widget" placeholder="32px">
                <span slot="label">
                  ${() => ppp.t('$settingsAppearancePage.height')}
                </span>
              </ppp-text-field>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          ${() => ppp.t('$settingsAppearancePage.saveSettings')}
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const settingsAppearancePageStyles = css`
  ${pageStyles}
  .settings-grid ppp-palette-item {
    width: 140px;
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: ${spacing4} 0;
  }

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${spacing2} ${spacing3};
  }
`;

export class SettingsAppearancePage extends Page {
  collection = 'app';

  async connectedCallback() {
    await super.connectedCallback();

    PaletteItem.compose({
      template: html`
        <template>
          <ppp-text-field
            slotted
            @input="${(x) => x.updateExampleColor()}}"
            ${ref('control')}
          >
            <span slot="label">
              <slot></slot>
            </span>
            <span slot="end">
              <span
                ${ref('example')}
                class="example"
                style="background-color: ${(x) => x.color}"
              >
              </span>
            </span>
          </ppp-text-field>
        </template>
      `,
      styles: css`
        .example {
          width: 14px;
          height: 14px;
          border: 1px solid ${paletteGrayBase};
          border-radius: 50%;
        }
      `
    }).define();

    if (sessionStorage.getItem('ppp-show-success-notification') === '1') {
      sessionStorage.removeItem('ppp-show-success-notification');
      this.showSuccessNotification();
    }
  }

  getDocumentId() {
    return {
      _id: '@settings'
    };
  }

  async read() {
    Array.from(
      this.shadowRoot.querySelectorAll('.settings-grid.fonts ppp-text-field')
    ).forEach((input) => {
      const dt = input.getAttribute('dt');
      const propName = dt.replace(/-./g, (x) => x[1].toUpperCase());
      const themePropName = `theme${
        propName[0].toUpperCase() + propName.slice(1)
      }`;

      input.value =
        this.document[themePropName] ?? designTokens.get(dt).default;
    });

    return Object.fromEntries(ppp.settings);
  }

  async validate() {
    for (const pi of Array.from(
      this.shadowRoot.querySelectorAll('ppp-palette-item')
    )) {
      await validate(pi.control);
      await validate(pi.control, {
        hook: async (value) => CSS.supports('color', value),
        errorMessage: ppp.t('$settingsAppearancePage.invalidColor')
      });
    }

    for (const input of Array.from(
      this.shadowRoot.querySelectorAll('.settings-grid.fonts ppp-text-field')
    )) {
      await validate(input);

      const dt = input.getAttribute('dt');

      if (dt === 'body-font' || dt === 'monospace-font') {
        await validate(input, {
          hook: async (value) => CSS.supports('font-family', value),
          errorMessage: ppp.t('$settingsAppearancePage.invalidFont')
        });
      } else if (dt.startsWith('font-size')) {
        await validate(input, {
          hook: async (value) => CSS.supports('font-size', value),
          errorMessage: ppp.t('$settingsAppearancePage.invalidSize')
        });
      } else if (dt.startsWith('font-weight')) {
        await validate(input, {
          hook: async (value) => CSS.supports('font-weight', value),
          errorMessage: ppp.t('$settingsAppearancePage.invalidValue')
        });
      } else if (dt.startsWith('line-height')) {
        await validate(input, {
          hook: async (value) => CSS.supports('line-height', value),
          errorMessage: ppp.t('$settingsAppearancePage.invalidValue')
        });
      } else if (dt.startsWith('button-height')) {
        await validate(input, {
          hook: async (value) => CSS.supports('height', value),
          errorMessage: ppp.t('$settingsAppearancePage.invalidValue')
        });
      }
    }
  }

  async submit() {
    const updateClause = {
      $set: {
        darkMode: this.darkMode.value
      },
      $unset: {
        removed: ''
      }
    };

    for (const pi of Array.from(
      this.shadowRoot.querySelectorAll('ppp-palette-item')
    )) {
      const propName = pi
        .getAttribute('dt')
        .replace(/-./g, (x) => x[1].toUpperCase());
      const themePropName = `theme${
        propName[0].toUpperCase() + propName.slice(1)
      }`;

      if (defaultTheme[propName] === pi.control.value) {
        updateClause.$unset[themePropName] = '';
      } else {
        updateClause.$set[themePropName] = pi.control.value;
      }
    }

    Array.from(
      this.shadowRoot.querySelectorAll('.settings-grid.color-pairs .row')
    ).forEach((row) => {
      const light = row.querySelector('ppp-select[index="0"]');
      const dark = row.querySelector('ppp-select[index="1"]');
      const propName = light.getAttribute('pair');
      const themePropName = `theme${
        propName[0].toUpperCase() + propName.slice(1)
      }`;

      if (
        defaultTheme[propName][0] === light.value &&
        defaultTheme[propName][1] === dark.value
      ) {
        updateClause.$unset[themePropName] = '';
      } else {
        updateClause.$set[themePropName] = [light.value, dark.value];
      }
    });

    Array.from(
      this.shadowRoot.querySelectorAll('.settings-grid.fonts ppp-text-field')
    ).forEach((input) => {
      const dt = input.getAttribute('dt');
      const propName = dt.replace(/-./g, (x) => x[1].toUpperCase());
      const themePropName = `theme${
        propName[0].toUpperCase() + propName.slice(1)
      }`;

      if (defaultTheme[propName] === input.value) {
        updateClause.$unset[themePropName] = '';
      } else {
        updateClause.$set[themePropName] = input.value;
      }
    });

    localStorage.setItem(
      'ppp-light-critical-css',
      `:root {
        --critical-default-color: ${
          this.shadowRoot.querySelector('[dt="palette-white"]').control.value
        };
        --critical-default-inverse-color: ${
          this.shadowRoot.querySelector('[dt="palette-black"]').control.value
        };
        --critical-border-color: ${
          this.shadowRoot.querySelector('[dt="palette-gray-base"]').control
            .value
        };
        --success-color: ${
          this.shadowRoot.querySelector('[dt="palette-green-base"]').control
            .value
        };
        --danger-color: ${
          this.shadowRoot.querySelector('[dt="palette-red-base"]').control.value
        };
      }`
    );

    localStorage.setItem(
      'ppp-dark-critical-css',
      `:root {
        --critical-default-color: ${
          this.shadowRoot.querySelector('[dt="palette-black"]').control.value
        };
        --critical-default-inverse-color: ${
          this.shadowRoot.querySelector('[dt="palette-white"]').control.value
        };
        --critical-border-color: ${
          this.shadowRoot.querySelector('[dt="palette-gray-base"]').control
            .value
        };
        --success-color: ${
          this.shadowRoot.querySelector('[dt="palette-green-base"]').control
            .value
        };
        --danger-color: ${
          this.shadowRoot.querySelector('[dt="palette-red-base"]').control.value
        };
      }`
    );

    return updateClause;
  }

  async submitDocument(options = {}) {
    try {
      await this.validate();
      await super.submitDocument(
        Object.assign(options, { silent: true, raiseException: true })
      );
      sessionStorage.setItem('ppp-show-success-notification', '1');
      location.reload();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async applyThemeColorsTemplate(template) {
    if (!template) return;

    this.beginOperation();

    try {
      const { default: theme } = await import(
        `${ppp.rootUrl}/design/themes/${template}.js`
      );

      for (const pi of Array.from(
        this.shadowRoot.querySelectorAll('ppp-palette-item')
      )) {
        const propName = pi
          .getAttribute('dt')
          .replace(/-./g, (x) => x[1].toUpperCase());

        pi.control.value = theme[propName];

        pi.control.dispatchEvent(new CustomEvent('input'));

        pi.control.appearance = 'default';
      }
    } catch (e) {
      this.failOperation(
        e,
        ppp.t('$settingsAppearancePage.themeTemplateLoading')
      );
    } finally {
      this.endOperation();
    }
  }

  async applyThemeColorPairsTemplate(template) {
    if (!template) return;

    this.beginOperation();

    try {
      const { default: theme } = await import(
        `${ppp.rootUrl}/design/themes/${template}.js`
      );

      Array.from(
        this.shadowRoot.querySelectorAll(
          '.settings-grid.color-pairs ppp-select'
        )
      ).forEach((select) => {
        select.value =
          theme[select.getAttribute('pair')][+select.getAttribute('index')];
      });
    } catch (e) {
      this.failOperation(
        e,
        ppp.t('$settingsAppearancePage.themeTemplateLoading')
      );
    } finally {
      this.endOperation();
    }
  }

  async applyThemeFontsTemplate(template) {
    if (!template) return;

    this.beginOperation();

    try {
      const { default: theme } = await import(
        `${ppp.rootUrl}/design/themes/${template}.js`
      );

      Array.from(
        this.shadowRoot.querySelectorAll('.settings-grid.fonts ppp-text-field')
      ).forEach((input) => {
        const dt = input.getAttribute('dt');
        const propName = dt.replace(/-./g, (x) => x[1].toUpperCase());

        input.value = theme[propName];

        input.dispatchEvent(new CustomEvent('input'));

        input.appearance = 'default';
      });
    } catch (e) {
      this.failOperation(
        e,
        ppp.t('$settingsAppearancePage.themeTemplateLoading')
      );
    } finally {
      this.endOperation();
    }
  }
}

export default SettingsAppearancePage.compose({
  template: settingsAppearancePageTemplate,
  styles: settingsAppearancePageStyles
}).define();
