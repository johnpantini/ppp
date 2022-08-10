import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { Observable, observable } from './element/observation/observable.js';
import { maybeFetchError } from './fetch-error.js';
import { Tmpl } from './tmpl.js';
import ppp from '../ppp.js';

export class EndpointPage extends Page {
  processSource(source) {
    const match = source.match(/\*\*@ppp([\s\S]+)@ppp\*/i);

    if (match) return match[1].trim();
    else return source;
  }

  async validate() {
    await validate(this.route);
    await validate(this.route, {
      hook: async (value) => value.startsWith('/'),
      errorMessage: 'Маршрут должен начинаться с /'
    });
    await validate(this.functionName);
    await validate(this.source);
  }
}
