import { notDefined } from '../../../lib/utilities/style/display.js';
import { css } from '../../../lib/element/styles/css.js';
import { bodyFont } from '../design-tokens.js';

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
    display: flex;
    font-size: 32px;
    font-weight: 300;
    padding: 32px 0 16px;
  }

  .empty-state h2 {
    font-size: 21px;
    font-weight: 500;
    padding: 0 0 32px;
    text-align: center;
  }

  .empty-state button {
    margin-bottom: 16px;
  }

  .empty-state .cta {
    appearance: none;
    padding: 0;
    margin: 0;
    border: 0 solid transparent;
    display: inline-flex;
    -webkit-box-align: stretch;
    align-items: stretch;
    border-radius: 4px;
    transition: all 150ms ease-in-out 0s;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    z-index: 0;
    background-color: rgb(9, 128, 76);
    box-shadow: rgb(19 170 82 / 40%) 0 2px 3px;
    color: rgb(255, 255, 255);
    height: 48px;
    font-size: 18px;
    line-height: 24px;
  }

  .empty-state .cta[disabled] {
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
    background-color: rgb(17, 97, 73);
    box-shadow: rgb(19 170 82 / 40%) 02px 3px, rgb(195 231 202) 0 0 0 3px;
  }

  .empty-state .cta .text {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: relative;
    z-index: 0;
    font-family: ${bodyFont}
    -webkit-box-pack: center;
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
  }

  .empty-state p {
    padding: 0 0 20px;
    text-align: center;
  }`;

export const basePageStyles = css`
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

  .last {
    border-bottom: none;
  }

  .loading-wrapper {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-height: 180px;
    flex-grow: 1;
    opacity: 1;
  }

  .loading-wrapper[busy] {
    opacity: 0.5;
  }

  .loading-indicator-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-indicator {
    background: url("data:image/svg+xml,%3C%3Fxml version%3D%221.0%22 encoding%3D%22utf-8%22%3F%3E%3Csvg width%3D'50px' height%3D'50px' xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22 preserveAspectRatio%3D%22xMidYMid%22 class%3D%22uil-ellipsis%22%3E%3Ccircle cx%3D%2216%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir11%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%220s%3Banir14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir12%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir11.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir13%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir14%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix11%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%220s%3Banix18.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix12%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix11.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix13%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix14%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix15%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix16%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix15.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix17%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix16.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix18%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix17.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2250%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir21%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir25.end%22 dur%3D%220.5s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir22%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir23%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir24%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir25%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix21%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%220s%3Banix28.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix22%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix23%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix24%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix25%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix26%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix25.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix27%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix26.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix28%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix27.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir31%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir35.end%22 dur%3D%220.25s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir32%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir33%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir34%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir35%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir34.end%22 dur%3D%220.375s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix31%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%220s%3Banix38.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix32%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix33%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix34%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix35%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix34.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix36%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix35.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix37%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix36.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix38%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix37.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir41%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%220s%3Banir44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir42%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir43%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir44%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir43.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix41%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%220s%3Banix48.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix42%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix43%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix44%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix43.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix45%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix46%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix45.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix47%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix46.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix48%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix47.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3C%2Fsvg%3E")
      no-repeat;
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

  .section-index-icon {
    align-self: start;
    display: flex;
    margin-right: 8px;
  }

  .label-group {
    width: 100%;
    flex-grow: 0;
    flex-shrink: 1;
    min-width: 50%;
    align-self: baseline;
  }

  .label-group > h6 {
    margin: unset;
    color: rgb(33, 49, 60);
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0;
  }

  .label-group > p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 16px;
    font-weight: normal;
    padding-bottom: 4px;
    margin-bottom: 0;
    color: rgb(93, 108, 116);
  }

  a {
    background-color: transparent;
    color: #006cbc;
    text-decoration: none;
    outline: none;
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  svg.spinner-icon {
    animation: spin 2s linear infinite;
  }

  .margin-top {
    margin-top: 10px;
  }

  ${emptyStateStyles}
`;
