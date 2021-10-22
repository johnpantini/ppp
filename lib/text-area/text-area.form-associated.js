import { FormAssociated } from '../form-associated/form-associated.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

class _TextArea extends FoundationElement {}

/**
 * A form-associated base class for the TextArea component.
 *
 * @internal
 */
export class FormAssociatedTextArea extends FormAssociated(_TextArea) {
  constructor() {
    super(...arguments);
    this.proxy = document.createElement('textarea');
  }
}
