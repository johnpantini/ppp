/** @decorator */

import { attr } from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

export class App extends FoundationElement {
  @attr
  appearance;

  @observable
  ppp;

  handleMyBalanceClick() {
    // TODO
    console.log('handleMyBalanceClick');
  }

  handleNewTerminalClick() {
    // TODO
    console.log('handleNewTerminalClick');
  }

  handleSignOutClick() {
    // TODO
    console.log('handleSignOutClick');
  }
}
