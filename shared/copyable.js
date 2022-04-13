import { FoundationElement } from './foundation-element.js';

export class Copyable extends FoundationElement {
  copy() {
    void navigator.clipboard.writeText(
      this.code.assignedNodes()[0].wholeText.trim()
    );
  }
}
