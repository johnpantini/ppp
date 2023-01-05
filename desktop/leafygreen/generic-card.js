import { GenericCard, genericCardTemplate } from '../../shared/generic-card.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';

// TODO - design tokens
export const genericCardStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    flex-direction: column;
    min-height: 220px;
    padding: 22px 32px 22px;
    position: relative;
    width: 370px;
    border-radius: 24px;
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
    margin: 5px 0;
  }

  .description {
    color: #89979b;
    font-size: 14px;
    padding-bottom: 16px;
  }

  .action {
    margin-top: auto;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default GenericCard.compose({
  template: genericCardTemplate,
  styles: genericCardStyles
});
