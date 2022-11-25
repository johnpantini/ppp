import { Page } from '../../shared/page.js';
import { notDefined } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { css } from '../../shared/element/styles/css.js';
import { bodyFont } from './design-tokens.js';

export const circleSvg = (index) => `
  <svg height="24" width="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="#3D4F58" stroke="#3D4F58"></circle>
    <text x="50%" y="50%" text-anchor="middle" fill="white" dy=".3em"
        font-size="smaller" font-weight="bold">${index.toString()}
    </text>
  </svg>`;

export const loadingIndicator = (size = 'xlarge') => `
  <div class="loading-indicator-content">
    <div class="loading-indicator ${size}"></div>
  </div>
`;

export const snippetStyles = css`
  .snippet-holder {
    border: 1px solid rgb(231, 238, 236);
    border-radius: 4px;
    overflow: hidden;
  }

  .snippet-inner {
    display: flex;
  }

  .snippet-holder pre {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 6px 0;
    width: 100%;
    overflow-x: auto;
    border-radius: 0;
    border: 0 rgb(231, 238, 236);
    margin: 0;
    position: relative;
    flex-grow: 1;
    background-color: rgb(249, 251, 250);
    color: rgb(6, 22, 33);
    display: flex;
    align-items: center;
  }

  .snippet-holder code {
    color: inherit;
    font-size: 13px;
    font-family: 'Source Code Pro', Menlo, monospace;
    line-height: 24px;
    align-self: center;
  }

  .code-table {
    border-spacing: 0;
    width: 100%;
  }

  .code-table td {
    border-spacing: 0;
    vertical-align: top;
    padding: 0 16px;
  }
`;

export const modalStyles = css`
  ppp-modal:not(:defined) {
    visibility: hidden;
    position: absolute;
    height: 0;
  }

  ppp-modal .description {
    margin: unset;
    font-family: ${bodyFont};
    color: rgb(33, 49, 60);
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    font-weight: 400;
    margin-bottom: 1rem;
  }

  [modal] section {
    margin-bottom: 11px;
    padding: 5px 5px 16px 5px;
  }

  [modal] footer {
    margin-bottom: -16px;
    padding-top: 16px;
  }

  [modal] .footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0 10px;
  }

  [modal] .footer-border {
    border-bottom: 1px solid #ebebed;
    margin-left: -32px;
    margin-top: 0;
    width: 750px;
  }

  [modal] .label-group > h6 {
    font-size: 0.9rem;
  }
`;

export const foldingStyles = css`
  .folding {
    margin-top: 25px;
    margin-bottom: 0;
    box-shadow: none;
    border: none;
  }

  .folding-header {
    border: none;
    background-color: #ffffff;
    padding: 5px 15px;
    align-items: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
  }

  .folding-header-text {
    pointer-events: none;
    text-transform: uppercase;
    font-weight: bold;
    color: #807f7f;
    width: 100%;
  }

  .folding-header-toggle {
    pointer-events: none;
    width: 16px;
    height: 27px;
    transform: rotate(-90deg);
    margin-right: 16px;
    display: inline-block;
    margin-left: auto;
    transition: transform 0.1s ease-in-out;
  }

  .folding-open .folding-header-toggle {
    transform: rotate(0deg);
  }

  .folding-content {
    box-sizing: border-box;
    margin: 0;
    padding: 10px 15px 0 15px;
    display: none;
  }

  .folding-open .folding-content {
    display: initial;
  }

  .folding-content ppp-checkbox {
    margin-left: 10px;
  }
`;

export const emptyStateStyles = css`
  .empty-state {
    word-wrap: break-word;
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-flow: column;
    justify-content: center;
    min-height: 260px;
    padding: 40px 0 0;
  }

  .empty-state h1 {
    font-size: 32px;
    text-align: center;
    margin: unset;
    font-family: ${bodyFont};
    color: rgb(33, 49, 60);
    font-weight: 500;
    line-height: 68px;
    letter-spacing: -0.3px;
  }

  .empty-state h2 {
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    margin: auto;
    text-align: center;
    font-family: ${bodyFont};
    color: rgb(33, 49, 60);
    letter-spacing: 0;
  }

  .empty-state button {
    margin-bottom: 16px;
  }

  .empty-state .cta {
    font-size: 17px;
    height: auto;
    margin: 24px 0;
    padding: 10px;
    appearance: none;
    border: 1px solid rgb(0, 104, 74);
    display: inline-flex;
    align-items: stretch;
    transition: all 150ms ease-in-out 0s;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    z-index: 0;
    font-family: ${bodyFont};
    border-radius: 6px;
    background-color: rgb(0, 104, 74);
    color: rgb(255, 255, 255);
    line-height: 20px;
    font-weight: 500;
  }

  .empty-state .cta[disabled] {
    user-select: none;
    pointer-events: none;
    appearance: none;
    text-decoration: none;
    background-color: rgb(231, 238, 236);
    border: 1px solid rgb(231, 238, 236);
    box-shadow: rgb(184, 196, 194) 0 0 0 1px;
    cursor: not-allowed;
    color: rgb(93, 108, 116);
  }

  .empty-state .cta:hover, .empty-state .cta:active {
    color: rgb(255, 255, 255);
    background-color: rgb(0, 89, 63);
    border-color: rgb(0, 89, 63);
    box-shadow: rgb(192, 250, 230) 0 0 0 3px;
  }

  .empty-state .cta .text {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: relative;
    z-index: 0;
    font-family: ${bodyFont}
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
  }

  .empty-state footer {
    font-size: 12px;
    padding-bottom: 60px;
    color: rgb(92, 108, 117);
  }

  .empty-state p {
    padding: 0 0 20px;
    text-align: center;
  }`;

export const pageStyles = css`
  * {
    box-sizing: border-box;
  }

  h1,
  h2 {
    margin: 0;
    padding: 0;
  }

  ${notDefined}
  section {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    padding: 25px;
    border-bottom: 1px solid #ebebed;
  }

  h6.section-header {
    margin-bottom: 8px;
    margin-top: 16px;
    font-family: ${bodyFont}
    color: rgb(33, 49, 60);
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0;
  }

  .section-subheader {
    display: flex;
    flex-direction: column;
  }

  .section-description {
    margin: unset;
    font-family: ${bodyFont};
    color: rgb(33, 49, 60);
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    font-weight: 400;
  }

  .last {
    border-bottom: none;
  }

  .loading-wrapper {
    position: relative;
    pointer-events: all;
    width: 100%;
    max-width: 100%;
    min-height: 100px;
    flex-grow: 1;
    opacity: 1;
    z-index: 10;
  }

  .loading-wrapper[loading] {
    opacity: 0.5;
    pointer-events: none;
  }

  .loading-indicator-content {
    position: fixed;
    right: calc(50% - 24px);
    bottom: 10px;
    z-index: 50;
  }

  .loading-indicator {
    background: url("data:image/svg+xml,%3C%3Fxml version%3D%221.0%22 encoding%3D%22utf-8%22%3F%3E%3Csvg width%3D'50px' height%3D'50px' xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22 preserveAspectRatio%3D%22xMidYMid%22 class%3D%22uil-ellipsis%22%3E%3Ccircle cx%3D%2216%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir11%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%220s%3Banir14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir12%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir11.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir13%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir14%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix11%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%220s%3Banix18.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix12%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix11.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix13%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix14%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix15%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix16%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix15.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix17%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix16.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix18%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix17.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2250%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir21%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir25.end%22 dur%3D%220.5s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir22%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir23%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir24%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir25%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix21%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%220s%3Banix28.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix22%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix23%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix24%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix25%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix26%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix25.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix27%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix26.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix28%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix27.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir31%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir35.end%22 dur%3D%220.25s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir32%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir33%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir34%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir35%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir34.end%22 dur%3D%220.375s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix31%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%220s%3Banix38.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix32%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix33%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix34%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix35%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix34.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix36%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix35.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix37%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix36.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix38%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix37.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir41%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%220s%3Banir44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir42%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir43%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir44%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir43.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix41%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%220s%3Banix48.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix42%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix43%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix44%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix43.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix45%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix46%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix45.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix47%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix46.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix48%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix47.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3C%2Fsvg%3E") no-repeat;
    background-size: 100%;
    min-height: 10px;
    width: 15px;
    margin-left: 10px;
    display: inline-block;
  }

  .loading-indicator.large {
    width: 30px;
    min-height: 30px;
  }

  .loading-indicator.xlarge {
    width: 45px;
    min-height: 45px;
  }

  .footer-actions {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-grow: 1;
    max-width: 100%;
  }

  .footer-actions.centered {
    justify-content: center;
  }

  .section-index-icon {
    align-self: start;
    display: flex;
    margin-right: 8px;
  }

  .label-group {
    width: 50%;
    flex-grow: 0;
    flex-shrink: 1;
    min-width: 50%;
    align-self: baseline;
  }

  .label-group.full {
    width: 100%;
  }

  .input-group {
    flex-grow: 1;
    align-items: center;
    max-width: 100%;
  }

  .label-group > h6 {
    margin: unset;
    color: #494747;
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0;
  }

  .label-group > h5 {
    margin: unset;
    color: #494747;
    font-size: 16px;
    letter-spacing: 0;
  }

  .label-group ppp-banner {
    margin-right: 20px;
  }

  .label-group > p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 16px;
    font-weight: normal;
    padding-bottom: 4px;
    padding-right: 20px;
    margin-bottom: 0;
    color: #a09f9e;
  }

  a {
    background-color: transparent;
    color: #006cbc;
    text-decoration: none;
    outline: none;
  }

  .card-container {
    margin: 15px 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, 370px);
    grid-gap: 24px;
  }

  .margin-top {
    margin-top: 10px;
  }

  .action-input {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
  }

  .action-input-text {
    width: 100%
  }

  .action-input-text + .action-input-button {
    margin-top: 12px;
  }

  .action-input-button {
    margin-left: 5px;
  }

  .section-content {
    padding-top: 15px;
  }

  .section-content * {
    box-sizing: border-box;
  }

  .horizontal-overflow {
    overflow-x: auto;
    width: 100%;
    display: table;
  }

  .service-details {
    display: grid;
    grid-template-areas:
        "header header header header"
        "footer footer footer footer";
    border-radius: 24px;
    position: relative;
    border: 1px solid rgb(231, 238, 236);
    box-shadow: rgb(6 22 33 / 30%) 0 4px 10px -4px;
    background-color: white;
    color: rgb(33, 49, 60);
  }

  .service-details-controls {
    display: grid;
    gap: 24px;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 24px;
    position: relative;
    top: -1px;
    border-top: inherit;
    border-bottom: inherit;
    border-radius: 24px 24px 0 0;
    grid-area: header / header / header / header;
  }

  .service-details-control {
    display: flex;
    column-gap: 8px;
  }

  .service-details-label {
    position: relative;
    grid-column-start: 1;
    align-self: center;
    font-size: 16px;
    font-weight: bold;
  }

  .service-details-info {
    border-radius: 0 0 24px 24px;
    padding: 24px;
    position: relative;
    grid-area: footer / footer / footer / footer;
    background-color: rgb(249, 251, 250);
  }

  .service-details-info-container {
    display: grid;
    gap: 4px 36px;
    place-content: center left;
  }

  .service-details-info-container > span {
    display: block;
    color: rgb(70, 76, 79);
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .service-details-info-container > div {
    display: block;
    color: rgb(93, 108, 116);
    font-size: 14px;
    font-weight: normal;
  }

  .global-search-input {
    display: flex;
    margin: 5px 0 10px 0;
    width: 300px;
  }

  .hotkey {
    user-select: none;
    font-family: "Source Code Pro", Menlo, monospace;
    border: 1px solid rgb(28, 45, 56);
    border-radius: 3px;
    padding-left: 5px;
    padding-right: 5px;
    color: rgb(0, 30, 43);
    background-color: rgb(255, 255, 255);
    font-size: 15px;
    line-height: 22px;
  }

  section ppp-codeflask {
    width: 100%;
    height: 256px;
  }

  .action-page-mount-point {
    display: none;
  }

  iframe {
    margin-top: 15px;
    border-radius: 7px;
  }

  .control-line {
    display: flex;
    flex-direction: row;
    gap: 0 8px;
  }

  .control-stack {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px 0;
  }

  ${modalStyles}
  ${foldingStyles}
  ${emptyStateStyles}
  ${snippetStyles}
`;

export const pageTemplate = (context, definition) => html`
  <template>
    ${when(
      (x) => !x.headless,
      html`
        <${'ppp-page-header'}>
          <slot name="header"></slot>
          <slot name="header-controls" slot="controls"></slot>
        </ppp-page-header>
      `
    )}
    <div class="loading-wrapper" ?loading="${(x) => x.loading}">
      <slot></slot>
      ${when((x) => x.loading, html`${loadingIndicator()}`)}
      <slot name="actions">
        <section class="last">
          <div class="${(x) =>
            x.getAttribute('centered-controls') !== null
              ? 'footer-actions centered'
              : 'footer-actions'}">
            <${'ppp-button'}
              ?disabled="${(x) => x.loading || x.disabled}"
              type="submit"
              @click="${(x) => x.saveDocument()}"
              appearance="primary"
            >
              <slot name="submit-control-text">Сохранить изменения</slot>
            </ppp-button>
          </div>
        </section>
      </slot>
    </div>
  </template>
`;

export default Page.compose({
  template: pageTemplate,
  styles: pageStyles
});
