import {
  BaseProgress as Progress,
  progressTemplate
} from '../../shared/progress.js';
import { css } from '../../shared/element/styles/css.js';

// TODO - design tokens
const progressStyles = css`
  @keyframes indeterminate {
    0% {
      background-position: -400px;
    }

    100% {
      background-position: 800px;
    }
  }

  .determinate {
    overflow: hidden;
    height: 6px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: rgb(34, 183, 235);
    background-image: linear-gradient(
      90deg,
      rgb(34, 183, 235) 0px,
      rgb(204, 232, 244) 200px,
      rgb(34, 183, 235) 400px
    );
    background-size: 600px;
    animation: 4s linear 0s infinite normal none running indeterminate;
    transition: width 0.3s ease-in-out 0s;
  }
`;

/**
 *
 * @public
 *
 */
export default Progress.compose({
  baseName: 'progress',
  template: progressTemplate,
  styles: progressStyles
});
