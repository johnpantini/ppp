import {
  GenericCard,
  genericCardTemplate
} from '../../../lib/generic-card/generic-card.js';
import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';

// TODO - design tokens
export const genericCardStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    flex-direction: column;
    margin-right: 30px;
    min-height: 220px;
    padding: 25px 30px;
    position: relative;
    width: 450px;
    border-radius: 7px;
    border: 1px solid rgb(231, 238, 236);
    box-shadow: rgba(6, 22, 33, 0.3) 0 4px 10px -4px;
    background-color: white;
    color: rgb(33, 49, 60);
  }

  .logo {
    height: 50px;
  }

  .title {
    color: #3d4f58;
    margin: 10px 0;
  }

  .description {
    color: #89979b;
    font-size: 14px;
  }

  .action {
    margin-top: auto;
  }
`;

export const genericCard = GenericCard.compose({
  baseName: 'generic-card',
  template: genericCardTemplate,
  styles: genericCardStyles
});
