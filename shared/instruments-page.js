import { Page } from './page.js';
import { requireComponent } from './template.js';
import ppp from '../ppp.js';

export class InstrumentsPage extends Page {
  getActiveTab() {
    const params = ppp.app.params();

    if (/manage|remove|import/i.test(params.tab)) return params.tab;
    else return 'manage';
  }

  async connectedCallback() {
    await requireComponent(`ppp-instruments-${this.getActiveTab()}-page`);

    super.connectedCallback();
  }
}
