import { Table, tableTemplate } from '../../shared/table.js';
import { css } from '../../shared/element/styles/css.js';
import { notDefined } from '../../shared/utilities/style/display.js';

// TODO - design tokens
export const tableStyles = (context, definition) => css`
  ${notDefined}
  * {
    box-sizing: border-box;
  }

  table {
    margin: 0;
    padding: 0;
    border-collapse: collapse;
    box-sizing: border-box;
    width: 100%;
    border-bottom: 1px solid rgb(231, 238, 236);
  }

  th {
    border-width: 0 1px 3px;
    border-style: solid;
    min-width: 40px;
    padding: 8px;
    box-sizing: border-box;
    vertical-align: middle;
    font-size: 14px;
    line-height: 20px;
    border-color: rgb(231, 238, 236);
    margin: 0;
  }

  :host(.long) tr:nth-of-type(2n) {
    background-color: rgb(249, 251, 250);
  }

  :host([sticky]) th {
    top: 0;
    position: sticky;
    background: #fff;
    z-index: 2;
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 32px;
  }

  .column-header-text {
    padding-right: 4px;
    color: rgb(61, 79, 88);
  }

  .row {
    border-top: 1px solid #e7eeec;
    color: rgb(61, 79, 88);
  }

  .cell {
    min-width: 40px;
    padding: 8px;
    box-sizing: border-box;
    vertical-align: middle;
    font-size: 14px;
    line-height: 20px;
    position: relative;
  }

  .cell a {
    background-color: transparent;
    color: #016bf8;
    text-decoration: none;
  }

  .cell a:hover {
    text-decoration: underline;
  }

  .row > .cell:nth-child(1) {
    padding-left: 8px;
  }

  .cell-container {
    display: flex;
    align-items: center;
    min-height: 40px;
  }

  .empty-message {
    font-style: italic;
    padding: 5px;
    text-align: center;
  }

  .hotkey {
    user-select: none;
    font-family: 'Source Code Pro', Menlo, monospace;
    border: 1px solid rgb(28, 45, 56);
    border-radius: 3px;
    padding-left: 5px;
    padding-right: 5px;
    color: rgb(0, 30, 43);
    background-color: rgb(255, 255, 255);
    font-size: 15px;
    line-height: 22px;
  }

  .label-with-hotkey {
    display: flex;
    flex-direction: row;
    gap: 0 6px;
    align-items: center;
  }
`;

export default Table.compose({
  template: tableTemplate,
  styles: tableStyles
});
