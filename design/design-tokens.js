import { DesignToken } from './design-token.js';
import defaultTheme from './themes/mongodb.js';
import ppp from '../ppp.js';

const { create } = DesignToken;
const designTokens = new Map();

export const createThemed = (name) => {
  const existing = designTokens.get(name);

  if (typeof existing !== 'undefined') {
    return existing;
  } else {
    const propName = name.replace(/-./g, (x) => x[1].toUpperCase());
    const themePropName = `theme${
      propName[0].toUpperCase() + propName.slice(1)
    }`;

    const dt = create(name).withDefault(defaultTheme[propName]);
    const themeSetting = ppp.settings.get(themePropName);

    if (typeof themeSetting !== 'undefined') {
      dt.setValueFor(ppp.designSystemCanvas, themeSetting);
    }

    designTokens.set(name, dt);

    return dt;
  }
};

export const themeConditional = (light, dark) => {
  if (typeof dark === 'undefined') dark = light;

  const name = `${light.name}-with-${dark.name}`;
  const existing = designTokens.get(name);

  if (typeof existing !== 'undefined') {
    return existing;
  } else {
    const dt = create(name).withDefault((resolve) =>
      ppp.darkMode ? resolve(dark) : resolve(light)
    );

    designTokens.set(name, dt);

    return dt;
  }
};

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : {
        r: 0,
        g: 0,
        b: 0
      };
}

export const toColorComponents = (token) => {
  if (token.$value.startsWith('#')) {
    const name = `components-of-${token.name}`;
    const existing = designTokens.get(name);

    if (typeof existing !== 'undefined') {
      return existing;
    } else {
      const dt = create(name).withDefault({
        createCSS() {
          if (token.$value.startsWith('rgb'))
            return token.$value.match(/\d+/g).slice(0, 3).join(',');
          else if (token.$value.startsWith('#')) {
            const rgb = hexToRgb(token.$value);

            return `${rgb.r},${rgb.g},${rgb.b}`;
          } else {
            return '0,0,0';
          }
        }
      });

      designTokens.set(name, dt);

      return dt;
    }
  }
};

export const shadeColor = (col, amt) => {
  col = col.replace(/^#/, '');

  if (col.length === 3)
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

  let [r, g, b] = col.match(/.{2}/g);

  [r, g, b] = [
    parseInt(r, 16) + amt,
    parseInt(g, 16) + amt,
    parseInt(b, 16) + amt
  ];

  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? '0' : '') + r;
  const gg = (g.length < 2 ? '0' : '') + g;
  const bb = (b.length < 2 ? '0' : '') + b;

  return `#${rr}${gg}${bb}`;
};

function shade(name, token, amount) {
  const existing = designTokens.get(name);

  if (typeof existing !== 'undefined') {
    return existing;
  } else {
    const dt = create(name).withDefault({
      createCSS() {
        return shadeColor(token.$value, amount);
      }
    });

    designTokens.set(name, dt);

    return dt;
  }
}

export const lighten = (token, amount) =>
  shade(
    `lighten-${Math.abs(Math.trunc(amount))}-${token.name}`,
    token,
    Math.abs(Math.trunc(amount))
  );

export const darken = (token, amount) =>
  shade(
    `darken-${Math.abs(Math.trunc(amount))}-${token.name}`,
    token,
    Math.abs(Math.trunc(amount)) * -1
  );

// Types
export const bodyFont = createThemed('body-font');
export const monospaceFont = createThemed('monospace-font');
// Body 1
export const fontSizeBody1 = createThemed('font-size-body-1');
export const lineHeightBody1 = createThemed('line-height-body-1');
export const fontWeightBody1 = createThemed('font-weight-body-1');
// Code 1
export const fontSizeCode1 = createThemed('font-size-code-1');
export const lineHeightCode1 = createThemed('line-height-code-1');
export const fontWeightCode1 = createThemed('font-weight-code-1');
// Heading 3
export const fontSizeHeading3 = createThemed('font-size-heading-3');
export const lineHeightHeading3 = createThemed('line-height-heading-3');
export const fontWeightHeading3 = createThemed('font-weight-heading-3');
// Heading 5
export const fontSizeHeading5 = createThemed('font-size-heading-5');
export const lineHeightHeading5 = createThemed('line-height-heading-5');
export const fontWeightHeading5 = createThemed('font-weight-heading-5');
// Heading 6 (Subtitle)
export const fontSizeHeading6 = createThemed('font-size-heading-6');
export const lineHeightHeading6 = createThemed('line-height-heading-6');
export const fontWeightHeading6 = createThemed('font-weight-heading-6');
// Base colors
export const paletteWhite = createThemed('palette-white');
export const paletteBlack = createThemed('palette-black');
// Gray
export const paletteGrayBase = createThemed('palette-gray-base');
export const paletteGrayLight1 = createThemed('palette-gray-light-1');
export const paletteGrayLight2 = createThemed('palette-gray-light-2');
export const paletteGrayLight3 = createThemed('palette-gray-light-3');
export const paletteGrayDark1 = createThemed('palette-gray-dark-1');
export const paletteGrayDark2 = createThemed('palette-gray-dark-2');
export const paletteGrayDark3 = createThemed('palette-gray-dark-3');
export const paletteGrayDark4 = createThemed('palette-gray-dark-4');
// Green
export const paletteGreenBase = createThemed('palette-green-base');
export const paletteGreenLight1 = createThemed('palette-green-light-1');
export const paletteGreenLight2 = createThemed('palette-green-light-2');
export const paletteGreenLight3 = createThemed('palette-green-light-3');
export const paletteGreenDark1 = createThemed('palette-green-dark-1');
export const paletteGreenDark2 = createThemed('palette-green-dark-2');
export const paletteGreenDark3 = createThemed('palette-green-dark-3');
// Purple
export const palettePurpleBase = createThemed('palette-purple-base');
export const palettePurpleLight2 = createThemed('palette-purple-light-2');
export const palettePurpleLight3 = createThemed('palette-purple-light-3');
export const palettePurpleDark2 = createThemed('palette-purple-dark-2');
export const palettePurpleDark3 = createThemed('palette-purple-dark-3');
// Blue
export const paletteBlueBase = createThemed('palette-blue-base');
export const paletteBlueLight1 = createThemed('palette-blue-light-1');
export const paletteBlueLight2 = createThemed('palette-blue-light-2');
export const paletteBlueLight3 = createThemed('palette-blue-light-3');
export const paletteBlueDark1 = createThemed('palette-blue-dark-1');
export const paletteBlueDark2 = createThemed('palette-blue-dark-2');
export const paletteBlueDark3 = createThemed('palette-blue-dark-3');
// Yellow
export const paletteYellowBase = createThemed('palette-yellow-base');
export const paletteYellowLight2 = createThemed('palette-yellow-light-2');
export const paletteYellowLight3 = createThemed('palette-yellow-light-3');
export const paletteYellowDark2 = createThemed('palette-yellow-dark-2');
export const paletteYellowDark3 = createThemed('palette-yellow-dark-3');
// Red
export const paletteRedBase = createThemed('palette-red-base');
export const paletteRedLight1 = createThemed('palette-red-light-1');
export const paletteRedLight2 = createThemed('palette-red-light-2');
export const paletteRedLight3 = createThemed('palette-red-light-3');
export const paletteRedDark2 = createThemed('palette-red-dark-2');
export const paletteRedDark3 = createThemed('palette-red-dark-3');
// Spacing
export const spacing1 = createThemed('spacing-1');
export const spacing2 = createThemed('spacing-2');
export const spacing3 = createThemed('spacing-3');
export const spacing4 = createThemed('spacing-4');
export const spacing5 = createThemed('spacing-5');
export const spacing6 = createThemed('spacing-6');
export const spacing7 = createThemed('spacing-7');

// Side navigation
export const sideNavCollapsedWidth = createThemed('side-nav-collapsed-width');
export const sideNavExpandedWidth = createThemed('side-nav-expanded-width');
// Scrollbars
export const scrollBarSize = createThemed('scroll-bar-size');
// Links
export const linkColor = themeConditional(
  designTokens.get(defaultTheme.linkColor[0]),
  designTokens.get(defaultTheme.linkColor[1])
);
// Text
export const defaultTextColor = themeConditional(
  designTokens.get(defaultTheme.defaultTextColor[0]),
  designTokens.get(defaultTheme.defaultTextColor[1])
);
