import {
  CollectionSelect,
  collectionSelectTemplate
} from '../../shared/collection-select.js';
import { caretDown } from './icons/caret-down.js';
import { circleNotch } from './icons/circle-notch.js';
import { css } from '../../shared/element/styles/css.js';
import { warning } from './icons/warning.js';

export const collectionSelectStyles = (context, definition) => css`
  :host(:focus-visible) {
    outline: none;
  }

  .spinner {
    animation: spin 2s linear infinite;
    color: #168b46;
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .error-icon {
    color: rgb(207, 74, 34);
  }
`;

export default CollectionSelect.compose({
  template: collectionSelectTemplate,
  styles: collectionSelectStyles,
  arrow: caretDown(),
  spinner: circleNotch({
    cls: 'spinner'
  }),
  warningIndicator: warning({ cls: 'error-icon' })
});
