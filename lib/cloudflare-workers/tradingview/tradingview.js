const shadeColor = (c, amount) => {
  c = c.replace(/^#/, '');

  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];

  let [r, g, b] = c.match(/.{2}/g);

  [r, g, b] = [
    parseInt(r, 16) + amount,
    parseInt(g, 16) + amount,
    parseInt(b, 16) + amount
  ];

  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? '0' : '') + r;
  const gg = (g.length < 2 ? '0' : '') + g;
  const bb = (b.length < 2 ? '0' : '') + b;

  return `#${rr}${gg}${bb}`;
};

window.onerror = () => false;

console.warn = function () {};

WebSocket = function () {
  return {
    addEventListener(type, listener, options) {},
    removeEventListener(type, handler) {}
  };
};

const originalFetch = fetch;

fetch = function (input, init) {
  if (input === '/pro-plans/profile/') {
    // {"pro_plan":""}
    return new Promise((resolve) => {
      resolve(
        new Response(
          JSON.stringify({
            pro_plan: 'pro_premium'
          }),
          {
            status: 200,
            statusText: 'OK',
            headers: new Headers()
          }
        )
      );
    });
  }

  if (typeof input === 'string') {
    if (
      /(telemetry|pricealerts|tv-dlive|snowplow|graphql|hotlist)/i.test(input)
    )
      return new Promise((resolve) => {
        resolve({
          json: () => ({
            s: 'ok',
            id: '',
            r: []
          }),
          text: () => '',
          then: () => {
            return Promise.resolve({
              data: {
                streams: []
              }
            });
          },
          ok: true,
          headers: new Headers(),
          status: 200
        });
      });
  }

  return originalFetch(input, init);
};

const send = XMLHttpRequest.prototype.send;
const open = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url) {
  this._url = url;

  return open.call(this, method, url);
};

XMLHttpRequest.prototype.send = function (data) {
  if (/google|snowplow|pricealerts|graphql/i.test(this._url)) {
    return;
  }

  return send.call(this, data);
};

const css = String.raw;
const criticalStyles = css`
  * {
    box-shadow: none !important;
    transition: none !important;
  }

  html body {
    display: none !important;
  }

  .layout__area--right {
    display: none !important;
  }

  .tv-screener__body-background {
    padding-right: 0 !important;
  }

  .tv-screener-toolbar--standalone_sticky {
    width: 100% !important;
  }

  .tv-screener--standalone.tv-screener--sticky-header {
    padding-right: 0 !important;
  }

  html.theme-dark body,
  html.theme-light body {
    display: block !important;
  }

  .tv-main.tv-screener__standalone-main-container,
  .tv-header,
  .tv-market-heatmap__standalone-title-wrap,
  .tv-screener__standalone-title-wrap {
    display: none !important;
  }

  .tv-screener__standalone-wrap {
    padding-top: 0 !important;
  }

  .tv-screener-toolbar.tv-screener-toolbar--standalone.tv-screener-toolbar--standalone_sticky {
    top: 0 !important;
  }

  .tv-screener-table__result-row {
    height: 45px !important;
  }

  [data-role='toast-container'] {
    display: none !important;
  }
`;

const style = document.createElement('style');

style.textContent = criticalStyles;

document.head.insertAdjacentElement('afterbegin', style);

let options = {};
let heatmapWrapper;

document.addEventListener('click', (event) => {
  const cp = event.composedPath();

  for (const n of cp) {
    if (n?.classList?.contains('tv-screener__symbol')) {
      event.preventDefault();
      event.stopPropagation();

      window.top.postMessage(
        {
          origin: 'ppp-simple-frame',
          event: 'symbolselect',
          detail: event.target.textContent?.trim?.()
        },
        '*'
      );

      break;
    } else if (
      options.rowClickSelectsSymbol &&
      n?.hasAttribute?.('data-symbol')
    ) {
      const symbol = n.getAttribute('data-symbol');

      window.top.postMessage(
        {
          origin: 'ppp-simple-frame',
          event: 'symbolselect',
          detail: symbol.split(':')[1].replace('.', ' ')
        },
        '*'
      );

      break;
    }
  }
});

let DOMContentLoaded = false;
let heatmapNode;

const findReactFiber = function (dom) {
  const key = Object.keys(dom).find((key) => key.startsWith('__reactFiber$'));

  if (!key) return null;

  const internalInstance = dom[key];

  if (internalInstance == null) return null;

  if (internalInstance.return) {
    return internalInstance._debugOwner
      ? internalInstance._debugOwner.stateNode
      : internalInstance.return.stateNode;
  } else {
    return internalInstance._currentElement._owner._instance;
  }
};

function observeHeatmapWrapper(wrapper) {
  new MutationObserver(() => {
    const mainWrapper = wrapper.querySelector('div[class*="mainWrapper"]');

    if (mainWrapper) {
      heatmapNode = findReactFiber(mainWrapper)?._heatmap;

      heatmapNode._clickHandler = () => {
        const symbol = heatmapNode._activeSymbol;

        symbol &&
          window.top.postMessage(
            {
              origin: 'ppp-simple-frame',
              event: 'symbolselect',
              detail: symbol.split(':')[1].replace('.', ' ')
            },
            '*'
          );
      };
    }
  }).observe(wrapper, {
    childList: true,
    subtree: true
  });
}

window.addEventListener('message', (event) => {
  if (typeof event.data === 'string' && /paletteWhite/.test(event.data)) {
    const {
      extraOptions,
      darkMode,
      paletteWhite,
      paletteBlack,
      paletteBlueBase,
      paletteBlueLight2,
      paletteGrayBase,
      paletteGrayLight1,
      paletteGrayLight2,
      paletteGrayLight3,
      paletteGrayDark1,
      paletteGrayDark2,
      paletteGrayDark3,
      paletteGrayDark4,
      scrollBarSize,
      positive,
      negative,
      bodyFont,
      fontSizeWidget
    } = JSON.parse(event.data);

    options = extraOptions;

    !DOMContentLoaded &&
      document.addEventListener('DOMContentLoaded', () => {
        DOMContentLoaded = true;
        window.user.is_pro = true;
        window.user.pro_plan = 'pro_premium';

        let autoUpdateInterval = +options.autoUpdateInterval;

        if (
          !isNaN(autoUpdateInterval) &&
          autoUpdateInterval >= 1 &&
          autoUpdateInterval <= 10
        ) {
          setInterval(() => {
            window._exposed_screenerWidget?.view?.refresh?.();
          }, autoUpdateInterval * 1000);
        }

        const observer = new MutationObserver((mutationList) => {
          window.initData.theme = darkMode ? 'dark' : 'light';

          for (const mutation of mutationList) {
            if (
              mutation.target?.classList.contains('market-heatmap-wrapper') ||
              mutation.target === document.body
            ) {
              if (darkMode) {
                document.documentElement.classList.remove('theme-light');
                document.documentElement.classList.add('theme-dark');
              } else {
                document.documentElement.classList.remove('theme-dark');
                document.documentElement.classList.add('theme-light');
              }
            } else if (
              /canvasContainer/.test(mutation.target?.getAttribute('class'))
            ) {
              if (!heatmapWrapper) {
                heatmapWrapper = document.querySelector(
                  '.market-heatmap-wrapper'
                );

                if (heatmapWrapper) {
                  observeHeatmapWrapper(heatmapWrapper);
                }
              }

              return observer.disconnect();
            }
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });

    const styles = css`
      * {
        font-family: ${bodyFont} !important;
      }

      ::-webkit-scrollbar {
        width: ${scrollBarSize}px;
        height: ${scrollBarSize}px;
      }

      ::-webkit-scrollbar-track-piece {
        background-color: ${darkMode
          ? paletteGrayDark3
          : paletteGrayLight3} !important;
      }

      ::-webkit-scrollbar-thumb:horizontal {
        background-color: ${darkMode
          ? `${paletteGrayLight1}33`
          : `${paletteGrayDark1}33`} !important;
      }

      ::-webkit-scrollbar-thumb:vertical {
        background-color: ${darkMode
          ? `${paletteGrayLight1}33`
          : `${paletteGrayDark1}33`} !important;
      }

      ::-webkit-scrollbar-corner {
        background-color: ${darkMode
          ? `${paletteGrayLight1}33`
          : `${paletteGrayDark1}33`} !important;
      }

      .tv-screener-table__cell,
      div[class*='heatmapTopBar'] {
        font-size: ${fontSizeWidget} !important;
      }

      .tv-screener-toolbar__favorites-item,
      .tv-screener-toolbar__period-picker-item {
        font-size: ${fontSizeWidget} !important;
      }

      .tv-screener-table__signal--buy,
      .tv-screener-table__cell--up {
        color: ${positive} !important;
      }

      .tv-screener-table__signal--sell,
      .tv-screener-table__cell--down {
        color: ${negative} !important;
      }

      .tv-screener__symbol {
        color: ${darkMode ? paletteBlueBase : paletteBlueLight2} !important;
      }

      .tv-screener-table__search-input {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-screener--standalone-market .tv-screener-table__signal--strong-buy,
      .tv-screener-table__signal--strong-buy {
        color: ${darkMode ? paletteBlueBase : paletteBlueLight2} !important;
      }

      .tv-screener-table .tv-screener-table__cell-currency-value {
        color: ${darkMode ? paletteGrayLight1 : paletteGrayBase} !important;
      }

      .tv-screener-table {
        color: ${darkMode ? paletteGrayLight2 : paletteBlack} !important;
      }

      .tv-screener__standalone-title {
        color: ${darkMode ? paletteGrayLight2 : paletteBlack} !important;
      }

      .tv-screener__description,
      .tv-screener-table__field-value--total {
        color: ${darkMode ? paletteGrayLight2 : paletteBlack} !important;
      }

      div[class*='screenerMapWrapper'],
      .tv-screener__body-background {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-signin-dialog__inner div[class*='footer-'] {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-screener-toolbar--standalone {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-screener-sticky-header-wrapper {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-header {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-screener-dialog__filter-field {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-tabbed-dialog {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
      }

      .tv-dialog {
        background-color: ${darkMode ? paletteBlack : paletteWhite} !important;
        border: 1px solid ${darkMode ? paletteGrayDark2 : paletteGrayLight2} !important;
      }

      .tv-data-table__tbody .tv-data-table__stroke:hover,
      .tv-screener-table__result-row--focused,
      .tv-screener-table__result-row--selected {
        background: ${darkMode
          ? `${paletteGrayDark1}B3`
          : `${paletteGrayLight2}B3`} !important;
      }

      .tv-data-table__cell,
      .tv-screener-dialog__filter-field {
        border-bottom-color: ${darkMode
          ? paletteGrayDark4
          : shadeColor(paletteGrayLight2, 10)} !important;
      }

      .tv-screener-table__search-input {
        border-color: ${darkMode
          ? paletteGrayDark1
          : paletteGrayLight2} !important;
      }

      .tv-screener-toolbar__button {
        color: ${darkMode
          ? paletteGrayLight1
          : shadeColor(paletteGrayBase, 25)} !important;
      }

      .tv-screener-toolbar__button:hover {
        color: ${darkMode ? paletteGrayLight2 : paletteGrayDark1} !important;
        background-color: ${darkMode
          ? paletteGrayDark2
          : paletteGrayLight3} !important;
      }

      .tv-screener-table__head-left {
        color: ${darkMode ? paletteGrayLight2 : paletteGrayDark3} !important;
      }

      .tv-screener-toolbar__button-icon {
        fill: ${darkMode
          ? paletteGrayLight1
          : shadeColor(paletteGrayBase, 25)} !important;
      }

      .tv-screener-toolbar__button,
      .tv-screener-table__th:not(:first-child),
      .tv-data-table__stroke:last-child .tv-data-table__cell,
      .tv-screener-table__head {
        border-color: ${darkMode
          ? paletteGrayDark1
          : paletteGrayLight2} !important;
      }

      .tv-screener-toolbar__button--filters {
        color: ${paletteWhite} !important;
      }

      .tv-screener-toolbar__favorites-item {
        border: 1px solid ${darkMode ? paletteGrayDark1 : paletteGrayLight2} !important;
        background: transparent !important;
        border-radius: 4px !important;
      }

      div.tv-screener-toolbar__favorites-item--active,
      div.tv-screener-toolbar__period-picker-item--active {
        border: 1px solid ${paletteBlueLight2} !important;
        background-color: transparent !important;
        color: ${darkMode ? paletteGrayLight2 : paletteGrayDark1} !important;
      }

      div.tv-screener-toolbar__favorites-item:hover,
      div.tv-screener-toolbar__period-picker-item:hover,
      div.tv-screener-toolbar__favorites-item--active:hover,
      div.tv-screener-toolbar__period-picker-item--active:hover {
        background-color: ${darkMode
          ? paletteGrayDark2
          : paletteGrayLight3} !important;
        color: ${darkMode ? paletteGrayLight2 : paletteGrayDark1} !important;
      }

      html[class] tbody tr.tv-screener-table__result-row--focused:hover,
      html[class] tbody tr.tv-screener-table__result-row--selected:hover {
        background: ${darkMode
          ? `${paletteGrayDark1}B3`
          : `${paletteGrayLight2}B3`} !important;
      }
    `;

    const style = document.createElement('style');

    style.textContent = styles;

    document.head.insertAdjacentElement('afterbegin', style);
  }
});

window.top.postMessage(
  {
    origin: 'ppp-simple-frame',
    event: 'ready'
  },
  '*'
);
