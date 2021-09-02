import { App } from '../../../lib/desktop/app.js';
import { appTemplate as template } from './app.template.js';
import { appStyles as styles } from './app.styles.js';

export const app = App.compose({
  baseName: 'app',
  template,
  styles
});
