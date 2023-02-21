/** @decorator */

import {
  html,
  css,
  ref,
  attr,
  Updates
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { PPPElement } from '../../lib/ppp-element.js';
import {
  designTokens,
  paletteGrayBase,
  spacing2,
  spacing3,
  spacing4
} from '../../design/design-tokens.js';
import defaultTheme from '../../design/themes/mongodb.js';
import '../banner.js';
import '../button.js';
import '../radio-group.js';
import '../text-field.js';

class PaletteItem extends PPPElement {
  @attr
  dt;

  dtChanged(oldValue, newValue) {
    if (newValue) {
      const page = this.closest('form').getRootNode().host;

      Updates.enqueue(() => {
        const propName = newValue.replace(/-./g, (x) => x[1].toUpperCase());
        const themePropName = `theme${
          propName[0].toUpperCase() + propName.slice(1)
        }`;

        this.control.placeholder = defaultTheme[propName];
        this.control.value =
          page.document[propName] ?? designTokens.get(newValue).default;
        this.updateExampleColor();
      });
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
}

export const settingsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Параметры</ppp-page-header>
      <section>
        <div class="label-group">
          <h5>Оформление приложения</h5>
          <p class="description">
            Светлое, тёмное или по выбору операционной системы.
          </p>
          <ppp-banner class="inline" appearance="warning">
            Оформление вступит в силу после сохранения изменений.
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.darkMode ?? '2'}"
            ${ref('darkMode')}
          >
            <ppp-radio value="2">По выбору системы</ppp-radio>
            <ppp-radio value="1">Тёмное</ppp-radio>
            <ppp-radio value="0">Светлое</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Палитра</h5>
          <p class="description">Настройте цветовое оформления приложения
            самостоятельно или воспользуйтесь готовым шаблоном:</p>
        </div>
        <div class="input-group">
          <div class="palette-holder">
            <div class="row">
              <ppp-palette-item dt="palette-white"> Белый</ppp-palette-item>
              <ppp-palette-item dt="palette-black"> Чёрный</ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-gray-dark-4">
                Серый -4
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-3">
                Серый -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-2">
                Серый -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-dark-1">
                Серый -1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-base">
                Серый
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-1">
                Серый +1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-2">
                Серый +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-gray-light-3">
                Серый +3
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-green-dark-3">
                Зелёный -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-dark-2">
                Зелёный -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-dark-1">
                Зелёный -1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-base">
                Зелёный
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-1">
                Зелёный +1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-2">
                Зелёный +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-green-light-3">
                Зелёный +3
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-purple-dark-3">
                Фиолетовый -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-dark-2">
                Фиолетовый -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-base">
                Фиолетовый
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-light-2">
                Фиолетовый +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-purple-light-3">
                Фиолетовый +3
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-blue-dark-3">
                Синий -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-dark-2">
                Синий -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-dark-1">
                Синий -1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-base">
                Синий
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-1">
                Синий +1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-2">
                Синий +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-blue-light-3">
                Синий +3
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-yellow-dark-3">
                Жёлтый -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-dark-2">
                Жёлтый -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-base">
                Жёлтый
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-light-2">
                Жёлтый +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-yellow-light-3">
                Жёлтый +3
              </ppp-palette-item>
            </div>
            <div class="row">
              <ppp-palette-item dt="palette-red-dark-3">
                Красный -3
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-dark-2">
                Красный -2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-base">
                Красный
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-1">
                Красный +1
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-2">
                Красный +2
              </ppp-palette-item>
              <ppp-palette-item dt="palette-red-light-3">
                Красный +3
              </ppp-palette-item>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.saveDocument()}"
        >
          Сохранить параметры
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const settingsPageStyles = css`
  ${pageStyles}
  ppp-banner {
    margin-top: 10px;
  }

  .palette-holder ppp-palette-item {
    width: 120px;
  }

  .palette-holder {
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

export class SettingsPage extends Page {
  collection = 'app';

  getDocumentId() {
    return '@settings';
  }

  async read() {
    return Object.fromEntries(ppp.settings);
  }

  async validate() {

  }

  async update() {

  }
}

export default SettingsPage.compose({
  template: settingsPageTemplate,
  styles: settingsPageStyles
}).define();

PaletteItem.compose({
  template: html`
    <ppp-text-field
      slotted
      @input="${(x) => x.updateExampleColor()}}"
      ${ref('control')}
    >
      <span slot="label">
        <slot></slot>
      </span>
      <span slot="end">
        <span ${ref('example')} class="example"
              style="background-color: ${(x) => x.color}"</span>
      </span>
    </ppp-text-field>
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
