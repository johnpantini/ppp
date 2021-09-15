import { notDefined } from '../../../lib/utilities/style/display.js';
import { css } from '../../../lib/element/styles/css.js';

export const basePageStyles = css`
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
`;
