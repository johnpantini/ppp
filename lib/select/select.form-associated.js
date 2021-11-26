import { Listbox } from '../listbox/listbox.js';
import { FormAssociated } from '../form-associated/form-associated.js';

class _Select extends Listbox {}

/**
 * A form-associated base class for the Select component.
 *
 * @internal
 */
export class FormAssociatedSelect extends FormAssociated(_Select) {
  constructor() {
    super(...arguments);
    this.proxy = document.createElement('select');
  }
}
