import { App } from '../lib/app.js';

export const app = (styles, template) =>
  App.compose({
    baseName: 'app',
    template,
    styles
  });
